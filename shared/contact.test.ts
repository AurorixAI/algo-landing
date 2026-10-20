import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer, request as httpRequest } from "node:http";
import test from "node:test";
import express from "express";
import type { HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import { createVercelContactHandler } from "../api/contact";
import { createNetlifyContactHandler } from "../netlify/functions/contact";
import { registerRoutes } from "../server/routes";
import { CONTACT_LIMITS, CONTACT_MAX_BODY_BYTES, contactConfig, createContactHandler, normalizeContactIp, type ContactDependencies, type ContactRequest } from "./contact";

const valid = { name: "Мария", email: "maria@example.com", message: "Хочу посмотреть диагностику", type: "demo", website: "", turnstileToken: "challenge-token" };
const configured = (extra: Record<string, string | undefined> = {}) => contactConfig({
  NODE_ENV: "production", CONTACT_ALLOWED_ORIGINS: "https://algo.example", TURNSTILE_EXPECTED_HOSTNAMES: "algo.example",
  CONTACT_EMAIL: "owner@algo.example", CONTACT_FROM: "ALGO <landing@algo.example>",
  TURNSTILE_SECRET_KEY: "test-secret-never-real", RESEND_API_KEY: "test-mail-key-never-real", ...extra,
});
const bytes = (value: unknown) => Buffer.from(typeof value === "string" ? value : JSON.stringify(value));
function request(body: unknown = valid, options: Partial<ContactRequest> = {}): ContactRequest {
  return {
    method: "POST", headers: { origin: "https://algo.example", "content-type": "application/json", "sec-fetch-site": "same-origin" },
    clientIp: "192.0.2.1", readBody: async () => bytes(body), ...options,
  };
}
function harness(options: ContactDependencies = {}) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetcher: typeof fetch = async (input, init = {}) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.includes("siteverify")) return Response.json({ success: true, hostname: "algo.example", action: "contact" });
    if (url === "https://api.resend.com/emails") return Response.json({ id: "test-only" });
    throw new Error("Unexpected external boundary");
  };
  return { calls, handle: createContactHandler({ config: configured(), fetch: fetcher, ...options }), fetcher };
}

test("rejects unsupported methods and JSON media types without reading the body", async () => {
  for (const method of ["GET", "HEAD", "OPTIONS", "PUT", "PATCH", "DELETE"]) {
    const { handle, calls } = harness();
    const result = await handle(request(valid, { method, readBody: async () => { throw new Error("must not read"); } }));
    assert.equal(result.status, 405);
    assert.equal(result.headers.Allow, "POST");
    assert.equal(result.headers["Access-Control-Allow-Origin"], undefined);
    assert.deepEqual(calls, []);
  }
  for (const contentType of [undefined, "text/plain", "application/x-www-form-urlencoded", "application/json; charset=iso-8859-1"]) {
    const { handle, calls } = harness();
    const result = await handle(request(valid, { headers: { origin: "https://algo.example", "content-type": contentType } }));
    assert.equal(result.status, 415);
    assert.deepEqual(calls, []);
  }
});

test("rejects cross-site, sibling origins, absent/null origins and forged Host", async () => {
  for (const origin of [undefined, "null", "https://evil.example", "https://algo.example.evil.test", "https://algo.example/", "https://user@algo.example"]) {
    const { handle, calls } = harness();
    const result = await handle(request(valid, { headers: { origin, host: "algo.example", "x-forwarded-host": "algo.example", "content-type": "application/json" } }));
    assert.equal(result.status, 403, origin);
    assert.deepEqual(calls, []);
  }
  for (const fetchSite of ["cross-site", "same-site", "none"]) {
    const result = await harness().handle(request(valid, { headers: { origin: "https://algo.example", "content-type": "application/json", "sec-fetch-site": fetchSite } }));
    assert.equal(result.status, 403);
  }
});

test("development origin is tied to loopback transport and configured port", async () => {
  const config = contactConfig({ NODE_ENV: "development", PORT: "5050" });
  for (const [origin, ip, status] of [
    ["http://localhost:5050", "127.0.0.1", 503], ["http://127.0.0.1:5050", "::ffff:127.0.0.1", 503],
    ["http://[::1]:5050", "::1", 503], ["http://localhost:5051", "127.0.0.1", 403],
    ["http://localhost:5050", "192.0.2.1", 403], ["http://localhost.evil.test:5050", "127.0.0.1", 403],
  ] as const) {
    const result = await harness({ config }).handle(request(valid, { headers: { origin, "content-type": "application/json" }, clientIp: ip }));
    assert.equal(result.status, status);
  }
  assert.equal(normalizeContactIp("1.2.3.4, 5.6.7.8"), undefined);
  assert.equal(normalizeContactIp(" 1.2.3.4 "), undefined);
});

test("strict JSON schema rejects empty names, scalar/null/array, type confusion and injection", async () => {
  const invalidBodies: unknown[] = [null, [], [valid], false, 42, "{broken", "null", "\"text\"", {},
    { ...valid, name: "   " }, { ...valid, name: "x".repeat(201) }, { ...valid, email: 42 }, { ...valid, message: 0 },
    { ...valid, name: "Mary\r\nBcc: victim@example.com" }, { ...valid, email: "a@example.com\r\nBcc: victim@example.com" },
    { ...valid, email: "<a@example.com>" }, { ...valid, email: "a@example.com,second@example.com" }, { ...valid, type: "unknown" },
    { ...valid, type: {} }, { ...valid, website: false }, { ...valid, turnstileToken: {} },
    { ...valid, turnstileToken: "x".repeat(2049) }, { ...valid, message: "x".repeat(2001) }, { ...valid, message: "x\0y" },
    { ...valid, injected: "extra" }, { ...valid, website: "https://spam.example" },
  ];
  for (const body of invalidBodies) {
    const { handle, calls } = harness();
    const result = await handle(request(body));
    assert.equal(result.status, 400, JSON.stringify(body));
    assert.deepEqual(result.body, { error: "invalid_request" });
    assert.equal(calls.length, 0);
  }
  const malformedUtf8 = await harness().handle(request(valid, { readBody: async () => new Uint8Array([0xff]) }));
  assert.equal(malformedUtf8.status, 400);
});

test("12 KiB limit counts original bytes, including UTF-8 and whitespace", async () => {
  const raw = bytes(valid);
  const exact = Buffer.concat([raw, Buffer.alloc(CONTACT_MAX_BODY_BYTES - raw.length, 32)]);
  assert.equal((await harness().handle(request(valid, { readBody: async () => exact }))).status, 200);
  assert.equal((await harness().handle(request(valid, { readBody: async () => Buffer.concat([exact, Buffer.from(" ")]) }))).status, 413);
  assert.equal((await harness().handle(request(valid, { headers: { origin: "https://algo.example", "content-type": "application/json", "content-length": String(CONTACT_MAX_BODY_BYTES + 1) } }))).status, 413);
  assert.equal((await harness().handle(request(valid, { headers: { origin: "https://algo.example", "content-type": "application/json", "content-encoding": "gzip" } }))).status, 415);
});

test("trimmed data is escaped in HTML and cannot alter mail headers", async () => {
  const { handle, calls } = harness();
  const result = await handle(request({ ...valid, name: "  <b>Mary & 'Team'</b>  ", email: "  maria@example.com  ", message: "  <script>alert(1)</script>\nLine 2  " }));
  assert.equal(result.status, 200);
  assert.equal(calls.length, 2);
  const sent = JSON.parse(String(calls[1].init.body));
  assert.equal(sent.reply_to, "maria@example.com");
  assert.equal(sent.subject, "[ALGO] Запрос демо — <b>Mary & 'Team'</b>");
  assert.ok(sent.html.includes("&lt;b&gt;Mary &amp; &#39;Team&#39;&lt;/b&gt;"));
  assert.ok(sent.html.includes("&lt;script&gt;alert(1)&lt;/script&gt;\nLine 2"));
  assert.ok(!sent.html.includes("<script>"));
  assert.equal(result.headers["Cache-Control"], "no-store");
});

test("mail configuration and verification configuration fail closed", async () => {
  for (const extra of [
    { RESEND_API_KEY: "" }, { TURNSTILE_SECRET_KEY: "" }, { TURNSTILE_EXPECTED_HOSTNAMES: "" },
    { CONTACT_ALLOWED_ORIGINS: "*" }, { CONTACT_ALLOWED_ORIGINS: "https://algo.example/path" },
    { CONTACT_ALLOWED_ORIGINS: "http://algo.example" }, { TURNSTILE_EXPECTED_HOSTNAMES: "https://algo.example" },
    { CONTACT_EMAIL: "a@example.com\r\nBcc: bad@example.com" }, { CONTACT_FROM: "ALGO\r\nBcc: bad@example.com" },
  ]) {
    const { handle, calls } = harness({ config: configured(extra) });
    const result = await handle(request());
    assert.equal(result.status, 503);
    assert.equal(calls.length, 0);
  }
  assert.deepEqual((await harness({ config: configured({ RESEND_API_KEY: "" }) }).handle(request())).body, { error: "delivery_unavailable" });
  assert.deepEqual((await harness().handle(request({ ...valid, turnstileToken: "" }))).body, { error: "verification_required" });
});

test("enabling delivery requires an explicit recipient and sender instead of historical fallback", async () => {
  for (const extra of [{ CONTACT_EMAIL: undefined }, { CONTACT_FROM: undefined }, { CONTACT_EMAIL: " " }, { CONTACT_FROM: " " }]) {
    const { handle, calls } = harness({ config: configured(extra) });
    const result = await handle(request());
    assert.equal(result.status, 503);
    assert.deepEqual(result.body, { error: "delivery_unavailable" });
    assert.equal(calls.length, 0);
  }
});

test("forged, expired, replayed, wrong-action and wrong-host challenges never send mail", async () => {
  for (const response of [
    { success: false, "error-codes": ["invalid-input-response"] },
    { success: false, "error-codes": ["timeout-or-duplicate"] },
    { success: true, hostname: "algo.example", action: "login" },
    { success: true, hostname: "evil.example", action: "contact" },
    { success: true, hostname: "algo.example" },
  ]) {
    let calls = 0;
    const fake: typeof fetch = async () => { calls++; return Response.json(response); };
    const result = await harness({ fetch: fake }).handle(request());
    assert.equal(result.status, 400);
    assert.deepEqual(result.body, { error: "verification_failed" });
    assert.equal(calls, 1);
  }
});

test("provider failures/timeouts are safe and never leak response details", async () => {
  for (const response of [new Response("private provider secret", { status: 500 }), new Response("not-json"), Response.json(null)]) {
    const fake: typeof fetch = async () => response;
    assert.deepEqual((await harness({ fetch: fake }).handle(request())).body, { error: "verification_unavailable" });
  }
  const aborted: typeof fetch = async (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new DOMException("private error", "AbortError")), { once: true });
  });
  assert.deepEqual((await harness({ fetch: aborted, verificationTimeoutMs: 5 }).handle(request())).body, { error: "verification_unavailable" });
  const deliveryFailure: typeof fetch = async (input) => String(input).includes("siteverify")
    ? Response.json({ success: true, hostname: "algo.example", action: "contact" })
    : new Response("Private email/body/provider key", { status: 500 });
  assert.deepEqual((await harness({ fetch: deliveryFailure }).handle(request())).body, { error: "delivery_unavailable" });
  const deliveryTimeout: typeof fetch = async (input, init) => String(input).includes("siteverify")
    ? Response.json({ success: true, hostname: "algo.example", action: "contact" }) : aborted(input, init);
  assert.deepEqual((await harness({ fetch: deliveryTimeout, deliveryTimeoutMs: 5 }).handle(request())).body, { error: "delivery_unavailable" });
});

test("per-IP attempts expire and forwarded IP spoofing cannot alter trusted transport", async () => {
  let time = 0;
  const { handle, calls } = harness({ now: () => time });
  for (let count = 0; count < CONTACT_LIMITS.ipAttempts; count++) assert.equal((await handle(request("invalid"))).status, 400);
  const limited = await handle(request(valid, { headers: { origin: "https://algo.example", "content-type": "application/json", "x-forwarded-for": "198.51.100.9" } }));
  assert.equal(limited.status, 429);
  assert.equal(limited.headers["Retry-After"], "600");
  assert.equal(calls.length, 0);
  time = CONTACT_LIMITS.attemptWindowMs;
  assert.equal((await handle(request())).status, 200);
});

test("global attempt budget and IP map cap do not evict live limits", async () => {
  const limits = { ...CONTACT_LIMITS, globalAttempts: 3, maxIpEntries: 2 };
  const { handle, calls } = harness({ limits });
  assert.equal((await handle(request("invalid", { clientIp: "192.0.2.1" }))).status, 400);
  assert.equal((await handle(request("invalid", { clientIp: "192.0.2.2" }))).status, 400);
  assert.equal((await handle(request("invalid", { clientIp: "192.0.2.3" }))).status, 429);
  assert.equal((await handle(request(valid, { clientIp: "192.0.2.1" }))).status, 429);
  assert.equal(calls.length, 0);
});

test("concurrent verified requests reserve a global send budget before delivery", async () => {
  let deliveries = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const fake: typeof fetch = async (input) => {
    if (String(input).includes("siteverify")) return Response.json({ success: true, hostname: "algo.example", action: "contact" });
    deliveries++;
    await gate;
    return Response.json({ id: "test" });
  };
  const { handle } = harness({ fetch: fake, limits: { ...CONTACT_LIMITS, sends: 2 } });
  const pending = [1, 2, 3, 4].map((id) => handle(request(valid, { clientIp: `192.0.2.${id}` })));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(deliveries, 2);
  release();
  const results = await Promise.all(pending);
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 200, 429, 429]);
});

test("Vercel web adapter enforces raw-stream limits, method and origin policy", async () => {
  const { fetcher, calls } = harness();
  const create = () => createVercelContactHandler({ config: configured(), fetch: fetcher });
  const req = (body: string, headers: Record<string, string> = {}) => new Request("https://algo.example/api/contact", {
    method: "POST", headers: { origin: "https://algo.example", "content-type": "application/json", ...headers }, body,
  });
  assert.equal((await create()(req(JSON.stringify(valid)))).status, 200);
  assert.equal((await create()(req(" ".repeat(CONTACT_MAX_BODY_BYTES + 1)))).status, 413);
  assert.equal((await create()(req("null"))).status, 400);
  const cross = await create()(req(JSON.stringify(valid), { origin: "https://evil.example" }));
  assert.equal(cross.status, 403);
  const options = await create()(new Request("https://algo.example/api/contact", { method: "OPTIONS" }));
  assert.equal(options.status, 405);
  assert.equal(options.headers.get("allow"), "POST");
  assert.equal(options.headers.get("access-control-allow-origin"), null);
  assert.equal(calls.length, 2);
});

test("Netlify adapter handles base64/UTF-8 byte limits, malformed JSON and headers", async () => {
  const { fetcher, calls } = harness();
  async function invoke(body: string, base64 = false, method = "POST") {
    const handler = createNetlifyContactHandler({ config: configured(), fetch: fetcher });
    const event: HandlerEvent = {
      rawUrl: "https://algo.example/api/contact", rawQuery: "", path: "/api/contact", httpMethod: method,
      headers: { origin: "https://algo.example", "content-type": "application/json" }, multiValueHeaders: {},
      queryStringParameters: null, multiValueQueryStringParameters: null, body, isBase64Encoded: base64,
    };
    return await handler(event, {} as HandlerContext, () => {}) as HandlerResponse;
  }
  assert.equal((await invoke(bytes(valid).toString("base64"), true)).statusCode, 200);
  assert.equal((await invoke("null")).statusCode, 400);
  assert.equal((await invoke(Buffer.alloc(CONTACT_MAX_BODY_BYTES + 1, 32).toString("base64"), true)).statusCode, 413);
  assert.equal((await invoke("я".repeat(CONTACT_MAX_BODY_BYTES / 2 + 1))).statusCode, 413);
  const options = await invoke("", false, "OPTIONS");
  assert.equal(options.statusCode, 405);
  assert.equal(options.headers?.Allow, "POST");
  assert.equal(options.headers?.["Cache-Control"], "no-store");
  assert.equal(options.headers?.["Access-Control-Allow-Origin"], undefined);
  assert.equal(calls.length, 2);
});

test("Express adapter protects the actual HTTP route, ignores spoofed forwarding, and caps raw bytes", async () => {
  const { fetcher, calls } = harness();
  const app = express();
  const server = createServer(app);
  await registerRoutes(server, app, { config: configured(), fetch: fetcher, limits: { ...CONTACT_LIMITS, ipAttempts: 2 } });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const url = `http://127.0.0.1:${address.port}/api/contact`;
  const send = (body: string, ip = "192.0.2.4") => fetch(url, { method: "POST", headers: { origin: "https://algo.example", "content-type": "application/json", "x-forwarded-for": ip }, body });
  try {
    const method = await fetch(url);
    assert.equal(method.status, 405);
    assert.equal(method.headers.get("allow"), "POST");
    assert.equal((await send(" ".repeat(CONTACT_MAX_BODY_BYTES + 1))).status, 413);
    assert.equal((await send("{broken")).status, 400);
    assert.equal((await send(JSON.stringify(valid))).status, 200);
    const limited = await send(JSON.stringify(valid), "198.51.100.6");
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("retry-after"), "600");
    assert.equal(calls.length, 2);
    assert.equal(JSON.parse(String(calls[0].init.body)).remoteip, "127.0.0.1");
  } finally { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); }
});

test("slow body is bounded in both Vercel streaming and Express HTTP adapters", async () => {
  const { fetcher, calls } = harness();
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(Buffer.from("{")); }, cancel() { cancelled = true; } });
  const webRequest = new Request("https://algo.example/api/contact", {
    method: "POST", headers: { origin: "https://algo.example", "content-type": "application/json" }, body: stream, duplex: "half",
  } as RequestInit);
  const vercel = createVercelContactHandler({ config: configured(), fetch: fetcher, bodyTimeoutMs: 10 });
  assert.equal((await vercel(webRequest)).status, 400);
  assert.equal(cancelled, true);
  const app = express();
  const server = createServer(app);
  await registerRoutes(server, app, { config: configured(), fetch: fetcher, bodyTimeoutMs: 15 });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");
  try {
    const response = await new Promise<{ status: number | undefined; body: string }>((resolve, reject) => {
      const req = httpRequest(`http://127.0.0.1:${address.port}/api/contact`, {
        method: "POST", headers: { origin: "https://algo.example", "content-type": "application/json", "content-length": "100" },
      }, (res) => {
        const parts: Buffer[] = [];
        res.on("data", (chunk) => parts.push(Buffer.from(chunk)));
        res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(parts).toString() }));
      });
      req.on("error", reject);
      req.write("{");
    });
    assert.equal(response.status, 408);
    assert.deepEqual(JSON.parse(response.body), { error: "invalid_request" });
    assert.equal(calls.length, 0);
  } finally { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); }
});
