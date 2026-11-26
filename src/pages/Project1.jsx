import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaAngleRight, FaNetworkWired, FaTerminal } from "react-icons/fa";
import { project1 } from "../data/projects/project1";
import { labNavigation } from "../data/projects/project1Console";
import Project1Console from "../components/Project1Console";
import ProjectPager from "../components/ProjectPager";
import topologyImage from "../assets/projects/p1-topology.png";
import "./ProjectDetail.css";
import "./ProjectCli.css";
import "./NetworkLab.css";

export default function Project1({ ready = true, theme }) {
  const { hash, key, state } = useLocation();
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (!ready) return;
    const frame = requestAnimationFrame(() => {
      const section = document.getElementById(hash.slice(1));
      const useSmooth = hasScrolled.current && !window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches;
      hasScrolled.current = true;
      if (section?.closest(".project-page--lab")) {
        section.scrollIntoView({ block: "start", behavior: useSmooth ? "smooth" : "instant" });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, key, ready]);

  return (
    <main className="project-page project-page--lab">
      <div className="project-container">
        <header className="network-hero">
          <div className="network-hero__copy">
            <p className="network-hero__eyebrow"><FaNetworkWired aria-hidden="true" /> Enterprise infrastructure case study</p>
            <h1 className="project-title">Enterprise Multi-Site <span>Network Lab</span></h1>
            <p className="project-subtitle">Follow a network from headquarters through two simulated ISPs to the branch. Explore the switching, routing, VPN and Windows infrastructure from the devices themselves.</p>
            <div className="cta-row">
              <Link className="btn btn-primary cursor-target" to="#topology" replace state={state}>Explore topology <FaAngleRight aria-hidden="true" /></Link>
              <Link className="btn btn-ghost cursor-target" to="#console" replace state={state}><FaTerminal aria-hidden="true" /> Open CLI</Link>
            </div>
          </div>

          <Link className="network-hero__preview cursor-target" to="#topology" replace state={state} aria-label="Explore the interactive topology">
            <img src={topologyImage} alt="" decoding="async" width="1536" height="1024" />
            <span className="network-hero__preview-label"><i aria-hidden="true" /> HQ · WAN · Branch</span>
          </Link>
        </header>

        <nav className="network-chapters" aria-label="Case study chapters">
          {labNavigation.map(({ id, title }) => <Link className="cursor-target" key={id} to={"#" + id} replace state={state}>{title}</Link>)}
          <Link className="cursor-target" to="#runbook" replace state={state}>Validation</Link>
          <Link className="cursor-target" to="#linkmap" replace state={state}>Link map</Link>
        </nav>

        <Project1Console theme={theme} />

        <section id="linkmap" className="section-block lab-links" aria-labelledby="lab-links-heading">
          <h2 id="lab-links-heading">Physical and logical link map</h2>
          <p>Trace the physical uplinks, ISP peering, and the primary and standby VPN tunnels.</p>
          <ul className="lab-links__list">
            {project1.connections.map((link) => (
              <li key={link.from + "-" + link.fromIf}>
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
        </section>

        <ProjectPager prev={null} next={null} />
      </div>
    </main>
  );
}
