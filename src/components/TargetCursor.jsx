import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./TargetCursor.css";

const cornerInset = 3;
const cornerExtent = 12;
const geometryTransitions = new Set(["all", "transform", "translate", "scale", "rotate"]);

export default function TargetCursor({
  targetSelector = ".cursor-target",
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
}) {
  const cursorRef = useRef(null);
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 0 && window.innerWidth <= 768);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) document.body.style.cursor = "none";

    const style = cursor.style;
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const lock = { progress: 0 };
    let mouseX = pointer.x;
    let mouseY = pointer.y;
    let activeTarget = null;
    let refreshFrame = null;
    let spinDelay;

    const moving = new Map();
    const options = { passive: true };
    const captureOptions = { passive: true, capture: true };

    function writePointerX() {
      style.setProperty("--cursor-x", `${pointer.x}px`);
    }

    function writePointerY() {
      style.setProperty("--cursor-y", `${pointer.y}px`);
    }

    function writeProgress() {
      style.setProperty("--lock-progress", lock.progress);
    }

    writePointerX();
    writePointerY();
    writeProgress();

    // Each tween is reused. CSS keeps the locked corners in viewport coordinates.
    const followX = gsap.quickTo(pointer, "x", { duration: .12, ease: "power3.out", onUpdate: writePointerX });
    const followY = gsap.quickTo(pointer, "y", { duration: .12, ease: "power3.out", onUpdate: writePointerY });
    const lockTo = gsap.quickTo(lock, "progress", { duration: hoverDuration, ease: "power2.out", onUpdate: writeProgress });

    function closestTarget(element) {
      return element instanceof Element ? element.closest(targetSelector) : null;
    }

    function measureTarget(target) {
      const rect = target.getBoundingClientRect();
      style.setProperty("--lock-left", `${rect.left - cornerInset}px`);
      style.setProperty("--lock-top", `${rect.top - cornerInset}px`);
      style.setProperty("--lock-right", `${rect.right + cornerInset - cornerExtent}px`);
      style.setProperty("--lock-bottom", `${rect.bottom + cornerInset - cornerExtent}px`);
    }

    function scheduleRefresh() {
      if (activeTarget && refreshFrame === null) {
        refreshFrame = requestAnimationFrame(refreshTarget);
      }
    }

    function refreshTarget() {
      refreshFrame = null;
      if (!activeTarget) return;
      const next = closestTarget(document.elementFromPoint(mouseX, mouseY));
      if (next !== activeTarget) {
        setTarget(next);
      } else {
        measureTarget(next);
      }
      if (moving.size) scheduleRefresh();
    }

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleRefresh);
    const removalObserver = new MutationObserver(() => {
      if (activeTarget && !activeTarget.isConnected) scheduleRefresh();
    });

    function setTarget(next) {
      if (activeTarget === next) return;
      clearTimeout(spinDelay);
      observer?.disconnect();
      removalObserver.disconnect();
      moving.clear();
      activeTarget = next;

      if (next) {
        measureTarget(next);
        cursor.dataset.locked = "";
        observer?.observe(next);
        removalObserver.observe(document.body, { childList: true, subtree: true });
        lockTo.tween.duration(hoverDuration);
        lockTo(1);
        return;
      }

      lockTo.tween.duration(.3);
      lockTo(0);
      spinDelay = setTimeout(() => { delete cursor.dataset.locked; }, 50);
    }

    function onMove(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      followX(mouseX);
      followY(mouseY);
      if (parallaxOn) {
        style.setProperty("--mouse-x", `${mouseX}px`);
        style.setProperty("--mouse-y", `${mouseY}px`);
      }
    }

    function onOver(event) {
      const target = closestTarget(event.target);
      if (activeTarget === target) return;
      onMove(event);
      setTarget(target);
    }

    function onOut(event) {
      if (activeTarget && !event.relatedTarget) setTarget(null);
    }

    function onTransition(event) {
      const { propertyName, target, type } = event;
      if (!activeTarget || !(target instanceof Element) || !target.contains(activeTarget) ||
          !geometryTransitions.has(propertyName) || event.pseudoElement) return;
      if (type === "transitionrun") {
        if (!moving.has(target)) moving.set(target, new Set());
        moving.get(target).add(propertyName);
      } else {
        const properties = moving.get(target);
        properties?.delete(propertyName);
        if (!properties?.size) moving.delete(target);
      }
      scheduleRefresh();
    }

    function press() {
      cursor.dataset.pressed = "";
    }

    function release() {
      delete cursor.dataset.pressed;
    }

    function onBlur() {
      release();
      setTarget(null);
    }

    window.addEventListener("mousemove", onMove, options);
    window.addEventListener("mouseover", onOver, options);
    window.addEventListener("mouseout", onOut, options);
    window.addEventListener("scroll", scheduleRefresh, captureOptions);
    window.addEventListener("resize", scheduleRefresh, options);
    window.addEventListener("transitionrun", onTransition, captureOptions);
    window.addEventListener("transitionend", onTransition, captureOptions);
    window.addEventListener("transitioncancel", onTransition, captureOptions);
    window.addEventListener("mousedown", press);
    window.addEventListener("mouseup", release);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      window.removeEventListener("scroll", scheduleRefresh, true);
      window.removeEventListener("resize", scheduleRefresh);
      window.removeEventListener("transitionrun", onTransition, true);
      window.removeEventListener("transitionend", onTransition, true);
      window.removeEventListener("transitioncancel", onTransition, true);
      window.removeEventListener("mousedown", press);
      window.removeEventListener("mouseup", release);
      window.removeEventListener("blur", onBlur);
      observer?.disconnect();
      removalObserver.disconnect();
      if (refreshFrame !== null) cancelAnimationFrame(refreshFrame);
      clearTimeout(spinDelay);
      followX.tween.kill();
      followY.tween.kill();
      lockTo.tween.kill();
      delete cursor.dataset.locked;
      release();
      document.body.style.cursor = originalCursor;
    };
  }, [targetSelector, hideDefaultCursor, hoverDuration, parallaxOn, isMobile]);

  if (isMobile) return null;

  return (
    <div ref={cursorRef} className="target-cursor-wrapper" aria-hidden="true" style={{ "--spin-duration": `${spinDuration}s` }}>
      <div className="target-cursor-pointer">
        <div className="target-cursor-feedback">
          <div className="target-cursor-dot" />
          <div className="target-cursor-rotor">
            <div className="target-cursor-corner corner-tl" />
            <div className="target-cursor-corner corner-tr" />
            <div className="target-cursor-corner corner-br" />
            <div className="target-cursor-corner corner-bl" />
          </div>
        </div>
      </div>
    </div>
  );
}
