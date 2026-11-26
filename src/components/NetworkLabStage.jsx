import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { FaNetworkWired, FaServer, FaTerminal } from "react-icons/fa";
import { defaultConsole } from "../data/projects/project1Console";
import NetworkRack from "./NetworkRack";
import Project1Console from "./Project1Console";
import ProjectTopology from "./ProjectTopology";
import "./NetworkLabStage.css";

const narrowScreen = "(max-width: 760px)";

export default function NetworkLabStage({ theme, ready }) {
  const { hash, key, state } = useLocation();
  const [view, setView] = useState("rack");
  const [host, setHost] = useState(defaultConsole);
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState({});
  const [narrow, setNarrow] = useState(() => window.matchMedia(narrowScreen).matches);
  const lastTrigger = useRef(null);
  const heading = useRef(null);
  const stage = useRef(null);
  const hardware = useRef(null);
  const mobilePanel = useRef(null);
  const focusFrame = useRef(0);
  const commandId = useRef(0);

  useEffect(() => {
    const query = window.matchMedia(narrowScreen);
    const resize = (event) => setNarrow(event.matches);
    query.addEventListener("change", resize);
    return () => query.removeEventListener("change", resize);
  }, []);

  useEffect(() => () => cancelAnimationFrame(focusFrame.current), []);

  const openDevice = useCallback((device, trigger) => {
    if (trigger) lastTrigger.current = trigger;
    setHost(device);
    setOpen(true);
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      if (lastTrigger.current?.isConnected) lastTrigger.current.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    if (ready && hash === "#console") openDevice(defaultConsole);
  }, [hash, key, openDevice, ready]);

  useLayoutEffect(() => {
    if (!open || !narrow) return;
    const root = document.querySelector(".app-root");
    const scrollRoot = document.documentElement;
    const previousOverflow = scrollRoot.style.overflow;
    const previousInert = root?.inert;
    scrollRoot.style.overflow = "hidden";
    if (root) root.inert = true;

    const stageElement = stage.current;
    const panelElement = mobilePanel.current;
    const viewport = window.visualViewport;
    function positionScene() {
      const height = window.innerHeight;
      const visible = viewport?.height ?? height;
      const keyboard = Math.max(0, height - visible - (viewport?.offsetTop ?? 0));
      panelElement?.style.setProperty("--lab-viewport-height", visible + "px");
      panelElement?.style.setProperty("--lab-keyboard-offset", keyboard + "px");
      if (panelElement) panelElement.dataset.keyboard = String(keyboard > 80);

      const model = hardware.current?.firstElementChild;
      if (view !== "rack" || !model || !stageElement) return;
      const stageTop = stageElement.getBoundingClientRect().top;
      const top = Math.max(17, stageTop + 54);
      const home = stageTop + hardware.current.offsetTop + model.offsetTop;
      const room = height - Math.min(530, height * .79) - top - 13;
      const scale = Math.max(.2, Math.min(.59, room / model.offsetHeight));
      stageElement.style.setProperty("--lab-rack-lift", (top - home) + "px");
      stageElement.style.setProperty("--lab-rack-scale", String(scale));
    }

    positionScene();
    window.addEventListener("resize", positionScene);
    window.addEventListener("scroll", positionScene, { passive: true });
    viewport?.addEventListener("resize", positionScene);
    viewport?.addEventListener("scroll", positionScene);
    return () => {
      scrollRoot.style.overflow = previousOverflow;
      if (root) root.inert = previousInert;
      window.removeEventListener("resize", positionScene);
      window.removeEventListener("scroll", positionScene);
      viewport?.removeEventListener("resize", positionScene);
      viewport?.removeEventListener("scroll", positionScene);
    };
  }, [open, narrow, view]);

  function changeView(next) {
    if (next === view) return;
    setView(next);
    setOpen(false);
  }

  const consolePanel = <Project1Console open={open} host={host} onSelect={setHost} onClose={close} heading={heading} modal={narrow} sessions={sessions} setSessions={setSessions} commandId={commandId} />;

  return (
    <section id="topology" className="lab-stage" ref={stage} data-view={view} data-open={open}
      aria-label="Enterprise network lab"
      onKeyDown={(event) => { if (open && event.key === "Escape") { event.preventDefault(); close(); } }}>
      <span id="console" className="lab-stage__anchor" aria-hidden="true" />
      <div className="lab-stage__ambient" aria-hidden="true" />
      <header className="lab-stage__intro" inert={open || view === "topology" || undefined}>
        <p className="lab-kicker">Enterprise network lab</p>
        <h1 id="lab-hero-title">Two sites.<br />One network.</h1>
        <p>Open a device and follow the path from HQ, across two providers, to the branch.</p>
        <div className="lab-stage__actions">
          <button type="button" onClick={(event) => openDevice(defaultConsole, event.currentTarget)}>
            <FaTerminal aria-hidden="true" /> Open HQ edge
          </button>
          <Link to="#story" replace state={state}>Read the case study</Link>
        </div>
      </header>

      <div className="lab-stage__views" role="group" aria-label="Equipment view">
        <button type="button" aria-pressed={view === "rack"} onClick={() => changeView("rack")}><FaServer aria-hidden="true" /> Rack</button>
        <button type="button" aria-pressed={view === "topology"} onClick={() => changeView("topology")}><FaNetworkWired aria-hidden="true" /> Topology</button>
      </div>

      <div className="lab-stage__hardware" ref={hardware}>
        {view === "rack"
          ? <NetworkRack active={open ? host : null} onOpen={openDevice} obscured={open && narrow} />
          : <div className="lab-stage__topology" inert={open || undefined}>
              <ProjectTopology active={open ? host : null} onOpen={openDevice} theme={theme} />
              <ul className="lab-stage__legend" aria-label="Topology legend">
                <li><i /> Physical</li><li><i /> IPsec</li><li><i /> Standby</li>
              </ul>
            </div>}
      </div>

      <p className="lab-stage__hint" aria-hidden={open || undefined}>{view === "rack" ? "Select a faceplate to connect" : "Select a device to connect"}</p>
      {narrow ? createPortal(
        <div className="lab-mobile-console" data-open={open} ref={mobilePanel}>
          <div className="lab-mobile-console__backdrop" aria-hidden="true" onClick={close} />
          {consolePanel}
        </div>,
        document.body,
      ) : consolePanel}
    </section>
  );
}
