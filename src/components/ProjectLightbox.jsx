// src/components/ProjectLightbox.jsx
import { useLayoutEffect } from "react";
import LightboxPortal from "./LightboxPortal";

/**
 * ProjectLightbox
 * ------------------------------------------------------------------
 * Portal-based lightbox for project media (images/videos).
 * - Opens "on the spot" (no jump) by locking scroll with body:fixed
 * - Uses useLayoutEffect so the lock + overlay feel instant (no delay)
 * - Supports ESC to close
 * - Uses your existing .lightbox-project / .lightbox-project-inner styles
 */
export default function ProjectLightbox({ item, onClose }) {
  useLayoutEffect(() => {
    if (!item) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);

    // ✅ lock scroll WITHOUT jumping to top (runs before paint)
    const scrollY = window.scrollY;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);

      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.left = prev.left;
      document.body.style.right = prev.right;
      document.body.style.width = prev.width;
      document.body.style.overflow = prev.overflow;

      // ✅ restore exact scroll position
      window.scrollTo(0, scrollY);
    };
  }, [item, onClose]);

  if (!item) return null;

  const src = item.fullSrc || item.mediaSrc || item.src;
  const title = item.title || "Media";

  return (
    <LightboxPortal>
      <div
        className="lightbox-project"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => {
          // close only when clicking the backdrop
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div
          className="lightbox-project-inner"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="project-lightbox-close cursor-target"
            aria-label="Close"
            title="Close"
            onClick={onClose}
          >
            ×
          </button>

          {item.type === "video" ? (
            <video
              src={src}
              controls
              autoPlay
              playsInline
              preload="auto"
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          ) : (
            <img
              src={src}
              alt={title}
              loading="eager"
              decoding="async"
              fetchpriority="high"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}

          {(item.title || item.caption) && (
            <div className="section-block" style={{ marginTop: 12 }}>
              {item.title && <h3 style={{ marginBottom: 6 }}>{item.title}</h3>}
              {item.caption && <p className="muted">{item.caption}</p>}
            </div>
          )}
        </div>
      </div>
    </LightboxPortal>
  );
}
