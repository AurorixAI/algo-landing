import assert from "node:assert/strict";
import test from "node:test";
import { EMPTY_APPLY_FORM, buildCreateBody, buildDetailsBody, validateStep, type ApplyValues } from "./demo-apply";
import { ApiFailure, DEMO_REQUESTS_PATH, createDemoRequest, patchDemoRequest, uuid4 } from "./demo-api";
import { maskPhone } from "./demo-form";

const UUID4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

interface Call { url: string; method: string; body: Record<string, unknown> }
function fakeFetch(replies: Array<{ status: number; json?: unknown; headers?: Record<string, string>; throws?: boolean }>) {
  const calls: Call[] = [];
  const fn = (async (url: string, init: RequestInit) => {
    calls.push({ url, method: String(init.method), body: JSON.parse(String(init.body)) });
    const reply = replies[Math.min(calls.length - 1, replies.length - 1)];
    if (reply.throws) throw new TypeError("network down");
    return new Response(reply.json === undefined ? "<html>502</html>" : JSON.stringify(reply.json), { status: reply.status, headers: reply.headers });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

const values: ApplyValues = {
  ...EMPTY_APPLY_FORM, centreName: "Альфа", orgType: "center", city: "Ташкент", fullName: "Иван Петров", phone: maskPhone("901234567"), email: "i@alfa.uz",
};
const create = (id = "11111111-1111-4111-8111-111111111111") => buildCreateBody(values, { utm_source: "ads" }, id, "tok");

test("uuid4: version 4, also without crypto.randomUUID", () => {
  assert.match(uuid4(), UUID4);
  const bytes = { getRandomValues: (a: ArrayBufferView) => { new Uint8Array(a.buffer).fill(255); return a; } } as unknown as Crypto;
  assert.match(uuid4(bytes), UUID4);
});

test("create: one POST to the relative public address, request_id and utm in the body, token kept for step 3", async () => {
  const { fn, calls } = fakeFetch([{ status: 201, json: { ok: true, id: "req-1", details_token: "dt", details_token_expires_at: "2026-10-29T12:00:00Z" } }]);
  const created = await createDemoRequest(create(), { fetch: fn });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, DEMO_REQUESTS_PATH);
  assert.equal(calls[0].url, "/api/v1/public/demo-requests");
  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].body.request_id, "11111111-1111-4111-8111-111111111111");
  assert.deepEqual(calls[0].body.source, { utm_source: "ads" });
  assert.equal(calls[0].body.website, "");
  assert.deepEqual(created, { id: "req-1", detailsToken: "dt", detailsTokenExpiresAt: "2026-10-29T12:00:00Z", requestId: "11111111-1111-4111-8111-111111111111" });
});

test("request_id_conflict: a NEW id is made and the request is repeated once", async () => {
  const conflict = { status: 409, json: { detail: "Эта заявка уже отправлена с другими данными.", code: "request_id_conflict" } };
  const { fn, calls } = fakeFetch([conflict, { status: 201, json: { id: "req-2", details_token: "dt2" } }]);
  const created = await createDemoRequest(create(), { fetch: fn, newId: () => "22222222-2222-4222-8222-222222222222" });
  assert.equal(calls.length, 2);
  assert.equal(calls[1].body.request_id, "22222222-2222-4222-8222-222222222222");
  assert.equal(calls[1].body.email, calls[0].body.email); // the data is the same, only the id changed
  assert.equal(created.requestId, "22222222-2222-4222-8222-222222222222");
  assert.equal(created.id, "req-2");
});

test("request_id_conflict twice: stops after the one repeat", async () => {
  const conflict = { status: 409, json: { detail: "x", code: "request_id_conflict" } };
  const { fn, calls } = fakeFetch([conflict]);
  await assert.rejects(createDemoRequest(create(), { fetch: fn, newId: uuid4 }), (e: ApiFailure) => e.status === 409 && e.code === "request_id_conflict");
  assert.equal(calls.length, 2);
});

test("other 409 / 422 / 429 are not repeated; fields and Retry-After are kept", async () => {
  const f422 = fakeFetch([{ status: 422, json: { detail: "Проверьте поля", code: "validation_error", fields: { phone: "Неверный телефон" } } }]);
  await assert.rejects(createDemoRequest(create(), { fetch: f422.fn }), (e: ApiFailure) => e.status === 422 && e.fields?.phone === "Неверный телефон");
  assert.equal(f422.calls.length, 1);
  const f429 = fakeFetch([{ status: 429, json: { detail: "Много", code: "rate_limited" }, headers: { "Retry-After": "90" } }]);
  await assert.rejects(createDemoRequest(create(), { fetch: f429.fn }), (e: ApiFailure) => e.status === 429 && e.retryAfter === 90);
  assert.equal(f429.calls.length, 1);
});

test("no connection and html error pages become failures the form can show (status 0 / 502)", async () => {
  await assert.rejects(createDemoRequest(create(), { fetch: fakeFetch([{ status: 200, throws: true }]).fn }), (e: ApiFailure) => e.status === 0);
  await assert.rejects(createDemoRequest(create(), { fetch: fakeFetch([{ status: 502 }]).fn }), (e: ApiFailure) => e.status === 502);
});

test("scenario: step 1, step 2 creates, step 3 adds to the same request with the token", async () => {
  const { fn, calls } = fakeFetch([
    { status: 201, json: { ok: true, id: "req-9", details_token: "dt9" } },
    { status: 200, json: { ok: true, id: "req-9" } },
  ]);
  assert.deepEqual(validateStep(1, values), {});
  assert.deepEqual(validateStep(2, values), {});
  const created = await createDemoRequest(create(), { fetch: fn });
  const filled = { ...values, needs: ["exams" as const], comment: "Нужны экзамены" };
  const details = buildDetailsBody(filled, created.detailsToken!);
  await patchDemoRequest(created.id, details!, { fetch: fn });
  assert.equal(calls.length, 2);
  assert.equal(calls[1].method, "PATCH");
  assert.equal(calls[1].url, "/api/v1/public/demo-requests/req-9");
  assert.deepEqual(calls[1].body, { details_token: "dt9", needs: ["exams"], comment: "Нужны экзамены" });
  assert.ok(!("request_id" in calls[1].body) && !("email" in calls[1].body)); // PATCH carries nothing else
});

test("patch refusals are failures with their code (the form accepts them as 'already taken')", async () => {
  for (const [status, code] of [[403, "details_token_expired"], [404, "not_found"], [409, "already_processed"]] as const) {
    const { fn } = fakeFetch([{ status, json: { detail: "x", code } }]);
    await assert.rejects(patchDemoRequest("r", { details_token: "t", comment: "c" }, { fetch: fn }), (e: ApiFailure) => e.status === status && e.code === code);
  }
});
