import { useId, useLayoutEffect, useRef, useState } from "react";
import { FaTerminal, FaTimes } from "react-icons/fa";
import useCompactLayout from "../hooks/useCompactLayout";
import "./RackDeck.css";
import "../pages/ProjectCli.css";

function RackEvidence({ card, titleId }) {
  return (
    <>
      <h3 id={titleId} className="device-card__title">{card.title}</h3>
      <p className="device-card__desc">{card.description}</p>

      <div className="cli-grid" style={{ marginTop: 12 }}>
        {(card.terminals || []).map((terminal, index) => (
          <div className="cli-terminal-card" key={`${card.id}-${index}`}>
            <div className="cli-terminalbar">
              <div className="cli-dots" aria-hidden="true">
                <span className="cli-dot dot-red" />
                <span className="cli-dot dot-yellow" />
                <span className="cli-dot dot-green" />
              </div>
              <div className="cli-label">
                {terminal.badge ? `${terminal.badge} — ` : ""}
                {terminal.host}
              </div>
              <div className="cli-spacer" />
              <span className="cli-badge">CLI</span>
            </div>

            <div className="cli-body">
              <div className="cli-promptline">
                <span className="cli-host">{terminal.host}</span>
                <span className="cli-prompt">#</span>
                <span className="cli-cmd">{terminal.command}</span>
              </div>
              <pre className="cli-pre" tabIndex={0} aria-label={`Output for ${terminal.command}`}>{terminal.output}</pre>
            </div>
          </div>
        ))}
      </div>

      {card.notes?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <h4 style={{ marginBottom: 8 }}>Notes</h4>
          <ul className="list">
            {card.notes.map((note, index) => <li key={index}>{note}</li>)}
          </ul>
        </div>
      )}
    </>
  );
}

function EvidenceSheet({ card, onClose, trigger }) {
  const ref = useRef(null);
  const titleId = useId();

  useLayoutEffect(() => {
    const sheet = ref.current;
    const previousOverflow = document.body.style.overflow;
    sheet.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      sheet.close();
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [trigger]);

  return (
    <dialog
      className="rackdeckx__sheet"
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="rackdeckx__sheet-surface">
        <div className="rackdeckx__sheet-bar">
          <span><FaTerminal aria-hidden="true" /> CLI evidence</span>
          <button type="button" className="rackdeckx__close" aria-label="Close device evidence" onClick={onClose}>
            <FaTimes aria-hidden="true" />
          </button>
        </div>
        <div className="rackdeckx__sheet-content">
          <RackEvidence card={card} titleId={titleId} />
        </div>
      </div>
    </dialog>
  );
}

export default function RackDeck({ data }) {
  const compact = useCompactLayout();
  const cards = data?.cards ?? [];
  const hotspots = (data?.hotspots ?? []).flatMap((hotspot) => {
    const card = cards.find((item) => item.id === hotspot.target);
    if (!card) return [];
    const label = hotspot.label || card.terminals?.[0]?.host || hotspot.id.toUpperCase();
    return [{ ...hotspot, label }];
  });
  const [activeId, setActiveId] = useState(cards[0]?.id);
  const [sheetTrigger, setSheetTrigger] = useState(null);
  const activeCard = cards.find((card) => card.id === activeId) ?? cards[0];

  function selectDevice(id, trigger) {
    setActiveId(id);
    if (compact) setSheetTrigger(trigger);
  }

  return (
    <div className={`rackdeckx${compact ? " rackdeckx--compact" : ""}`}>
      <div className="rackdeckx__rack">
        <header className="rackdeckx__title">
          <h2>{data?.title || "Rack View"}</h2>
          <p className="muted">
            {compact ? "Select a device to inspect its CLI evidence." : "Select a device to load its CLI evidence on the right."}
          </p>
        </header>

        <figure className="rackdeckx__figure">
          <img className="rackdeckx__img" src={data?.image} alt={data?.title || "Rack diagram"} width="1024" height="1536" />
          {hotspots.map((hotspot) => (
            <button
              key={hotspot.id}
              type="button"
              className={`rackdeckx__hotspot ${hotspot.target === activeCard?.id ? "is-active" : ""}`}
              style={hotspot.style}
              onClick={(event) => selectDevice(hotspot.target, event.currentTarget)}
              aria-label={`Select ${hotspot.label} on rack`}
              aria-pressed={hotspot.target === activeCard?.id}
              aria-haspopup={compact ? "dialog" : undefined}
            >
              <span className="rackdeckx__hotspotLabel">{hotspot.label}</span>
            </button>
          ))}
        </figure>

        {compact && (
          <div className="rackdeckx__devices" role="group" aria-label="Rack devices">
            {hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                type="button"
                className="rackdeckx__device"
                aria-pressed={hotspot.target === activeCard?.id}
                aria-haspopup="dialog"
                onClick={(event) => selectDevice(hotspot.target, event.currentTarget)}
              >
                <FaTerminal aria-hidden="true" /> {hotspot.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!compact && activeCard && (
        <div className="rackdeckx__deck">
          <div className="section-block hardware-card deck-card deck-card--active">
            <RackEvidence card={activeCard} />
          </div>
        </div>
      )}

      {compact && sheetTrigger && activeCard && (
        <EvidenceSheet card={activeCard} trigger={sheetTrigger} onClose={() => setSheetTrigger(null)} />
      )}
    </div>
  );
}
