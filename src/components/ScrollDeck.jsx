// src/components/ScrollDeck.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import gsap from "gsap";
import { portfolioSections, restoreProjectPosition } from "../utils/scrollToSection";
import "./ScrollDeck.css";

/* =====================================================
   ScrollDeck

   - Full-viewport panels; active panel is scrollable.
   - At top/bottom boundary, continue scrolling transitions to prev/next.

   Directional entry:
   - DOWN into next panel => next starts at TOP
   - UP into previous panel => previous starts at BOTTOM

   Navbar/deep-link entry:
   - Always starts at TOP of destination panel

   Touch layouts use NativePortfolioScroll.
===================================================== */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const IS_TEST =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  (import.meta.env.MODE === "test" || import.meta.env.VITEST);

const BOUNDARY_EPS = 12; // px tolerance for rounding/overscroll across devices

export default function ScrollDeck({
  setActive,
  isQuoteOpen,
  revealKey,
  ready,
  request,
  children,
}) {
  const panels = useMemo(() => React.Children.toArray(children), [children]);

  const containerRef = useRef(null);
  const panelRefs = useRef([]);
  const activeIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const boundaryCooldownUntilRef = useRef(0);
  const transitionRef = useRef(null);
  const handledRequestRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  /* =====================================================
     Runtime flags (mobile + reduced motion)
  ===================================================== */
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    const mqReduce =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const apply = () => {
      prefersReducedMotionRef.current = !!mqReduce?.matches;
    };

    apply();
    if (mqReduce?.addEventListener) mqReduce.addEventListener("change", apply);
    else mqReduce?.addListener(apply);

    return () => {
      if (mqReduce?.removeEventListener) mqReduce.removeEventListener("change", apply);
      else mqReduce?.removeListener(apply);
    };
  }, []);

  /* =====================================================
     A11y + focus helpers
  ===================================================== */
  const getFirstFocusable = useCallback((root) => {
    if (!root) return null;

    const selector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
      "[contenteditable='true']",
    ].join(",");

    return root.querySelector(selector);
  }, []);

  const focusSafely = useCallback((el) => {
    if (!el || typeof el.focus !== "function") return false;
    try {
      el.focus({ preventScroll: true });
    } catch {
      try {
        el.focus();
      } catch {
        return false;
      }
    }
    return true;
  }, []);

  const blurIfFocusedInside = useCallback((panelEl) => {
    if (IS_TEST) return;

    const activeEl = document.activeElement;
    if (!activeEl || activeEl === document.body) return;
    if (!panelEl || !panelEl.contains(activeEl)) return;

    try {
      activeEl.blur();
    } catch {
      // ignore
    }
  }, []);

  const focusIntoPanel = useCallback(
    (idx) => {
      if (IS_TEST) return;

      const panelEl = panelRefs.current[idx];
      if (!panelEl) return;

      const activeEl = document.activeElement;
      if (activeEl && panelEl.contains(activeEl)) return;

      const first = getFirstFocusable(panelEl);
      if (first && focusSafely(first)) return;

      if (!panelEl.hasAttribute("tabindex"))
        panelEl.setAttribute("tabindex", "-1");
      focusSafely(panelEl);
    },
    [focusSafely, getFirstFocusable]
  );

  const focusDeckContainer = useCallback(() => {
    if (IS_TEST) return;
    const container = containerRef.current;
    if (!container) return;
    focusSafely(container);
  }, [focusSafely]);

  const setPanelA11y = useCallback((idx, isActive) => {
    const el = panelRefs.current[idx];
    if (!el) return;

    if (IS_TEST) {
      el.removeAttribute("aria-hidden");
      if ("inert" in el) el.inert = false;
      el.removeAttribute("inert");
      return;
    }

    el.setAttribute("aria-hidden", String(!isActive));

    // inert: use DOM property (best), and keep attribute for broad support
    if ("inert" in el) el.inert = !isActive;

    if (isActive) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, []);

  const setPanelVisibility = useCallback((idx, isVisible) => {
    const el = panelRefs.current[idx];
    if (!el) return;

    if (IS_TEST) {
      el.style.visibility = "visible";
      el.style.pointerEvents = "auto";
      el.style.opacity = "1";
      return;
    }

    el.style.visibility = isVisible ? "visible" : "hidden";
    el.style.pointerEvents = isVisible ? "auto" : "none";
  }, []);

  const syncPanelsA11y = useCallback(
    (activeIdx) => {
      const maxIdx = Math.min(portfolioSections.length - 1, panels.length - 1);
      const safe = clamp(activeIdx, 0, maxIdx);

      for (let i = 0; i < panels.length; i += 1) {
        const isActive = i === safe;
        setPanelA11y(i, isActive);
      }
    },
    [panels.length, setPanelA11y]
  );

  /* =====================================================
     Helpers
  ===================================================== */
  const getIndexById = useCallback((id) => {
    if (!id) return -1;
    return portfolioSections.findIndex((s) => s.id === id);
  }, []);

  const setHashQuietly = useCallback((hash) => {
    if ((window.location.hash || "") === hash) return;
    const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, []);

  const publishDeckState = useCallback((idx) => {
    const panel = panelRefs.current[idx];
    const scrollTop = panel?.scrollTop || 0;
    const id = portfolioSections[idx]?.id || "home";

    window.dispatchEvent(
      new CustomEvent("deck:state", {
        detail: { index: idx, id, scrollTop },
      })
    );
  }, []);

  const applyActive = useCallback(
    (idx) => {
      const safe = clamp(
        idx,
        0,
        Math.min(portfolioSections.length - 1, panels.length - 1)
      );

      activeIndexRef.current = safe;
      setActiveIndex(safe);

      const meta = portfolioSections[safe];
      if (meta) {
        setActive?.(meta.name);
        setHashQuietly(`#${meta.id}`);
      }
    },
    [panels.length, setActive, setHashQuietly]
  );

  const scrollPanelTo = useCallback(
    (idx, position = "top", behavior = "auto") => {
      const el = panelRefs.current[idx];
      if (!el) return;

      const top = 0;
      const bottom = Math.max(0, el.scrollHeight - el.clientHeight);
      const target = position === "bottom" ? bottom : top;

      try {
        el.scrollTo({ top: target, behavior });
      } catch {
        el.scrollTop = target;
      }
    },
    []
  );

  /* =====================================================
     Initial state (post-curtain reveal)
  ===================================================== */
  useEffect(() => {
    if (!revealKey) return;

    if (containerRef.current) containerRef.current.dataset.ready = "true";

    if (IS_TEST) {
      panelRefs.current.forEach((el) => {
        if (!el) return;
        el.style.opacity = "1";
        el.style.transform = "translate3d(0,0,0)";
        el.style.filter = "blur(0px)";
        el.style.visibility = "visible";
        el.style.pointerEvents = "auto";
        el.style.zIndex = "20";
      });

      if (typeof queueMicrotask === "function")
        queueMicrotask(() => applyActive(0));
      else Promise.resolve().then(() => applyActive(0));

      return;
    }

    panelRefs.current.forEach((el, idx) => {
      if (!el) return;

      const isActive = idx === activeIndexRef.current;

      el.style.opacity = isActive ? "1" : "0";
      el.style.transform = "translate3d(0,0,0)";
      el.style.filter = "blur(0px)";
      el.style.zIndex = isActive ? "20" : "10";

      setPanelVisibility(idx, isActive);
    });

    syncPanelsA11y(activeIndexRef.current);

    if (typeof queueMicrotask === "function") {
      queueMicrotask(() => applyActive(activeIndexRef.current));
    } else {
      Promise.resolve().then(() => applyActive(activeIndexRef.current));
    }
  }, [revealKey, applyActive, setPanelVisibility, syncPanelsA11y]);

  /* =====================================================
     Keep a11y state in sync after React commits activeIndex
  ===================================================== */
  useEffect(() => {
    if (IS_TEST) return;
    syncPanelsA11y(activeIndex);
  }, [activeIndex, syncPanelsA11y]);

  /* =====================================================
     Body scroll lock (Main page only)
  ===================================================== */
  useEffect(() => {
    if (IS_TEST) return;

    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // ✅ Fix: kill any preserved window scroll when returning from a Project route.
    // This does NOT force Home; ScrollDeck handles section selection internally.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  /* =====================================================
     Panel transition
  ===================================================== */
  const goToIndex = useCallback(
    (nextIdx, opts = {}) => {
      const {
        resetTargetScroll = false,
        targetScrollBehavior = "auto",
        targetScrollPosition = "top",
        immediate = false,
      } = opts;

      const current = activeIndexRef.current;
      const maxIdx = Math.min(portfolioSections.length - 1, panels.length - 1);
      const target = clamp(nextIdx, 0, maxIdx);

      if (target === current) {
        if (resetTargetScroll) {
          scrollPanelTo(current, targetScrollPosition, targetScrollBehavior);
          publishDeckState(current);
        }
        return;
      }

      if (isTransitioningRef.current) return;
      if (isQuoteOpen) return;

      const dir = target > current ? 1 : -1;
      isTransitioningRef.current = true;

      const currentEl = panelRefs.current[current];
      const nextEl = panelRefs.current[target];

      if (!currentEl || !nextEl) {
        isTransitioningRef.current = false;
        applyActive(target);
        return;
      }

      // 1) Ensure target is interactable/visible BEFORE focus changes.
      setPanelVisibility(target, true);
      setPanelA11y(target, true);
      nextEl.style.zIndex = "30";
      currentEl.style.zIndex = "20";

      // 2) Critical: if focus is inside the outgoing panel, move it out NOW
      //    (prevents "Blocked aria-hidden..." warning).
      blurIfFocusedInside(currentEl);
      focusDeckContainer();

      if (resetTargetScroll) {
        scrollPanelTo(target, targetScrollPosition, targetScrollBehavior);
      }

      // 3) Commit active index (navbar/hash/state)
      applyActive(target);

      // 4) Move focus into target panel (immediately, while both are visible)
      focusIntoPanel(target);

      if (immediate || prefersReducedMotionRef.current) {
        gsap.killTweensOf([currentEl, nextEl]);

        currentEl.style.opacity = "0";
        currentEl.style.transform = "translate3d(0,0,0)";
        currentEl.style.filter = "blur(0px)";

        nextEl.style.opacity = "1";
        nextEl.style.transform = "translate3d(0,0,0)";
        nextEl.style.filter = "blur(0px)";

        setPanelVisibility(current, false);
        setPanelA11y(current, false);

        nextEl.style.zIndex = "20";
        currentEl.style.zIndex = "10";

        isTransitioningRef.current = false;

        if (typeof queueMicrotask === "function")
          queueMicrotask(() => focusIntoPanel(target));
        else Promise.resolve().then(() => focusIntoPanel(target));

        return;
      }

      gsap.killTweensOf([currentEl, nextEl]);

      // Stage next panel
      gsap.set(nextEl, {
        opacity: 0,
        y: dir * 18,
        scale: 0.997,
        transformOrigin: "50% 50%",
      });

      const tl = gsap.timeline({
        defaults: { duration: 0.55, ease: "power2.out" },
        onComplete: () => {
          gsap.set(currentEl, {
            opacity: 0,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
          });

          setPanelVisibility(current, false);
          setPanelA11y(current, false);

          nextEl.style.zIndex = "20";
          currentEl.style.zIndex = "10";

          isTransitioningRef.current = false;

          focusIntoPanel(target);
        },
      });

      transitionRef.current = tl;
      tl.to(
        currentEl,
        {
          opacity: 0,
          y: -dir * 12,
          scale: 1.001,
        },
        0.04
      ).to(
        nextEl,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
        },
        0
      );
    },
    [
      applyActive,
      blurIfFocusedInside,
      focusDeckContainer,
      focusIntoPanel,
      isQuoteOpen,
      panels.length,
      publishDeckState,
      scrollPanelTo,
      setPanelA11y,
      setPanelVisibility,
    ]
  );

  const goToSection = useCallback(
    (id, opts) => {
      const idx = getIndexById(id);
      if (idx >= 0) goToIndex(idx, opts);
    },
    [getIndexById, goToIndex]
  );

  /* =====================================================
     Pending navigation (Navbar / deep-link)
  ===================================================== */
  useEffect(() => {
    if (!ready || !request?.id || isQuoteOpen || handledRequestRef.current === request) return;

    const frame = requestAnimationFrame(() => {
      handledRequestRef.current = request;
      transitionRef.current?.progress(1);
      goToSection(request.id, {
        resetTargetScroll: true,
        immediate: Boolean(request.projectPosition),
      });

      if (request.projectPosition) {
        const panel = panelRefs.current[getIndexById("projects")];
        if (panel) restoreProjectPosition(request.projectPosition, panel);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [ready, request, isQuoteOpen, goToSection, getIndexById]);

  useEffect(() => () => transitionRef.current?.kill(), []);

  /* =====================================================
     External controls
  ===================================================== */
  useEffect(() => {
    if (IS_TEST) return;

    const onScrollTop = () => {
      const idx = activeIndexRef.current;
      const el = panelRefs.current[idx];
      if (!el) return;

      if (idx !== 0) {
        goToIndex(0, {
          resetTargetScroll: true,
          targetScrollPosition: "top",
          targetScrollBehavior: "auto",
        });
        return;
      }

      el.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("deck:scrollToTop", onScrollTop);
    return () => window.removeEventListener("deck:scrollToTop", onScrollTop);
  }, [goToIndex]);

  /* =====================================================
     Wheel routing (desktop only)
  ===================================================== */
  useEffect(() => {
    if (IS_TEST) return;

    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e) => {
      if (isQuoteOpen || e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;

      const now = performance.now();
      if (now < boundaryCooldownUntilRef.current) {
        e.preventDefault();
        return;
      }

      if (isTransitioningRef.current) {
        e.preventDefault();
        return;
      }

      const idx = activeIndexRef.current;
      const el = panelRefs.current[idx];
      if (!el) return;

      const delta = e.deltaY;
      if (Math.abs(delta) < 2) return;

      const atTop = el.scrollTop <= BOUNDARY_EPS;
      const atBottom =
        Math.ceil(el.scrollTop + el.clientHeight) >=
        el.scrollHeight - BOUNDARY_EPS;

      const maxIdx = Math.min(portfolioSections.length - 1, panels.length - 1);
      const COOLDOWN_MS = 80;

      if (delta > 0) {
        if (!atBottom) return;

        if (idx >= maxIdx) {
          boundaryCooldownUntilRef.current = now + COOLDOWN_MS;
          e.preventDefault();
          return;
        }

        e.preventDefault();
        goToIndex(idx + 1, {
          resetTargetScroll: true,
          targetScrollPosition: "top",
          targetScrollBehavior: "auto",
        });
      } else {
        if (!atTop) return;

        if (idx <= 0) {
          boundaryCooldownUntilRef.current = now + COOLDOWN_MS;
          e.preventDefault();
          return;
        }

        e.preventDefault();
        goToIndex(idx - 1, {
          resetTargetScroll: true,
          targetScrollPosition: "bottom",
          targetScrollBehavior: "auto",
        });
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [goToIndex, isQuoteOpen, panels.length]);

  /* =====================================================
     Active-panel scroll reporting
  ===================================================== */
  useEffect(() => {
    if (IS_TEST) return;

    const el = panelRefs.current[activeIndex];
    if (!el) return;

    const onScroll = () => publishDeckState(activeIndex);

    el.addEventListener("scroll", onScroll, { passive: true });
    publishDeckState(activeIndex);

    return () => el.removeEventListener("scroll", onScroll);
  }, [activeIndex, publishDeckState]);

  /* =====================================================
     Publish state AFTER activeIndex commit
  ===================================================== */
  useEffect(() => {
    publishDeckState(activeIndex);

    const id = portfolioSections[activeIndex]?.id || "home";
    window.dispatchEvent(
      new CustomEvent("deck:active", { detail: { index: activeIndex, id } })
    );

    if (!IS_TEST) {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("resize"));
      });
    }
  }, [activeIndex, publishDeckState]);

  /* =====================================================
     Render
  ===================================================== */
  return (
    <div
      ref={containerRef}
      className={["scroll-deck", IS_TEST ? "scroll-deck--test" : ""].join(" ")}
      data-ready={revealKey ? "true" : "false"}
      tabIndex={-1} // focus landing zone (prevents aria-hidden warning)
    >
      {panels.map((panel, idx) => (
        <section
          key={portfolioSections[idx]?.id || idx}
          ref={(node) => {
            panelRefs.current[idx] = node;
          }}
          className="scroll-deck__panel"
        >
          <div className="scroll-deck__panelInner">{panel}</div>
        </section>
      ))}
    </div>
  );
}
