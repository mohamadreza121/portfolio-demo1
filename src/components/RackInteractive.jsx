import "./RackInteractive.css";

/**
 * RackInteractive
 * ------------------------------------------------------------------
 * Renders a rack image with clickable hotspots.
 *
 * Props:
 * - image (string): public path (e.g. /hq-core-and-edge.png)
 * - title (string)
 * - hotspots (array): [{ id, label, target, style: {top,left,width,height} }]
 * - activeId (string)
 * - onSelect (fn): (id) => void
 */
export default function RackInteractive({
  image,
  title,
  hotspots = [],
  activeId,
  onSelect,
  className = "",
}) {
  return (
    <section
      className={`rack ${className}`}
      aria-label={title || "Rack diagram"}
    >
      <div className="rack__header">
        <h2 className="rack__title">{title}</h2>
        <p className="rack__hint">
          Click a highlighted device to open its card.
        </p>
      </div>

      <div className="rack__frame">
        <img className="rack__image" src={image} alt={title || "Rack"} />

        <div className="rack__hotspots" aria-hidden="false">
          {hotspots.map((hs) => {
            const isActive = hs.id === activeId;
            return (
              <button
                key={hs.id}
                type="button"
                className={`rack__hotspot ${isActive ? "is-active" : ""}`}
                style={hs.style}
                onClick={() => onSelect?.(hs.target || hs.id)}
                aria-label={hs.label}
                title={hs.label}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
