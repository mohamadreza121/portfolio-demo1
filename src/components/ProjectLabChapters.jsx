import { useLayoutEffect, useState } from "react";
import { FaChevronRight, FaTerminal } from "react-icons/fa";
import { commandsFor, consolePrompt, labChapters } from "../data/projects/project1Console";
import WindowsLabEvidence from "../pages/Project6";

const story = [
  {
    id: "switching",
    title: "Give HQ a second way out.",
    label: "The campus",
    description: "HQ separates users, servers, and management into VLANs. Both uplinks carry those VLANs, so the primary and backup gateways can share one virtual IP per segment.",
    path: ["SW1", "HQ-GW1 / HQ-GW2", "HQ-EDGE"],
    host: "HQ-GW2",
    command: "show vrrp",
    observation: "GW2 owns the virtual IPs. GW1 is ready to take over.",
    limit: 3,
  },
  {
    id: "routing",
    title: "Carry routes inside the tunnel.",
    label: "The routing core",
    description: "OSPF joins the campus gateways to the edge router and runs across the encrypted tunnel. The branch learns how to reach HQ subnets across the same adjacency.",
    path: ["HQ gateways", "HQ-EDGE", "Tunnel10", "R2"],
    host: "HQ-EDGE",
    command: "show ip ospf neighbor",
    observation: "The two HQ links and Tunnel10 have reached FULL adjacency.",
  },
  {
    id: "wan",
    title: "Make room for a second provider.",
    label: "The WAN",
    description: "The HQ edge peers with both ISPs and takes a default route from each. Inside the lab, a primary IPsec VTI carries traffic while Tunnel20 is held for failover.",
    path: ["HQ-EDGE", "ISP1 / ISP2", "INET-RTR"],
    host: "HQ-EDGE",
    command: "show ip bgp summary",
    observation: "Each provider has an established eBGP session and advertises one prefix.",
    match: (line) => /Neighbor|^160\.1\.1\./.test(line),
  },
  {
    id: "branch",
    title: "Put the branch on the same network.",
    label: "The branch",
    description: "SW2 trunks the branch VLANs to R2. The branch router learns the HQ subnets, relays DHCP requests to SRV1, and routes Internet traffic at the branch edge.",
    path: ["SW2", "R2", "Tunnel10", "HQ"],
    host: "R2",
    command: "show ip route",
    observation: "HQ routes arrive at R2 over Tunnel10.",
    match: (line) => line.includes("Tunnel10"),
  },
  {
    id: "windows",
    title: "Get an endpoint online.",
    label: "Windows services",
    description: "SRV1 hosts AD DS, DNS, and DHCP at HQ. A branch client gets a lease through the relay, uses SRV1 for DNS, and can then join the domain.",
    path: ["Branch client", "R2 relay", "SRV1"],
    host: "SRV1",
    command: "ipconfig /all",
    observation: "SRV1 has a static address, uses itself for DNS, and uses the HQ virtual gateway.",
    match: (line) => /IPv4 Address|Default Gateway|DNS Servers/.test(line),
  },
];

const sensitiveConfigLine = /\b(password|secret|key-string|pre-shared-key|authentication-key|username|snmp-server community)\b/i;

function readableOutput(entry) {
  if (!entry.command.startsWith("show run")) return entry.output;
  return entry.output.split("\n").map((line) =>
    sensitiveConfigLine.test(line) ? " ! Credential setting omitted" : line
  ).join("\n");
}

function DeviceEvidence({ card }) {
  const host = card.terminals[0].host;
  return (
    <details className="lab-story__device">
      <summary className="cursor-target">{host}<FaChevronRight aria-hidden="true" /></summary>
      <p>{card.description}</p>
      {card.notes?.length > 0 && <ul className="list">{card.notes.map((note) => <li key={note}>{note}</li>)}</ul>}
      {card.terminals.map((entry) => (
        <details key={entry.command} className="lab-story__output">
          <summary className="cursor-target"><code>{entry.command}</code></summary>
          {entry.output && <pre className="cli-pre" tabIndex={0}>{readableOutput(entry)}</pre>}
        </details>
      ))}
    </details>
  );
}

function requestedChapter(hash) {
  if (hash === "#cmd" || hash === "#troubleshooting") return "windows";
  return story.find(({ id }) => "#" + id === hash)?.id;
}

export default function ProjectLabChapters({ hash }) {
  const [selected, setSelected] = useState(() => requestedChapter(hash) || "switching");
  const requested = requestedChapter(hash);
  useLayoutEffect(() => { if (requested) setSelected(requested); }, [requested]);

  const chapter = story.find(({ id }) => id === selected);
  const cards = labChapters.find(({ id }) => id === selected)?.cards;
  const output = commandsFor(chapter.host).find(({ name }) => name === chapter.command).output();
  const excerpt = output.split("\n").filter(chapter.match ?? ((line) => line.trim())).slice(0, chapter.limit ?? 5).join("\n");
  const showServerEvidence = selected === "windows" && (hash === "#cmd" || hash === "#troubleshooting");

  function onKeyDown(event, index) {
    const keys = {
      ArrowRight: (index + 1) % story.length, ArrowDown: (index + 1) % story.length,
      ArrowLeft: (index + story.length - 1) % story.length, ArrowUp: (index + story.length - 1) % story.length,
      Home: 0, End: story.length - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = story[keys[event.key]].id;
    setSelected(next);
    document.getElementById("story-tab-" + next)?.focus({ preventScroll: true });
  }

  return (
    <section id="story" className="lab-story" aria-labelledby="lab-story-title">
      <header className="lab-story__header">
        <p className="lab-kicker">How it works</p>
        <h2 id="lab-story-title">Follow the packet.</h2>
        <p>Start at HQ, cross the WAN, and see what it takes for a branch client to come online.</p>
      </header>
      <div className="lab-story__layout">
        <div className="lab-story__steps" role="tablist" aria-label="Case study chapters">
          {story.map(({ id, label }, index) => (
            <button key={id} type="button" role="tab" className="cursor-target" id={"story-tab-" + id} aria-controls="lab-story-panel" aria-selected={selected === id}
              tabIndex={selected === id ? 0 : -1} onClick={() => setSelected(id)} onKeyDown={(event) => onKeyDown(event, index)}>
              <i aria-hidden="true" />{label}
            </button>
          ))}
        </div>
        <div id="lab-story-panel" role="tabpanel" tabIndex={0} aria-labelledby={"story-tab-" + selected}>
          <article className="lab-story__chapter" key={selected} id={selected === "windows" ? undefined : selected}>
            <h3>{chapter.title}</h3>
            <p>{chapter.description}</p>
            <ol className="lab-story__path" aria-label="Path through the network">
              {chapter.path.map((device) => <li key={device}>{device}</li>)}
            </ol>
            <figure className="lab-story__readout">
              <div><FaTerminal aria-hidden="true" /><code>{consolePrompt(chapter.host)} {chapter.command}</code></div>
              <pre tabIndex={0}>{excerpt}</pre>
              <figcaption>{chapter.observation}</figcaption>
            </figure>
            <details className="lab-story__evidence" open={showServerEvidence || undefined}>
              <summary className="cursor-target">{selected === "windows" ? "Server runbook and screenshots" : "Full device evidence"}<FaChevronRight aria-hidden="true" /></summary>
              {cards ? cards.map((card) => <DeviceEvidence key={card.id} card={card} />) : <WindowsLabEvidence />}
            </details>
          </article>
        </div>
      </div>
    </section>
  );
}
