import { useMemo, useState } from "react";
import "./RackDeck.css";
import "../pages/ProjectCli.css";

const EMPTY_ARR = [];

export default function RackDeck({ data }) {
  // ✅ stable fallbacks (no new [] created each render)
  const cards = data?.cards ?? EMPTY_ARR;
  const hotspots = data?.hotspots ?? EMPTY_ARR;

  const defaultId = cards[0]?.id || hotspots[0]?.target || "";
  const [activeId, setActiveId] = useState(defaultId);

  const activeCard = useMemo(() => {
    const found = cards.find((c) => c.id === activeId);
    return found || cards[0] || null;
  }, [cards, activeId]);

  return (
    <div className="rackdeckx">
      <div className="rackdeckx__rack">
        <div className="rackdeckx__title">
          <h2 style={{ margin: 0 }}>{data?.title || "Rack View"}</h2>
          <p className="muted" style={{ margin: "8px 0 0" }}>
            Click a hotspot to load the CLI evidence on the right.
          </p>
        </div>

        <figure className="rackdeckx__figure" style={{ margin: 0 }}>
          <img
            className="rackdeckx__img"
            src={data?.image}
            alt={data?.title || "Rack diagram"}
          />

          {hotspots.map((h) => {
            const isActive = h.target === activeId;
            return (
              <button
                key={h.id}
                type="button"
                className={`rackdeckx__hotspot ${isActive ? "is-active" : ""}`}
                style={h.style}
                onClick={() => setActiveId(h.target)}
                aria-label={`Select ${h.label}`}
                title={h.label}
              >
                <span className="rackdeckx__hotspotLabel">{h.label}</span>
              </button>
            );
          })}
        </figure>
      </div>

      <div className="rackdeckx__deck">
        {!activeCard ? (
          <div className="section-block">
            <p className="muted">No rack card data found.</p>
          </div>
        ) : (
          <div className="section-block hardware-card deck-card deck-card--active">
            <h3 className="device-card__title" style={{ marginTop: 0 }}>
              {activeCard.title}
            </h3>
            <p className="device-card__desc">{activeCard.description}</p>

            <div className="cli-grid" style={{ marginTop: 12 }}>
              {(activeCard.terminals || []).map((t, idx) => (
                <div
                  className="cli-terminal-card"
                  key={`${activeCard.id}-${idx}`}
                >
                  <div className="cli-terminalbar">
                    <div className="cli-dots" aria-hidden="true">
                      <span className="cli-dot dot-red" />
                      <span className="cli-dot dot-yellow" />
                      <span className="cli-dot dot-green" />
                    </div>
                    <div className="cli-label">
                      {t.badge ? `${t.badge} — ` : ""}
                      {t.host}
                    </div>
                    <div className="cli-spacer" />
                    <span className="cli-badge">CLI</span>
                  </div>

                  <div className="cli-body">
                    <div className="cli-promptline">
                      <span className="cli-host">{t.host}</span>
                      <span className="cli-prompt">#</span>
                      <span className="cli-cmd">{t.command}</span>
                    </div>

                    <pre className="cli-pre">{t.output}</pre>
                  </div>
                </div>
              ))}
            </div>

            {activeCard.notes?.length ? (
              <div style={{ marginTop: 14 }}>
                <h4 style={{ marginBottom: 8 }}>Notes</h4>
                <ul className="list">
                  {activeCard.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
