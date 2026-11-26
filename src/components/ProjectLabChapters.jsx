import { memo } from "react";
import { FaTerminal } from "react-icons/fa";
import { labChapters } from "../data/projects/project1Console";
import WindowsLabEvidence from "../pages/Project6";

const sensitiveConfigLine = /\b(password|secret|key-string|pre-shared-key|authentication-key|username|snmp-server community)\b/i;

function readableOutput(entry) {
  if (!entry.command.startsWith("show run")) return entry.output;
  return entry.output.split("\n").map((line) =>
    sensitiveConfigLine.test(line) ? " ! Credential setting omitted" : line
  ).join("\n");
}

function DeviceEvidence({ card, onOpen }) {
  const host = card.terminals[0].host;
  return (
    <article className="lab-chapter__device">
      <div className="lab-chapter__device-head">
        <h3>{host}</h3>
        <button type="button" className="btn btn-ghost cursor-target" onClick={() => onOpen(host)}>
          <FaTerminal aria-hidden="true" /> Open CLI <span className="lab-console__sr">for {host}</span>
        </button>
      </div>
      <p>{card.description}</p>
      {card.notes?.length > 0 && <ul className="list">{card.notes.map((note) => <li key={note}>{note}</li>)}</ul>}
      <details className="lab-chapter__evidence">
        <summary>Inspect lab evidence for {host}</summary>
        {card.terminals.map((entry) => (
          <details key={entry.command} className="lab-chapter__output">
            <summary><code>{entry.command}</code></summary>
            <pre className="cli-pre" tabIndex={0}>{readableOutput(entry)}</pre>
          </details>
        ))}
      </details>
    </article>
  );
}

function ProjectLabChapters({ onOpen }) {
  return (
    <>
      {labChapters.map(({ id, title, summary, cards }) => (
        <section id={id} className="section-block lab-chapter" aria-labelledby={id + "-title"} key={id}>
          <header>
            <h2 id={id + "-title"}>{title}</h2>
            <p>{summary}</p>
          </header>
          <div className="lab-chapter__devices">
            {cards.map((card) => <DeviceEvidence key={card.id} card={card} onOpen={onOpen} />)}
          </div>
        </section>
      ))}
      <WindowsLabEvidence onOpen={onOpen} />
    </>
  );
}

export default memo(ProjectLabChapters);
