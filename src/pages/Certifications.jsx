import DecryptedText from "../components/DecryptedText";
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaArrowUpRightFromSquare, FaExpand, FaXmark } from "react-icons/fa6";
import LightboxPortal from "../components/LightboxPortal";
import "./Certifications.css";

import cert1 from "../assets/cert1.png";
import cert2 from "../assets/cert2.png";
import cert3 from "../assets/cert3.png";
import cert4 from "../assets/cert4.png";
import cert5 from "../assets/cert5.png";
import cert6 from "../assets/cert6.png";
import cert7 from "../assets/cert7.png";
import cert8 from "../assets/cert8.png";
import cert9 from "../assets/cert9.png";
import cert10 from "../assets/cert10.png";

const PdfViewerLightbox = lazy(() => import("../components/PdfViewerLightbox"));

const certificates = [
  { title: "Cisco Certified Specialist – Enterprise Core", thumb: cert1, issuer: "Cisco", issued: "Sep 2024", expires: "Sep 2027" },
  { title: "CCNA – Routing & Switching", thumb: cert2, issuer: "Cisco", issued: "Aug 2017", expires: "Aug 2020" },
  { title: "Computer Hardware Basics", thumb: cert3, issuer: "Cisco Networking Academy", issued: "Oct 2023" },
  { title: "Endpoint Security", thumb: cert4, issuer: "Cisco Networking Academy", issued: "Nov 2023" },
  { title: "Introduction to Cybersecurity", thumb: cert5, issuer: "Cisco Networking Academy", issued: "Aug 2022" },
  { title: "Introduction to Java", thumb: cert6, issuer: "Sololearn", issued: "Jul 2025" },
  { title: "Network Support & Security", thumb: cert7, issuer: "Cisco Networking Academy", issued: "Nov 2023" },
  { title: "Networking Basics", thumb: cert8, issuer: "Cisco Networking Academy", issued: "Sep 2022" },
  { title: "Networking Devices and Initial Configuration", thumb: cert9, issuer: "Cisco Networking Academy", issued: "Nov 2023" },
  { title: "Python Essentials 1", thumb: cert10, issuer: "Cisco Networking Academy", issued: "Oct 2023" },
];

const total = certificates.length;
const wrap = (index) => (index + total) % total;
const pdfPath = (index) => "/assets/cert" + (index + 1) + ".pdf";

function CertificateViewer({ index, view, onClose }) {
  const dialog = useRef(null);
  const certificate = certificates[index];
  const url = pdfPath(index);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const { scrollTop, source } = view;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    if (!element.open) element.showModal();
    window.scrollTo({ top: scrollTop, behavior: "instant" });

    let animation;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const target = element.getBoundingClientRect();
      const visibleSource = source && source.width > 0 && source.top >= 0 && source.bottom <= window.innerHeight;
      const x = visibleSource ? source.left + source.width / 2 - (target.left + target.width / 2) : 0;
      const y = visibleSource ? source.top + source.height / 2 - (target.top + target.height / 2) : 18;
      const scale = visibleSource ? Math.max(.56, Math.min(.93, source.width / target.width)) : .94;
      animation = element.animate?.([
        { transform: `translate(${x}px, ${y}px) scale(${scale})`, opacity: .3 },
        { transform: "none", opacity: 1 },
      ], { duration: 480, easing: "cubic-bezier(.22, .75, .23, 1)" });
    }

    return () => {
      animation?.cancel();
      root.style.overflow = previousOverflow;
      window.scrollTo({ top: scrollTop, behavior: "instant" });
    };
  }, [view]);

  return (
    <LightboxPortal>
      <dialog className="credential-viewer" ref={dialog} onClose={onClose}
        aria-labelledby="credential-viewer-title" onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current.close();
        }}>
        <div className="credential-viewer__inner">
          <header>
            <h2 id="credential-viewer-title">{certificate.title}</h2>
            <a href={url} target="_blank" rel="noreferrer">Open PDF <FaArrowUpRightFromSquare aria-hidden="true" /></a>
            <button type="button" aria-label="Close certificate" onClick={() => dialog.current.close()} autoFocus>
              <FaXmark aria-hidden="true" />
            </button>
          </header>
          <div className="credential-viewer__document">
            <Suspense fallback={<div className="credential-viewer__preview"><img src={certificate.thumb} alt="" /><p role="status">Loading certificate…</p></div>}>
              <PdfViewerLightbox fileUrl={url} />
            </Suspense>
          </div>
        </div>
      </dialog>
    </LightboxPortal>
  );
}

export default function Certifications() {
  const [selected, setSelected] = useState(0);
  const [viewer, setViewer] = useState(null);
  const stage = useRef(null);
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const hover = useRef({ direction: 0, timer: 0 });
  const refocusSlide = useRef(false);
  const active = certificates[selected];

  const stopHover = useCallback(() => {
    window.clearTimeout(hover.current.timer);
    hover.current.direction = 0;
  }, []);

  useEffect(() => stopHover, [stopHover]);

  const move = useCallback((amount) => {
    setSelected((index) => wrap(index + amount));
  }, []);

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
    setViewer({ scrollTop: window.scrollY, source });
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
    <section id="certifications" className="certifications-page" aria-labelledby="credentials-heading">
      <span className="spy-marker" />
      <div className="credential-gallery">
        <header className="credential-header">
          <div className="credential-heading-copy">
            <h1 id="credentials-heading">
              <DecryptedText text="Professional" animateOn="view" sequential speed={45} revealDirection="center" />{" "}
              <span className="credential-title-accent"><DecryptedText text="Certifications" animateOn="view" sequential speed={45} revealDirection="center" revealDelay={75} /></span>
            </h1>
            <p>Networking, security, hardware, and programming credentials.</p>
          </div>
          <a className="credential-credly cursor-target" href="https://www.credly.com/users/mohammadreza-heidarpoor" target="_blank" rel="noreferrer">
            Verify on Credly <FaArrowUpRightFromSquare aria-hidden="true" />
          </a>
        </header>
        <section className="credential-carousel" aria-roledescription="carousel" aria-label="Certification gallery" onKeyDown={onKeys}>
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
                {certificates.map((certificate, index) => {
                  const offset = wrap(index - selected + total / 2) - total / 2;
                  const distance = Math.abs(offset);
                  return (
                    <button key={certificate.title} type="button" className="credential-slide" data-slot={offset}
                      disabled={distance > 2} tabIndex={offset === 0 ? 0 : -1} aria-hidden={distance > 2 || undefined}
                      aria-label={(offset === 0 ? "View " : "Select ") + certificate.title}
                      onClick={() => {
                        if (offset === 0) openViewer();
                        else {
                          stopHover();
                          setSelected(index);
                        }
                      }}>
                      <img src={certificate.thumb} alt="" draggable="false" loading={distance > 2 ? "lazy" : "eager"} />
                      {offset === 0 && <span className="credential-slide__expand" aria-hidden="true"><FaExpand /></span>}
                    </button>
                  );
                })}
              </div>
              <button type="button" className="credential-step credential-step--prev" aria-label="Previous certificate" onClick={() => step(-1)}><FaArrowLeft aria-hidden="true" /></button>
              <button type="button" className="credential-step credential-step--next" aria-label="Next certificate" onClick={() => step(1)}><FaArrowRight aria-hidden="true" /></button>
            </div>
            <figcaption className="credential-info">
              <div className="credential-info__body" key={selected}>
                <p className="credential-info__issuer">{active.issuer}</p>
                <h2>{active.title}</h2>
                <p className="credential-info__date">
                  {active.expires ? "Issued " : "Completed "}{active.issued}
                  {active.expires && <span>Valid through {active.expires}</span>}
                </p>
              </div>
              <button type="button" className="credential-open cursor-target" onClick={openViewer}><FaExpand aria-hidden="true" /> View certificate</button>
            </figcaption>
          </figure>
          <p className="credential-sr" aria-live="polite" aria-atomic="true">{active.title}</p>
        </section>
      </div>
      {viewer && <CertificateViewer index={selected} view={viewer} onClose={() => setViewer(null)} />}
    </section>
  );
}
