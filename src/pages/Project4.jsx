import { useEffect } from "react";
import RackDeck from "../components/RackDeck";
import { project4Rack } from "../data/project4Rack";
import ProjectPager from "../components/ProjectPager";
import "./ProjectDetail.css";
import "./ProjectCli.css";

export default function Project4() {
  useEffect(() => window.scrollTo({ top: 0, behavior: "auto" }), []);

  return (
    <main className="project-page project-page--rack">
      <div className="project-container">
        <section className="section-block">
          <h1 className="project-title">
            Edge Enforcement and Management Hardening
          </h1>
          <p className="project-subtitle">
            Two ISP edge routers peer to an Internet-simulation core (INET-RTR).
            ISPs originate default toward HQ while INET advertises multiple
            public-service loopbacks used for realistic policy/NAT and
            reachability validation.
          </p>
          <div className="badges">
            {[
              "Edge policy ACL",
              "NAT with route-maps",
              "VTY ACL",
              "SSHv2-only posture",
            ].map((b) => (
              <span className="badge" key={b}>
                {b}
              </span>
            ))}
          </div>
        </section>

        <section className="section-block">
          <RackDeck data={project4Rack} />
        </section>

        <ProjectPager
          prev={{ href: "/projects/3", label: "Project 3" }}
          next={{ href: "/projects/5", label: "Project 5" }}
        />
      </div>
    </main>
  );
}
