import { Link } from "react-router-dom";
import "./ProjectPager.css";

export default function ProjectPager({ prev, next, className = "" }) {
  return (
    <nav className={`projpager ${className}`} aria-label="Project navigation">
      <Link className="projpager__btn projpager__btn--ghost" to="/#projects">All Projects</Link>
      <div className="projpager__spacer" />

      {prev ? (
        <Link className="projpager__btn" to={prev.href}>← {prev.label}</Link>
      ) : (
        <span className="projpager__btn projpager__btn--disabled">← Previous</span>
      )}

      {next ? (
        <Link className="projpager__btn" to={next.href}>{next.label} →</Link>
      ) : (
        <span className="projpager__btn projpager__btn--disabled">Next →</span>
      )}
    </nav>
  );
}
