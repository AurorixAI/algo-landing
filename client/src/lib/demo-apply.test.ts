import assert from "node:assert/strict";
import test from "node:test";
import {
  EMPTY_APPLY_FORM,
  buildCreateBody,
  buildDetailsBody,
  describeFailure,
  firstStepWithErrors,
  isUntouched,
  validateStep,
  type ApplyValues,
} from "./demo-apply";
import { maskPhone } from "./demo-form";

const ID = "6f1c1b3e-8a52-4f4e-9d6a-2c7f3f5d9a10";

function filled(over: Partial<ApplyValues> = {}): ApplyValues {
  return {
    ...EMPTY_APPLY_FORM,
    centreName: "Центр «Альфа»",
    orgType: "center",
    city: "Ташкент",
    fullName: "Иван Петров",
    phone: maskPhone("901234567"),
    email: " Ivan@Alfa.UZ ",
    ...over,
  };
}

test("step 1 needs name, type and city; the rest of the form is not asked yet", () => {
  assert.deepEqual(Object.keys(validateStep(1, EMPTY_APPLY_FORM)).sort(), ["centreName", "city", "orgType"]);
  assert.deepEqual(validateStep(1, filled()), {});
});

test("step 2 needs name, a full +998 phone and an email", () => {
  const empty = validateStep(2, { ...EMPTY_APPLY_FORM, centreName: "x" });
  assert.deepEqual(Object.keys(empty).sort(), ["email", "fullName", "phone"]);
  assert.match(validateStep(2, filled({ phone: maskPhone("90123") })).phone ?? "", /полностью/);
  assert.match(validateStep(2, filled({ email: "ivan@" })).email ?? "", /почту/);
  assert.deepEqual(validateStep(2, filled()), {});
});

test("optional fields stay optional, but a wrong value is caught", () => {
  assert.equal(validateStep(1, filled({ studentsCount: "" })).studentsCount, undefined);
  assert.ok(validateStep(1, filled({ studentsCount: "100001" })).studentsCount);
  assert.ok(validateStep(1, filled({ branchesMode: "some", branchesCount: "" })).branchesCount);
  assert.ok(validateStep(1, filled({ branchesMode: "some", branchesCount: "1000" })).branchesCount);
  assert.equal(validateStep(1, filled({ branchesMode: "none" })).branchesCount, undefined);
  assert.ok(validateStep(1, filled({ address: "а".repeat(301) })).address);
  assert.ok(validateStep(3, filled({ comment: "а".repeat(2001) })).comment);
  assert.ok(validateStep(3, filled({ heardFrom: "а".repeat(201) })).heardFrom);
  assert.deepEqual(validateStep(3, EMPTY_APPLY_FORM), {}); // step 3 is entirely optional
});

test("create body: snake_case keys of K3_API.md, normalised values, honeypot always present", () => {
  const body = buildCreateBody(
    filled({ address: " ул. Навои 1 ", studentsCount: "120", branchesMode: "none", position: "owner", contactTime: "после 15:00" }),
    { utm_source: "ads", landing: "/" },
    ID,
    "ts-token",
  );
  assert.deepEqual(body, {
    contact_name: "Иван Петров",
    centre_name: "Центр «Альфа»",
    city: "Ташкент",
    phone: "+998901234567",
    email: "ivan@alfa.uz",
    website: "",
    students_count: 120,
    source: { utm_source: "ads", landing: "/" },
    request_id: ID,
    locale: "ru",
    org_type: "center",
    address: "ул. Навои 1",
    branches_count: 0,
    position: "owner",
    preferred_contact_time: "после 15:00",
    turnstile_token: "ts-token",
  });
  assert.ok(!Object.keys(body).some((k) => /[A-Z]/.test(k)), "no camelCase keys");
});

test("create body leaves out what was not filled (the server knows no empty values)", () => {
  const body = buildCreateBody(filled(), undefined, ID, "");
  for (const key of ["students_count", "address", "branches_count", "position", "preferred_contact_time", "turnstile_token", "source", "comment"]) {
    assert.ok(!(key in body), key);
  }
  assert.equal(buildCreateBody(filled({ branchesMode: "some", branchesCount: "3" }), undefined, ID, "").branches_count, 3);
  assert.equal(buildCreateBody(filled({ website: "bot" }), undefined, ID, "").website, "bot"); // the server drops it silently
});

test("details body: only what was filled; nothing filled = nothing to send", () => {
  assert.equal(buildDetailsBody(EMPTY_APPLY_FORM, "tok"), null);
  assert.equal(buildDetailsBody({ ...EMPTY_APPLY_FORM, comment: "   " }, "tok"), null);
  assert.deepEqual(
    buildDetailsBody({ ...EMPTY_APPLY_FORM, needs: ["exams", "payments"], currentTool: "excel", heardFrom: " Telegram ", comment: "Привет" }, "tok"),
    { details_token: "tok", needs: ["payments", "exams"], current_tool: "excel", heard_from: "Telegram", comment: "Привет" },
  );
});

test("a draft nobody typed in is untouched", () => {
  assert.equal(isUntouched(EMPTY_APPLY_FORM), true);
  assert.equal(isUntouched({ ...EMPTY_APPLY_FORM, needs: ["exams"] }), false);
  assert.equal(isUntouched({ ...EMPTY_APPLY_FORM, city: "Ташкент" }), false);
});

test("failures: field errors (old and new names) point at the step that shows the field", () => {
  const view = describeFailure({ status: 422, message: "Проверьте поля", fields: { contact_name: "Короткое имя", org_type: "Неизвестный тип" } }, 2);
  assert.equal(view.kind, "fields");
  assert.equal(view.errors.fullName, "Короткое имя");
  assert.equal(view.errors.orgType, "Неизвестный тип");
  assert.equal(view.step, 1); // the earliest step with an error
  assert.equal(view.message, "Проверьте отмеченные поля.");
  assert.equal(firstStepWithErrors({ phone: "x" }, 3), 2);
  const onlyNew = describeFailure({ status: 422, message: "m", fields: { branches_count: "Слишком много" } }, 2);
  assert.equal(onlyNew.errors.branchesCount, "Слишком много");
  assert.equal(onlyNew.message, "Проверьте отмеченные поля.");
});

test("failures: 429, no network, server error, captcha, unknown fields, repeated conflict", () => {
  const limited = describeFailure({ status: 429, message: "x", retryAfter: 120 }, 2);
  assert.equal(limited.kind, "rate_limited");
  assert.match(limited.message, /через 2 мин/);
  const offline = describeFailure({ status: 0, message: "x" }, 2);
  assert.equal(offline.kind, "network");
  assert.match(offline.message, /сохранены/);
  assert.equal(describeFailure({ status: 502, message: "x" }, 2).kind, "server");
  assert.equal(describeFailure({ status: 400, message: "x", code: "captcha_failed" }, 2).kind, "captcha");
  assert.equal(describeFailure({ status: 400, message: "x", code: "unknown_fields", fields: { foo: "Неизвестное поле" } }, 2).kind, "outdated");
  assert.equal(describeFailure({ status: 409, message: "x", code: "request_id_conflict" }, 2).kind, "conflict");
  assert.equal(describeFailure(new Error("boom"), 2).kind, "server");
  for (const kind of ["rate_limited", "network", "server"]) {
    assert.ok(!/localhost|undefined|\[object/.test(describeFailure({ status: kind === "network" ? 0 : kind === "server" ? 500 : 429, message: "m" }, 2).message));
  }
});
