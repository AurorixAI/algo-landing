import assert from "node:assert/strict";
import test from "node:test";
import { prepareEntryScroll } from "./entry-scroll";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
}

function fixture(type = "navigate", address = "https://algo.example/?campaign=demo", initialY = 0) {
  const fonts = deferred();
  const events = new Map<string, Set<Function>>();
  const frames = new Map<number, FrameRequestCallback>();
  const targets = new Map<string, { absoluteTop: number; margin: string }>();
  const scrolls: ScrollToOptions[] = [];
  let url = new URL(address);
  let y = initialY;
  let entry = { restoration: "auto", savedY: initialY, href: address };
  const trail: typeof entry[] = [];
  let frameId = 0;
  const emit = (name: string, event: unknown = {}) => { for (const handler of [...events.get(name) ?? []]) handler(event); };
  const add = (name: string, callback: Function) => { if (!events.has(name)) events.set(name, new Set()); events.get(name)!.add(callback); };
  const remove = (name: string, callback: Function) => { events.get(name)?.delete(callback); };
  const state = { preserved: "history state" };
  const browser = {
    performance: { getEntriesByType: () => [{ type }] },
    get location() { return url; },
    get scrollY() { return y; },
    history: { state, get scrollRestoration() { return entry.restoration; }, set scrollRestoration(value: string) { entry.restoration = value; }, replaceState: (saved: unknown, _title: string, value: string) => { assert.equal(saved, state); url = new URL(value, url); entry.href = url.href; } },
    document: {
      readyState: "loading", fonts: { ready: fonts.promise },
      addEventListener: add, removeEventListener: remove,
      getElementById: (id: string) => {
        const target = targets.get(id);
        return target ? { target, getBoundingClientRect: () => ({ top: target.absoluteTop - y }) } : null;
      },
    },
    addEventListener: add, removeEventListener: remove,
    getComputedStyle: (node: { target: { margin: string } }) => ({ scrollMarginTop: node.target.margin }),
    scrollTo: (options: ScrollToOptions) => { scrolls.push(options); y = options.top ?? y; },
    requestAnimationFrame: (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id: number) => { frames.delete(id); },
  };
  const ready = async () => {
    emit("pageshow"); fonts.resolve();
    await Promise.resolve(); await Promise.resolve();
  };
  const paint = () => { for (const [id, callback] of [...frames]) { frames.delete(id); callback(0); } };
  return {
    browser: browser as unknown as Window, raw: browser, scrolls, events, fonts, targets, ready, paint, emit,
    get y() { return y; }, get url() { return url; },
    move: (position: number) => { y = position; },
    hash: (hash: string) => { url.hash = hash; emit("hashchange"); },
    link: (hash: string) => {
      emit("pointerdown", { isTrusted: true });
      const link = { href: new URL(hash, url).href, target: "", hasAttribute: () => false };
      emit("click", { target: { closest: () => link }, button: 0 });
      entry.savedY = y;
      trail.push(entry);
      url = new URL(hash, url);
      entry = { ...entry, href: url.href };
      emit("popstate"); emit("hashchange");
    },
    back: () => {
      entry = trail.pop()!;
      url = new URL(entry.href);
      emit("popstate");
      if (entry.restoration === "auto") y = entry.savedY;
      emit("hashchange");
    },
  };
}

test("reload resets a saved bottom position and removes only the old fragment", async () => {
  const page = fixture("reload", "https://algo.example/?campaign=demo#payroll", 8300);
  const complete = prepareEntryScroll(page.browser);
  assert.equal(page.y, 0);
  assert.equal(page.url.href, "https://algo.example/?campaign=demo");
  assert.equal(page.raw.history.scrollRestoration, "manual");
  complete(); await page.ready(); page.paint();
  assert.equal(page.y, 0);
  assert.equal(page.raw.history.scrollRestoration, "auto");
  assert.ok(page.scrolls.every(scroll => scroll.behavior === "instant"));
  assert.ok([...page.events.values()].every(handlers => handlers.size === 0));
});

test("direct fragment waits for all chapters, page restoration and fonts", async () => {
  const page = fixture("navigate", "https://algo.example/#diagnostics");
  const complete = prepareEntryScroll(page.browser);
  page.targets.set("diagnostics", { absoluteTop: 2000, margin: "104px" });
  await page.ready(); page.paint();
  assert.equal(page.scrolls.length, 0); // React chapters have not committed yet.
  complete(); await Promise.resolve(); await Promise.resolve(); page.paint();
  assert.equal(page.y, 1896);
  assert.equal(page.url.hash, "#diagnostics");
  complete(); page.paint();
  assert.equal(page.scrolls.length, 1);
});

test("no late jump overrides manual scrolling while fonts are pending", async () => {
  const page = fixture("navigate", "https://algo.example/#demo");
  page.targets.set("demo", { absoluteTop: 8000, margin: "104px" });
  const complete = prepareEntryScroll(page.browser);
  complete(); page.emit("wheel", { isTrusted: true }); page.move(900);
  await page.ready(); page.paint();
  assert.equal(page.y, 900);
  assert.equal(page.scrolls.length, 0);
  assert.equal(page.raw.history.scrollRestoration, "auto");
});

test("a newly selected anchor supersedes the stale entry target", async () => {
  const page = fixture("navigate", "https://algo.example/#demo");
  page.targets.set("demo", { absoluteTop: 8000, margin: "104px" });
  page.targets.set("exams", { absoluteTop: 1500, margin: "88px" });
  const complete = prepareEntryScroll(page.browser);
  complete(); page.link("#exams");
  await page.ready(); page.paint();
  assert.equal(page.y, 1412);
  assert.equal(page.url.hash, "#exams");
});

test("scrolling after selecting an anchor cancels its pending correction too", async () => {
  const page = fixture("reload", "https://algo.example/#demo", 8000);
  page.targets.set("exams", { absoluteTop: 1500, margin: "88px" });
  const complete = prepareEntryScroll(page.browser);
  complete(); page.link("#exams"); page.emit("touchstart", { isTrusted: true }); page.move(500);
  await page.ready(); page.paint();
  assert.equal(page.y, 500);
  assert.equal(page.scrolls.length, 1); // Only the immediate reload reset.
});

test("an anchor clicked during loading preserves the old entry for Back", async () => {
  const page = fixture();
  page.targets.set("exams", { absoluteTop: 1500, margin: "88px" });
  const complete = prepareEntryScroll(page.browser);
  assert.equal(page.raw.history.scrollRestoration, "manual");
  page.link("#exams");
  complete(); await page.ready(); page.paint();
  assert.equal(page.y, 1412);
  page.back();
  assert.equal(page.url.hash, "");
  assert.equal(page.raw.history.scrollRestoration, "auto");
  assert.equal(page.y, 0);
});

test("back/forward is left entirely to native restoration", async () => {
  const page = fixture("back_forward", "https://algo.example/#demo", 8300);
  prepareEntryScroll(page.browser)(); await page.ready(); page.paint();
  assert.equal(page.y, 8300);
  assert.equal(page.url.hash, "#demo");
  assert.equal(page.raw.history.scrollRestoration, "auto");
  assert.equal(page.scrolls.length, 0);
  assert.equal(page.events.size, 0);
});

test("history traversal during loading cancels the initial target", async () => {
  const page = fixture("navigate", "https://algo.example/#demo");
  const complete = prepareEntryScroll(page.browser);
  complete(); page.emit("popstate"); page.hash("#exams"); page.move(1200);
  assert.equal(page.raw.history.scrollRestoration, "auto");
  await page.ready(); page.paint();
  assert.equal(page.y, 1200);
  assert.equal(page.scrolls.length, 0);
});

test("pagehide cancels queued work so BFCache cannot replay it", async () => {
  const page = fixture("navigate", "https://algo.example/#demo");
  const complete = prepareEntryScroll(page.browser);
  complete(); await page.ready(); page.emit("pagehide"); page.move(3600); page.paint();
  page.emit("pageshow", { persisted: true });
  assert.equal(page.y, 3600);
  assert.equal(page.raw.history.scrollRestoration, "auto");
  assert.equal(page.scrolls.length, 0);
});

test("invalid or unknown fragments safely start at the top", async () => {
  for (const hash of ["#missing-section", "#%broken"]) {
    const page = fixture("navigate", `https://algo.example/${hash}`, 3000);
    prepareEntryScroll(page.browser)(); await page.ready(); page.paint();
    assert.equal(page.y, 0);
    assert.equal(page.scrolls.length, 1);
  }
});

test("wheel between font readiness and the final frame still wins", async () => {
  const page = fixture("navigate", "https://algo.example/#demo");
  page.targets.set("demo", { absoluteTop: 8000, margin: "104px" });
  prepareEntryScroll(page.browser)(); await page.ready();
  page.emit("wheel", { isTrusted: true }); page.move(740); page.paint();
  assert.equal(page.y, 740);
  assert.equal(page.scrolls.length, 0);
});

test("leaving before pageshow does not hold restoration or replay on return", async () => {
  const page = fixture("reload", "https://algo.example/#demo", 8000);
  const complete = prepareEntryScroll(page.browser);
  page.emit("pagehide");
  assert.equal(page.raw.history.scrollRestoration, "auto");
  page.move(2400); complete(); await page.ready(); page.paint();
  assert.equal(page.y, 2400);
  assert.equal(page.scrolls.length, 1);
});
