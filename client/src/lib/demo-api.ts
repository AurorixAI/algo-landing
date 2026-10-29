/**
 * Client of `POST/PATCH /api/v1/public/demo-requests` (K3_API.md).  The address is relative: on the landing host nginx proxies
 * `/api/v1/public/` to the auth service, so one build works on any host (K3 spec section 0).
 *
 * `fetch` and the id generator are passed in, so tests run it without a browser.
 */
import type { CreateBody, DetailsBody, FailureShape } from "./demo-apply";

export const DEMO_REQUESTS_PATH = "/api/v1/public/demo-requests";
const TIMEOUT_MS = 20_000;

/** A failed request.  `status` 0 = no connection (also a timeout: the id makes a repeat safe). */
export class ApiFailure extends Error implements FailureShape {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
    readonly fields?: Record<string, string>,
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "ApiFailure";
  }
}

export interface ApiDeps {
  fetch?: typeof fetch;
  /** A fresh uuid v4 (used when the server says `request_id_conflict`). */
  newId?: () => string;
  timeoutMs?: number;
}

export interface Created {
  id: string;
  /** null when the server did not hand a token (a repeat of an old request): step 3 is then not possible. */
  detailsToken: string | null;
  detailsTokenExpiresAt: string | null;
  /** The request_id that was finally accepted (differs from the first one after a conflict). */
  requestId: string;
}

/** uuid v4 that also works where `crypto.randomUUID` does not (plain http, old browsers). */
export function uuid4(cryptoApi: Pick<Crypto, "getRandomValues"> & Partial<Pick<Crypto, "randomUUID">> = globalThis.crypto): string {
  if (typeof cryptoApi.randomUUID === "function") return cryptoApi.randomUUID();
  const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

async function send(method: "POST" | "PATCH", url: string, body: unknown, deps: ApiDeps): Promise<Record<string, unknown>> {
  const doFetch = deps.fetch ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), deps.timeoutMs ?? TIMEOUT_MS);
  let response: Response;
  try {
    response = await doFetch(url, {
      method,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiFailure(0, "Нет связи с сервером");
  } finally {
    clearTimeout(timer);
  }
  let payload: Record<string, unknown> = {};
  try {
    const parsed: unknown = await response.json();
    if (typeof parsed === "object" && parsed !== null) payload = parsed as Record<string, unknown>;
  } catch {
    /* nginx 502/504 answer with html: only the status matters then */
  }
  if (response.status >= 200 && response.status < 300) return payload;
  const retryHeader = Number(response.headers.get("Retry-After"));
  const fields =
    typeof payload.fields === "object" && payload.fields !== null ? (payload.fields as Record<string, string>) : undefined;
  throw new ApiFailure(
    response.status,
    text(payload.detail) ?? "Не удалось отправить заявку",
    text(payload.code),
    fields,
    Number.isFinite(retryHeader) && retryHeader > 0 ? retryHeader : undefined,
  );
}

/**
 * Create the request (end of step 2).  On `request_id_conflict` a NEW id is made and the request is repeated ONCE (K3_API.md 1.2);
 * any other failure is thrown as it is, and the same id is kept for the visitor's next try (a repeat then returns the same request).
 */
export async function createDemoRequest(body: CreateBody, deps: ApiDeps = {}): Promise<Created> {
  let sent = body;
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await send("POST", DEMO_REQUESTS_PATH, sent, deps);
      return {
        id: text(response.id) ?? "",
        detailsToken: text(response.details_token) ?? null,
        detailsTokenExpiresAt: text(response.details_token_expires_at) ?? null,
        requestId: sent.request_id,
      };
    } catch (error) {
      if (error instanceof ApiFailure && error.status === 409 && error.code === "request_id_conflict" && attempt === 0) {
        sent = { ...sent, request_id: (deps.newId ?? uuid4)() };
        continue;
      }
      throw error;
    }
  }
}

/** Add step 3 to the request that was created at step 2. */
export async function patchDemoRequest(id: string, body: DetailsBody, deps: ApiDeps = {}): Promise<void> {
  await send("PATCH", `${DEMO_REQUESTS_PATH}/${encodeURIComponent(id)}`, body, deps);
}
