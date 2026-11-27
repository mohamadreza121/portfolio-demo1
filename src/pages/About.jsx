import { useEffect, useRef, useState } from "react";
import { FaDownload, FaEnvelope, FaClipboardList, FaShareNodes, FaTableCells } from "react-icons/fa6";
import DecryptedText from "../components/DecryptedText";
import profile from "../data/professionalProfile.json";
import "./AboutModern.css";

const repair = {
  title: "Damaged volleyball net",
  ticket: "DEMO-042",
  asset: "NET-014",
  location: "Court 2",
};

const beats = [
  {
    label: "Report",
    tool: "Microsoft Forms",
    icon: FaClipboardList,
    status: "Reported",
    title: "Give the crew an easy way to report it.",
    copy: "I built a Microsoft Forms intake for repairs. Staff can enter the location and asset ID, describe the issue, and attach photos before they leave the court.",
    fields: [["Location", repair.location], ["Asset ID", repair.asset], ["Attachment", "net-damage.jpg"]],
    detail: "Power Automate creates the SharePoint ticket.",
  },
  {
    label: "Assign",
    tool: "SharePoint · Power Automate",
    icon: FaShareNodes,
    status: "Assigned",
    title: "Give the repair an owner.",
    copy: "SharePoint holds the repair record. When the office assigns a ticket, Power Automate emails the selected staff member or contractor with the location, notes, and photos.",
    fields: [["Work route", "Internal staff"], ["Assigned to", "Facilities crew"], ["Notification", "Assignment email sent"]],
    detail: "The assignee receives a link to the ticket.",
  },
  {
    label: "Log",
    tool: "Excel · Power Automate",
    icon: FaTableCells,
    status: "Logged",
    title: "Make the record easy to find again.",
    copy: "Power Automate logs the repair in Excel using the ticket ID, so staff can find and update the right row. I also set up an Access database for the office and built a separate inventory workflow around asset IDs.",
    fields: [["Ticket ID", repair.ticket], ["Asset ID", repair.asset], ["Location", repair.location]],
    detail: "The log retains the link back to SharePoint.",
  },
];

const career = [{
  role: profile.role,
  employer: profile.employer + " · " + profile.department,
  period: profile.period,
  summary: "Support events and AV setups and build repair and inventory workflows for the facilities team.",
}, ...profile.otherExperience];

function RepairArtifact({ beat, mode }) {
  const Icon = beat.icon;
  return (
    <article className={`about-artifact about-artifact--${mode}`} aria-label={`${beat.label} example`}>
      <div className="about-artifact__top">
        <span><Icon aria-hidden="true" />{beat.tool}</span>
        <span>Demo data</span>
      </div>
      <div className="about-artifact__body">
        <div className="about-artifact__meta"><span>{repair.ticket}</span><span>{beat.status}</span></div>
        <h4>{repair.title}</h4>
        {beat.label === "Log" ? (
          <table className="about-artifact__log" aria-label="Sample Excel log row">
            <thead><tr>{beat.fields.map(([label]) => <th key={label} scope="col">{label}</th>)}</tr></thead>
            <tbody><tr>{beat.fields.map(([label, value]) => <td key={label}>{value}</td>)}</tr></tbody>
          </table>
        ) : (
          <dl>
            {beat.fields.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        )}
        <p>{beat.detail}</p>
      </div>
    </article>
  );
}

function RepairStory({ storyRef }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const section = storyRef.current;
    const root = section.closest(".scroll-deck__panel");
    const scroller = root || window;
    const steps = [...section.querySelectorAll(".about-repair__beat")];
    const sticky = window.matchMedia("(min-width: 881px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;

    function update() {
      frame = 0;
      if (!sticky.matches || root?.getAttribute("aria-hidden") === "true") return;
      const cursor = (root?.getBoundingClientRect().top ?? 0) + (root?.clientHeight || window.innerHeight) * .53;
      let next = 0;
      for (const step of steps) {
        if (step.getBoundingClientRect().top > cursor) break;
        next = Number(step.dataset.index);
      }
      setCurrent(next);
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    scroller.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("deck:active", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("deck:active", schedule);
    };
  }, [storyRef]);

  return (
    <section ref={storyRef} className="about-repair" aria-labelledby="about-repair-title">
      <header className="about-repair__heading">
        <p className="about-kicker">York University · Athletics &amp; Recreation</p>
        <h2 id="about-repair-title" tabIndex={-1}>Follow one repair.</h2>
        <p>I built this workflow so the crew could report a problem at the venue and the office could see who was handling it. The demo uses a sample ticket.</p>
      </header>
      <div className="about-repair__sequence">
        <ol className="about-repair__steps">
          {beats.map((beat, index) => (
            <li className="about-repair__beat" data-index={index} data-current={index === current} key={beat.label}>
              <div className="about-repair__copy">
                <p className="about-kicker">{beat.label}</p>
                <h3>{beat.title}</h3>
                <p>{beat.copy}</p>
              </div>
              <RepairArtifact beat={beat} mode="inline" />
            </li>
          ))}
        </ol>
        <div className="about-repair__stage" aria-hidden="true">
          <ol className="about-repair__rail">
            {beats.map((beat, index) => <li data-current={index === current} key={beat.label}>{beat.label}</li>)}
          </ol>
          <div className="about-repair__stack">
            {beats.map((beat, index) => (
              <div className="about-repair__frame" data-position={Math.sign(index - current)} key={beat.label}>
                <RepairArtifact beat={beat} mode="sticky" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  const storyRef = useRef(null);
  return (
    <section id="about" className="about-page" aria-labelledby="about-heading">
      <span className="spy-marker" />
      <div className="about-story-container">
        <header className="about-intro">
          <div className="about-intro__copy">
            <p className="about-kicker">About me</p>
            <h1 id="about-heading" aria-label="About me — From the venue floor to the back office.">
              <span className="about-title-line"><DecryptedText text="From the" animateOn="view" sequential speed={34} revealDirection="start" /></span>{" "}
              <span className="about-title-line"><DecryptedText text="venue floor" animateOn="view" sequential speed={34} revealDirection="start" revealDelay={100} /></span>{" "}
              <span className="about-title-line about-title-line--accent"><DecryptedText text="to the back office." animateOn="view" sequential speed={34} revealDirection="start" revealDelay={200} /></span>
            </h1>
            <p className="about-intro__bio">I'm Mohammadreza Heidarpoor. I study information technology at York, support live events with Athletics &amp; Recreation, and build tools that help the crew keep track of repairs and equipment.</p>
            <button type="button" className="about-action cursor-target" onClick={() => {
              const simple = window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse), (max-width: 880px)").matches;
              storyRef.current?.querySelector("h2")?.focus({ preventScroll: true });
              storyRef.current?.scrollIntoView({ behavior: simple ? "instant" : "smooth" });
            }}>Follow one repair</button>
          </div>
          <figure className="about-portrait">
            <div className="about-portrait__image">
              <img src="/my-avatar.jpg" alt={profile.name} width="1200" height="1600" decoding="async" />
            </div>
            <figcaption><span>{profile.name}</span><span>{profile.location}</span></figcaption>
          </figure>
        </header>

        <RepairStory storyRef={storyRef} />

        <section className="about-workbench" aria-labelledby="about-workbench-title">
          <header>
            <p className="about-kicker">The workbench</p>
            <h2 id="about-workbench-title">Before the doors open.</h2>
            <p>I make Ethernet and XLR microphone cables and help with AV checks and equipment setup for live events.</p>
          </header>
          <figure>
            <img src="/about-workbench.webp" alt="Close-up of an RJ45 Ethernet plug and a three-pin XLR microphone connector on a dark workbench" width="1440" height="960" loading="lazy" decoding="async" />
            <figcaption><span>RJ45 · Ethernet</span><span>XLR · Microphone audio</span></figcaption>
          </figure>
        </section>

        <section className="about-career" aria-labelledby="about-career-title">
          <header>
            <p className="about-kicker">Career timeline</p>
            <h2 id="about-career-title">Where I’ve worked.</h2>
          </header>
          <ol className="about-career__list">
            {career.map(({ role, employer, period, summary }) => (
              <li key={role}>
                <p className="about-career__period">{period}</p>
                <div><h3>{role}</h3><p className="about-career__employer">{employer}</p></div>
                <p>{summary}</p>
              </li>
            ))}
          </ol>
          <div className="about-career__closing">
            <p>{profile.degree}<small>{profile.employer} · {profile.graduation}</small></p>
            <p>{profile.credential}</p>
            <div className="about-actions">
              <a className="about-action cursor-target" href="/Mohammadreza-Heidarpoor-Resume.pdf" download><FaDownload aria-hidden="true" /> Download résumé</a>
              <a className="about-action cursor-target" href={"mailto:" + profile.email}><FaEnvelope aria-hidden="true" /> Get in touch</a>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
