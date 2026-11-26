import { memo } from "react";
import { project1 } from "../data/projects/project1";
import { rackDevices, consoleGroups } from "../data/projects/project1Hardware";

import "./NetworkRack.css";

const roles = Object.fromEntries(consoleGroups.flatMap(({ nodes }) => nodes));
const chassisLabels = {
  switch: "ACCESS SWITCH",
  gateway: "SERVICES ROUTER",
  edge: "WAN EDGE",
  router: "WAN ROUTER",
  server: "RACK SERVER",
};

const physicalLinks = project1.connections.filter(({ type }) => type !== "IPSEC");
const portStates = Object.fromEntries(rackDevices.map(({ host, ports }) => {
  const links = physicalLinks.filter(({ from, to }) => from === host || to === host);
  return [host, Array.from({ length: ports }, (_, index) => {
    const link = links[index];
    if (!link) return "empty";
    return link.notes.includes("admin down") ? "standby" : "linked";
  })];
}));

function Faceplate({ kind, host }) {
  if (kind === "server") {
    return (
      <span className="rack-server" aria-hidden="true">
        <span className="rack-caddies">{["01", "02", "03", "04"].map((bay) => (
          <span key={bay}><i /><b>{bay}</b></span>
        ))}</span>
        <span className="rack-power"><i /><b /></span>
      </span>
    );
  }
  const ports = portStates[host];
  return (
    <span className="rack-faceplate" aria-hidden="true">
      <span className="rack-console-jack" />
      <span className="rack-jacks">{ports.map((state, index) => (
        <span className="rack-port" key={index} data-state={state}>
          <i />
          <b>{index + 1}</b>
        </span>
      ))}</span>
      <i className="rack-vents" />
    </span>
  );
}

function NetworkRack({ active, onOpen, obscured }) {
  const Device = onOpen ? "button" : "span";

  return (
    <div className="rack-model" aria-hidden={!onOpen || undefined} aria-label={onOpen ? "Interactive equipment rack" : undefined} inert={obscured || undefined}>
      <div className="rack-model__top" aria-hidden="true"><i /><i /></div>
      <div className="rack-model__side" aria-hidden="true"><i /></div>
      <div className="rack-model__front">
        <div className="rack-model__toprail" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="rack-devices">
          {rackDevices.map(({ host, kind }) => (
            <Device
              key={host}
              className="rack-module"
              data-kind={kind}
              {...(onOpen ? {
                type: "button",
                "aria-label": "Open " + host + " console",
                "aria-pressed": active === host,
                title: roles[host],
                onClick: (event) => onOpen(host, event.currentTarget),
              } : {})}
              data-active={active === host}
            >
              <span className="rack-screw" aria-hidden="true" />
              <span className="rack-module__name">
                <i aria-hidden="true" />
                <span>{host}<small aria-hidden="true">{chassisLabels[kind]}</small></span>
              </span>
              <Faceplate kind={kind} host={host} />
              <span className="rack-screw" aria-hidden="true" />
            </Device>
          ))}
        </div>
        <div className="rack-model__foot" aria-hidden="true"><i /><span /><i /></div>
      </div>
    </div>
  );
}

export default memo(NetworkRack);
