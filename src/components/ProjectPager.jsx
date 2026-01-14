import { Link, useNavigate } from "react-router-dom";
import { navigateAndScroll } from "../utils/scrollToSection";
import "./ProjectPager.css";

export default function ProjectPager({ prev, next, className = "" }) {
  const navigate = useNavigate();

  return (
    <nav className={`projpager ${className}`} aria-label="Project navigation">
      {/* All Projects — SPA navigate + smooth scroll (no full refresh) */}
      <button
        type="button"
        className="projpager__btn projpager__btn--ghost cursor-target"
        onClick={() => navigateAndScroll(navigate, "projects")}
      >
        All Projects
      </button>

      <div className="projpager__spacer" />

      {prev ? (
        <Link className="projpager__btn cursor-target" to={prev.href}>
          ← {prev.label}
        </Link>
      ) : (
        <span className="projpager__btn projpager__btn--disabled">
          ← Previous
        </span>
      )}

      {next ? (
        <Link className="projpager__btn cursor-target" to={next.href}>
          {next.label} →
        </Link>
      ) : (
        <span className="projpager__btn projpager__btn--disabled">Next →</span>
      )}
    </nav>
  );
}
