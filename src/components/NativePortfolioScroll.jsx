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

    if (request.projectPosition) {
      restoreProjectPosition(request.projectPosition);
    } else {
      target.scrollIntoView({ block: "start", behavior: "instant" });
    }

    const section = portfolioSections.find((item) => item.id === id);
    currentSection.current = id;
    setActive?.(section.name);
    updateHash(id);
  }, [ready, request, setActive]);

  useEffect(() => {
    if (!ready || !container.current) return;

    const sections = portfolioSections.map((section) => ({
      ...section,
      element: container.current.querySelector(`#${section.id}`),
    }));

    let frame = 0;
    function updateActive() {
      frame = 0;
      const marker = window.innerHeight * 0.3;
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

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [ready, setActive]);

  return <main className="mobile-portfolio" ref={container}>{children}</main>;
}
