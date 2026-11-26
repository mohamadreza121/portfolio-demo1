import { memo, useLayoutEffect, useRef, useState } from "react";
import { FaAngleRight, FaNetworkWired, FaServer, FaTerminal } from "react-icons/fa";
import { project1 } from "../data/projects/project1";
import { consoleGroups, rackDevices, topologyPositions, linkWaypoints } from "../data/projects/project1Console";

const roles = Object.fromEntries(consoleGroups.flatMap(({ nodes }) => nodes));
const rackOrder = rackDevices.map(({ host }) => host);

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

function TopologyMap({ active, onOpen, theme }) {
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
    <div className="lab-topology-scroll" tabIndex={0} aria-label="Topology diagram">
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
            onClick={() => onOpen(host)}
          >
            {host === "SRV1" ? <FaServer aria-hidden="true" /> : <FaNetworkWired aria-hidden="true" />}
            <strong>{host}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function RackMap({ active, onOpen }) {
  return (
    <div className="lab-rack">
      <figure className="lab-rack__figure">
        <img src="/Rack.png" width="1024" height="1536" alt="Rack showing the lab’s switches, gateways, ISP routers and server" />
        {rackDevices.map(({ host, style }) => (
          <button
            className="lab-rack__hotspot cursor-target"
            key={host}
            type="button"
            aria-pressed={host === active}
            aria-label={"Open " + host + " console from rack"}
            title={host + " · " + roles[host]}
            style={style}
            onClick={() => onOpen(host)}
          />
        ))}
      </figure>
      <div className="lab-rack__devices" aria-label="Rack device list">
        {rackOrder.map((host) => (
          <button
            key={host}
            type="button"
            aria-pressed={host === active}
            className="cursor-target"
            onClick={() => onOpen(host)}
          >
            <strong>{host}</strong>
            <span>{roles[host]}</span>
            <FaAngleRight aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ProjectTopology({ active, onOpen, theme }) {
  const [view, setView] = useState("topology");
  const links = project1.connections.filter(({ from, to }) => from === active || to === active);
  return (
    <section id="topology" className="section-block network-board" aria-labelledby="topology-title">
      <header className="network-board__heading">
        <div>
          <h2 id="topology-title">Topology and rack</h2>
          <p>Select any device to open its CLI session.</p>
        </div>
        <div className="network-board__switch" role="group" aria-label="Lab view">
          <button type="button" aria-pressed={view === "topology"} onClick={() => setView("topology")}>
            <FaNetworkWired aria-hidden="true" /> Topology
          </button>
          <button type="button" aria-pressed={view === "rack"} onClick={() => setView("rack")}>
            <FaServer aria-hidden="true" /> Rack
          </button>
        </div>
      </header>

      {view === "topology" ? (
        <>
          <p className="network-board__swipe">Swipe to see the full topology, or choose a device from the rack list.</p>
          <TopologyMap active={active} onOpen={onOpen} theme={theme} />
          <ul className="network-board__legend" aria-label="Link legend">
            <li><i /> Physical link</li>
            <li><i /> Primary IPsec VTI</li>
            <li><i /> Standby link</li>
          </ul>
        </>
      ) : <RackMap active={active} onOpen={onOpen} />}

      <div className="network-board__inspect">
        <div>
          <h3>{active} <span>{roles[active]}</span></h3>
          <ul aria-label={active + " links"}>
            {links.map(({ from, to, fromIf, toIf, type }) => (
              <li key={from + fromIf}>
                <code>{from === active ? fromIf : toIf}</code>
                <span>{from === active ? to : from}</span>
                <small>{type}</small>
              </li>
            ))}
          </ul>
        </div>
        <button className="btn btn-ghost cursor-target" type="button" onClick={() => onOpen(active)}>
          <FaTerminal aria-hidden="true" /> Open {active} CLI
        </button>
      </div>
    </section>
  );
}

export default memo(ProjectTopology);
