import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaTerminal, FaTimes } from "react-icons/fa";
import { project1 } from "../data/projects/project1";
import {
  commandsFor,
  consoleGroups,
  consolePrompt,
  runWindowsCommand,
} from "../data/projects/project1Console";
import { completeLabCommand, labCommandHelp, runLabCommand } from "../utils/labConsole";
import "./Project1Console.css";

const consoleDevices = Object.fromEntries(consoleGroups.flatMap((group) => group.nodes));
const tabs = [["terminal", "Terminal"], ["ports", "Interfaces"], ["commands", "Commands"]];

export default function Project1Console({ host, open, onSelect, onClose, heading, modal, sessions, setSessions, commandId }) {
  const [tab, setTab] = useState("terminal");
  const [previousHost, setPreviousHost] = useState(host);
  const [draft, setDraft] = useState("");
  const [historyIndex, setHistoryIndex] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [status, setStatus] = useState("");
  const screen = useRef(null);
  const frame = useRef(0);
  const draftBeforeHistory = useRef("");

  const current = sessions[host] ?? [];
  const commands = useMemo(() => commandsFor(host), [host]);
  const history = current.filter((entry) => entry.history).map((entry) => entry.command);
  const windows = host === "SRV1";
  const prompt = consolePrompt(host);
  const running = reveal?.host === host;
  const links = project1.connections.filter(({ from, to }) => from === host || to === host);

  if (host !== previousHost) {
    setPreviousHost(host);
    setTab("terminal");
    setDraft("");
    setHistoryIndex(null);
    setStatus("");
  }

  function updateView() {
    const viewport = screen.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }

  useEffect(() => {
    updateView();
  }, [host, open, tab, current.length, reveal]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const stopReveal = useCallback((message = "") => {
    cancelAnimationFrame(frame.current);
    setReveal(null);
    if (message) setStatus(message);
  }, []);

  function interruptReveal() {
    if (!running) {
      setDraft("");
      return;
    }
    const partial = reveal.output.slice(0, reveal.count);
    setSessions((state) => ({
      ...state,
      [host]: state[host].map((entry) => entry.id === reveal.id
        ? { ...entry, output: partial ? partial + "\n^C" : "^C" }
        : entry),
    }));
    stopReveal("Output interrupted.");
  }

  function append(hostName, command, output, history = false) {
    const id = ++commandId.current;
    setSessions((state) => ({
      ...state,
      [hostName]: [...(state[hostName] ?? []), { id, command, output, history }].slice(-40),
    }));
    return id;
  }

  function details(command) {
    const help = windows ? runWindowsCommand("help").text : labCommandHelp(command, commands);
    append(host, command + "?", help || "% Unrecognized command");
    setStatus("Command help displayed.");
  }

  function run(command) {
    const device = host;
    const text = command.trim();
    if (!text) return;
    stopReveal();
    setDraft("");
    setHistoryIndex(null);
    const result = device === "SRV1" ? runWindowsCommand(text) : runLabCommand(text, commands, prompt);
    const output = result.text ?? "";
    const id = append(device, text, output, true);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!output || !result.name || motion.matches) {
      setStatus(output ? "Command complete." : "Command complete. No matching output.");
      return;
    }

    setStatus(`Receiving output from ${device}.`);
    setReveal({ host: device, id, output, count: 0 });
    let start;
    let lastDraw = -100;
    const duration = Math.max(300, Math.min(1080, output.length * 1.3));
    function paint(time) {
      start ??= time;
      const elapsed = time - start;
      if (elapsed >= duration || motion.matches) {
        stopReveal("Output complete.");
        return;
      }
      if (elapsed - lastDraw >= 34) {
        lastDraw = elapsed;
        const count = Math.ceil(elapsed / duration * output.length);
        setReveal({ host: device, id, output, count });
      }
      frame.current = requestAnimationFrame(paint);
    }
    frame.current = requestAnimationFrame(paint);
  }

  function runSuggestion(command) {
    setTab("terminal");
    run(command);
  }

  function onTabKey(event, index) {
    const order = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
    if (!(event.key in order)) return;
    event.preventDefault();
    const next = tabs[order[event.key]][0];
    setTab(next);
    document.getElementById("lab-tab-" + next)?.focus({ preventScroll: true });
  }

  function clearSession() {
    stopReveal("Transcript cleared.");
    setSessions((state) => ({ ...state, [host]: [] }));
    setDraft("");
    setHistoryIndex(null);
  }

  function onInputKey(event) {
    if (event.ctrlKey && event.key.toLowerCase() === "c" && (running || !draft)) {
      event.preventDefault();
      interruptReveal();
    } else if (event.key === "?" && !/\|\s*\S+\s+\S/.test(draft)) {
      event.preventDefault();
      details(draft);
    } else if (event.key === "Tab" && !event.shiftKey && draft.trim()) {
      const candidates = windows ? commands.filter(({ name }) => name.toLowerCase().startsWith(draft.toLowerCase())) : [];
      const completed = windows
        ? (candidates.length === 1 ? candidates[0].name : null)
        : completeLabCommand(draft, commands);
      if (completed && completed !== draft) {
        event.preventDefault();
        setDraft(completed);
      }
    } else if ((event.key === "ArrowUp" || event.key === "ArrowDown") && history.length) {
      if (event.key === "ArrowDown" && historyIndex === null) return;
      event.preventDefault();
      if (historyIndex === null) draftBeforeHistory.current = draft;
      const move = event.key === "ArrowUp" ? -1 : 1;
      const index = Math.min(history.length, Math.max(0, (historyIndex ?? history.length) + move));
      setHistoryIndex(index === history.length ? null : index);
      setDraft(index === history.length ? draftBeforeHistory.current : history[index]);
    }
  }

  return (
    <section className="rack-console" data-open={open} aria-hidden={!open} inert={!open || undefined}
      aria-labelledby="lab-console-heading" role={modal ? "dialog" : undefined} aria-modal={modal && open || undefined}
      onKeyDown={(event) => {
        if (!modal || event.key !== "Tab" || event.defaultPrevented) return;
        const controls = [...event.currentTarget.querySelectorAll('button:not(:disabled), select, input, [tabindex="0"]')]
          .filter((element) => element.tabIndex >= 0 && !element.closest("[hidden]"));
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}>
      <header className="rack-console__header">
        <div className="rack-console__icon"><FaTerminal aria-hidden="true" /></div>
        <div className="rack-console__identity">
          <h2 id="lab-console-heading" tabIndex={-1} ref={heading}>{host}</h2>
          <p>{consoleDevices[host]} · {windows ? "Windows CMD" : "Cisco IOS"}</p>
        </div>
        <button type="button" className="rack-console__close" aria-label="Close console" onClick={onClose}><FaTimes aria-hidden="true" /></button>
      </header>

      <div className="rack-console__toolbar">
        <div className="rack-console__tabs" role="tablist" aria-label="Device details">
          {tabs.map(([id, label], index) => (
            <button type="button" role="tab" key={id} id={"lab-tab-" + id} aria-controls={"lab-panel-" + id}
              tabIndex={tab === id ? 0 : -1} aria-selected={tab === id} onClick={() => setTab(id)} onKeyDown={(event) => onTabKey(event, index)}>
              {label}
            </button>
          ))}
        </div>
        <select value={host} onChange={(event) => { setTab("terminal"); onSelect(event.target.value); }} aria-label="Switch device">
          {consoleGroups.map(({ name, nodes }) => (
            <optgroup key={name} label={name}>{nodes.map(([name]) => <option key={name} value={name}>{name}</option>)}</optgroup>
          ))}
        </select>
      </div>

      <div id="lab-panel-terminal" className="rack-console__panel rack-console__panel--terminal" role="tabpanel" aria-labelledby="lab-tab-terminal" hidden={tab !== "terminal"}>
        <div className="rack-terminal__viewport" ref={screen} tabIndex={0} role="region" aria-label={host + " transcript"}>
          {current.length === 0 && (
            <div className="rack-terminal__welcome">
              <p><span aria-hidden="true" /> Simulated session ready</p>
              <button type="button" onClick={() => runSuggestion(commands[0].name)}><FaTerminal aria-hidden="true" /><span>{commands[0].name}</span></button>
            </div>
          )}
          {current.map((entry) => {
            const streaming = running && reveal.id === entry.id;
            return (
              <div className="rack-terminal__entry" key={entry.id}>
                <pre className="rack-terminal__echo"><span>{prompt} </span>{entry.command}</pre>
                {entry.output && (
                  <pre aria-hidden={streaming || undefined}>
                    {streaming ? entry.output.slice(0, reveal.count) : entry.output}
                    {streaming && <i className="rack-terminal__cursor" aria-hidden="true" />}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
        <form className="rack-terminal__form" data-platform={windows ? "windows" : "ios"} onSubmit={(event) => {
          event.preventDefault();
          run(draft);
        }}>
          <label htmlFor="lab-cli-input">{prompt}</label>
          <input id="lab-cli-input" aria-label={"Command on " + host} value={draft}
            onChange={(event) => { setDraft(event.target.value); setHistoryIndex(null); }} onKeyDown={onInputKey}
            autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="go" maxLength={128} placeholder="Type a command" />
          <button type="submit" disabled={!draft.trim()} onPointerDown={(event) => {
            if (event.pointerType === "touch" && document.activeElement === input.current) event.preventDefault();
          }}>Run</button>
        </form>
        <footer className="rack-terminal__status">
          <span>{windows ? "Simulated Windows session" : "Read-only lab snapshot"}</span>
          <div>
            <button type="button" onClick={() => details(draft)}>Help</button>
            {running ? <button type="button" onClick={() => stopReveal("Output complete.")}>Show output</button>
              : <button type="button" onClick={clearSession} disabled={!current.length}>Clear</button>}
          </div>
          <span className="lab-console__sr" role="status">{status}</span>
        </footer>
      </div>

      <div id="lab-panel-ports" className="rack-console__panel rack-console__panel--scroll" role="tabpanel" aria-labelledby="lab-tab-ports" hidden={tab !== "ports"} tabIndex={0}>
        <ul className="rack-console__ports">
          {links.map(({ from, fromIf, to, toIf, type, notes }) => (
            <li key={from + "-" + fromIf}>
              <code>{from === host ? fromIf : toIf}</code>
              <span>{from === host ? to : from} <small>{from === host ? toIf : fromIf}</small></span>
              <b>{type}</b>
              <p>{notes}</p>
            </li>
          ))}
        </ul>
      </div>

      <div id="lab-panel-commands" className="rack-console__panel rack-console__panel--scroll" role="tabpanel" aria-labelledby="lab-tab-commands" hidden={tab !== "commands"} tabIndex={0}>
        <ul className="rack-console__commands">
          {commands.map(({ name, description }) => (
            <li key={name}><button type="button" onClick={() => runSuggestion(name)}><code>{name}</code><span>{description}</span></button></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
