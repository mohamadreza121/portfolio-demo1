import DecryptedText from "../components/DecryptedText";
import { FaDownload, FaEnvelope } from "react-icons/fa6";
import profile from "../data/professionalProfile.json";
import "./AboutModern.css";

const cables = new Intl.ListFormat("en-CA").format(profile.cabling);

const chapters = [
  {
    label: "Facilities operations",
    title: "Start with what the crew needs.",
    copy: "Working in Athletics & Recreation has taught me to look at systems from the crew’s side. During an event, that means setting up spaces and helping with AV checks. Back in the office, it means making sure people can report a problem and see who’s handling it.",
  },
  {
    label: "Service desk",
    title: "Give each repair a clear path.",
    copy: "I built a Microsoft 365 ticketing workflow for equipment repairs. Staff can report an issue and attach photos in Microsoft Forms. SharePoint tracks each ticket, while Power Automate logs it in Excel and sends assignment notifications.",
    tools: "Microsoft Forms · SharePoint · Power Automate · Excel",
  },
  {
    label: "Inventory and databases",
    title: "Make equipment records easier to keep current.",
    copy: "I set up a Microsoft Access database for the office and built an inventory workflow that uses asset IDs to match staff submissions to equipment records. The team can review updates in SharePoint, and Power Automate keeps the Excel log in sync.",
    tools: "Microsoft Access · SharePoint · Excel",
  },
];

export default function About() {
  return (
    <section id="about" className="about-page" aria-labelledby="about-heading">
      <span className="spy-marker" />
      <div className="about-story-container">
        <header className="about-intro">
          <div className="about-intro__copy">
            <h1 id="about-heading">
              <span className="about-kicker">About me</span>
              <span className="about-name"><DecryptedText text="Mohammadreza" animateOn="view" sequential speed={45} revealDirection="center" /></span>{" "}
              <span className="about-name about-name--surname"><DecryptedText text="Heidarpoor" animateOn="view" sequential speed={45} revealDirection="center" revealDelay={120} /></span>
            </h1>
            <p className="about-intro__headline">IT, from the venue floor to the back office.</p>
            <p>I study information technology at York and work on the Athletics &amp; Recreation facilities team. I support events and build tools that help the office track repairs and equipment.</p>
            <div className="about-actions">
              <a className="about-action about-action--primary cursor-target" href="/Mohammadreza-Heidarpoor-Resume.pdf" download>
                <FaDownload aria-hidden="true" /> Download résumé
              </a>
              <a className="about-action cursor-target" href={"mailto:" + profile.email}>
                <FaEnvelope aria-hidden="true" /> Get in touch
              </a>
            </div>
          </div>
          <figure className="about-portrait">
            <div className="about-portrait__image">
              <img src="/my-avatar.jpg" alt={profile.name} width="1200" height="1600" decoding="async" />
            </div>
            <figcaption><span>{profile.employer}</span><span>{profile.location}</span></figcaption>
          </figure>
        </header>

        <section className="about-experience" aria-labelledby="about-work">
          <header className="about-experience__intro">
            <p className="about-kicker">Experience</p>
            <h2 id="about-work">How the work came together.</h2>
            <p className="about-experience__role">{profile.role}</p>
            <p>{profile.employer} · {profile.department}</p>
            <p className="about-experience__date">{profile.period}</p>
          </header>
          <ol className="about-chapters">
            {chapters.map(({ label, title, copy, tools }) => (
              <li key={label}>
                <div>
                  <p className="about-kicker">{label}</p>
                  <h3>{title}</h3>
                </div>
                <div className="about-chapter-copy">
                  <p>{copy}</p>
                  {tools && <p className="about-chapter-tools">{tools}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="about-career" aria-labelledby="about-career">
          <header>
            <p className="about-kicker">Career history</p>
            <h2 id="about-career">Support, networking, and teaching.</h2>
          </header>
          <ul>
            {profile.otherExperience.map(({ role, employer, period, summary }) => (
              <li key={employer}>
                <p className="about-career__period">{period}</p>
                <div>
                  <h3>{role}</h3>
                  <p className="about-career__employer">{employer}</p>
                </div>
                <p>{summary}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="about-foundations" aria-labelledby="about-foundations">
          <div>
            <p className="about-kicker">Technical foundation</p>
            <h2 id="about-foundations">From patch cables to routing tables.</h2>
            <p>I work with routing, switching, and VPNs, and I make {cables} cables. I also help with AV checks and equipment setup for events.</p>
          </div>
          <dl>
            <div>
              <dt>Education</dt>
              <dd>{profile.degree}<small>{profile.employer} · {profile.graduation}</small></dd>
            </div>
            <div>
              <dt>Credential</dt>
              <dd>{profile.credential}</dd>
            </div>
          </dl>
        </section>
      </div>
    </section>
  );
}
