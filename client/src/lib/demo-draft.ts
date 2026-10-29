/**
 * What survives a reload or a closed window (K3 L1, L3; analysis 4A rows A1, A3): the typed values, the step, the request id and,
 * after step 2, the id of the created request with its details token.  Lives in sessionStorage (this tab only), is cleared when
 * the request is finished.  Storage can be missing or full (private window): every call is wrapped and the form works without it.
 */
import { EMPTY_APPLY_FORM, type ApplyValues, type Step } from "./demo-apply";
import { captureSource, type DemoSource } from "./demo-form";

export const DRAFT_KEY = "algo.demo.draft.v1";
export const SOURCE_KEY = "algo.demo.source.v1";

export interface CreatedRef {
  id: string;
  token: string | null;
  /** ISO time after which the token no longer works; null = unknown. */
  expiresAt: string | null;
}

export interface Draft {
  step: Step | "done";
  values: ApplyValues;
  /** uuid v4 of this request: made once, kept until the request is created (K3_API.md 1.2). */
  requestId: string;
  created: CreatedRef | null;
  /** The text a chapter's button put into the comment (to tell it from what the visitor typed). */
  context: string;
  /** A calm line on the final screen (e.g. step 3 could not be saved). */
  notice: string;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function safe<T>(action: () => T, fallback: T): T {
  try {
    return action();
  } catch {
    return fallback;
  }
}

const STRING_KEYS = [
  "fullName", "centreName", "city", "phone", "email", "studentsCount", "comment", "address", "branchesCount",
  "contactTime", "heardFrom", "orgType", "position", "currentTool",
] as const;

/** Take only what has the right shape: a stale or hand-edited draft must not break the form. */
function cleanValues(raw: unknown): ApplyValues {
  const out: ApplyValues = { ...EMPTY_APPLY_FORM, needs: [] };
  if (typeof raw !== "object" || raw === null) return out;
  const source = raw as Record<string, unknown>;
  for (const key of STRING_KEYS) {
    const value = source[key];
    if (typeof value === "string") (out as unknown as Record<string, string>)[key] = value.slice(0, 2100);
  }
  if (!out.phone) out.phone = EMPTY_APPLY_FORM.phone;
  if (source.branchesMode === "none" || source.branchesMode === "some" || source.branchesMode === "") out.branchesMode = source.branchesMode;
  if (Array.isArray(source.needs)) out.needs = source.needs.filter((n): n is ApplyValues["needs"][number] => typeof n === "string").slice(0, 5);
  return out; // `website` (the honeypot) is never restored
}

export function loadDraft(storage: StorageLike | undefined, now: number = Date.now()): Draft | null {
  if (!storage) return null;
  const text = safe(() => storage.getItem(DRAFT_KEY), null);
  if (!text) return null;
  let raw: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null) return null;
    raw = parsed as Record<string, unknown>;
  } catch {
    return null;
  }
  if (typeof raw.requestId !== "string" || !raw.requestId) return null;
  const created = cleanCreated(raw.created);
  let step: Draft["step"] = raw.step === 2 || raw.step === 3 || raw.step === "done" ? raw.step : 1;
  // Step 3 needs the request that was created at step 2; a request that was not created cannot be at step 3.
  if (step === 3 && !created) step = 2;
  if (step === 2 && created) step = 3;
  // The token lives 2 hours: after that nothing can be added, the request itself was accepted.
  if (step === 3 && created && (!created.token || (created.expiresAt && Date.parse(created.expiresAt) <= now))) step = "done";
  return {
    step,
    values: cleanValues(raw.values),
    requestId: raw.requestId,
    created,
    context: typeof raw.context === "string" ? raw.context : "",
    notice: typeof raw.notice === "string" ? raw.notice : "",
  };
}

function cleanCreated(raw: unknown): CreatedRef | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.id !== "string" || !value.id) return null;
  return {
    id: value.id,
    token: typeof value.token === "string" && value.token ? value.token : null,
    expiresAt: typeof value.expiresAt === "string" ? value.expiresAt : null,
  };
}

export function saveDraft(storage: StorageLike | undefined, draft: Draft): void {
  if (!storage) return;
  const { website: _honeypot, ...values } = draft.values;
  safe(() => storage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, values })), undefined);
}

export function clearDraft(storage: StorageLike | undefined): void {
  if (storage) safe(() => storage.removeItem(DRAFT_KEY), undefined);
}

/** UTM tags and where the visit came from: read on the first visit, kept for the tab (analysis A16). */
export function rememberSource(
  storage: StorageLike | undefined,
  where: { search: string; pathname: string; referrer: string; host: string },
): DemoSource {
  const stored = storage ? safe(() => storage.getItem(SOURCE_KEY), null) : null;
  let previous: DemoSource | null = null;
  if (stored) {
    try {
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed === "object" && parsed !== null) previous = parsed as DemoSource;
    } catch {
      previous = null;
    }
  }
  const source = captureSource(where.search, where.referrer, where.host, previous);
  if (!source.landing) source.landing = where.pathname.slice(0, 300) || "/";
  if (storage) safe(() => storage.setItem(SOURCE_KEY, JSON.stringify(source)), undefined);
  return source;
}
