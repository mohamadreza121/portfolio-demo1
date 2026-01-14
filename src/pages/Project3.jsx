import { useEffect } from "react";
import RackDeck from "../components/RackDeck";
import { project3Rack } from "../data/project3Rack";
import ProjectPager from "../components/ProjectPager";
import "./ProjectDetail.css";
import "./ProjectCli.css";

export default function Project3() {
  useEffect(() => window.scrollTo({ top: 0, behavior: "auto" }), []);

  return (
    <main className="project-page project-page--rack">
      <div className="project-container">
        <section className="section-block">
          <h1 className="project-title">
            Predictable Routing and Observable Failover
          </h1>
          <p className="project-subtitle">
            Clean adjacencies, clear default propagation, and a measurable
            failover story (primary/backup VTI + cost bias).
          </p>
          <div className="badges">
            {[
              "OSPF area 0",
              "p2p network type",
              "passive-interface default",
              "cost-based failover",
            ].map((b) => (
              <span className="badge" key={b}>
                {b}
              </span>
            ))}
          </div>
        </section>

        <section className="section-block">
          <RackDeck data={project3Rack} />
        </section>

        <ProjectPager
          prev={{ href: "/projects/2", label: "Project 2" }}
          next={{ href: "/projects/4", label: "Project 4" }}
        />
      </div>
    </main>
  );
}
