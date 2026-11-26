import { useEffect, useMemo, useRef, useState } from "react";
import { FaAngleRight, FaCheck, FaNetworkWired, FaTerminal } from "react-icons/fa";
import {
  commandsFor,
  consoleGroups,
  defaultConsole,
  verificationSteps,
} from "../data/projects/project1Console";
import { completeLabCommand, labCommandHelp, runLabCommand } from "../utils/labConsole";
import "./Project1Console.css";

const consoleDevices = Object.fromEntries(consoleGroups.flatMap((group) => group.nodes));
const showCommand = (name, command) => `${name}#${command}`;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Project1Console() {
  const [host, setHost] = useState(defaultConsole);
  const [sessions, setSessions] = useState({});
  const [draft, setDraft] = useState("");
  const [historyIndex, setHistoryIndex] = useState(null);
  const [showAllCommands, setShowAllCommands] = useState(false);
  const [reveal, setReveal] = useState(null);
  const [status, setStatus] = useState("");
  const [verified, setVerified] = useState(new Set());
  const input = useRef(null);
  const screen = useRef(null);
  const frame = useRef(0);
  const nextId = useRef(0);
  const draftBeforeHistory = useRef("");
  const heading = useRef(null);

  const current = sessions[host] ?? [];
  const commands = useMemo(() => commandsFor(host), [host]);
  const history = current.filter((entry) => entry.history).map((entry) => entry.command);
  const prompt = `${host}#`;
  const running = reveal?.host === host;
  const isTouch = () => window.matchMedia("(pointer: coarse)").matches;

  function updateView() {
    const viewport = screen.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }

  useEffect(() => {
    updateView();
  }, [host, current.length, reveal]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function stopReveal(message = "") {
    cancelAnimationFrame(frame.current);
    setReveal(null);
    if (message) setStatus(message);
  }

  function interruptReveal() {
    if (!reveal) {
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
    const id = ++nextId.current;
    setSessions((state) => ({
      ...state,
      [hostName]: [...(state[hostName] ?? []), { id, command, output, history }].slice(-40),
    }));
    return id;
  }

  function selectDevice(device) {
    if (device === host) return;
    stopReveal();
    setStatus("");
    setDraft("");
    setHistoryIndex(null);
    setShowAllCommands(false);
    setHost(device);
  }

  function details(command) {
    const help = labCommandHelp(command, commands);
    append(host, command + "?", help || "% Unrecognized command");
    setStatus("Command help displayed.");
  }

  function run(command, device = host) {
    const text = command.trim();
    if (!text) return;
    stopReveal();
    setDraft("");
    setHistoryIndex(null);
    const available = device === host ? commands : commandsFor(device);
    const result = runLabCommand(text, available, `${device}#`);
    const output = result.text ?? "";
    const id = append(device, text, output, true);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (result.name) {
      const step = verificationSteps.find((step) => step.host === device && step.command === result.name);
      if (step) setVerified((done) => new Set(done).add(step.command + step.host));
    }

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
    run(command);
    if (!isTouch()) input.current?.focus({ preventScroll: true });
  }

  function runStep(step) {
    selectDevice(step.host);
    run(step.command, step.host);
    heading.current?.scrollIntoView({ block: "start", behavior: reducedMotion() ? "instant" : "smooth" });
    heading.current?.focus({ preventScroll: true });
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
      const completed = completeLabCommand(draft, commands);
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
    <>
      <section id="console" className="section-block lab-console" aria-labelledby="lab-console-heading">
        <header className="lab-console__heading">
          <div>
            <h2 id="lab-console-heading" tabIndex={-1} ref={heading}>Network lab console</h2>
            <p>Select a device and run a <code>show</code> command to explore the topology.</p>
          </div>
          <span className="lab-console__tag">Simulated Cisco IOS</span>
        </header>

        <div className="lab-console__workbench">
          <aside className="lab-console__devices" aria-label="Lab devices">
            <div className="lab-console__devices-title"><FaNetworkWired aria-hidden="true" /> Devices</div>
            {consoleGroups.map((group) => (
              <div className="lab-console__group" key={group.name}>
                <h3>{group.name}</h3>
                <ul>
                  {group.nodes.map(([name, role]) => (
                    <li key={name}>
                      <button type="button" aria-pressed={host === name} onClick={() => selectDevice(name)}>
                        <span className="lab-console__device-name">{name}</span>
                        <span className="lab-console__role">{role}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          <div className="lab-console__session">
            <div className="cli-terminal-card lab-terminal">
              <header className="lab-terminal__bar">
                <div className="lab-terminal__port">
                  <FaTerminal aria-hidden="true" />
                  <div>
                    <h3>{host}</h3>
                    <p>{consoleDevices[host]}</p>
                  </div>
                </div>
                <span className="lab-terminal__connection"><i aria-hidden="true" /> Console connected</span>
              </header>

              <div className="lab-terminal__viewport" ref={screen} tabIndex={0} role="region" aria-label={`${host} transcript`}>
                {current.length === 0 && (
                  <p className="lab-terminal__welcome">Press Enter to run a command. Type <kbd>?</kbd> for available options.</p>
                )}
                {current.map((entry) => {
                  const streaming = running && reveal.id === entry.id;
                  return (
                    <div className="lab-terminal__entry" key={entry.id} data-receiving={streaming || undefined}>
                      <pre className="lab-terminal__echo"><span>{prompt}</span>{entry.command}</pre>
                      {entry.output && (
                        <pre className="lab-terminal__output" aria-hidden={streaming || undefined}>
                          {streaming ? entry.output.slice(0, reveal.count) : entry.output}
                          {streaming && <span className="lab-terminal__cursor" aria-hidden="true" />}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>

              <form className="lab-terminal__prompt" onSubmit={(event) => {
                event.preventDefault();
                run(draft);
              }}>
                <label htmlFor="lab-cli-input">{prompt}</label>
                <input
                  ref={input}
                  id="lab-cli-input"
                  aria-label={`Command on ${host}`}
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setHistoryIndex(null);
                  }}
                  onKeyDown={onInputKey}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="go"
                  maxLength={128}
                  placeholder="Type a command"
                />
                <button type="submit" disabled={!draft.trim()}>Run</button>
              </form>
            </div>

            <div className="lab-console__tools">
              <div className="lab-console__keyboard">
                <button type="button" onClick={() => details(draft)}><kbd>?</kbd> Help</button>
                <span><kbd>Tab</kbd> Complete</span>
                <span><kbd>↑</kbd> <kbd>↓</kbd> History</span>
              </div>
              <div className="lab-console__actions">
                {running && <button type="button" onClick={() => stopReveal("Output complete.")}>Show full output</button>}
                <button type="button" onClick={clearSession} disabled={!current.length}>Clear</button>
              </div>
            </div>
            {current.some((entry) => entry.output) && (
              <p className="lab-console__swipe-hint">Swipe the transcript sideways to see all columns.</p>
            )}
            <span className="lab-console__sr" role="status">{status}</span>

            <div className="lab-console__commands">
              <div className="lab-console__commands-header">
                <h3>Try a command</h3>
                {commands.length > 4 && (
                  <button
                    type="button"
                    aria-expanded={showAllCommands}
                    aria-controls="lab-command-options"
                    onClick={() => setShowAllCommands((open) => !open)}
                  >
                    {showAllCommands ? "Show fewer" : `All ${commands.length} commands`}
                  </button>
                )}
              </div>
              <div id="lab-command-options" className="lab-console__suggestions">
                {(showAllCommands ? commands : commands.slice(0, 4)).map((command) => (
                  <button type="button" key={command.name} title={command.description} onClick={() => runSuggestion(command.name)}>
                    <FaAngleRight aria-hidden="true" /> <code>{command.name}</code>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="lab-console__note">The console uses a read-only lab snapshot. Pipe filters match literal text, for example <code>show ip route | include 10.255.101.2</code>.</p>
      </section>

      <section id="runbook" className="section-block lab-verification" aria-labelledby="lab-verification-heading">
        <h2 id="lab-verification-heading">Verify the network</h2>
        <p>Follow the checks in order, or jump straight to the part of the topology you want to inspect.</p>
        <ol>
          {verificationSteps.map((step, index) => (
            <li key={step.host + step.command}>
              <div className="lab-verification__number" aria-hidden="true">
                {verified.has(step.command + step.host) ? <FaCheck /> : String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <h3>{step.label}</h3>
                <p>{step.finding}</p>
                {verified.has(step.command + step.host) && <span className="lab-console__sr">Command run</span>}
              </div>
              <button type="button" onClick={() => runStep(step)} aria-label={`Run ${step.command} on ${step.host}`}>
                <code>{showCommand(step.host, step.command)}</code><FaAngleRight aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
