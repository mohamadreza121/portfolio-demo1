import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaExpand } from "react-icons/fa6";
import NetworkRack from "../components/NetworkRack";
import { project1 } from "../data/projects/project1";
import { loadProjectLab } from "../routes/loadProjectLab";
import { rememberProjectPosition } from "../utils/scrollToSection";
import "./Projects.css";

const projectPath = "/projects/1";

function RackPreview({ screen }) {
  return (
    <div className="project-viewfinder" ref={screen} aria-hidden="true">
      <div className="project-viewfinder__header"><i /> Rack preview</div>
      <div className="project-viewfinder__rack"><NetworkRack active="HQ-EDGE" /></div>
      <div className="project-viewfinder__signal">
        <span><i /> HQ</span><span><i /> Dual ISP</span><span><i /> Branch</span>
      </div>
    </div>
  );
}

function warmProject() {
  loadProjectLab().catch(() => {});
}

export default function Projects() {
  const { key } = useLocation();
  const navigate = useNavigate();
  const screen = useRef(null);
  const departing = useRef(false);
  const [launch, setLaunch] = useState(null);

  const finishLaunch = useCallback(() => {
    if (!departing.current) return;
    departing.current = false;
    setLaunch(null);
    navigate(projectPath, { state: { projectsBack: 1, fromRackPreview: true } });
  }, [navigate]);

  useEffect(() => {
    if (!launch) return;
    const timer = window.setTimeout(finishLaunch, 650);
    return () => window.clearTimeout(timer);
  }, [launch, finishLaunch]);

  function openProject(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (departing.current) {
      event.preventDefault();
      return;
    }

    rememberProjectPosition(key, 1, event.currentTarget);
    const rect = screen.current?.getBoundingClientRect();
    if (!rect?.width || !rect.height || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    event.preventDefault();
    departing.current = true;
    warmProject();
    const x = window.innerWidth / 2 - (rect.left + rect.width / 2);
    const y = window.innerHeight / 2 - (rect.top + rect.height / 2);
    const scale = Math.max(window.innerWidth / rect.width, window.innerHeight / rect.height) * 1.13;
    const rack = screen.current.querySelector(".rack-model");
    setLaunch({
      left: rect.left, top: rect.top, width: rect.width, height: rect.height,
      "--launch-x": x + "px", "--launch-y": y + "px", "--launch-scale": scale,
      "--launch-rack-pose": getComputedStyle(rack).transform,
    });
  }

  return (
    <section id="projects" className="projects-page" aria-labelledby="projects-heading">
      <span className="spy-marker" />
      <div className="project-showcase">
        <h1 id="projects-heading">Projects</h1>
        <article>
          <Link id="open-project-1" className="project-feature" to={projectPath} state={{ projectsBack: 1 }}
            aria-labelledby="featured-lab-title" aria-describedby="featured-lab-summary"
            onClick={openProject} onPointerEnter={warmProject} onFocus={warmProject}>
            <RackPreview screen={screen} />
            <div className="project-feature__copy">
              <p className="project-feature__type">Interactive network lab</p>
              <h2 id="featured-lab-title">{project1.title}</h2>
              <p id="featured-lab-summary">See how two offices stay connected across two internet providers. Open a device, trace its links, or run a command in the simulated console.</p>
              <ul className="project-feature__highlights" aria-label="What you can explore">
                <li>10 rack devices</li><li>Live topology</li><li>Cisco &amp; Windows CLI</li>
              </ul>
              <span className="project-feature__cta">Enter the lab <FaExpand aria-hidden="true" /></span>
            </div>
          </Link>
        </article>
      </div>
      {launch && createPortal(
        <div className="project-launch" aria-hidden="true">
          <div className="project-launch__screen" style={launch} onAnimationEnd={finishLaunch}><RackPreview /></div>
        </div>,
        document.body,
      )}
    </section>
  );
}
