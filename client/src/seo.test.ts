import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name: string) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
const html = read("index.html");

/** The sha256 that nginx's CSP (I5) lists for the inline JSON-LD block.  Change the block -> change this AND the CSP in nginx. */
const JSON_LD_CSP_HASH = "sha256-4aGtvtcALQgeHnlSqbuF2OnJMzibRdE21wZJyYZkEuY=";

test("K3 L8: canonical, og:url and JSON-LD point at https://algolab.me/", () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/algolab\.me\/" \/>/);
  assert.match(html, /<meta property="og:url" content="https:\/\/algolab\.me\/" \/>/);
  const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(block, "JSON-LD block");
  const data = JSON.parse(block[1]);
  assert.equal(data.url, "https://algolab.me/");
  assert.equal(data.logo, "https://algolab.me/favicon.svg");
  assert.ok(!/netlify/i.test(html), "no old netlify address left");
  for (const image of html.matchAll(/(?:og|twitter):image" content="([^"]+)"/g)) assert.match(image[1], /^https:\/\/algolab\.me\//);
});

test("K3 L8: the CSP hash of the JSON-LD block is the one written in the handoff (and in nginx)", () => {
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).filter((t) => t.trim());
  assert.equal(inline.length, 1, "exactly one inline script: the JSON-LD");
  assert.equal("sha256-" + createHash("sha256").update(inline[0]).digest("base64"), JSON_LD_CSP_HASH);
});

test("K3 L8/L9: sitemap and robots, release marker placeholder, no Express/Netlify leftovers", () => {
  assert.match(read("public/sitemap.xml"), /<loc>https:\/\/algolab\.me\/<\/loc>/);
  assert.match(read("public/robots.txt"), /^Sitemap: https:\/\/algolab\.me\/sitemap\.xml$/m);
  assert.doesNotMatch(read("public/robots.txt"), /netlify/i);
  assert.match(html, /<meta name="release" content="__RELEASE__" \/>/);
});
