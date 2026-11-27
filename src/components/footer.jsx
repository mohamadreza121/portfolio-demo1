import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLinkedin, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { navigateAndScroll, portfolioSections } from "../utils/scrollToSection";
import { sendContactMessage } from "../services/messaging";
import ContactForm from "./ContactForm";
import "./CpuPackage.css";
import "./footer.css";

function Chip({ kind, children }) {
  return (
    <div className={`cpu-package footer-chip footer-chip--${kind}`}>
      <div className="cpu-package__substrate">
        <div className="cpu-package__lid">{children}</div>
      </div>
    </div>
  );
}

export default function Footer({ onRequestQuote }) {
  const navigate = useNavigate();

  return (
    <footer id="footer" className="footer">
      <div className="footer-board">
        <div className="footer-board__traces" aria-hidden="true">
          <i /><i /><i />
        </div>

        <Chip kind="contact">
          <h2>Get in touch</h2>
          <address className="footer-contacts">
            <span><FaMapMarkerAlt aria-hidden="true" />Toronto, Canada</span>
            <a href="tel:+16478023224" className="cursor-target">
              <FaPhone aria-hidden="true" />+1 (647) 802-3224
            </a>
            <a href="mailto:mrheidarpoor7@gmail.com" className="cursor-target">
              <FaEnvelope aria-hidden="true" />mrheidarpoor7@gmail.com
            </a>
            <a href="https://www.linkedin.com/in/mohammadreza-heidarpoor/" target="_blank" rel="noreferrer" className="cursor-target">
              <FaLinkedin aria-hidden="true" />LinkedIn
            </a>
          </address>
          <button type="button" className="footer-quote cursor-target" onClick={() => onRequestQuote?.()}>
            Request a Quote
          </button>
        </Chip>

        <Chip kind="links">
          <h2>Quick links</h2>
          <nav className="footer-links" aria-label="Footer navigation">
            {portfolioSections.map(({ id, name }) => (
              <button key={id} type="button" className="cursor-target" onClick={() => navigateAndScroll(navigate, id)}>
                {id === "certifications" ? "Certifications" : name}
              </button>
            ))}
          </nav>
        </Chip>

        <Chip kind="form">
          <ContactForm
            title="Start a project"
            subtitle="Tell me about your idea and I’ll get back to you."
            onSubmit={sendContactMessage}
          />
        </Chip>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} Mohammadreza Heidarpoor</div>
    </footer>
  );
}
