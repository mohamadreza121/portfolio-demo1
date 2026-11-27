import { useNavigate } from "react-router-dom";
import { FaCertificate, FaEnvelope, FaHome, FaLinkedin, FaMapMarkerAlt, FaPhone, FaProjectDiagram, FaUser } from "react-icons/fa";
import { navigateAndScroll, portfolioSections } from "../utils/scrollToSection";
import profile from "../data/professionalProfile.json";
import { DockIcon } from "./Dock";
import "./footer.css";

const sectionIcons = {
  home: FaHome,
  about: FaUser,
  projects: FaProjectDiagram,
  certifications: FaCertificate,
};

function Chip({ kind, children }) {
  return (
    <div className={`cpu-package footer-chip footer-chip--${kind}`}>
      <div className="cpu-package__substrate">
        <div className="cpu-package__lid">{children}</div>
      </div>
    </div>
  );
}

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer id="footer" className="footer">
      <div className="footer-board">
        <div className="footer-board__traces" aria-hidden="true"><i /><i /><i /></div>

        <Chip kind="contact">
          <h2>Get in touch</h2>
          <a className="footer-email cursor-target" href={"mailto:" + profile.email}>
            <FaEnvelope aria-hidden="true" /> <span>{profile.email}</span>
          </a>
          <address className="footer-contacts">
            <span><FaMapMarkerAlt aria-hidden="true" />Toronto, Canada</span>
            <a href="tel:+16478023224" className="cursor-target">
              <FaPhone aria-hidden="true" />+1 (647) 802-3224
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="cursor-target">
              <FaLinkedin aria-hidden="true" />LinkedIn
            </a>
          </address>
        </Chip>

        <Chip kind="links">
          <h2>Quick links</h2>
          <nav className="footer-links" aria-label="Footer navigation">
            {portfolioSections.map(({ id, name }) => {
              const Icon = sectionIcons[id];
              return (
                <button key={id} type="button" className="cursor-target" onClick={() => navigateAndScroll(navigate, id)}>
                  <DockIcon><Icon /></DockIcon>
                  <span>{id === "certifications" ? "Certifications" : name}</span>
                </button>
              );
            })}
          </nav>
        </Chip>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} {profile.name}</div>
    </footer>
  );
}
