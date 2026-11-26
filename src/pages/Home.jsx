import { Link } from "react-router-dom";
import { FiArrowDown, FiArrowUpRight, FiMapPin } from "react-icons/fi";

export default function Home() {
  return (
    <section id="home" className="portfolio-width portfolio-hero" aria-labelledby="home-heading">
      <div className="portfolio-hero-copy">
        <p className="portfolio-eyebrow portfolio-name">Mohammadreza Heidarpoor</p>
        <h1 id="home-heading">Networks &amp;<br /><span>web apps.</span></h1>
        <p className="portfolio-intro">
          I’m a network engineer and web developer. I build enterprise networking labs and browser-based tools for learning technical skills.
        </p>
        <div className="portfolio-hero-actions">
          <Link to="/#projects" className="portfolio-button portfolio-button-primary">Explore my work <FiArrowDown aria-hidden="true" /></Link>
          <Link to="/#about" className="portfolio-text-link">About me <FiArrowUpRight aria-hidden="true" /></Link>
        </div>
        <p className="portfolio-location"><FiMapPin aria-hidden="true" /> Toronto, Canada</p>
      </div>

      <div className="portfolio-hero-visual">
        <img src="/portfolio/network-hero.webp" alt="" width="1050" height="1312" fetchPriority="high" />
      </div>
    </section>
  );
}
