import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { project1 } from "../data/projects/project1";
import { consolePrompt, verificationSteps } from "../data/projects/project1Console";
import NetworkLabStage from "../components/NetworkLabStage";
import ProjectLabChapters from "../components/ProjectLabChapters";
import "./ProjectDetail.css";
import "./ProjectCli.css";
import "./NetworkLab.css";

const storyAnchors = ["switching", "routing", "wan", "branch", "windows"];

export default function Project1({ ready = true, theme }) {
  const { hash, key } = useLocation();
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (!ready) return;
    const frame = requestAnimationFrame(() => {
      const id = hash.slice(1);
      const section = document.getElementById(storyAnchors.includes(id) ? "story" : id);
      const smooth = hasScrolled.current && !window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches;
      hasScrolled.current = true;
      if (section?.closest(".project-page--lab")) {
        section.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "instant" });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, key, ready]);

  return (
    <main className="project-page project-page--lab">
      <div className="project-container">
        <NetworkLabStage theme={theme} ready={ready} />
        <ProjectLabChapters hash={hash} />

        <section className="lab-archive" aria-labelledby="lab-archive-title">
          <div>
            <p className="lab-kicker">Verification</p>
            <h2 id="lab-archive-title">Check the design against the output.</h2>
          </div>
          <div className="lab-archive__accordions">
            <details id="runbook" open={hash === "#runbook" || undefined}>
              <summary>Validation runbook</summary>
              <ul>
                {verificationSteps.map(({ host, command, label, finding }) => (
                  <li key={host + command}><b>{label}</b><code>{consolePrompt(host)} {command}</code><span>{finding}</span></li>
                ))}
              </ul>
            </details>
            <details id="linkmap" open={hash === "#linkmap" || undefined}>
              <summary>Physical and logical links <span>{project1.connections.length}</span></summary>
              <ul>
                {project1.connections.map(({ from, fromIf, to, toIf, type, notes }) => (
                  <li key={from + fromIf}><b>{from} <code>{fromIf}</code> <span aria-hidden="true">↔</span> {to} <code>{toIf}</code></b><span>{type} · {notes}</span></li>
                ))}
              </ul>
            </details>
            <details>
              <summary>Lab outcomes</summary>
              <ul>{project1.keyOutcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
            </details>
          </div>
        </section>
      </div>
    </main>
  );
}
