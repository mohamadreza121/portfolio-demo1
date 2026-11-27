import { Link, useLocation, useNavigate } from "react-router-dom";
import { navigateAndScroll } from "../utils/scrollToSection";
import "./ProjectPager.css";

export default function ProjectPager({ prev, next, className = "" }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const back = Number.isSafeInteger(state?.projectsBack) && state.projectsBack > 0
    ? state.projectsBack
    : 0;
  const adjacentState = back ? { projectsBack: back + 1 } : undefined;

  return (
    <nav className={`projpager ${className}`} aria-label="Project navigation">
      <button
        type="button"
        className="projpager__btn projpager__btn--ghost cursor-target"
        onClick={() => {
          if (back) navigate(-back);
          else navigateAndScroll(navigate, "projects");
        }}
      >
        All Projects
      </button>

      <div className="projpager__spacer" />

      {prev ? (
        <Link className="projpager__btn cursor-target" to={prev.href} state={adjacentState}>
          ← {prev.label}
        </Link>
      ) : (
        <span className="projpager__btn projpager__btn--disabled">
          ← Previous
        </span>
      )}

      {next ? (
        <Link className="projpager__btn cursor-target" to={next.href} state={adjacentState}>
          {next.label} →
        </Link>
      ) : (
        <span className="projpager__btn projpager__btn--disabled">Next →</span>
      )}
    </nav>
  );
}
