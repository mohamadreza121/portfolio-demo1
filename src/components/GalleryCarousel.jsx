import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaExpand } from "react-icons/fa6";
import useNearViewport from "../hooks/useNearViewport";
import "./GalleryCarousel.css";

export default function GalleryCarousel({
  items, label, itemLabel, viewLabel, renderCaption, renderViewer,
  className = "", lockOnSlides = false,
}) {
  const [selected, setSelected] = useState(0);
  const [viewer, setViewer] = useState(null);
  const stage = useRef(null);
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const hover = useRef({ direction: 0, timer: 0 });
  const refocusSlide = useRef(false);
  const active = items[selected];
  const total = items.length;
  const midpoint = Math.floor(total / 2);
  const near = useNearViewport(stage);

  const stopHover = useCallback(() => {
    window.clearTimeout(hover.current.timer);
    hover.current.direction = 0;
  }, []);

  useEffect(() => stopHover, [stopHover]);

  const move = useCallback((amount) => {
    setSelected((index) => (index + amount + total) % total);
  }, [total]);

  const step = useCallback((amount) => {
    stopHover();
    move(amount);
  }, [move, stopHover]);

  useEffect(() => {
    const element = stage.current;
    let accumulated = 0;
    let lastWheel = 0;
    let lastStep = -Infinity;

    function onWheel(event) {
      if (event.ctrlKey || event.metaKey) return;
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (!horizontal && !event.target.closest(".credential-slide")) return;
      const delta = horizontal ? event.deltaX : event.deltaY;
      if (!delta || !event.cancelable) return;
      event.preventDefault();

      const now = performance.now();
      if (now - lastWheel > 170 || Math.sign(accumulated) !== Math.sign(delta)) accumulated = 0;
      lastWheel = now;
      accumulated += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
      if (Math.abs(accumulated) >= 42 && now - lastStep > 470) {
        step(Math.sign(accumulated));
        accumulated = 0;
        lastStep = now;
      }
    }

    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [step]);

  useLayoutEffect(() => {
    if (!refocusSlide.current) return;
    refocusSlide.current = false;
    stage.current.querySelector('.credential-slide[data-slot="0"]')?.focus({ preventScroll: true });
  }, [selected]);

  function onKeys(event) {
    const moves = { ArrowLeft: -1, ArrowRight: 1, Home: -selected, End: total - 1 - selected };
    if (!(event.key in moves)) return;
    event.preventDefault();
    if (!moves[event.key]) return;
    refocusSlide.current = event.target.matches(".credential-slide");
    step(moves[event.key]);
  }

  function openViewer() {
    stopHover();
    const source = stage.current.querySelector('.credential-slide[data-slot="0"]')?.getBoundingClientRect();
    setViewer({ index: selected, scrollTop: window.scrollY, source });
  }

  function steerWithMouse(event) {
    if (event.pointerType !== "mouse" || event.buttons || viewer || event.target.closest(".credential-step")) {
      stopHover();
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - bounds.left) / bounds.width;
    const direction = position < .20 ? -1 : position > .80 ? 1 : 0;
    if (direction === hover.current.direction) return;
    stopHover();
    if (!direction) return;
    hover.current.direction = direction;

    function rotate() {
      move(direction);
      hover.current.timer = window.setTimeout(rotate, 1050);
    }

    hover.current.timer = window.setTimeout(rotate, 570);
  }

  function beginSwipe(event) {
    if (event.button !== 0 || !event.isPrimary) return;
    stopHover();
    suppressClick.current = false;
    if (event.target.closest(".credential-step")) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
  }

  function updateSwipe(event) {
    const start = gesture.current;
    if (!start) { steerWithMouse(event); return; }
    if (start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.horizontal) {
      if (Math.hypot(dx, dy) < 13) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        gesture.current = null;
        return;
      }
      start.horizontal = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      event.currentTarget.dataset.dragging = "true";
      event.currentTarget.style.setProperty("--drag-offset", Math.max(-45, Math.min(45, dx * .34)) + "px");
    }
  }

  function endSwipe(event) {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    gesture.current = null;
    delete event.currentTarget.dataset.dragging;
    event.currentTarget.style.removeProperty("--drag-offset");
    if (event.type === "pointerup" && start.horizontal && Math.abs(event.clientX - start.x) >= 40) {
      step(event.clientX < start.x ? 1 : -1);
    }
  }

  return (
    <>
      <section className={className ? "credential-carousel " + className : "credential-carousel"} aria-roledescription="carousel" aria-label={label} onKeyDown={onKeys}>
        <figure className="credential-figure">
          <div className="credential-spotlight" ref={stage} onPointerDown={beginSwipe} onPointerMove={updateSwipe} onPointerLeave={stopHover}
            onPointerUp={endSwipe} onPointerCancel={endSwipe} onLostPointerCapture={endSwipe}
            onClickCapture={(event) => {
              if (suppressClick.current && event.detail > 0) {
                suppressClick.current = false;
                event.stopPropagation();
                event.preventDefault();
              }
            }}>
            <div className="credential-deck">
              {items.map((item, index) => {
                const offset = (index - selected + midpoint + total) % total - midpoint;
                const distance = Math.abs(offset);
                return (
                  <button key={item.title} type="button" className="credential-slide" data-slot={offset} data-cursor-target={lockOnSlides && distance <= 2 ? "" : undefined}
                    disabled={distance > 2} tabIndex={offset === 0 ? 0 : -1} aria-hidden={distance > 2 || undefined}
                    aria-label={(offset === 0 ? "View " : "Select ") + item.title}
                    onClick={() => {
                      if (offset === 0) openViewer();
                      else {
                        stopHover();
                        setSelected(index);
                      }
                    }}>
                    <img src={near && distance <= 2 ? item.thumb : undefined} alt="" draggable="false" decoding="async" />
                    {offset === 0 && <span className="credential-slide__expand" aria-hidden="true"><FaExpand /></span>}
                  </button>
                );
              })}
            </div>
            <button type="button" className="credential-step credential-step--prev cursor-target" aria-label={"Previous " + itemLabel} onClick={() => step(-1)}><FaArrowLeft aria-hidden="true" /></button>
            <button type="button" className="credential-step credential-step--next cursor-target" aria-label={"Next " + itemLabel} onClick={() => step(1)}><FaArrowRight aria-hidden="true" /></button>
          </div>
          <figcaption className="credential-info">
            <div className="credential-info__body" key={selected}>
              {renderCaption(active)}
            </div>
            <button type="button" className="credential-open cursor-target" onClick={openViewer}><FaExpand aria-hidden="true" /> {viewLabel}</button>
          </figcaption>
        </figure>
        <p className="credential-sr" aria-live="polite" aria-atomic="true">{active.title}</p>
      </section>
      {viewer && renderViewer(items[viewer.index], viewer, () => setViewer(null))}
    </>
  );
}
