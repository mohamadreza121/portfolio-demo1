import { useEffect, useMemo } from "react";
import CliTerminalCard from "../components/CliTerminalCard";
import { project1 } from "../data/projects/project1";
import ProjectPager from "../components/ProjectPager";
import "./ProjectDetail.css";
import "./ProjectCli.css";

function pad(value, width) {
  const s = String(value ?? "");
  return s.length >= width ? s.slice(0, width - 1) + "…" : s.padEnd(width, " ");
}

function formatKV(rows = []) {
  const header = pad("KEY", 22) + "VALUE";
  const body = rows.map((r) => pad(r.k, 22) + (r.v || "")).join("\n");
  return `${header}\n${"-".repeat(78)}\n${body}`;
}

function formatConnections(rows = []) {
  const header =
    pad("FROM", 16) +
    pad("IF", 10) +
    pad("TO", 16) +
    pad("IF", 10) +
    pad("TYPE", 10) +
    "NOTES";

  const body = rows
    .map(
      (r) =>
        pad(r.from, 16) +
        pad(r.fromIf, 10) +
        pad(r.to, 16) +
        pad(r.toIf, 10) +
        pad(r.type, 10) +
        (r.notes || "")
    )
    .join("\n");

  return `${header}\n${"-".repeat(92)}\n${body}`;
}

function formatChecklist(rows = []) {
  const header = pad("CHECK", 24) + pad("COMMAND", 30) + "EXPECTED";
  const body = rows
    .map((r) => pad(r.check, 24) + pad(r.command, 30) + (r.expected || ""))
    .join("\n");
  return `${header}\n${"-".repeat(92)}\n${body}`;
}

export default function Project1() {
  useEffect(() => window.scrollTo({ top: 0, behavior: "auto" }), []);

  const kvText = useMemo(() => formatKV(project1.topologyAtAGlance || []), []);
  const connText = useMemo(
    () => formatConnections(project1.connections || []),
    []
  );
  const checklistText = useMemo(
    () => formatChecklist(project1.validationChecklist || []),
    []
  );

  const outcomesText = useMemo(() => {
    const header = "OUTCOMES";
    const body = (project1.keyOutcomes || [])
      .map((x, i) => `${String(i + 1).padStart(2, "0")}. ${x}`)
      .join("\n");
    return `${header}\n${"-".repeat(78)}\n${body}`;
  }, []);

  return (
    <main className="project-page">
      <div className="project-container">
        <section className="section-block">
          <div className="hero-grid">
            <div className="hero-copy">
              <h1 className="project-title">{project1.title}</h1>
              <p className="muted">{project1.subtitle}</p>

              <div className="pill-row">
                {(project1.badges || []).map((b) => (
                  <span className="pill" key={b}>
                    {b}
                  </span>
                ))}
              </div>

              <div className="cta-row">
                <a className="btn btn-primary cursor-target" href="#linkmap">
                  Link Map
                </a>
                <a className="btn btn-ghost cursor-target" href="#runbook">
                  Validation
                </a>
              </div>
            </div>

            <div className="hero-media">
              <img
                src={project1.media?.heroImage}
                alt="Full network topology"
                className="hero-img"
              />
            </div>
          </div>
        </section>

        <section className="section-block">
          <h2>Topology at a Glance (CLI)</h2>
          <CliTerminalCard
            title="Design Summary"
            subtitle="High-level inventory and roles"
            content={kvText}
          />
        </section>

        <section id="linkmap" className="section-block">
          <h2>Physical / Logical Link Map (CLI)</h2>
          <CliTerminalCard
            title="Connections"
            subtitle="Documentation-ready interconnect list"
            content={connText}
          />
        </section>

        <section className="section-block">
          <h2>Key Outcomes (CLI)</h2>
          <CliTerminalCard
            title="Outcomes"
            subtitle="What the lab proves in a portfolio review"
            content={outcomesText}
          />
        </section>

        <section id="runbook" className="section-block">
          <h2>Representative Validation Checklist (CLI)</h2>
          <CliTerminalCard
            title="Runbook"
            subtitle="Commands + expected outcomes"
            content={checklistText}
          />
        </section>

        <ProjectPager
          prev={null}
          next={{ href: "/projects/2", label: "Project 2" }}
        />
      </div>
    </main>
  );
}
