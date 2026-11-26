import { memo, useLayoutEffect, useRef, useState } from "react";
import { FaExchangeAlt, FaGlobe, FaNetworkWired, FaServer } from "react-icons/fa";
import { project1 } from "../data/projects/project1";
import { rackDevices, topologyPositions, linkWaypoints } from "../data/projects/project1Console";

const nodeDetails = {
  SRV1: "AD DS · DNS · DHCP",
  SW1: "HQ access",
  "HQ-GW1": "VRRP backup",
  "HQ-GW2": "VRRP master",
  "HQ-EDGE": "AS 65010 · VPN",
  "ISP1-RTR": "AS 65001",
  "ISP2-RTR": "AS 65002",
  "INET-RTR": "AS 65000",
  R2: "Branch edge",
  SW2: "Branch access",
};

const nodeIcons = { switch: FaNetworkWired, gateway: FaExchangeAlt, edge: FaExchangeAlt, router: FaGlobe, server: FaServer };
const nodeKinds = Object.fromEntries(rackDevices.map(({ host, kind }) => [host, kind]));

function linkKind(link) {
  if (link.fromIf === "Tunnel20" || link.notes.includes("admin down")) return "standby";
  if (link.type === "IPSEC") return "vpn";
  if (link.type === "EBGP") return "bgp";
  return "physical";
}

function strokePath(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const next = points[i + 1];
    const previous = points[i - 1];
    const corner = (target) => {
      const ratio = Math.min(.5, 8 / Math.hypot(target[0] - x, target[1] - y));
      return [x + (target[0] - x) * ratio, y + (target[1] - y) * ratio];
    };
    ctx.lineTo(...corner(previous));
    ctx.quadraticCurveTo(x, y, ...corner(next));
  }
  ctx.lineTo(...points.at(-1));
  ctx.stroke();
}

function drawLinks(canvas, stage, active, pulse) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  if (!width || !height) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const palette = getComputedStyle(stage);
  const color = (name, fallback) => palette.getPropertyValue("--topology-" + name).trim() || fallback;
  const colors = {
    physical: color("physical", "#9aafa6"), bgp: color("bgp", "#68dca8"),
    vpn: color("vpn", "#73bee9"), standby: color("standby", "#9c9eaa"),
  };
  const links = project1.connections.map((link) => ({
    link,
    selected: link.from === active || link.to === active,
  }));
  links.sort((a, b) => Number(a.selected) - Number(b.selected));

  for (const { link, selected } of links) {
    const kind = linkKind(link);
    const points = linkWaypoints(link).map(([x, y]) => [width * x / 100, height * y / 100]);
    ctx.setLineDash([]);
    ctx.globalAlpha = .87;
    ctx.lineWidth = selected ? 6 : 4;
    ctx.strokeStyle = "#081210";
    ctx.shadowBlur = 0;
    strokePath(ctx, points);

    ctx.globalAlpha = selected ? .98 : active ? .24 : .77;
    ctx.lineWidth = selected ? 2 : 1.35;
    ctx.strokeStyle = colors[kind];
    ctx.setLineDash(kind === "standby" ? [2, 6] : kind === "vpn" ? [7, 5] : []);
    ctx.shadowBlur = selected ? 8 : 0;
    ctx.shadowColor = colors[kind];
    strokePath(ctx, points);

    if (pulse != null && selected && (kind === "bgp" || kind === "physical")) {
      ctx.globalAlpha = Math.sin(Math.PI * pulse) * .83;
      ctx.lineWidth = 2.8;
      ctx.setLineDash([12, 720]);
      ctx.lineDashOffset = -pulse * 205;
      strokePath(ctx, points);
      ctx.lineDashOffset = 0;
    }
  }
}

function ProjectTopology({ active, onOpen, theme }) {
  const stage = useRef(null);
  const canvas = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const inspected = active || hovered || focused;
  const linkCount = inspected && project1.connections.filter(({ from, to }) => from === inspected || to === inspected).length;

  useLayoutEffect(() => {
    const redraw = (pulse) => {
      if (canvas.current && stage.current) drawLinks(canvas.current, stage.current, inspected, pulse);
    };
    const resize = () => redraw();
    redraw();
    let frame = 0;
    let start;
    function animate(time) {
      start ??= time;
      const progress = Math.min(1, (time - start) / 850);
      redraw(progress);
      if (progress < 1) frame = requestAnimationFrame(animate);
    }
    const animateLinks = inspected && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    frame = requestAnimationFrame(animateLinks ? animate : resize);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    observer?.observe(stage.current);
    if (!observer) window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      if (!observer) window.removeEventListener("resize", resize);
    };
  }, [inspected, theme]);

  return (
    <>
      <div className="lab-topology-heading">
        <h2>Network topology</h2>
        <p>{project1.connections.length} physical and logical links</p>
      </div>
      <div className="lab-topology-scroll" tabIndex={0} role="region" aria-label="Topology diagram" onPointerLeave={() => setHovered(null)}>
        <div className="lab-topology-map" ref={stage}>
          <div className="lab-topology-map__zone lab-topology-map__zone--hq"><b>Headquarters</b><span>VLANs · VRRP · OSPF</span></div>
          <div className="lab-topology-map__zone lab-topology-map__zone--wan"><b>Provider WAN</b><span>Dual eBGP uplinks</span></div>
          <div className="lab-topology-map__zone lab-topology-map__zone--branch"><b>Branch</b><span>Access · DHCP relay</span></div>
          <canvas ref={canvas} aria-hidden="true" />
          <span className="lab-topology-map__tunnel" data-path="primary">Tunnel10 · Primary IPsec VTI</span>
          <span className="lab-topology-map__tunnel" data-path="standby">Tunnel20 · Standby</span>
          {Object.entries(topologyPositions).map(([host, [x, y]]) => {
            const Icon = nodeIcons[nodeKinds[host]];
            return (
              <button
                className="lab-topology-node cursor-target"
                key={host}
                type="button"
                style={{ left: x + "%", top: y + "%" }}
                data-inspected={host === inspected}
                data-kind={nodeKinds[host]}
                aria-pressed={host === active}
                aria-label={"Open " + host + " console"}
                aria-description={nodeDetails[host]}
                onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(host); }}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setFocused(host)}
                onBlur={() => setFocused(null)}
                onClick={(event) => onOpen(host, event.currentTarget)}
              >
                <span className="lab-topology-node__icon"><Icon aria-hidden="true" /></span>
                <span><strong>{host}</strong><small>{nodeDetails[host]}</small></span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="lab-topology-footer">
        <ul className="lab-stage__legend" aria-label="Topology legend">
          <li data-kind="physical"><i /> Physical</li><li data-kind="bgp"><i /> eBGP</li>
          <li data-kind="vpn"><i /> IPsec VTI</li><li data-kind="standby"><i /> Standby</li>
        </ul>
        <p>{inspected ? <><b>{inspected}</b> · {linkCount} {linkCount === 1 ? "link" : "links"}</> : <><span className="lab-topology-footer__select">Select a device to open its CLI</span><span className="lab-topology-footer__swipe">Swipe to explore all devices</span></>}</p>
      </div>
    </>
  );
}

export default memo(ProjectTopology);
