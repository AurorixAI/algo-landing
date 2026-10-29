import assert from "node:assert/strict";
import test from "node:test";
import { EMPTY_APPLY_FORM } from "./demo-apply";
import { DRAFT_KEY, SOURCE_KEY, clearDraft, loadDraft, rememberSource, saveDraft, type Draft } from "./demo-draft";

class Memory {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
  removeItem(k: string) { this.data.delete(k); }
}
const broken = {
  getItem: () => { throw new Error("blocked"); },
  setItem: () => { throw new Error("full"); },
  removeItem: () => { throw new Error("blocked"); },
};
const draft = (over: Partial<Draft> = {}): Draft => ({
  step: 2, requestId: "11111111-1111-4111-8111-111111111111", created: null, context: "", notice: "",
  values: { ...EMPTY_APPLY_FORM, centreName: "Альфа", city: "Ташкент", orgType: "center", needs: [] }, ...over,
});

test("typed values and the step come back after a reload; the honeypot does not", () => {
  const store = new Memory();
  saveDraft(store, draft({ values: { ...draft().values, website: "bot", fullName: "Иван" } }));
  assert.ok(!store.getItem(DRAFT_KEY)!.includes("bot"));
  const back = loadDraft(store)!;
  assert.equal(back.step, 2);
  assert.equal(back.values.centreName, "Альфа");
  assert.equal(back.values.fullName, "Иван");
  assert.equal(back.values.website, "");
  assert.equal(back.requestId, "11111111-1111-4111-8111-111111111111");
});

test("after success the draft is cleared", () => {
  const store = new Memory();
  saveDraft(store, draft());
  clearDraft(store);
  assert.equal(loadDraft(store), null);
});

test("garbage in storage gives no draft; missing or blocked storage never throws", () => {
  const store = new Memory();
  for (const text of ["", "{", "null", "[]", "{\"step\":9}", "{\"requestId\":5}"]) {
    store.setItem(DRAFT_KEY, text);
    assert.equal(loadDraft(store), null, text);
  }
  assert.equal(loadDraft(undefined), null);
  assert.equal(loadDraft(broken), null);
  assert.doesNotThrow(() => { saveDraft(broken, draft()); clearDraft(broken); saveDraft(undefined, draft()); });
});

test("a hand-edited draft cannot put wrong types into the form", () => {
  const store = new Memory();
  store.setItem(DRAFT_KEY, JSON.stringify({ step: 1, requestId: "x", values: { centreName: 5, city: "Ташкент", needs: "exams", phone: "" } }));
  const back = loadDraft(store)!;
  assert.equal(back.values.centreName, "");
  assert.equal(back.values.city, "Ташкент");
  assert.deepEqual(back.values.needs, []);
  assert.equal(back.values.phone, "+998 ");
});

test("step 3 needs the created request; its token lives 2 hours", () => {
  const store = new Memory();
  const created = { id: "r1", token: "t", expiresAt: "2026-10-29T12:00:00.000Z" };
  saveDraft(store, draft({ step: 3, created }));
  assert.equal(loadDraft(store, Date.parse("2026-10-29T11:00:00Z"))!.step, 3);
  assert.equal(loadDraft(store, Date.parse("2026-10-29T12:00:01Z"))!.step, "done"); // nothing can be added any more; the request is accepted
  saveDraft(store, draft({ step: 3, created: null }));
  assert.equal(loadDraft(store)!.step, 2); // not created: back to the step that creates it
  saveDraft(store, draft({ step: 2, created }));
  assert.equal(loadDraft(store, Date.parse("2026-10-29T11:00:00Z"))!.step, 3); // created while the answer was lost: go on with step 3
});

test("source: utm and referrer host are read once and kept for the tab; the first values win over a later bare visit", () => {
  const store = new Memory();
  const first = rememberSource(store, { search: "?utm_source=ads&utm_campaign=oct&x=1", pathname: "/", referrer: "https://t.me/some/chat?id=77", host: "algolab.me" });
  assert.deepEqual(first, { utm_source: "ads", utm_campaign: "oct", referrer: "t.me", landing: "/" });
  assert.ok(store.getItem(SOURCE_KEY));
  const later = rememberSource(store, { search: "", pathname: "/", referrer: "", host: "algolab.me" });
  assert.deepEqual(later, first);
  assert.equal(rememberSource(broken, { search: "?utm_source=a", pathname: "/", referrer: "", host: "h" }).utm_source, "a");
});
