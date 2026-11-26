import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { FaArrowUp } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { sendQuoteMessage } from "./services/messaging";
import { getOpeningVariant, markOpeningSeen } from "./utils/opening";

import Router from "./routes/Router";
import LetterGlitch from "./components/LetterGlitch";
import TargetCursor from "./components/TargetCursor";
import Navbar from "./components/Navbar";
import CurtainOverlay from "./components/CurtainOverlay";
import QuoteModal from "./components/QuoteModal";
import useCompactLayout from "./hooks/useCompactLayout";

import "./index.css";
import "./mobile.css";

export default function App() {
  const location = useLocation();
  const compact = useCompactLayout();
  const reducedMotion = useReducedMotion();
  const [opening, setOpening] = useState(() => getOpeningVariant(location, compact));
  const [dockLanded, setDockLanded] = useState(false);
  const [theme, setTheme] = useState("night");
  const [active, setActive] = useState("Home");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteService, setQuoteService] = useState("");

  const openQuote = useCallback((service = "") => {
    setQuoteService(service);
    setQuoteOpen(true);
  }, []);

  const closeQuote = useCallback(() => setQuoteOpen(false), []);

  const finishOpening = useCallback(({ restoreFocus = false, dockLanded = false } = {}) => {
    setOpening(null);
    setDockLanded(dockLanded);

    if (restoreFocus) {
      requestAnimationFrame(() => {
        document.querySelector("#home .home-title")?.focus({ preventScroll: true });
      });
    }
  }, []);

  useEffect(() => {
    const onOpen = (event) => openQuote(event.detail?.service);
    window.addEventListener("openQuoteModal", onOpen);
    return () => window.removeEventListener("openQuoteModal", onOpen);
  }, [openQuote]);

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useLayoutEffect(() => {
    document.documentElement.dataset.phase = opening ? "opening" : "ready";
    if (opening) markOpeningSeen();
  }, [opening]);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!dockLanded) return;
    const timeout = window.setTimeout(() => setDockLanded(false), 400);
    return () => window.clearTimeout(timeout);
  }, [dockLanded]);

  useEffect(() => {
    // The compact dock already includes a Home control.
    if (compact) return;
    if (location.pathname === "/") {
      const onDeckState = (event) => {
        const { index = 0, scrollTop = 0 } = event.detail ?? {};
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
    <div className="app-root" data-compact={compact} data-opening={opening || undefined}>
      <div inert={Boolean(opening)} data-dock-landed={dockLanded || undefined}>
        <Navbar
          active={location.pathname.startsWith("/projects/") ? "Projects" : active}
          compact={compact}
          hidden={quoteOpen}
          theme={theme}
          onToggleTheme={() => setTheme((current) => (current === "night" ? "day" : "night"))}
        />

        {!compact && showScrollTop && (
          <button
            type="button"
            className="scroll-top-btn cursor-target"
            aria-label="Scroll to top"
            onClick={() => {
              if (location.pathname === "/") {
                window.dispatchEvent(new Event("deck:scrollToTop"));
              } else {
                window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
              }
              window.dispatchEvent(new Event("scrollToTop"));
            }}
          >
            <FaArrowUp size={22} />
          </button>
        )}
      </div>

      <LetterGlitch
        theme={theme}
        glitchSpeed={compact ? 190 : 120}
        maxFps={compact ? 18 : 30}
        smooth={!compact}
        paused={Boolean(reducedMotion || opening)}
      />

      {!compact && !reducedMotion && <TargetCursor spinDuration={2.2} hideDefaultCursor parallaxOn />}

      <div className={opening ? "site-shell" : "site-shell site-unlocked"} inert={Boolean(opening)}>
        <Router
          theme={theme}
          compact={compact}
          ready={!opening}
          setActive={setActive}
          revealKey={1}
          onRequestQuote={openQuote}
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

      {opening && <CurtainOverlay variant={opening} onFinish={finishOpening} />}
    </div>
  );
}
