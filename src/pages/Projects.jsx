import { Link } from "react-router-dom";
import { FiArrowRight, FiArrowUpRight, FiGithub } from "react-icons/fi";

const labs = [
  {
    id: 2,
    title: "Campus Switching & Gateway Redundancy",
    summary: "VLAN trunks and redundant campus gateways.",
    tags: "802.1Q · VLANs · OSPF · VRRP",
  },
  {
    id: 3,
    title: "Predictable Routing & Observable Failover",
    summary: "Test route selection and failover with dual WAN paths.",
    tags: "BGP · NAT · IPsec · OSPF",
  },
  {
    id: 4,
    title: "Edge Enforcement & Management Hardening",
    summary: "Validate WAN policies and restrict device management access.",
    tags: "BGP · SSHv2 · Failover",
  },
  {
    id: 5,
    title: "Multihoming Simulation",
    summary: "Run repeatable connectivity tests across provider links.",
    tags: "OSPF · NAT · IPsec",
  },
  {
    id: 6,
    title: "Windows Infrastructure Runbook",
    summary: "Deploy and validate AD DS, DNS and DHCP across a lab network.",
    tags: "Windows Server · AD DS · DNS · DHCP",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="portfolio-section portfolio-work" aria-labelledby="work-heading">
      <div className="portfolio-width">
        <header className="portfolio-section-header">
          <h2 id="work-heading">Selected work<span>.</span></h2>
          <a className="portfolio-text-link" href="https://github.com/mohamadreza121" target="_blank" rel="noreferrer">
            <FiGithub aria-hidden="true" /> See GitHub <FiArrowUpRight aria-hidden="true" />
          </a>
        </header>

        <div className="portfolio-project-grid">
          <article className="portfolio-project-card">
            <Link to="/projects/1" className="portfolio-project-cover" tabIndex={-1} aria-hidden="true">
              <img src="/portfolio/enterprise-lab.webp" alt="" width="1060" height="707" loading="lazy" />
            </Link>
            <div className="portfolio-project-copy">
              <p className="portfolio-eyebrow">Network infrastructure</p>
              <h3>Enterprise Multi-Site Network Lab</h3>
              <p>An HQ and branch network with segmented VLANs, redundant internet links, a site-to-site VPN and Windows Server services.</p>
              <p className="portfolio-project-tags">OSPF · BGP · FortiGate · IPsec</p>
              <Link className="portfolio-text-link" to="/projects/1">Read the case study <FiArrowRight aria-hidden="true" /></Link>
            </div>
          </article>

          <article className="portfolio-project-card">
            <a href="https://java1620-study-desktop.testing5070.chatgpt.site" target="_blank" rel="noreferrer" className="portfolio-project-cover portfolio-project-cover-java" tabIndex={-1} aria-hidden="true">
              <img src="/portfolio/java-study.webp" alt="" width="1050" height="656" loading="lazy" />
            </a>
            <div className="portfolio-project-copy">
              <p className="portfolio-eyebrow">Web application</p>
              <h3>Java Study Desktop</h3>
              <p>A desktop-style study app with interactive Java lessons, editable coding labs and timed practice exams.</p>
              <p className="portfolio-project-tags">Java learning · Interactive labs · Exam practice</p>
              <div className="portfolio-project-actions">
                <a className="portfolio-text-link" href="https://java1620-study-desktop.testing5070.chatgpt.site" target="_blank" rel="noreferrer">Open the app <FiArrowUpRight aria-hidden="true" /></a>
                <a className="portfolio-text-link portfolio-source-link" href="https://github.com/mohamadreza121/Intro-to-java-1620" target="_blank" rel="noreferrer">Source <FiArrowUpRight aria-hidden="true" /></a>
              </div>
            </div>
          </article>
        </div>

        <h3 className="portfolio-list-heading">More networking labs</h3>
        <ul className="portfolio-lab-list">
          {labs.map((lab) => (
            <li key={lab.id}>
              <Link to={`/projects/${lab.id}`}>
                <span>
                  <span className="portfolio-lab-title">{lab.title}</span>
                  <span className="portfolio-lab-summary">{lab.summary}</span>
                </span>
                <span className="portfolio-project-tags">{lab.tags}</span>
                <FiArrowRight aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
