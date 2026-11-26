import { useNavigate } from "react-router-dom";

import { navigateAndScroll } from "../utils/scrollToSection";

import "./HomeModern.css";
import "../components/TargetCursor.css";

export default function Home() {
  const navigate = useNavigate();

  const openQuote = (service = "") => {
    window.dispatchEvent(
      new CustomEvent("openQuoteModal", { detail: { service } })
    );
  };

  return (
    <div id="home" className="home-page">
      <span className="spy-marker" />

      <div className="home-container">
        <section className="home-hero">
          <div className="hero-right">
            <h1 className="home-title" tabIndex={-1}>Mohammadreza Heidarpoor</h1>
            <h2 className="home-subtitle">Network Engineer &amp; Network Technician</h2>

            {/* Optional minimal “value line” (kept short + serious) */}
            <p className="home-tagline">
              Secure, scalable network design. Clean documentation. Real-world labs.
            </p>

            <div className="home-cta-row">
              <button
                type="button"
                className="btn-pill primary cursor-target"
                onClick={() => navigateAndScroll(navigate, "projects")}
              >
                Projects
              </button>

              <button
                type="button"
                className="btn-pill cursor-target"
                onClick={() => navigateAndScroll(navigate, "services")}
              >
                Services
              </button>

              <button
                type="button"
                className="btn-pill cursor-target"
                onClick={() => openQuote("")}
              >
                Request a Quote
              </button>

              <a
                href="mailto:mrheidarpoor7@gmail.com"
                className="btn-pill cursor-target"
                onClick={(e) => e.stopPropagation()}
              >
                Contact
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
