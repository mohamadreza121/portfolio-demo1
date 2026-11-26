import { Suspense, lazy } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Main from "../pages/Main";

const projects = [
  lazy(() => import("../pages/Project1.jsx")),
  lazy(() => import("../pages/Project2.jsx")),
  lazy(() => import("../pages/Project3.jsx")),
  lazy(() => import("../pages/Project4.jsx")),
  lazy(() => import("../pages/Project5.jsx")),
  lazy(() => import("../pages/Project6.jsx")),
];

export default function Router({ onRequestQuote }) {
  return (
    <Routes>
      <Route path="/" element={<Main onRequestQuote={onRequestQuote} />} />
      {projects.map((Project, index) => (
        <Route
          key={index}
          path={`/projects/${index + 1}`}
          element={
            <Suspense fallback={<p className="portfolio-width portfolio-route-message" role="status">Loading case study…</p>}>
              <Project />
            </Suspense>
          }
        />
      ))}
      <Route
        path="*"
        element={
          <main className="portfolio-width portfolio-route-message">
            <h1>Page not found</h1>
            <Link className="portfolio-text-link" to="/#projects">Browse the portfolio</Link>
          </main>
        }
      />
    </Routes>
  );
}
