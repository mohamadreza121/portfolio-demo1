import { lazy, Suspense, useLayoutEffect, useRef, useState } from "react";
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
const pad = (number) => String(number).padStart(2, "0");
const pdfPath = (index) => "/assets/cert" + (index + 1) + ".pdf";

function CertificateViewer({ index, scrollTop, onClose }) {
  const dialog = useRef(null);
  const certificate = certificates[index];
  const url = pdfPath(index);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    if (!element.open) element.showModal();
    window.scrollTo({ top: scrollTop, behavior: "instant" });

    return () => {
      root.style.overflow = previousOverflow;
      window.scrollTo({ top: scrollTop, behavior: "instant" });
    };
  }, [scrollTop]);

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
            <Suspense fallback={<p role="status">Loading certificate…</p>}>
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
  const [pdfScrollTop, setPdfScrollTop] = useState(null);
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const active = certificates[selected];

  function move(amount) {
    setSelected((index) => wrap(index + amount));
  }

  function onKeys(event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setSelected(event.key === "Home" ? 0 : total - 1);
    }
  }

  function beginSwipe(event) {
    if (event.button !== 0 || !event.isPrimary) return;
    suppressClick.current = false;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
  }

  function updateSwipe(event) {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
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
      move(event.clientX < start.x ? 1 : -1);
    }
  }

  return (
    <section id="certifications" className="certifications-page" aria-labelledby="credentials-heading">
      <span className="spy-marker" />
      <div className="credential-gallery">
        <header className="credential-header">
          <div>
            <h1 id="credentials-heading">Professional <span>Certifications</span></h1>
            <p>Networking, security, hardware, and programming credentials.</p>
          </div>
          <a className="credential-credly cursor-target" href="https://www.credly.com/users/mohammadreza-heidarpoor" target="_blank" rel="noreferrer">
            Verify on Credly <FaArrowUpRightFromSquare aria-hidden="true" />
          </a>
        </header>
        <section className="credential-carousel" aria-roledescription="carousel" aria-label="Certification gallery" onKeyDown={onKeys}>
          <div className="credential-spotlight" onPointerDown={beginSwipe} onPointerMove={updateSwipe}
            onPointerUp={endSwipe} onPointerCancel={endSwipe} onLostPointerCapture={endSwipe}
            onClickCapture={(event) => {
              if (suppressClick.current && event.detail > 0) {
                suppressClick.current = false;
                event.stopPropagation();
                event.preventDefault();
              }
            }}>
            <div className="credential-floor" aria-hidden="true" />
            <div className="credential-deck">
              {certificates.map((certificate, index) => {
                const offset = wrap(index - selected + total / 2) - total / 2;
                const distance = Math.abs(offset);
                return (
                  <button key={certificate.title} type="button" className="credential-slide" data-slot={offset}
                    disabled={distance > 2} tabIndex={offset === 0 ? 0 : -1} aria-hidden={distance > 2 || undefined}
                    aria-label={(offset === 0 ? "View " : "Select ") + certificate.title}
                    onClick={() => offset === 0 ? setPdfScrollTop(window.scrollY) : setSelected(index)}>
                    <img src={certificate.thumb} alt="" draggable="false" loading={distance > 2 ? "lazy" : "eager"} />
                    {offset === 0 && <span className="credential-slide__expand" aria-hidden="true"><FaExpand /></span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="credential-control" aria-label="Browse certificates">
            <button type="button" className="credential-step" aria-label="Previous certificate" onClick={() => move(-1)}><FaArrowLeft aria-hidden="true" /></button>
            <div className="credential-index">
              {certificates.map(({ title }, index) => (
                <button key={title} type="button" aria-label={title} title={title} aria-current={selected === index ? "true" : undefined}
                  onClick={() => setSelected(index)}>{pad(index + 1)}</button>
              ))}
            </div>
            <button type="button" className="credential-step" aria-label="Next certificate" onClick={() => move(1)}><FaArrowRight aria-hidden="true" /></button>
            <span className="credential-progress" aria-hidden="true">{pad(selected + 1)} / {pad(total)}</span>
          </div>

          <div className="credential-info">
            <div className="credential-info__body" key={selected}>
              <p className="credential-info__issuer">{active.issuer}</p>
              <h2>{active.title}</h2>
              <p className="credential-info__date">
                {active.expires ? "Issued " : "Completed "}{active.issued}
                {active.expires && <span>Valid through {active.expires}</span>}
              </p>
            </div>
            <button type="button" className="credential-open cursor-target" onClick={() => setPdfScrollTop(window.scrollY)}><FaExpand aria-hidden="true" /> View certificate</button>
          </div>
          <p className="credential-sr" aria-live="polite" aria-atomic="true">{selected + 1} of {total}. {active.title}.</p>
        </section>
      </div>
      {pdfScrollTop !== null && <CertificateViewer index={selected} scrollTop={pdfScrollTop} onClose={() => setPdfScrollTop(null)} />}
    </section>
  );
}
