import { useId, useLayoutEffect, useRef } from "react";
import { FaXmark } from "react-icons/fa6";
import LightboxPortal from "./LightboxPortal";
import "./GalleryCarousel.css";

export default function GalleryViewer({ title, closeLabel, view, onClose, actions, children }) {
  const dialog = useRef(null);
  const titleId = useId();

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
        aria-labelledby={titleId} onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current.close();
        }}>
        <div className="credential-viewer__inner">
          <header>
            <h2 id={titleId}>{title}</h2>
            {actions}
            <button type="button" aria-label={closeLabel} onClick={() => dialog.current.close()} autoFocus>
              <FaXmark aria-hidden="true" />
            </button>
          </header>
          {children}
        </div>
      </dialog>
    </LightboxPortal>
  );
}
