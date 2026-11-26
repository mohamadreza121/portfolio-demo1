import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowUpRight, FiMenu, FiMoon, FiSun, FiX } from "react-icons/fi";

const links = [
  ["projects", "Work"],
  ["about", "About"],
  ["certifications", "Credentials"],
  ["services", "Services"],
];

export default function PortfolioHeader({ theme, onToggleTheme }) {
  const { hash, key, pathname } = useLocation();
  const [menuKey, setMenuKey] = useState(null);
  const menuOpen = menuKey === key;

  return (
    <header className="portfolio-header">
      <div className="portfolio-width portfolio-header-inner">
        <Link to="/#home" className="portfolio-brand" onClick={() => setMenuKey(null)} aria-label="Mohammadreza Heidarpoor home">
          <span aria-hidden="true">RH<span>.</span></span>
        </Link>

        <nav id="portfolio-navigation" className="portfolio-nav" data-open={menuOpen} aria-label="Primary navigation">
          {links.map(([id, label]) => (
            <Link
              key={id}
              to={`/#${id}`}
              aria-current={pathname === "/" && hash === `#${id}` ? "location" : undefined}
              data-active={id === "projects" && pathname.startsWith("/projects/") ? "true" : undefined}
              onClick={() => setMenuKey(null)}
            >
              {label}
            </Link>
          ))}
          <Link to="/#footer" className="portfolio-mobile-contact" onClick={() => setMenuKey(null)}>Contact</Link>
        </nav>

        <div className="portfolio-header-actions">
          <button type="button" className="portfolio-icon-button" onClick={onToggleTheme} aria-label={theme === "night" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "night" ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
          </button>
          <Link className="portfolio-button portfolio-button-outline portfolio-header-contact" to="/#footer">
            Get in touch <FiArrowUpRight aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="portfolio-icon-button portfolio-menu-toggle"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="portfolio-navigation"
            onClick={() => setMenuKey(menuOpen ? null : key)}
          >
            {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
