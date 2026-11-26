import { useCallback, useEffect, useRef, useState } from "react";
import CarouselProject from "../components/CarouselProject";
import { createPortal } from "react-dom";
import { project6 } from "../data/projects/project6";

function Lightbox({ item, onClose }) {
  const closeButton = useRef(null);
  useEffect(() => {
    if (!item) return;

    const onKeyDown = (e) => e.key === "Escape" && onClose?.();
    const prevOverflow = document.body.style.overflow;
    const opener = document.activeElement;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeButton.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [item, onClose]);

  if (!item) return null;

  return createPortal(
    <div
      className="lightbox-project lab-windows-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title || "Media viewer"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <button
        type="button"
        className="project-lightbox-close cursor-target"
        ref={closeButton}
        onClick={onClose}
        aria-label="Close"
        title="Close"
      >
        ×
      </button>

      <div className="lightbox-project-inner">
        <img
          src={item.fullSrc || item.mediaSrc}
          alt={item.title || "Media"}
          style={{ width: "100%", height: "auto", borderRadius: 14 }}
        />

        {(item.title || item.caption) && (
          <div className="section-block" style={{ marginTop: 12 }}>
            {item.title && <h3 style={{ marginBottom: 6 }}>{item.title}</h3>}
            {item.caption && <p className="muted">{item.caption}</p>}
          </div>
        )}
      </div>
    </div>,
    document.getElementById("portal-root") || document.body,
  );
}

function buildCmdBlock() {
  const header = [
    "Microsoft Windows [Version 10.0.20348.0000]",
    "(c) Microsoft Corporation. All rights reserved.",
    "",
    "C:\\Users\\Administrator>",
  ].join("\n");

  const sections = project6.cmdRunbook
    .map((s) => {
      const lines = (s.lines || [])
        .map((l) => `C:\\Users\\Administrator>${l}`)
        .join("\n");
      return [`:: ${s.title}`, lines, ""].join("\n");
    })
    .join("\n");

  return `${header}\n\n${sections}`.trimEnd();
}

const cmdText = buildCmdBlock();

export default function WindowsLabEvidence({ onOpen }) {
  const [lightboxItem, setLightboxItem] = useState(null);
  const closeLightbox = useCallback(() => setLightboxItem(null), []);

  return (
    <section id="windows" className="section-block lab-chapter lab-windows" aria-labelledby="lab-windows-title">
      <header className="lab-windows__heading">
        <div>
          <h2 id="lab-windows-title">{project6.title}</h2>
          <p>{project6.subtitle}</p>
        </div>
        <button type="button" className="btn btn-primary cursor-target" onClick={() => onOpen("SRV1")}>Open SRV1 CLI</button>
      </header>
      <div className="lab-windows__details">
        <section className="section-block" id="cmd">
          <h3>Server Runbook (CMD)</h3>
          <p className="muted">
            Commands for checking the server baseline, DHCP, DNS, and domain join.
          </p>

          <div className="cmd-terminal-card">
            <div className="cmd-terminalbar">
              <span className="cmd-title">Administrator: Command Prompt</span>
            </div>
            <pre className="cmd-pre">{cmdText}</pre>
          </div>
        </section>

        <section className="section-block">
          <h3>SRV1 Baseline</h3>
          <dl className="kv">
            {project6.srv1.map((x) => (
              <div className="kv__item" key={x.k}>
                <dt className="kv__label">{x.k}</dt>
                <dd className="kv__value">{x.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="section-block">
          <h3>Scope Strategy</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Site</th>
                <th>VLAN</th>
                <th>Subnet</th>
                <th>Router</th>
                <th>DNS</th>
              </tr>
            </thead>
            <tbody>
              {project6.scopes.map((s) => (
                <tr key={`${s.site}-${s.vlan}`}>
                  <td>{s.site}</td>
                  <td>{s.vlan}</td>
                  <td>{s.subnet}</td>
                  <td>{s.router}</td>
                  <td>{s.dns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="section-block">
          <h3>Join Workflow</h3>
          <ul className="list">
            {project6.joinWorkflow.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </section>

        <section className="section-block" id="troubleshooting">
          <h3>Troubleshooting Screenshots</h3>
          <p className="muted">
            Captured DHCP, DNS, and domain troubleshooting output.
          </p>

          <CarouselProject
            items={project6.troubleshootingScreenshots}
            onOpen={setLightboxItem}
            isLightboxOpen={Boolean(lightboxItem)}
            ariaLabel="SRV1 DHCP and DNS evidence"
          />
        </section>

      </div>
      <Lightbox item={lightboxItem} onClose={closeLightbox} />
    </section>
  );
}
