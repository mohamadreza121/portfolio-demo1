import { memo } from "react";
import { rackDevices, consoleGroups } from "../data/projects/project1Console";

const roles = Object.fromEntries(consoleGroups.flatMap(({ nodes }) => nodes));

function Faceplate({ kind, ports }) {
  if (kind === "server") {
    return <span className="rack-server" aria-hidden="true"><i /><i /><i /><i /><b>PSU</b></span>;
  }
  return (
    <span className="rack-faceplate" aria-hidden="true">
      <span className="rack-jacks">{Array.from({ length: ports }, (_, slot) => <i key={slot} />)}</span>
      <i className="rack-vents" />
    </span>
  );
}

function NetworkRack({ active, onOpen, obscured }) {
  return (
    <div className="rack-model" aria-label="Interactive equipment rack" inert={obscured || undefined}>
      <div className="rack-model__top" aria-hidden="true" />
      <div className="rack-model__side" aria-hidden="true" />
      <div className="rack-model__front">
        <div className="rack-model__toprail" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="rack-devices">
          {rackDevices.map(({ host, kind, ports }) => (
            <button
              key={host}
              type="button"
              className="rack-module"
              data-kind={kind}
              aria-label={"Open " + host + " console"}
              aria-pressed={active === host}
              title={roles[host]}
              onClick={(event) => onOpen(host, event.currentTarget)}
            >
              <span className="rack-screw" aria-hidden="true" />
              <span className="rack-module__name"><i aria-hidden="true" />{host}</span>
              <Faceplate kind={kind} ports={ports} />
              <span className="rack-screw" aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="rack-model__foot" aria-hidden="true"><i /><span /><i /></div>
      </div>
    </div>
  );
}

export default memo(NetworkRack);
