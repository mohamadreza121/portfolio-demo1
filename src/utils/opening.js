const openingKey = "portfolio-opening-seen";

export function getOpeningVariant({ pathname, hash }, compact) {
  if (pathname !== "/" || (hash && hash !== "#home")) return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  try {
    if (window.sessionStorage.getItem(openingKey) === "1") return null;
  } catch {
    // Storage can be disabled in a browser session.
  }

  return compact ? "compact" : "desktop";
}

export function markOpeningSeen() {
  try {
    window.sessionStorage.setItem(openingKey, "1");
  } catch {
    // The current page still completes the opening without storage.
  }
}
