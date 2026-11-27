import { useNavigate } from "react-router-dom";
import { navigateAndScroll } from "../utils/scrollToSection";
import "./HomeModern.css";

const name = ["Mohammadreza", "Heidarpoor"];
const glyphs = "71/0=+";

function Signature() {
  function moveLight(event) {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    const element = event.currentTarget;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    element.style.setProperty("--relief-x", x * 6 + "px");
  }

  return (
    <div className="home-signature" onPointerMove={moveLight}
      onPointerLeave={(event) => event.currentTarget.style.removeProperty("--relief-x")}>
      <h1 className="home-wordmark" aria-label={name.join(" ")}>
        {name.map((word) => (
          <span key={word} className="home-word" aria-hidden="true">
            {Array.from(word, (letter, index) => (
              <span key={index} className="home-letter" style={{ "--order": word.length - index }}>
                <span className="home-ink">{letter}</span>
                <span className="home-cipher">{glyphs[index % glyphs.length]}</span>
              </span>
            ))}
          </span>
        ))}
      </h1>
      <div className="home-trace" aria-hidden="true">
        <i className="home-trace__lamp" />
        <i className="home-trace__lead" />
        <i className="home-trace__drop" />
        <i className="home-trace__baseline" />
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div id="home" className="home-page">
      <span className="spy-marker" />
      <section className="home-opening" aria-label="Introduction">
        <p className="home-location">Toronto, Canada</p>
        <Signature />
        <div className="home-details">
          <div className="home-statement">
            <h2>Network engineering &amp; automation</h2>
            <p>I build failover into Cisco networks and automate service desk handoffs.</p>
          </div>
          <div className="home-actions">
            <button type="button" className="home-work cursor-target"
              onClick={() => navigateAndScroll(navigate, "projects")}>Explore my work</button>
            <div className="home-quicklinks">
              <button type="button" onClick={() => navigateAndScroll(navigate, "about")}>About</button>
              <a href="mailto:mrheidarpoor7@gmail.com">Contact</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
