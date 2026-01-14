import { useEffect } from "react";
import RackDeck from "../components/RackDeck";
import { project2Rack } from "../data/project2Rack";
import ProjectPager from "../components/ProjectPager";
import "./ProjectDetail.css";
import "./ProjectCli.css";

export default function Project2() {
  useEffect(() => window.scrollTo({ top: 0, behavior: "auto" }), []);

  return (
    <main className="project-page project-page--rack">
      <div className="project-container">
        <section className="section-block">
          <h1 className="project-title">
            Campus Switching + Gateway Experience
          </h1>
          <p className="project-subtitle">
            Projects 2–5 are rack-driven: click an element to load CLI outputs
            that prove the feature. No duplicated narrative blocks—evidence is
            centralized inside the rack cards.
          </p>
          <div className="badges">
            {["Rapid-PVST", "PortFast/BPDU Guard", "802.1Q trunks", "VRRP"].map(
              (b) => (
                <span className="badge" key={b}>
                  {b}
                </span>
              )
            )}
          </div>
        </section>

        <section className="section-block">
          <RackDeck data={project2Rack} />
        </section>

        <ProjectPager
          prev={{ href: "/projects/1", label: "Project 1" }}
          next={{ href: "/projects/3", label: "Project 3" }}
        />
      </div>
    </main>
  );
}
