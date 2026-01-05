import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import RackInteractive from "./RackInteractive";
import CarouselProject from "./CarouselProject";
import ProjectLightbox from "./ProjectLightbox";
import "../pages/ProjectDetail.css";

const EMPTY_ARR = Object.freeze([]);

function DeviceCardContent({ card, onOpenLightbox, isLightboxOpen, showMedia = true }) {
  if (!card) return null;

  return (
    <>
      <h3 className="device-card__title">{card.title}</h3>
      <p className="device-card__desc">{card.description}</p>

      {Array.isArray(card.sections) && card.sections.length > 0 && (
        <div className="grid-2">
          {card.sections.map((s) => (
            <div key={`${card.id}-${s.title}`} className="kv__item">
              <div className="kv__label">{s.title}</div>
              <ul className="list">
                {s.items.map((it) => (
                  <li key={`${card.id}-${s.title}-${it}`}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {showMedia && Array.isArray(card.carousel) && card.carousel.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <h4 className="section-title" style={{ marginBottom: 10 }}>
            Evidence / media
          </h4>
          <CarouselProject
            items={card.carousel}
            isLightboxOpen={isLightboxOpen}
            onOpen={(item) => onOpenLightbox?.(item)}
          />
        </div>
      )}
    </>
  );
}

function DeckCardShell({ children, className = "", style, ariaHidden }) {
  return (
    <div
      className={`section-block deck-card hardware-card ${className}`}
      style={style}
      aria-hidden={ariaHidden}
    >
      {children}
    </div>
  );
}

export default function RackProjectPage({
  projectId,
  headerTitle,
  headerSubtitle,
  rack,
  prevPath,
  nextPath,
}) {
  // Keep stable references without fighting React Compiler memoization rules.
  // Using a module-level EMPTY_ARR prevents creating a new [] on every render.
  const cards = Array.isArray(rack?.cards) ? rack.cards : EMPTY_ARR;
  const hotspots = Array.isArray(rack?.hotspots) ? rack.hotspots : EMPTY_ARR;
  const image = rack?.image;

  const defaultActive = cards[0]?.id;
  const [activeId, setActiveId] = useState(defaultActive);
  const [lightboxItem, setLightboxItem] = useState(null);

  const deckTopRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = lightboxItem ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [lightboxItem]);

  const byId = useMemo(() => {
    const map = new Map();
    cards.forEach((c) => map.set(c.id, c));
    return map;
  }, [cards]);

  const activeCard = byId.get(activeId) || cards[0];
  const activeIndex = Math.max(0, cards.findIndex((c) => c.id === activeCard?.id));

  const select = (id) => {
    if (!id) return;
    setActiveId(id);

    // On smaller screens (stacked layout), bring the deck into view.
    if (window.innerWidth < 920) {
      requestAnimationFrame(() => {
        deckTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  // Show up to 2 "behind" cards for the stacked/deck visual.
  const behindCards = useMemo(() => {
    const total = cards.length;
    if (total <= 1) return [];

    // Never include the active card in the "behind" list.
    const maxBehind = Math.min(2, total - 1);
    const seen = new Set();
    const order = [];

    for (let step = 1; step <= maxBehind; step += 1) {
      const idx = (activeIndex + step) % total;
      if (idx === activeIndex) continue;

      const c = cards[idx];
      if (!c || seen.has(c.id)) continue;

      seen.add(c.id);
      order.push({ card: c, depth: step });
    }

    return order;
  }, [cards, activeIndex]);

  return (
    <div className="project-page project-page--rack" id={`project-${projectId}`}>
      <span className="spy-marker" />

      <div className="project-container">
        <header className="project-header">
          <h1 className="project-title">
            {headerTitle}
          </h1>
          {headerSubtitle ? <p className="project-subtitle">{headerSubtitle}</p> : null}
        </header>

        <section className="rackdeck" aria-label="Rack with device detail deck">
          <div className="rackdeck__rack">
            <RackInteractive
              image={image}
              title={rack?.title}
              hotspots={hotspots}
              activeId={activeCard?.id}
              onSelect={select}
            />
          </div>

          <div className="rackdeck__deck" ref={deckTopRef}>
            <div className="deck__header">
              <h2 className="section-title" style={{ margin: 0 }}>
                Device details
              </h2>
              <p className="deck__hint">
                Click a highlighted device in the rack to open its card. The active card expands to fit its content.
              </p>
            </div>

            <div className="deck" role="region" aria-label="Device detail cards">
              {behindCards.map(({ card, depth }) => (
                <DeckCardShell
                  key={`behind-${card.id}`}
                  className="deck-card--behind"
                  ariaHidden
                  style={{
                    transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.015})`,
                    opacity: 0.14,
                    zIndex: 1,
                  }}
                >
                  <div className="deck-card__behind-title">{card.title}</div>
                </DeckCardShell>
              ))}

              <DeckCardShell className="deck-card--active" style={{ zIndex: 3 }} ariaHidden={false}>
                <DeviceCardContent
                  card={activeCard}
                  isLightboxOpen={!!lightboxItem}
                  onOpenLightbox={(item) => setLightboxItem(item)}
                  showMedia
                />
              </DeckCardShell>
            </div>
          </div>
        </section>

        <div className="nav-row">
          <Link className="nav-btn cursor-target" to="/">
            ← Back to Home
          </Link>
          {prevPath ? (
            <Link className="nav-btn cursor-target" to={prevPath}>
              ← Previous
            </Link>
          ) : null}
          {nextPath ? (
            <Link className="nav-btn cursor-target" to={nextPath}>
              Next →
            </Link>
          ) : null}
        </div>

        <ProjectLightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
      </div>
    </div>
  );
}
