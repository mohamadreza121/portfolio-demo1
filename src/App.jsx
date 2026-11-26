import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaArrowUp } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { sendQuoteMessage } from "./services/messaging";

import Router from "./routes/Router";
import LetterGlitch from "./components/LetterGlitch";
import TargetCursor from "./components/TargetCursor";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import CurtainOverlay from "./components/CurtainOverlay";
import QuoteModal from "./components/QuoteModal";
import useCompactLayout from "./hooks/useCompactLayout";

import "./index.css";
import "./mobile.css";

export default function App() {
  /* =====================================================
     ROUTING
  ===================================================== */
  const location = useLocation();
  const compact = useCompactLayout();

  /* =====================================================
     GLOBAL STATE
  ===================================================== */
  const [active, setActive] = useState("Home");

  /* =====================================================
     PHASE STATE
  ===================================================== */
  const [homeEntry] = useState(() => location.pathname === "/" &&
    (!location.hash || location.hash === "#home") &&
    (!location.state?.scrollTo || location.state.scrollTo === "home"));
  const [phase, setPhase] = useState(homeEntry ? "ready" : "preloader");
  const [homeOpening, setHomeOpening] = useState(homeEntry);

  // Release the opening state while leaving all controls usable from the first frame.
  useEffect(() => {
    if (!homeOpening) return;
    const timeout = window.setTimeout(() => setHomeOpening(false), 1300);
    return () => window.clearTimeout(timeout);
  }, [homeOpening]);

  /* =====================================================
     REVEAL KEY
  ===================================================== */
  const [revealKey, setRevealKey] = useState(homeEntry ? 1 : 0);

  /* =====================================================
     INTERNAL GUARDS
  ===================================================== */
  const hasInitialRevealRef = useRef(false);

  /* =====================================================
     UI STATE
  ===================================================== */
  const [showScrollTop, setShowScrollTop] = useState(false);

  /* =====================================================
     QUOTE MODAL STATE
  ===================================================== */
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteService, setQuoteService] = useState("");
  const closeQuote = useCallback(() => setQuoteOpen(false), []);

  useEffect(() => {
    const onOpen = (e) => {
      const svc = e?.detail?.service ?? "";
      setQuoteService(svc);
      setQuoteOpen(true);
    };

    window.addEventListener("openQuoteModal", onOpen);
    return () => window.removeEventListener("openQuoteModal", onOpen);
  }, []);

  /* =====================================================
     DISABLE BROWSER SCROLL RESTORATION (CRITICAL)
  ===================================================== */
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, [location.pathname]);

  /* =====================================================
     FORCE HARD SCROLL RESET ON FIRST LOAD
  ===================================================== */
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  /* =====================================================
     PHASE ATTRIBUTE
  ===================================================== */
  useEffect(() => {
    document.documentElement.setAttribute("data-phase", phase);
  }, [phase]);

  /* =====================================================
     PRELOADER → CURTAINS
  ===================================================== */
  const handlePreloaderComplete = useCallback(() => {
    setPhase("curtains");
  }, []);

  /* =====================================================
     CURTAINS START → REVEAL
  ===================================================== */
  const handleCurtainsStartReveal = useCallback(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    setRevealKey((k) => k + 1);
  }, []);

  /* =====================================================
     CURTAINS → READY
  ===================================================== */
  const handleCurtainsComplete = useCallback(() => {
    setPhase("ready");
  }, []);

  /* =====================================================
     RE-TRIGGER REVEAL WHEN RETURNING TO "/"
  ===================================================== */
  useEffect(() => {
    if (phase !== "ready") return;
    if (location.pathname !== "/") return;

    if (!hasInitialRevealRef.current) {
      hasInitialRevealRef.current = true;
      return;
    }

    requestAnimationFrame(() => {
      setRevealKey((k) => k + 1);
    });
  }, [location.pathname, phase]);

  /* =====================================================
     SCROLL-TOP VISIBILITY
  ===================================================== */
  useEffect(() => {
    // The compact dock already includes a Home control.
    if (compact) return;
    if (location.pathname === "/") {
      const onDeckState = (e) => {
        const d = e?.detail || {};
        const idx = Number(d.index || 0);
        const top = Number(d.scrollTop || 0);
        setShowScrollTop(idx > 0 || top > 240);
      };

      window.addEventListener("deck:state", onDeckState);
      return () => window.removeEventListener("deck:state", onDeckState);
    }

    const onScroll = () => setShowScrollTop(window.scrollY > 240);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname, compact]);

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="app-root" data-compact={compact} data-home-opening={homeOpening || undefined}>
      {(phase === "preloader" || phase === "curtains") && (
        <CurtainOverlay
          phase={phase}
          onStartReveal={handleCurtainsStartReveal}
          onComplete={handleCurtainsComplete}
        />
      )}

      {phase === "preloader" && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

      {(phase === "curtains" || phase === "ready") && (
        <>
          <Navbar
            active={location.pathname.startsWith("/projects/") ? "Projects" : active}
            compact={compact}
            hidden={quoteOpen}
          />

          {!compact && showScrollTop && (
            <button
              className="scroll-top-btn cursor-target"
              aria-label="Scroll to top"
              onClick={() => {
                if (location.pathname === "/") {
                  window.dispatchEvent(new Event("deck:scrollToTop"));
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }

                // Kept for backward-compat / any listeners elsewhere
                window.dispatchEvent(new Event("scrollToTop"));
              }}
            >
              <FaArrowUp size={22} />
            </button>
          )}
        </>
      )}

      <LetterGlitch
        glitchSpeed={compact ? 190 : 120}
        maxFps={compact ? 18 : 30}
        centerVignette={compact}
        outerVignette
        smooth={!compact}
      />

      {!compact && <TargetCursor spinDuration={2.2} hideDefaultCursor parallaxOn />}

      <div
        className={[
          "site-shell",
          revealKey > 0 ? "site-visible" : "site-hidden",
          phase === "ready" ? "site-unlocked" : "site-locked",
        ].join(" ")}
      >
        <Router
          compact={compact}
          ready={phase === "ready"}
          setActive={setActive}
          revealKey={revealKey}
          onRequestQuote={(service) => {
            setQuoteService(service || "");
            setQuoteOpen(true);
          }}
          isQuoteOpen={quoteOpen}
        />

        <QuoteModal
          open={quoteOpen}
          compact={compact}
          service={quoteService}
          onClose={closeQuote}
          onSubmit={(data) => sendQuoteMessage(data, quoteService)}
        />
      </div>
    </div>
  );
}
