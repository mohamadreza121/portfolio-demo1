import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./CurtainOverlay.css";

export default function CurtainOverlay({ variant, onFinish }) {
  const overlay = useRef(null);
  const skip = useRef(null);

  useLayoutEffect(() => {
    const root = overlay.current;
    const select = gsap.utils.selector(root);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isPhone = variant === "compact";
    const [rail] = select(".opening-rail");
    const [outbound] = select(".opening-pulse--out");
    const [reply] = select(".opening-pulse--reply");
    const [dockPulse] = select(".opening-pulse--dock");
    const distance = rail.clientWidth;
    let dockTarget = { x: 0, y: 0 };

    function skipOpening() {
      onFinish({ restoreFocus: document.activeElement === skip.current });
    }

    function completeOpening() {
      onFinish({
        dockLanded: true,
        restoreFocus: document.activeElement === skip.current,
      });
    }

    function onKey(event) {
      if (event.key === "Escape") skipOpening();
    }

    function onMotionChange(event) {
      if (event.matches) skipOpening();
    }

    document.addEventListener("keydown", onKey);
    reducedMotion.addEventListener("change", onMotionChange);

    const timeline = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: completeOpening,
    });

    timeline
      .fromTo(select(".opening-rail"), { opacity: 0 }, { opacity: 1, duration: .12 }, 0)
      .fromTo(select(".opening-port"), { scale: .5 }, { scale: 1, duration: .14, stagger: .035 }, .012)
      .set(outbound, { opacity: 1, x: 0 }, isPhone ? .045 : .12)
      .to(outbound, { x: distance, duration: isPhone ? .15 : .19, ease: "power1.inOut" }, ">")
      .to(outbound, { opacity: 0, duration: .055 }, ">-.02");

    if (!isPhone) {
      timeline
        .set(reply, { opacity: 1, x: distance }, .30)
        .to(reply, { x: 0, duration: .145, ease: "power1.inOut" }, .30)
        .to(reply, { opacity: 0, duration: .045 }, .425);
    }

    const split = isPhone ? .17 : .45;
    const splitDuration = isPhone ? .24 : .34;

    timeline
      .fromTo(select(".opening-seam"), { opacity: 0, scaleY: .08 }, { opacity: 1, scaleY: 1, duration: .12 }, split - .035)
      .to(rail, { opacity: 0, scaleX: .52, duration: .095 }, split)
      .to(select(".curtain-left"), { xPercent: -103, duration: splitDuration, ease: "power3.inOut" }, split)
      .to(select(".curtain-right"), { xPercent: 103, duration: splitDuration, ease: "power3.inOut" }, split)
      .to(select(".opening-seam"), { opacity: 0, duration: .16 }, split + .06)
      .call(() => {
        const dockItem = root.closest(".app-root")?.querySelector(".dock-item[aria-current], .mobile-dock button[aria-current]");
        if (!dockItem) return;
        const target = dockItem.getBoundingClientRect();
        const dot = dockPulse.getBoundingClientRect();
        dockTarget = {
          x: target.left + target.width / 2 - dot.left - dot.width / 2,
          y: target.top + target.height / 2 - dot.top - dot.height / 2,
        };
      }, [], split + .045)
      .fromTo(dockPulse, { opacity: 0, x: 0, y: 0 }, {
        opacity: 1,
        x: () => dockTarget.x,
        y: () => dockTarget.y,
        immediateRender: false,
        duration: isPhone ? .17 : .24,
        ease: "power2.inOut",
      }, split + .075)
      .to(dockPulse, { opacity: 0, scale: 2, duration: .055 }, ">-.012");

    // Animation frames can be throttled. Keep the opening from delaying navigation.
    const deadline = window.setTimeout(completeOpening, isPhone ? 540 : 920);

    return () => {
      window.clearTimeout(deadline);
      timeline.revert();
      document.removeEventListener("keydown", onKey);
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, [variant, onFinish]);

  return (
    <div className={`curtain-overlay curtain-overlay--${variant}`} ref={overlay} aria-label="Portfolio opening">
      <div className="curtain curtain-left" aria-hidden="true" />
      <div className="curtain curtain-right" aria-hidden="true" />
      <div className="opening-seam" aria-hidden="true" />
      <div className="opening-rail" aria-hidden="true">
        <span className="opening-port opening-port--left" />
        <span className="opening-port opening-port--right" />
        <span className="opening-pulse opening-pulse--out" />
        <span className="opening-pulse opening-pulse--reply" />
      </div>
      <span className="opening-pulse opening-pulse--dock" aria-hidden="true" />
      <button type="button" ref={skip} className="opening-skip" onClick={() => onFinish({ restoreFocus: true })}>
        Skip intro <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
