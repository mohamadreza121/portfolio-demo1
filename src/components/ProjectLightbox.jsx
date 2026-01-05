import LightboxPortal from "./LightboxPortal";

/**
 * ProjectLightbox
 * ------------------------------------------------------------------
 * Lightweight lightbox for project media (images/videos).
 * Uses the existing portal root and global .lightbox-project styles.
 */
export default function ProjectLightbox({ item, onClose }) {
  if (!item) return null;

  const src = item.mediaSrc || item.src;
  const title = item.title || "Media";

  return (
    <LightboxPortal>
      <div className="lightbox-project" onClick={onClose} role="dialog" aria-modal="true">
        <div className="lightbox-project-inner" onClick={(e) => e.stopPropagation()}>
          {/* Close button kept minimal to preserve your existing visual language */}
          <button
            type="button"
            className="project-lightbox-close cursor-target"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>

          {item.type === "video" ? (
            <video src={src} controls autoPlay style={{ display: "block" }} />
          ) : (
            <img src={src} alt={title} />
          )}
        </div>
      </div>
    </LightboxPortal>
  );
}
