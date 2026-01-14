import { useEffect, useMemo, useState } from "react";
import CarouselProject from "../components/CarouselProject";
import { project6 } from "../data/projects/project6";
import ProjectPager from "../components/ProjectPager";
import "./ProjectDetail.css";
import "./ProjectCli.css";

function Lightbox({ item, onClose }) {
  useEffect(() => {
    if (!item) return;

    const onKeyDown = (e) => e.key === "Escape" && onClose?.();
    const prevOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="lightbox-project"
      role="dialog"
      aria-modal="true"
      aria-label={item.title || "Media viewer"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <button
        type="button"
        className="project-lightbox-close cursor-target"
        onClick={onClose}
        aria-label="Close"
        title="Close"
      >
        ×
      </button>

      <div
        className="lightbox-project-inner"
        onMouseDown={(e) => e.stopPropagation()}
      >
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
    </div>
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

export default function Project6() {
  useEffect(() => window.scrollTo({ top: 0, behavior: "auto" }), []);

  const [lightboxItem, setLightboxItem] = useState(null);
  const isLightboxOpen = Boolean(lightboxItem);

  const cmdText = useMemo(() => buildCmdBlock(), []);

  return (
    <main className="project-page">
      <div className="project-container">
        <section className="section-block">
          <div className="hero-grid">
            <div className="hero-copy">
              <h1 className="project-title">{project6.title}</h1>
              <p className="muted">{project6.subtitle}</p>

              <div className="pill-row">
                {project6.badges.map((b) => (
                  <span className="pill" key={b}>
                    {b}
                  </span>
                ))}
              </div>

              <div className="cta-row">
                <a className="btn btn-primary" href="#cmd">
                  Runbook (CMD)
                </a>
                <a className="btn btn-ghost" href="#troubleshooting">
                  Troubleshooting Screenshots
                </a>
              </div>
            </div>

            <div className="hero-media">
              <img
                src="/project-media/SRV1-info1.png"
                alt="Windows Server SRV1"
                className="hero-img"
              />
            </div>
          </div>
        </section>

        <section className="section-block" id="cmd">
          <h2>Server Runbook (CMD)</h2>
          <p className="muted">
            This is intentionally formatted as a Windows Server terminal
            workflow for repeatable validation.
          </p>

          <div className="cmd-terminal-card">
            <div className="cmd-terminalbar">
              <span className="cmd-title">Administrator: Command Prompt</span>
            </div>
            <pre className="cmd-pre">{cmdText}</pre>
          </div>
        </section>

        <section className="section-block">
          <h2>SRV1 Baseline</h2>
          <dl className="kv">
            {project6.srv1.map((x) => (
              <div className="kv__item" key={x.k}>
                <div className="kv__label">{x.k}</div>
                <p className="kv__value">{x.v}</p>
              </div>
            ))}
          </dl>
        </section>

        <section className="section-block">
          <h2>Scope Strategy</h2>
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
          <h2>Join Workflow</h2>
          <ul className="list">
            {project6.joinWorkflow.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </section>

        <section className="section-block" id="troubleshooting">
          <h2>Troubleshooting Screenshots</h2>
          <p className="muted">
            One carousel only—used as a visual proof pack for SRV1 services.
          </p>

          <CarouselProject
            items={project6.troubleshootingScreenshots}
            onOpen={(item) => setLightboxItem(item)}
            isLightboxOpen={isLightboxOpen}
            ariaLabel="Project 6 troubleshooting screenshots carousel"
          />
        </section>

        <ProjectPager
          prev={{ href: "/projects/5", label: "Project 5" }}
          next={null}
        />
      </div>

      <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
    </main>
  );
}
