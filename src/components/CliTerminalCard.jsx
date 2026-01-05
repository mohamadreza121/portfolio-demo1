import React from "react";

/**
 * CliTerminalCard
 * Reusable terminal-style container used on Project pages.
 *
 * Props:
 * - id: short id label shown as badge (e.g., "p1-01")
 * - label: terminal bar label (e.g., "neteng@lab:~/projects$ open p1-01")
 * - host: prompt hostname (e.g., "R1-CORE")
 * - cmd: command shown after prompt (string)
 * - children: content (typically <pre> output or any JSX)
 */
export default function CliTerminalCard({ id, label, host, cmd, children }) {
  return (
    <article className="cli-terminal-card">
      <div className="cli-terminalbar" aria-hidden="true">
        <div className="cli-dots">
          <span className="cli-dot dot-red" />
          <span className="cli-dot dot-yellow" />
          <span className="cli-dot dot-green" />
        </div>

        <div className="cli-label">{label}</div>

        <div className="cli-spacer" />

        <div className="cli-badge">{id}</div>
      </div>

      <div className="cli-body">
        <div className="cli-promptline" aria-label="Command prompt">
          <span className="cli-host">{host}#</span>
          <span className="cli-cmd">{cmd}</span>
        </div>

        {children}
      </div>
    </article>
  );
}
