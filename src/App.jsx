import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { FaArrowUp } from "react-icons/fa";
import { useLocation } from "react-router-dom";

import Router from "./routes/Router";
import LetterGlitch from "./components/LetterGlitch";
import TargetCursor from "./components/TargetCursor";
import PortfolioIntro from "./components/PortfolioIntro";
import Navbar from "./components/Navbar";
import useCompactLayout from "./hooks/useCompactLayout";

import "./index.css";
import "./mobile.css";

const introSeenKey = "portfolio:terminal-intro";

function shouldPlayIntro() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return !window.sessionStorage.getItem(introSeenKey);
  } catch {
    return true;
  }
}

export default function App() {
  const location = useLocation();
  const compact = useCompactLayout();
  const [active, setActive] = useState("Home");
  const [homeEntry] = useState(() => location.pathname === "/" &&
    (!location.hash || location.hash === "#home") &&
    (!location.state?.scrollTo || location.state.scrollTo === "home"));
  const [intro, setIntro] = useState(() => homeEntry && shouldPlayIntro());
  const [homeOpening, setHomeOpening] = useState(homeEntry && !intro);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const beginHomeReveal = useCallback(() => setHomeOpening(true), []);
  const completeIntro = useCallback(() => {
    try {
      window.sessionStorage.setItem(introSeenKey, "1");
    } catch {
      // A browser can disable storage. The opening still works for this visit.
    }
    beginHomeReveal();
    setIntro(false);
  }, [beginHomeReveal]);

  useEffect(() => {
    if (!homeOpening) return;
    const timeout = window.setTimeout(() => setHomeOpening(false), 1300);
    return () => window.clearTimeout(timeout);
  }, [homeOpening]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.phase = intro ? "intro" : "ready";
    return () => { delete root.dataset.phase; };
  }, [intro]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (compact) return;
    if (location.pathname === "/") {
      const onDeckState = (event) => {
        const { index = 0, scrollTop = 0 } = event.detail || {};
        setShowScrollTop(index > 0 || scrollTop > 240);
      };
      window.addEventListener("deck:state", onDeckState);
      return () => window.removeEventListener("deck:state", onDeckState);
    }

    const onScroll = () => setShowScrollTop(window.scrollY > 240);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname, compact]);

  return (
    <div className="app-root" data-compact={compact} data-home-opening={homeOpening || undefined}
      data-awaiting-intro={intro && !homeOpening || undefined}>
      {intro && <PortfolioIntro compact={compact} onHandoff={beginHomeReveal} onComplete={completeIntro} />}

      <LetterGlitch
        glitchSpeed={compact ? 190 : 120}
        maxFps={compact ? 18 : 30}
        centerVignette={compact}
        outerVignette
        smooth={!compact}
      />

      {!intro && !compact && <TargetCursor spinDuration={2.2} hideDefaultCursor parallaxOn />}

      <div inert={intro || undefined}>
        <Navbar
          active={location.pathname.startsWith("/projects/") ? "Projects" : active}
          compact={compact}
        />

        {!compact && showScrollTop && (
          <button
            className="scroll-top-btn"
            aria-label="Scroll to top"
            onClick={() => {
              if (location.pathname === "/") {
                window.dispatchEvent(new Event("deck:scrollToTop"));
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
              window.dispatchEvent(new Event("scrollToTop"));
            }}
          >
            <FaArrowUp size={22} />
          </button>
        )}

        <div className="site-shell">
          <Router compact={compact} ready={!intro} setActive={setActive} revealKey={1} />
        </div>
      </div>
    </div>
  );
}
