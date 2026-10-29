/**
 * The form is a place in the browser history (K3 L3, analysis A2/A3): it opens with `#demo`, so on a phone «Назад» closes the
 * window instead of leaving the site, and a link `/?utm_source=x#demo` (what the old /register and /request-demo redirect to)
 * opens it with the query kept.
 *
 * Entries: [page][page#demo].  An entry that already came with `#demo` (direct link, reload) is rebuilt into the same two entries.
 */
export const FORM_HASH = "#demo";
const MARK = "algoDemo";

export interface HistoryHost {
  location: { pathname: string; search: string; hash: string };
  history: {
    state: unknown;
    pushState(state: unknown, title: string, url: string): void;
    replaceState(state: unknown, title: string, url: string): void;
    back(): void;
  };
}

function marked(state: unknown): boolean {
  return typeof state === "object" && state !== null && (state as Record<string, unknown>)[MARK] === 1;
}

export function wantsForm(host: Pick<HistoryHost, "location">): boolean {
  return host.location.hash === FORM_HASH;
}

/** Called when the window opens (button) or the page was opened at `#demo`.  Idempotent. */
export function enterForm(host: HistoryHost): void {
  const base = host.location.pathname + host.location.search;
  if (host.location.hash === FORM_HASH && marked(host.history.state)) return; // reload of our own entry
  if (host.location.hash === FORM_HASH) host.history.replaceState(null, "", base); // direct link: make room for the page entry
  host.history.pushState({ [MARK]: 1 }, "", base + FORM_HASH);
}

/** Called when the window is closed by a button or Esc.  A popstate that already closed it needs no call. */
export function leaveForm(host: HistoryHost): void {
  if (host.location.hash !== FORM_HASH) return;
  if (marked(host.history.state)) host.history.back();
  else host.history.replaceState(null, "", host.location.pathname + host.location.search);
}
