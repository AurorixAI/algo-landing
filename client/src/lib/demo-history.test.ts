import assert from "node:assert/strict";
import test from "node:test";
import { enterForm, leaveForm, wantsForm, type HistoryHost } from "./demo-history";

/** A browser history as a list of entries: enough to see what «Назад» does. */
function browser(address: string, state: unknown = null) {
  const entries: Array<{ url: URL; state: unknown }> = [{ url: new URL(address), state }];
  let at = 0;
  const host: HistoryHost = {
    get location() { const u = entries[at].url; return { pathname: u.pathname, search: u.search, hash: u.hash }; },
    history: {
      get state() { return entries[at].state; },
      pushState(s, _t, url) { entries.splice(at + 1); entries.push({ url: new URL(url, entries[at].url), state: s }); at++; },
      replaceState(s, _t, url) { entries[at] = { url: new URL(url, entries[at].url), state: s }; },
      back() { at = Math.max(0, at - 1); },
    },
  };
  return { host, entries, get at() { return at; }, back: () => host.history.back() };
}
const where = (b: ReturnType<typeof browser>) => b.entries[b.at].url.pathname + b.entries[b.at].url.search + b.entries[b.at].url.hash;

test("a button opens #demo as a new history entry; «Назад» is the page again", () => {
  const b = browser("https://algolab.me/?utm_source=ads");
  enterForm(b.host);
  assert.equal(where(b), "/?utm_source=ads#demo");
  assert.equal(wantsForm(b.host), true);
  assert.equal(b.entries.length, 2);
  b.back(); // the phone's Back
  assert.equal(where(b), "/?utm_source=ads");
  assert.equal(wantsForm(b.host), false);
});

test("closing with the X goes back one entry, so Back afterwards leaves the page as it should, not a stale #demo", () => {
  const b = browser("https://algolab.me/");
  enterForm(b.host);
  leaveForm(b.host);
  assert.equal(where(b), "/");
  assert.equal(b.at, 0);
  leaveForm(b.host); // already closed: nothing happens
  assert.equal(b.at, 0);
});

test("a link /?utm…#demo opens the form, keeps the query and leaves a page entry behind it", () => {
  const b = browser("https://algolab.me/?utm_source=x&utm_campaign=y#demo");
  assert.equal(wantsForm(b.host), true);
  enterForm(b.host);
  assert.equal(b.entries.length, 2);
  assert.equal(where(b), "/?utm_source=x&utm_campaign=y#demo");
  assert.equal(b.entries[0].url.search, "?utm_source=x&utm_campaign=y");
  assert.equal(b.entries[0].url.hash, "");
  b.back();
  assert.equal(where(b), "/?utm_source=x&utm_campaign=y"); // Back closes the window, the page and the query stay
});

test("a reload of our own entry keeps it as it is (entering twice does not stack entries)", () => {
  const b = browser("https://algolab.me/");
  enterForm(b.host);
  enterForm(b.host);
  assert.equal(b.entries.length, 2);
});

test("an #demo typed by hand (no mark) is closed by rewriting the address, not by walking back out of the site", () => {
  const b = browser("https://algolab.me/?a=1#demo");
  leaveForm(b.host);
  assert.equal(where(b), "/?a=1");
  assert.equal(b.entries.length, 1);
});
