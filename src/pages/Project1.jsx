import { useEffect } from "react";
import { Link } from "react-router-dom";
import { project1 } from "../data/projects/project1";
import Project1Console from "../components/Project1Console";
import ProjectPager from "../components/ProjectPager";
import "./ProjectDetail.css";
import "./ProjectCli.css";

export default function Project1() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <main className="project-page project-page--lab">
      <div className="project-container">
        <header className="section-block lab-intro">
          <h1 className="project-title">{project1.title}</h1>
          <p className="project-subtitle">{project1.subtitle}</p>
          <p className="lab-intro__stack">{project1.badges.join(" · ")}</p>
          <nav className="cta-row" aria-label="Case study sections">
            <a className="btn btn-primary cursor-target" href="#console">Open console</a>
            <a className="btn btn-ghost cursor-target" href="#linkmap">Link map</a>
            <a className="btn btn-ghost cursor-target" href="#runbook">Validation</a>
          </nav>
        </header>

        <Project1Console />

        <section id="linkmap" className="section-block lab-links" aria-labelledby="lab-links-heading">
          <h2 id="lab-links-heading">Topology and link map</h2>
          <p>Trace the physical uplinks, ISP peering, and the primary and standby VPN tunnels.</p>
          <details className="lab-topology">
            <summary>View lab topology diagram</summary>
            <img src={project1.media.heroImage} alt="Enterprise network topology showing HQ, the two ISPs, and the branch" loading="lazy" width="1606" height="885" />
          </details>
          <ul className="lab-links__list">
            {project1.connections.map((link) => (
              <li key={`${link.from}-${link.fromIf}`}>
                <div className="lab-links__ports">
                  <span><strong>{link.from}</strong><code>{link.fromIf}</code></span>
                  <span className="lab-links__join" aria-hidden="true">↔</span>
                  <span><strong>{link.to}</strong><code>{link.toIf}</code></span>
                </div>
                <span className="lab-links__type">{link.type}</span>
                <span className="lab-links__description">{link.notes}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section-block lab-summary">
          <h2>What the lab demonstrates</h2>
          <ul className="list">
            {project1.keyOutcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
          </ul>
          <Link className="lab-summary__runbook" to="/projects/6">SRV1 DHCP and DNS validation →</Link>
        </section>

        <ProjectPager
          prev={null}
          next={{ href: "/projects/2", label: "Project 2" }}
        />
      </div>
    </main>
  );
}
