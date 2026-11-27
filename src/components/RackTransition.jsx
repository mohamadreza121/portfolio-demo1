import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import NetworkRack from "./NetworkRack";
import { loadProjectLab } from "../routes/loadProjectLab";
import "./RackTransition.css";

export default function RackTransition({ source, onNavigate, onComplete }) {
  const flight = useRef(null);
  const callbacks = useRef({ onNavigate, onComplete });
  const [failed, setFailed] = useState(false);

  useLayoutEffect(() => {
    callbacks.current = { onNavigate, onComplete };
  }, [onNavigate, onComplete]);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-rack-transition", "true");
    return () => document.documentElement.removeAttribute("data-rack-transition");
  }, []);

  useEffect(() => {
    let cancelled = false;
    let arriving = false;
    let motion;
    const element = flight.current;
    const rack = element.querySelector(".rack-model");
    const observer = new MutationObserver(findDestination);
    const easing = "cubic-bezier(.22, 1, .36, 1)";

    // Start moving immediately. Module loading continues behind this live rack.
    const lift = element.animate?.([
      { transform: "translateY(0)" },
      { transform: "translateY(-8px)" },
    ], { duration: 300, easing, fill: "forwards" });

    const timeout = window.setTimeout(() => {
      if (arriving || cancelled) return;
      observer.disconnect();
      cancelled = true;
      setFailed(true);
    }, 8000);

    function findDestination() {
      if (cancelled || arriving) return;
      const target = document.querySelector(".project-page--lab .lab-stage__hardware");
      if (!target?.querySelector(".rack-model")) return;
      arriving = true;
      observer.disconnect();
      // The destination restores scroll in its layout effect before this observer runs.
      const destination = target.getBoundingClientRect();
      const targetRack = target.querySelector(".rack-model");
      const rackStyle = getComputedStyle(targetRack);
      const current = element.getBoundingClientRect();
      lift?.cancel();
      Object.assign(element.style, {
        left: destination.left + "px", top: destination.top + "px",
        width: destination.width + "px", height: destination.height + "px",
        perspective: getComputedStyle(target).perspective,
      });
      element.dataset.arriving = "true";
      rack.style.width = targetRack.offsetWidth + "px";
      rack.style.transform = rackStyle.transform;
      motion = element.animate?.([
        { left: current.left + "px", top: current.top + "px", width: current.width + "px", height: current.height + "px", opacity: 1 },
        { left: destination.left + "px", top: destination.top + "px", width: destination.width + "px", height: destination.height + "px", opacity: 1 },
      ], { duration: 560, easing });
      rack.animate?.([
        { width: source.rackWidth + "px", transform: source.pose },
        { width: targetRack.offsetWidth + "px", transform: rackStyle.transform },
      ], { duration: 560, easing });
      window.clearTimeout(timeout);
      if (motion) motion.finished.then(() => { if (!cancelled) callbacks.current.onComplete(); }).catch(() => {});
      else callbacks.current.onComplete();
    }

    loadProjectLab().then(() => {
      if (cancelled) return;
      observer.observe(document.body, { childList: true, subtree: true });
      callbacks.current.onNavigate();
      findDestination();
    }).catch(() => {
      if (!cancelled) {
        window.clearTimeout(timeout);
        cancelled = true;
        setFailed(true);
      }
    });

    function cancel() { callbacks.current.onComplete(); }
    function onKey(event) { if (event.key === "Escape") cancel(); }
    window.addEventListener("resize", cancel, { once: true });
    window.addEventListener("popstate", cancel, { once: true });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      observer.disconnect();
      lift?.cancel();
      motion?.cancel();
      window.removeEventListener("resize", cancel);
      window.removeEventListener("popstate", cancel);
      window.removeEventListener("keydown", onKey);
    };
  }, [source]);

  return createPortal(
    <div className="rack-transition">
      <div className="rack-transition__veil" aria-hidden="true" />
      <div className="rack-transition__flight" ref={flight} aria-hidden="true" style={{
        left: source.left, top: source.top, width: source.width, height: source.height,
        perspective: source.perspective,
        "--flight-rack-width": source.rackWidth + "px", "--flight-rack-pose": source.pose,
      }}>
        <NetworkRack active={source.host} />
      </div>
      <div className="rack-transition__status" data-failed={failed} role="status">
        <span>{failed ? "The lab couldn’t open. Please try again." : "Opening the lab…"}</span>
        <button type="button" onClick={onComplete}>{failed ? "Close" : "Cancel"}</button>
      </div>
    </div>, document.body,
  );
}
