/** One owner for document-entry scrolling; ordinary in-page links remain native. */
export function prepareEntryScroll(browser: Window): () => void {
  const navigation = browser.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const legacy = (browser.performance as Performance & { navigation?: { type: number } }).navigation?.type;
  const type = navigation?.type ?? (legacy === 1 ? "reload" : legacy === 2 ? "back_forward" : "navigate");
  // Back/forward and BFCache belong to the browser, including their saved focus/scroll.
  if (type === "back_forward") return () => {};

  const previousRestoration = browser.history.scrollRestoration;
  browser.history.scrollRestoration = "manual";
  let pendingHash = browser.location.hash;
  let cancelled = false;
  let disposed = false;
  let scheduled = false;
  let frame: number | undefined;
  let expectedLinkPop: string | undefined;
  const top = () => browser.scrollTo({ top: 0, left: 0, behavior: "instant" });

  if (type === "reload") {
    // A fragment from the previous visit is not a new request to open that section.
    browser.history.replaceState(browser.history.state, "", browser.location.pathname + browser.location.search);
    pendingHash = "";
    top();
  }

  let shown: (() => void) | undefined;
  const pageShown = browser.document.readyState === "complete" ? Promise.resolve() : new Promise<void>(resolve => {
    shown = resolve;
    browser.addEventListener("pageshow", shown, { once: true });
  });
  const onIntent = (event: Event) => { if (event.isTrusted) cancelled = true; };
  const onHash = () => {
    if (browser.location.hash !== pendingHash) cancelled = true;
    expectedLinkPop = undefined;
  };
  const onHistory = () => {
    // Native fragment links also emit popstate, before hashchange.
    if (expectedLinkPop && browser.location.hash === expectedLinkPop) {
      expectedLinkPop = undefined;
      return;
    }
    // Real traversal restores persisted scroll after this event: release it now.
    cleanup();
  };
  const onLink = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const url = new URL(link.href, browser.location.href);
    if (url.origin !== browser.location.origin || url.pathname !== browser.location.pathname || url.search !== browser.location.search || !url.hash) return;
    // A deliberate link selected while chunks/fonts load takes priority over the entry URL.
    pendingHash = url.hash;
    expectedLinkPop = url.hash !== browser.location.hash ? url.hash : undefined;
    cancelled = false;
    // This setting belongs to each history entry. Release the OLD entry before
    // the link creates a new one, otherwise Back would inherit a manual entry.
    browser.history.scrollRestoration = previousRestoration;
  };
  const cleanup = () => {
    disposed = true;
    if (frame !== undefined) browser.cancelAnimationFrame(frame);
    for (const name of ["wheel", "touchstart", "pointerdown", "keydown"]) browser.removeEventListener(name, onIntent, true);
    browser.document.removeEventListener("click", onLink, true);
    browser.removeEventListener("hashchange", onHash);
    browser.removeEventListener("popstate", onHistory);
    browser.removeEventListener("pagehide", cleanup);
    if (shown) browser.removeEventListener("pageshow", shown);
    browser.history.scrollRestoration = previousRestoration;
  };
  for (const name of ["wheel", "touchstart", "pointerdown", "keydown"]) browser.addEventListener(name, onIntent, { capture: true, passive: true });
  browser.document.addEventListener("click", onLink, true);
  browser.addEventListener("hashchange", onHash);
  browser.addEventListener("popstate", onHistory);
  browser.addEventListener("pagehide", cleanup);

  // Called once React has committed all lazy chapters. No delayed timer or repeated reset.
  return () => {
    if (scheduled || disposed) return;
    scheduled = true;
    Promise.all([pageShown, browser.document.fonts?.ready]).then(() => {
      if (disposed) return;
      frame = browser.requestAnimationFrame(() => {
        try {
          if (!cancelled && browser.location.hash === pendingHash) {
            let id = "";
            try { id = decodeURIComponent(pendingHash.slice(1)); } catch { /* Invalid fragment starts at the top. */ }
            const target = id ? browser.document.getElementById(id) : null;
            if (target) {
              const margin = parseFloat(browser.getComputedStyle(target).scrollMarginTop) || 0;
              browser.scrollTo({ top: Math.max(0, browser.scrollY + target.getBoundingClientRect().top - margin), left: 0, behavior: "instant" });
            } else top();
          }
        } finally { cleanup(); }
      });
    }, cleanup);
  };
}

// Runs before React mounts, so native restoration cannot race the first render.
export const completeEntryScroll = typeof window === "undefined" ? () => {} : prepareEntryScroll(window);
