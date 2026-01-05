import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import DecryptedText from "../components/DecryptedText";
import CliTerminalCard from "../components/CliTerminalCard";
import { project1Plan } from "../data/project1Plan";
import "./ProjectDetail.css";
import "./ProjectCli.css";

function pad(value, width) {
  const s = String(value ?? "");
  return s.length >= width ? s.slice(0, width - 1) + "…" : s.padEnd(width, " ");
}

function formatConnections(connections = []) {
  const header =
    pad("FROM", 18) +
    pad("IF", 10) +
    pad("TO", 18) +
    pad("IF", 10) +
    pad("TYPE", 16) +
    "NOTES";
  const sep = "-".repeat(86);

  const lines = connections.map((c) => {
    return (
      pad(c.from, 18) +
      pad(c.fromIf, 10) +
      pad(c.to, 18) +
      pad(c.toIf, 10) +
      pad(c.type, 16) +
      (c.notes || "")
    );
  });

  return [header, sep, ...lines].join("\n");
}

function formatDeviceSummary(devices = []) {
  const header = pad("DEVICE", 28) + pad("ROLE", 52) + "INTERFACES";
  const sep = "-".repeat(92);

  const lines = devices.map((d) => {
    const ifCount = Array.isArray(d.interfaces) ? d.interfaces.length : 0;
    return pad(d.name, 28) + pad(d.role || "", 52) + String(ifCount);
  });

  return [header, sep, ...lines].join("\n");
}

function formatInterfaces(device) {
  const ifs = device?.interfaces || [];
  const roleLine = device?.role ? `! Role: ${device.role}\n` : "";
  const header = pad("INTERFACE", 18) + pad("IP-ADDRESS", 22) + "NOTES";
  const sep = "-".repeat(82);

  const lines = ifs.map((i) => {
    const ip = i.ip && i.ip !== "—" ? i.ip : "unassigned";
    return pad(i.if, 18) + pad(ip, 22) + (i.notes || "");
  });

  return roleLine + [header, sep, ...lines].join("\n");
}

function formatVerification(verification = []) {
  const lines = verification.map((v, idx) => {
    const title = v?.title ? `${idx + 1}. ${v.title}` : `${idx + 1}. Check`;
    const bullets = (v?.checks || []).map((c) => `   - ${c}`);
    return [title, ...bullets].join("\n");
  });

  return lines.join("\n\n");
}

export default function Project1() {
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, []);

  const { summary, connections, devices, verification } = project1Plan;

  const connectionRows = useMemo(() => connections || [], [connections]);
  const deviceRows = useMemo(() => devices || [], [devices]);
  const verificationRows = useMemo(() => verification || [], [verification]);

  return (
    <div className="project-page project-cli-page" id="project-1">
      <span className="spy-marker" />

      <div className="project-cli-container">
        <header className="project-cli-hero">
          <h1 className="project-cli-title">
            <span className="decrypt-stable">
              <DecryptedText
                text={summary.title}
                animateOn="view"
                sequential
                speed={55}
                revealDirection="start"
              />
            </span>
          </h1>

          <p className="project-cli-subtitle">{summary.subtitle}</p>

          <div className="project-cli-badges" aria-label="Highlights">
            {summary.highlights.map((h) => (
              <span key={h} className="badge">
                {h}
              </span>
            ))}
          </div>
        </header>

        <div className="cli-grid">
          <CliTerminalCard
            id="p1-01"
            label="neteng@lab:~/projects$ open p1-01"
            host="R1-CORE"
            cmd="show running-config | section topology"
          >
            <pre className="cli-pre">{`${summary.title}\n\n${summary.subtitle}\n\nHighlights:\n- ${summary.highlights.join(
              "\n- "
            )}`}</pre>
          </CliTerminalCard>

          <CliTerminalCard
            id="p1-02"
            label="neteng@lab:~/projects$ open p1-02"
            host="SW1-HQ"
            cmd="show cdp neighbors detail"
          >
            <pre className="cli-pre">{formatConnections(connectionRows)}</pre>
          </CliTerminalCard>

          <CliTerminalCard
            id="p1-03"
            label="neteng@lab:~/projects$ open p1-03"
            host="NMS"
            cmd="show inventory | include ROLE"
          >
            <pre className="cli-pre">{formatDeviceSummary(deviceRows)}</pre>
          </CliTerminalCard>

          <CliTerminalCard
            id="p1-04"
            label="neteng@lab:~/projects$ open p1-04"
            host="NOC"
            cmd="run validation --enterprise"
          >
            <pre className="cli-pre">{formatVerification(verificationRows)}</pre>
          </CliTerminalCard>
        </div>

        {/* Device interface shells */}
        <div className="cli-grid" style={{ marginTop: 14 }}>
          {deviceRows.map((d, idx) => {
            const id = `p1-${String(idx + 5).padStart(2, "0")}`;
            const label = `neteng@lab:~/projects$ open ${id}`;
            const host = (d.name || "DEVICE")
              .toUpperCase()
              .replace(/\s+/g, "-")
              .replace(/[()]/g, "");
            const cmd = "show ip interface brief";

            return (
              <CliTerminalCard
                key={id}
                id={id}
                label={label}
                host={host}
                cmd={cmd}
              >
                <pre className="cli-pre">{formatInterfaces(d)}</pre>
              </CliTerminalCard>
            );
          })}
        </div>

        <div className="cli-actions" aria-label="Project navigation">
          <Link to="/" className="nav-btn cursor-target">
            Back to Home
          </Link>
          <Link to="/projects/2" className="nav-btn cursor-target">
            Next Project →
          </Link>
        </div>
      </div>
    </div>
  );
}
