import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaExpand } from "react-icons/fa6";
import DecryptedText from "../components/DecryptedText";
import NetworkRack from "../components/NetworkRack";
import { project1 } from "../data/projects/project1";
import { loadProjectLab } from "../routes/loadProjectLab";
import { rememberProjectPosition } from "../utils/scrollToSection";
import "./Projects.css";

const projectPath = "/projects/1";
const rackFocus = [
  { host: "SW1", label: "HQ access · Segmentation & resilient gateways" },
  { host: "HQ-EDGE", label: "WAN edge · Routing & encrypted tunnels" },
  { host: "R2", label: "Branch · Reachability & service verification" },
];

function warmProject() {
  loadProjectLab().catch(() => {});
}

export default function Projects() {
  const { key } = useLocation();
  const navigate = useNavigate();
  const story = useRef(null);
  const screen = useRef(null);
  const departing = useRef(false);
  const [chapter, setChapter] = useState(0);
  const [launch, setLaunch] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const element = story.current;
    const panel = element.closest(".scroll-deck__panel");
    const scroller = panel || window;
    const chapters = [...element.querySelectorAll(".project-story__chapter")];
    let frame = 0;

    function update() {
      frame = 0;
      if (panel?.getAttribute("aria-hidden") === "true") return;
      const top = panel?.getBoundingClientRect().top || 0;
      const height = panel?.clientHeight || window.innerHeight;
      const marker = top + height * .54;
      let current = 0;
      chapters.forEach((item, index) => {
        if (item.getBoundingClientRect().top < marker) current = index;
      });
      setChapter(current);
      const bounds = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (top - bounds.top) / Math.max(1, bounds.height - height)));
      element.style.setProperty("--story-progress", progress);
      element.style.setProperty("--story-turn", (-21 + progress * 13) + "deg");
      element.style.setProperty("--story-lift", (-progress * 14) + "px");
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    scroller.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("deck:active", schedule);
    window.addEventListener("deck:state", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("deck:active", schedule);
      window.removeEventListener("deck:state", schedule);
    };
  }, []);

  const finishLaunch = useCallback(() => {
    if (!departing.current) return;
    departing.current = false;
    setLaunch(null);
    navigate(projectPath, { state: { projectsBack: 1, fromRackPreview: true } });
  }, [navigate]);

  useEffect(() => {
    if (!launch) return;
    const timer = window.setTimeout(finishLaunch, 560);
    return () => window.clearTimeout(timer);
  }, [launch, finishLaunch]);

  async function openProject(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (departing.current) { event.preventDefault(); return; }
    rememberProjectPosition(key, 1, event.currentTarget);
    const rack = screen.current?.querySelector(".rack-model");
    const rect = screen.current?.getBoundingClientRect();
    if (!rect?.width || !rect.height || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    event.preventDefault();
    departing.current = true;
    setError("");

    if (document.startViewTransition) {
      try {
        await loadProjectLab();
      } catch {
        departing.current = false;
        setError("The lab couldn’t load. Please try again.");
        return;
      }
      if (!rack?.isConnected) return;
      rack.style.viewTransitionName = "network-rack";
      const transition = document.startViewTransition(async () => {
        rack.style.viewTransitionName = "none";
        document.documentElement.classList.add("rack-morphing");
        flushSync(() => navigate(projectPath, {
          state: { projectsBack: 1, fromRackPreview: true, rackMorph: true },
        }));
        // Let the preloaded route mount before capturing the destination rack.
        await new Promise((resolve) => {
          let attempts = 0;
          function waitForRack() {
            if (document.querySelector('.project-page--lab .rack-model') || ++attempts > 60) resolve();
            else requestAnimationFrame(waitForRack);
          }
          requestAnimationFrame(waitForRack);
        });
        window.scrollTo({ top: 0, behavior: "instant" });
      });
      transition.finished.catch(() => {}).finally(() => {
        rack.style.removeProperty("view-transition-name");
        document.documentElement.classList.remove("rack-morphing");
        departing.current = false;
      });
      return;
    }

    warmProject();
    setLaunch({
      left: rect.left, top: rect.top, width: rect.width, height: rect.height,
      "--launch-x": window.innerWidth * .7 - (rect.left + rect.width / 2) + "px",
      "--launch-y": window.innerHeight * .48 - (rect.top + rect.height / 2) + "px",
      "--launch-rack-pose": getComputedStyle(rack).transform,
    });
  }

  const linkProps = {
    to: projectPath, state: { projectsBack: 1 }, onClick: openProject,
    onPointerEnter: warmProject, onFocus: warmProject,
  };

  return (
    <section id="projects" className="projects-page" aria-labelledby="featured-lab-title">
      <span className="spy-marker" />
      <article className="project-story" ref={story} data-chapter={chapter}>
        <div className="project-story__narrative">
          <header className="project-story__chapter project-story__hero" data-current={chapter === 0}>
            <p className="project-story__eyebrow">GNS3 / Cisco IOS / Windows Server</p>
            <h1 id="featured-lab-title"><DecryptedText text={project1.title} animateOn="view" sequential speed={30} revealDirection="center" /></h1>
            <p className="project-story__summary">I built a connected HQ and branch from the ground up—segmented networks, redundant gateways, two internet providers, and a secure link between sites.</p>
            <Link id="open-project-1" className="project-story__cta" {...linkProps}>Enter the lab <FaExpand aria-hidden="true" /></Link>
            <p className="project-story__scroll"><span aria-hidden="true" /> Scroll through the build</p>
          </header>

          <section className="project-story__chapter" aria-labelledby="project-config-title" data-current={chapter === 1}>
            <p className="project-story__eyebrow">The configuration</p>
            <h2 id="project-config-title">Built at the<br /><em>command line.</em></h2>
            <p>I configured VLANs and VRRP at HQ, OSPF inside the network, and eBGP toward both ISPs. IPsec VTIs connect the branch, with a lower-cost primary path and a standby tunnel.</p>
            <figure className="project-story__terminal">
              <figcaption>HQ-EDGE <span>Running-config excerpt</span></figcaption>
              <pre><code>{"interface Tunnel10\n ip ospf 1 area 0\n ip ospf cost 10\n tunnel mode ipsec ipv4\n tunnel protection ipsec profile IPSEC-VTI-WAN1"}</code></pre>
            </figure>
          </section>

          <section className="project-story__chapter" aria-labelledby="project-verify-title" data-current={chapter === 2}>
            <p className="project-story__eyebrow">The verification</p>
            <h2 id="project-verify-title">Follow the packet.<br /><em>Check the result.</em></h2>
            <p>I traced routes, checked tunnel states, and tested access to central Windows services. AD DS, DNS, and DHCP tie the network together. The lab lets you inspect the devices and their command output.</p>
            <figure className="project-story__terminal">
              <figcaption>HQ-EDGE <span>Lab output excerpt</span></figcaption>
              <pre><code><b>show interface tunnel10</b>{"\nTunnel10 is up, line protocol is up"}</code></pre>
            </figure>
            <Link className="project-story__cta" {...linkProps}>Explore the configuration <FaExpand aria-hidden="true" /></Link>
          </section>
        </div>

        <figure className="project-story__visual">
          <Link {...linkProps} className="project-rack-link" aria-label="Open the interactive network lab" ref={screen}>
            <NetworkRack active={rackFocus[chapter].host} />
          </Link>
          <figcaption className="project-story__rack-caption">
            <span className="project-story__focus" key={chapter}>{rackFocus[chapter].label}</span>
            <span className="project-story__progress" aria-hidden="true"><i /></span>
          </figcaption>
        </figure>
        {error && <p className="project-story__error" role="alert">{error}</p>}
      </article>
      {launch && createPortal(
        <div className="project-launch" aria-hidden="true">
          <div className="project-launch__screen" style={launch} onAnimationEnd={finishLaunch}>
            <NetworkRack active={rackFocus[chapter].host} />
          </div>
        </div>, document.body,
      )}
    </section>
  );
}
