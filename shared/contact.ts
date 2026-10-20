import { createHash } from "node:crypto";
import { isIP } from "node:net";

export const CONTACT_MAX_BODY_BYTES = 12 * 1024;
export const CONTACT_BODY_TIMEOUT_MS = 5_000;

type HeaderValue = string | string[] | undefined;
export type ContactHeaders = Record<string, HeaderValue>;
export type ContactErrorCode =
  | "invalid_request" | "payload_too_large" | "method_not_allowed" | "forbidden"
  | "rate_limited" | "verification_required" | "verification_failed"
  | "verification_unavailable" | "delivery_unavailable";

export interface ContactResult {
  status: number;
  headers: Record<string, string>;
  body: { ok: true } | { error: ContactErrorCode; retryAfter?: number };
}

export interface ContactRequest {
  method: string;
  headers: ContactHeaders;
  /** Set only by the adapter's trusted transport/platform, never arbitrary X-Forwarded-For. */
  clientIp?: string;
  readBody: () => Promise<Uint8Array>;
}

export interface ContactConfig {
  allowedOrigins: ReadonlySet<string>;
  expectedHostnames: ReadonlySet<string>;
  turnstileSecret: string;
  resendKey: string;
  recipient: string;
  sender: string;
  deliveryReady: boolean;
  developmentPort?: string;
  valid: boolean;
}

export interface ContactLimits {
  ipAttempts: number;
  attemptWindowMs: number;
  globalAttempts: number;
  sends: number;
  sendWindowMs: number;
  maxIpEntries: number;
}

export const CONTACT_LIMITS: Readonly<ContactLimits> = Object.freeze({
  ipAttempts: 5,
  attemptWindowMs: 10 * 60_000,
  globalAttempts: 100,
  sends: 30,
  sendWindowMs: 60 * 60_000,
  maxIpEntries: 10_000,
});

export class ContactBodyError extends Error {
  constructor(public readonly status: 400 | 413) { super("Contact body rejected"); }
}

const CONTROL = /[\u0000-\u001f\u007f\u2028\u2029]/;
const EMAIL = /^[^\s@<>(),;:\\"\[\]]+@[^\s@<>(),;:\\"\[\]]+\.[^\s@<>(),;:\\"\[\]]+$/;
const isEmail = (value: string) => value.length <= 320 && !CONTROL.test(value) && EMAIL.test(value);
const list = (value: string | undefined) => value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
const isLoopbackHost = (host: string) => ["localhost", "127.0.0.1", "[::1]"].includes(host);

export function normalizeContactIp(value?: string): string | undefined {
  if (!value || value.length > 64 || value !== value.trim()) return undefined;
  if (value.startsWith("::ffff:") && isIP(value.slice(7)) === 4) return value.slice(7);
  return isIP(value) ? value.toLowerCase() : undefined;
}

/** Invalid security configuration fails closed rather than expanding an allowlist. */
export function contactConfig(env: Record<string, string | undefined>): ContactConfig {
  let valid = true;
  const allowedOrigins = new Set<string>();
  for (const origin of list(env.CONTACT_ALLOWED_ORIGINS)) {
    try {
      const url = new URL(origin);
      const localDevelopment = env.NODE_ENV !== "production" && url.protocol === "http:" && isLoopbackHost(url.hostname);
      if ((url.protocol !== "https:" && !localDevelopment) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
        valid = false;
      } else allowedOrigins.add(url.origin);
    } catch { valid = false; }
  }
  const expectedHostnames = new Set<string>();
  for (const hostname of list(env.TURNSTILE_EXPECTED_HOSTNAMES)) {
    if (!/^(?:[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?|\[::1\])$/i.test(hostname) || hostname.includes("..")) valid = false;
    else expectedHostnames.add(hostname.toLowerCase());
  }
  const port = env.PORT || "5050";
  if (!/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535) valid = false;
  const recipient = env.CONTACT_EMAIL?.trim() || "aurorixai@gmail.com";
  const sender = env.CONTACT_FROM?.trim() || "ALGO Landing <onboarding@resend.dev>";
  const senderAddress = sender.match(/^(?:[^<>]{1,100}\s*)?<([^<>]+)>$/)?.[1] || sender;
  // Mail credentials must not silently activate historical development addresses.
  const deliveryReady = !!env.CONTACT_EMAIL?.trim() && !!env.CONTACT_FROM?.trim()
    && isEmail(recipient) && !CONTROL.test(sender) && isEmail(senderAddress);
  return {
    allowedOrigins, expectedHostnames, valid,
    turnstileSecret: env.TURNSTILE_SECRET_KEY?.trim() || "",
    resendKey: env.RESEND_API_KEY?.trim() || "",
    recipient, sender, deliveryReady,
    developmentPort: env.NODE_ENV === "development" ? port : undefined,
  };
}

function header(headers: ContactHeaders, key: string): string | undefined {
  const value = headers[key];
  return typeof value === "string" ? value : undefined;
}

function reply(status: number, body: ContactResult["body"], extra: Record<string, string> = {}): ContactResult {
  return { status, body, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra } };
}

export function contactError(status: number, error: ContactErrorCode): ContactResult {
  return reply(status, { error }, status === 405 ? { Allow: "POST" } : {});
}

interface Counter { count: number; expires: number }
/** A bounded per-process backstop. Serverless instances do not share these counters. */
class ProcessBudget {
  private readonly ips = new Map<string, Counter>();
  private attempts: Counter = { count: 0, expires: 0 };
  private sends: Counter = { count: 0, expires: 0 };
  constructor(private readonly limits: ContactLimits) {}
  private fresh(counter: Counter | undefined, now: number, window: number): Counter {
    return !counter || now >= counter.expires ? { count: 0, expires: now + window } : counter;
  }
  private remaining(counter: Counter, now: number) { return Math.max(1, Math.ceil((counter.expires - now) / 1000)); }
  attempt(ip: string, now: number): number {
    this.attempts = this.fresh(this.attempts, now, this.limits.attemptWindowMs);
    if (this.attempts.count >= this.limits.globalAttempts) return this.remaining(this.attempts, now);
    this.attempts.count++;
    // Do not retain raw IPs and do not evict live entries to make room for an attack.
    const key = createHash("sha256").update(ip).digest("hex");
    const old = this.ips.get(key);
    if (!old && this.ips.size >= this.limits.maxIpEntries) {
      this.ips.forEach((counter, existing) => { if (counter.expires <= now) this.ips.delete(existing); });
      if (this.ips.size >= this.limits.maxIpEntries) return this.remaining(this.attempts, now);
    }
    const counter = this.fresh(old, now, this.limits.attemptWindowMs);
    this.ips.set(key, counter);
    if (counter.count >= this.limits.ipAttempts) return this.remaining(counter, now);
    counter.count++;
    return 0;
  }
  reserveSend(now: number): number {
    this.sends = this.fresh(this.sends, now, this.limits.sendWindowMs);
    if (this.sends.count >= this.limits.sends) return this.remaining(this.sends, now);
    // Reserve before awaiting the provider, so concurrent requests cannot overspend it.
    this.sends.count++;
    return 0;
  }
}

type ContactType = "demo" | "pitchDeck" | "connect";
interface Submission { name: string; email: string; message: string; type: ContactType; website: string; turnstileToken: string }

function submission(bytes: Uint8Array): Submission | undefined {
  if (bytes.byteLength > CONTACT_MAX_BODY_BYTES) throw new ContactBodyError(413);
  let value: unknown;
  try { value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { return undefined; }
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some((key) => !["name", "email", "message", "type", "website", "turnstileToken"].includes(key))) return undefined;
  if (typeof data.name !== "string" || typeof data.email !== "string" || typeof data.type !== "string"
    || typeof data.website !== "string" || typeof data.turnstileToken !== "string"
    || (data.message !== undefined && typeof data.message !== "string")) return undefined;
  if (CONTROL.test(data.name) || CONTROL.test(data.email) || CONTROL.test(data.turnstileToken)) return undefined;
  const name = data.name.trim();
  const email = data.email.trim();
  const message = (data.message as string | undefined)?.trim() || "";
  const type = data.type.trim();
  const website = data.website.trim();
  const turnstileToken = data.turnstileToken.trim();
  if (!name || name.length > 200 || !isEmail(email) || message.length > 2000
    || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)
    || !["demo", "pitchDeck", "connect"].includes(type) || website.length > 200 || turnstileToken.length > 2048) return undefined;
  return { name, email, message, type: type as ContactType, website, turnstileToken };
}

const labels: Record<ContactType, string> = { demo: "Запрос демо", pitchDeck: "Запрос Pitch Deck", connect: "Подключение центра" };
const escapeHtml = (value: string) => value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[char]!));
function emailHtml(data: Submission): string {
  return `<h2>Новая заявка с лендинга ALGO</h2><table>${[
    ["Тип", labels[data.type]], ["Имя", data.name], ["Email", data.email], ["Сообщение", data.message || "—"],
  ].map(([label, value]) => `<tr><th>${label}</th><td>${escapeHtml(value)}</td></tr>`).join("")}</table>`;
}

export interface ContactDependencies {
  config?: ContactConfig;
  fetch?: typeof fetch;
  now?: () => number;
  limits?: ContactLimits;
  bodyTimeoutMs?: number;
  verificationTimeoutMs?: number;
  deliveryTimeoutMs?: number;
}

export function createContactHandler(dependencies: ContactDependencies = {}) {
  const config = dependencies.config ?? contactConfig(process.env);
  const fetcher = dependencies.fetch ?? fetch;
  const now = dependencies.now ?? Date.now;
  const budget = new ProcessBudget(dependencies.limits ?? CONTACT_LIMITS);
  const limited = (retryAfter: number) => reply(429, { error: "rate_limited", retryAfter }, { "Retry-After": String(retryAfter) });
  return async (request: ContactRequest): Promise<ContactResult> => {
    if (request.method !== "POST") return contactError(405, "method_not_allowed");
    if (!config.valid) return contactError(503, "verification_unavailable");
    const ip = normalizeContactIp(request.clientIp);
    const origin = header(request.headers, "origin");
    const fetchSite = header(request.headers, "sec-fetch-site");
    if (fetchSite && fetchSite !== "same-origin") return contactError(403, "forbidden");
    let originHost: string;
    try {
      if (!origin || new URL(origin).origin !== origin) return contactError(403, "forbidden");
      const url = new URL(origin);
      originHost = url.hostname.toLowerCase();
      const local = config.developmentPort && (ip === "127.0.0.1" || ip === "::1")
        && url.protocol === "http:" && isLoopbackHost(url.hostname) && url.port === config.developmentPort;
      if (!config.allowedOrigins.has(origin) && !local) return contactError(403, "forbidden");
    } catch { return contactError(403, "forbidden"); }
    const contentType = header(request.headers, "content-type");
    if (!contentType || !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(contentType.trim())) return contactError(415, "invalid_request");
    const encoding = header(request.headers, "content-encoding");
    if (encoding && encoding.toLowerCase() !== "identity") return contactError(415, "invalid_request");
    const contentLength = header(request.headers, "content-length");
    if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > CONTACT_MAX_BODY_BYTES)) {
      return contactError(/^\d+$/.test(contentLength) ? 413 : 400, /^\d+$/.test(contentLength) ? "payload_too_large" : "invalid_request");
    }
    const attemptWait = budget.attempt(ip || "unknown-transport", now());
    if (attemptWait) return limited(attemptWait);
    let data: Submission | undefined;
    try { data = submission(await request.readBody()); }
    catch (error) { return contactError(error instanceof ContactBodyError ? error.status : 400, error instanceof ContactBodyError && error.status === 413 ? "payload_too_large" : "invalid_request"); }
    if (!data) return contactError(400, "invalid_request");
    if (data.website) return contactError(400, "invalid_request");
    // Preview does not collect or log personal data and never pretends to deliver mail.
    if (!config.resendKey || !config.deliveryReady) return contactError(503, "delivery_unavailable");
    if (!config.turnstileSecret || config.expectedHostnames.size === 0 || !config.expectedHostnames.has(originHost)) return contactError(503, "verification_unavailable");
    if (!data.turnstileToken) return contactError(400, "verification_required");
    const verificationAbort = new AbortController();
    const verificationTimer = setTimeout(() => verificationAbort.abort(), dependencies.verificationTimeoutMs ?? 5_000);
    try {
      const result = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: verificationAbort.signal,
        body: JSON.stringify({ secret: config.turnstileSecret, response: data.turnstileToken, ...(ip ? { remoteip: ip } : {}) }),
      });
      if (!result.ok) return contactError(503, "verification_unavailable");
      const verified: unknown = await result.json();
      if (!verified || typeof verified !== "object") return contactError(503, "verification_unavailable");
      const details = verified as Record<string, unknown>;
      if (details.success !== true || details.action !== "contact" || typeof details.hostname !== "string"
        || !config.expectedHostnames.has(details.hostname.toLowerCase()) || details.hostname.toLowerCase() !== originHost) return contactError(400, "verification_failed");
    } catch { return contactError(503, "verification_unavailable"); }
    finally { clearTimeout(verificationTimer); }
    const sendWait = budget.reserveSend(now());
    if (sendWait) return limited(sendWait);
    const deliveryAbort = new AbortController();
    const deliveryTimer = setTimeout(() => deliveryAbort.abort(), dependencies.deliveryTimeoutMs ?? 8_000);
    try {
      const result = await fetcher("https://api.resend.com/emails", {
        method: "POST", signal: deliveryAbort.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.resendKey}` },
        body: JSON.stringify({ from: config.sender, to: [config.recipient], reply_to: data.email, subject: `[ALGO] ${labels[data.type]} — ${data.name}`, html: emailHtml(data) }),
      });
      // Provider response bodies can contain PII/secrets; do not expose or log them.
      if (!result.ok) return contactError(503, "delivery_unavailable");
      return reply(200, { ok: true });
    } catch { return contactError(503, "delivery_unavailable"); }
    finally { clearTimeout(deliveryTimer); }
  };
}
