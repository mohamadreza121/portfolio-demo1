import GalleryCarousel from "../components/GalleryCarousel";
import GalleryViewer from "../components/GalleryViewer";
import { project6 } from "../data/projects/project6";

const screenshots = project6.troubleshootingScreenshots.map((item) => ({ ...item, thumb: item.mediaSrc }));

function renderScreenshotCaption(item) {
  return (
    <>
      <h4>{item.title}</h4>
      <p className="credential-info__description">{item.caption}</p>
    </>
  );
}

function renderScreenshotViewer(item, view, onClose) {
  return (
    <GalleryViewer title={item.title} closeLabel="Close screenshot" view={view} onClose={onClose}>
      <figure className="credential-viewer__screenshot">
        <img src={item.fullSrc || item.mediaSrc} alt={item.title} />
        <figcaption>{item.caption}</figcaption>
      </figure>
    </GalleryViewer>
  );
}

function buildCmdBlock() {
  const header = [
    "Microsoft Windows [Version 10.0.20348.0000]",
    "(c) Microsoft Corporation. All rights reserved.",
    "",
    "C:\\Users\\Administrator>",
  ].join("\n");

  const sections = project6.cmdRunbook
    .map((s) => {
      const lines = (s.lines || [])
        .map((l) => `C:\\Users\\Administrator>${l}`)
        .join("\n");
      return [`:: ${s.title}`, lines, ""].join("\n");
    })
    .join("\n");

  return `${header}\n\n${sections}`.trimEnd();
}

const cmdText = buildCmdBlock();

export default function WindowsLabEvidence() {
  return (
    <section id="windows" className="section-block lab-chapter lab-windows" aria-labelledby="lab-windows-title">
      <header className="lab-windows__heading">
        <div>
          <h2 id="lab-windows-title">{project6.title}</h2>
          <p>{project6.subtitle}</p>
        </div>
      </header>
      <div className="lab-windows__details">
        <section className="section-block" id="cmd">
          <h3>Server Runbook (CMD)</h3>
          <p className="muted">
            Commands for checking the server baseline, DHCP, DNS, and domain join.
          </p>

          <div className="cmd-terminal-card">
            <div className="cmd-terminalbar">
              <span className="cmd-title">Administrator: Command Prompt</span>
            </div>
            <pre className="cmd-pre">{cmdText}</pre>
          </div>
        </section>

        <section className="section-block">
          <h3>SRV1 Baseline</h3>
          <dl className="kv">
            {project6.srv1.map((x) => (
              <div className="kv__item" key={x.k}>
                <dt className="kv__label">{x.k}</dt>
                <dd className="kv__value">{x.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="section-block">
          <h3>Scope Strategy</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Site</th>
                <th>VLAN</th>
                <th>Subnet</th>
                <th>Router</th>
                <th>DNS</th>
              </tr>
            </thead>
            <tbody>
              {project6.scopes.map((s) => (
                <tr key={`${s.site}-${s.vlan}`}>
                  <td>{s.site}</td>
                  <td>{s.vlan}</td>
                  <td>{s.subnet}</td>
                  <td>{s.router}</td>
                  <td>{s.dns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="section-block">
          <h3>Join Workflow</h3>
          <ul className="list">
            {project6.joinWorkflow.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </section>

        <section className="lab-windows__screenshots" id="troubleshooting">
          <h3>Troubleshooting Screenshots</h3>
          <p className="muted">
            Captured DHCP, DNS, and domain troubleshooting output.
          </p>

          <GalleryCarousel items={screenshots} className="credential-carousel--screenshots" label="SRV1 DHCP and DNS evidence"
            itemLabel="screenshot" viewLabel="View screenshot" renderCaption={renderScreenshotCaption}
            renderViewer={renderScreenshotViewer} lockOnSlides />
        </section>

      </div>
    </section>
  );
}
