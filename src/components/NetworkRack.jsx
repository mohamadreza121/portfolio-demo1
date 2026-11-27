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

function Jacks({ states }) {
  return (
    <span className="rack-jacks">
      {states.map((state, index) => (
        <span className="rack-port" key={index} data-state={state}><i /></span>
      ))}
    </span>
  );
}

function Faceplate({ kind, host }) {
  if (kind === "server") {
    return (
      <span className="rack-server" aria-hidden="true">
        <i className="rack-vents" />
        <span className="rack-caddies">{["01", "02", "03", "04"].map((bay) => (
          <span key={bay}><b>{bay}</b><i /></span>
        ))}</span>
        <span className="rack-power"><i /><b /></span>
      </span>
    );
  }

  return (
    <span className="rack-faceplate" aria-hidden="true">
      <span className="rack-console-jack" />
      <span className="rack-port-bank">
        <Jacks states={portStates[host]} />
        {kind === "switch" && <Jacks states={portStates[host].map(() => "empty")} />}
      </span>
      {kind === "switch"
        ? <span className="rack-uplinks"><i /><i /></span>
        : <i className="rack-vents" />}
    </span>
  );
}

function NetworkRack({ active, onOpen, obscured }) {
  const Device = onOpen ? "button" : "span";

  return (
    <div className="rack-model" aria-hidden={!onOpen || undefined} aria-label={onOpen ? "Interactive equipment rack" : undefined} inert={obscured || undefined}>
      <div className="rack-model__floor" aria-hidden="true" />
      <div className="rack-model__back" aria-hidden="true" />
      <div className="rack-model__top" aria-hidden="true"><i /><i /></div>
      <div className="rack-model__frame" aria-hidden="true"><i /></div>
      <div className="rack-model__front">
        <div className="rack-model__rail" aria-hidden="true" />
        <div className="rack-devices">
          {rackDevices.map(({ host, kind }) => (
            <div className="rack-bay" data-kind={kind} key={host}>
              <span className="rack-bay__lid" aria-hidden="true" />
              <span className="rack-bay__side" aria-hidden="true"><i /><b /></span>
              <Device
                className="rack-module"
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
            </div>
          ))}
        </div>
        <div className="rack-model__rail rack-model__rail--base" aria-hidden="true" />
      </div>
    </div>
  );
}

export default memo(NetworkRack);
