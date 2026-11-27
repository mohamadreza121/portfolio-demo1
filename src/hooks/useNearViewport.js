import { useEffect, useState } from "react";

export default function useNearViewport(ref) {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (near || !element) return;

    const panel = element.closest(".scroll-deck__panel");
    const root = document.documentElement;
    let intersects = typeof IntersectionObserver === "undefined";

    function reveal() {
      if (intersects && root.dataset.phase !== "intro" && panel?.getAttribute("aria-hidden") !== "true") {
        setNear(true);
      }
    }

    // Inactive deck panels can overlap the viewport geometrically.
    const visibility = new MutationObserver(reveal);
    visibility.observe(root, { attributes: true, attributeFilter: ["data-phase"] });
    if (panel) visibility.observe(panel, { attributes: true, attributeFilter: ["aria-hidden"] });

    const observer = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([entry]) => {
          intersects = entry.isIntersecting;
          reveal();
        }, { root: panel, rootMargin: "180px 0px" })
      : null;
    observer?.observe(element);
    if (!observer) reveal();

    return () => {
      observer?.disconnect();
      visibility.disconnect();
    };
  }, [near, ref]);

  return near;
}
