import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Main from "../pages/Main";
import PageTransition from "../components/PageTransition";

const Project1 = lazy(() => import("../pages/Project1"));
const Project2 = lazy(() => import("../pages/Project2"));
const Project3 = lazy(() => import("../pages/Project3"));
const Project4 = lazy(() => import("../pages/Project4"));
const Project5 = lazy(() => import("../pages/Project5"));
const Project6 = lazy(() => import("../pages/Project6"));

export default function Router({
  theme,
  toggleTheme,
  active,
  setActive,
  revealKey,
  onRequestQuote,
  isQuoteOpen,
}) {
  const location = useLocation();

  return (
    <AnimatePresence mode="sync">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Main
                theme={theme}
                toggleTheme={toggleTheme}
                active={active}
                setActive={setActive}
                revealKey={revealKey}
                onRequestQuote={onRequestQuote}
                isQuoteOpen={isQuoteOpen}
              />
            </PageTransition>
          }
        />

        <Route
          path="/projects/1"
          element={
            <PageTransition>
              <Suspense fallback={<div style={{ minHeight: "100vh" }} aria-busy="true" />}>
                <Project1 theme={theme} />
              </Suspense>
            </PageTransition>
          }
        />

        <Route
          path="/projects/2"
          element={
            <PageTransition>
              <Suspense fallback={<div style={{ minHeight: "100vh" }} aria-busy="true" />}>
                <Project2 theme={theme} />
              </Suspense>
            </PageTransition>
          }
        />

        <Route
          path="/projects/3"
          element={
            <PageTransition>
              <Suspense fallback={<div style={{ minHeight: "100vh" }} aria-busy="true" />}>
                <Project3 theme={theme} />
              </Suspense>
            </PageTransition>
          }
        />

        <Route
          path="/projects/4"
          element={
            <PageTransition>
              <Suspense fallback={<div style={{ minHeight: "100vh" }} aria-busy="true" />}>
                <Project4 theme={theme} />
              </Suspense>
            </PageTransition>
          }
        />

        <Route
          path="/projects/5"
          element={
            <PageTransition>
              <Suspense fallback={<div style={{ minHeight: "100vh" }} aria-busy="true" />}>
                <Project5 theme={theme} />
              </Suspense>
            </PageTransition>
          }
        />

        <Route
          path="/projects/6"
          element={
            <PageTransition>
              <Suspense fallback={<div style={{ minHeight: "100vh" }} aria-busy="true" />}>
                <Project6 theme={theme} />
              </Suspense>
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
