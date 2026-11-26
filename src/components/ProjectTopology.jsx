import { memo, useLayoutEffect, useRef } from "react";
import { FaNetworkWired, FaServer } from "react-icons/fa";
import { project1 } from "../data/projects/project1";
import { topologyPositions, linkWaypoints } from "../data/projects/project1Console";

function drawLinks(canvas, stage, active) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  if (!width || !height) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const palette = getComputedStyle(stage);
  const accent = palette.getPropertyValue("--accent").trim() || "#61dca3";
  const tunnel = palette.getPropertyValue("--accent-alt").trim() || "#61b3dc";
  const links = project1.connections.map((link) => ({
    link,
    active: link.from === active || link.to === active,
  }));
  links.sort((a, b) => Number(a.active) - Number(b.active));

  for (const item of links) {
    const link = item.link;
    const standby = link.fromIf === "Tunnel20" || link.notes.includes("admin down");
    const vti = link.type === "IPSEC";
    ctx.beginPath();
    ctx.globalAlpha = item.active ? .94 : .34;
    ctx.lineWidth = item.active ? 2 : 1.2;
    ctx.strokeStyle = vti ? tunnel : accent;
    ctx.setLineDash(standby ? [2, 6] : vti ? [7, 5] : []);
    ctx.shadowBlur = item.active ? 8 : 0;
    ctx.shadowColor = ctx.strokeStyle;
    for (const [index, [x, y]] of linkWaypoints(link).entries()) {
      if (index === 0) ctx.moveTo(width * x / 100, height * y / 100);
      else ctx.lineTo(width * x / 100, height * y / 100);
    }
    ctx.stroke();
  }
}

function ProjectTopology({ active, onOpen, theme }) {
  const stage = useRef(null);
  const canvas = useRef(null);

  useLayoutEffect(() => {
    const redraw = () => {
      if (canvas.current && stage.current) drawLinks(canvas.current, stage.current, active);
    };
    redraw();
    const frame = requestAnimationFrame(redraw);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(redraw);
    observer?.observe(stage.current);
    if (!observer) window.addEventListener("resize", redraw);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      if (!observer) window.removeEventListener("resize", redraw);
    };
  }, [active, theme]);

  return (
    <div className="lab-topology-scroll" tabIndex={0} role="region" aria-label="Topology diagram">
      <div className="lab-topology-map" ref={stage}>
        <div className="lab-topology-map__zone lab-topology-map__zone--hq">Headquarters</div>
        <div className="lab-topology-map__zone lab-topology-map__zone--wan">WAN</div>
        <div className="lab-topology-map__zone lab-topology-map__zone--branch">Branch</div>
        <canvas ref={canvas} aria-hidden="true" />
        {Object.entries(topologyPositions).map(([host, [x, y]]) => (
          <button
            className="lab-topology-node cursor-target"
            key={host}
            type="button"
            style={{ left: x + "%", top: y + "%" }}
            aria-pressed={host === active}
            aria-label={"Open " + host + " console"}
            onClick={(event) => onOpen(host, event.currentTarget)}
          >
            {host === "SRV1" ? <FaServer aria-hidden="true" /> : <FaNetworkWired aria-hidden="true" />}
            <strong>{host}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(ProjectTopology);
