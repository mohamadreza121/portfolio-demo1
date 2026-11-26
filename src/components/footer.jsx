import { Link } from "react-router-dom";
import { FiArrowUp, FiArrowUpRight, FiGithub, FiLinkedin, FiMail, FiPhone } from "react-icons/fi";
import { sendContactMessage } from "../services/messaging";
import ContactForm from "./ContactForm";

export default function Footer({ onRequestQuote }) {
  return (
    <footer id="footer" className="portfolio-footer" aria-labelledby="contact-heading">
      <div className="portfolio-width">
        <div className="portfolio-contact">
          <div>
            <h2 id="contact-heading">Get in touch<span>.</span></h2>
            <p>Have a network project, web app or role you’d like to discuss?</p>
            <a className="portfolio-email" href="mailto:mrheidarpoor7@gmail.com"><FiMail aria-hidden="true" /> mrheidarpoor7@gmail.com</a>
            <a className="portfolio-phone" href="tel:+16478023224"><FiPhone aria-hidden="true" /> +1 (647) 802-3224</a>
            <div className="portfolio-contact-links">
              <a className="portfolio-text-link" href="https://www.linkedin.com/in/mohammadreza-heidarpoor/" target="_blank" rel="noreferrer"><FiLinkedin aria-hidden="true" /> LinkedIn</a>
              <a className="portfolio-text-link" href="https://github.com/mohamadreza121" target="_blank" rel="noreferrer"><FiGithub aria-hidden="true" /> GitHub</a>
              <button type="button" className="portfolio-text-link" onClick={() => onRequestQuote?.()}>Request a quote <FiArrowUpRight aria-hidden="true" /></button>
            </div>
          </div>

          <ContactForm
            title="Send an inquiry"
            subtitle=""
            onSubmit={sendContactMessage}
          />
        </div>

        <div className="portfolio-footer-bottom">
          <p>© {new Date().getFullYear()} Mohammadreza Heidarpoor</p>
          <Link className="portfolio-text-link" to="/#home">Back to top <FiArrowUp aria-hidden="true" /></Link>
        </div>
      </div>
    </footer>
  );
}
