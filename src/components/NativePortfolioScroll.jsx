import { useEffect, useLayoutEffect, useRef } from "react";
import {
  portfolioSections,
  restoreProjectPosition,
} from "../utils/scrollToSection";

function updateHash(id) {
  if (window.location.hash === `#${id}`) return;
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, "", `${pathname}${search}#${id}`);
}

export default function NativePortfolioScroll({ children, ready, request, setActive }) {
  const container = useRef(null);
  const currentSection = useRef(null);

  useLayoutEffect(() => {
    if (!ready || !container.current) return;

    const id = request.id || "home";
    const target = container.current.querySelector(`#${id}`);
    if (!target) return;

    // Wait for the intro to unlock document scrolling before landing on the anchor.
    const frame = requestAnimationFrame(() => {
      if (request.projectPosition) {
        restoreProjectPosition(request.projectPosition);
      } else {
        target.scrollIntoView({ block: "start", behavior: "instant" });
      }

      const section = portfolioSections.find((item) => item.id === id);
      currentSection.current = id;
      setActive?.(section.name);
      updateHash(id);
    });
    return () => cancelAnimationFrame(frame);
  }, [ready, request, setActive]);

  useEffect(() => {
    if (!ready || !container.current) return;

    const sections = portfolioSections.map((section) => ({
      ...section,
      element: container.current.querySelector(`#${section.id}`),
    }));

    const viewport = window.visualViewport;
    let frame = 0;
    function updateActive() {
      frame = 0;
      const marker = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight) * 0.3;
      let active = sections[0];
      for (const section of sections) {
        if (!section.element || section.element.getBoundingClientRect().top > marker) break;
        active = section;
      }
      if (active.id === currentSection.current) return;
      currentSection.current = active.id;
      setActive?.(active.name);
      updateHash(active.id);
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(updateActive);
    }

    // Capture scrolls from the body as well as the viewport in mobile webviews.
    window.addEventListener("scroll", scheduleUpdate, { capture: true, passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    viewport?.addEventListener("scroll", scheduleUpdate, { passive: true });
    viewport?.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.removeEventListener("resize", scheduleUpdate);
      viewport?.removeEventListener("scroll", scheduleUpdate);
      viewport?.removeEventListener("resize", scheduleUpdate);
    };
  }, [ready, setActive]);

  return <main className="mobile-portfolio" ref={container}>{children}</main>;
}
