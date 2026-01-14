import { useEffect } from "react";
import RackDeck from "../components/RackDeck";
import { project5Rack } from "../data/project5Rack";
import ProjectPager from "../components/ProjectPager";
import "./ProjectDetail.css";
import "./ProjectCli.css";

export default function Project5() {
  useEffect(() => window.scrollTo({ top: 0, behavior: "auto" }), []);

  return (
    <main className="project-page project-page--rack">
      <div className="project-container">
        <section className="section-block">
          <h1 className="project-title">
            Multihoming Simulation with Repeatable Tests
          </h1>
          <p className="project-subtitle">
            Two ISPs and an Internet-core simulator enable measurable validation
            for routing preference, default-only posture, NAT proof, and edge
            policy outcomes.
          </p>
          <div className="badges">
            {[
              "EBGP",
              "Default-only policy",
              "Primary/Secondary preference",
              "Simulated public services",
            ].map((b) => (
              <span className="badge" key={b}>
                {b}
              </span>
            ))}
          </div>
        </section>

        <section className="section-block">
          <RackDeck data={project5Rack} />
        </section>

        <ProjectPager
          prev={{ href: "/projects/4", label: "Project 4" }}
          next={{ href: "/projects/6", label: "Project 6" }}
        />
      </div>
    </main>
  );
}
