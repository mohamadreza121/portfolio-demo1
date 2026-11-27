import { Suspense, lazy, useCallback, useState } from "react";
import { Navigate, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Main from "../pages/Main";
import PageTransition from "../components/PageTransition";
import RackTransition from "../components/RackTransition";
import { loadProjectLab } from "./loadProjectLab";

const legacyProjectSections = ["switching", "routing", "wan", "branch", "windows"];

const Project1 = lazy(loadProjectLab);

export default function Router({
  compact = false,
  ready,
  setActive,
  revealKey,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [rackFlight, setRackFlight] = useState(null);
  const startRackFlight = useCallback((source) => setRackFlight((current) => current || source), []);
  const finishRackFlight = useCallback(() => setRackFlight(null), []);
  const enterLab = useCallback(() => navigate("/projects/1", {
    state: { projectsBack: 1, fromRackPreview: true },
  }), [navigate]);

  return (
    <>
    <AnimatePresence initial={location.pathname !== "/"} mode={compact ? "wait" : "sync"}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition compact={compact} rackDeparture={Boolean(rackFlight)}>
              <Main
                compact={compact}
                ready={ready}
                setActive={setActive}
                revealKey={revealKey}
                onEnterLab={startRackFlight}
              />
            </PageTransition>
          }
        />

        <Route
          path="/projects/1"
          element={
            <PageTransition compact={compact} rackPreview={location.state?.fromRackPreview}>
              <Suspense
                fallback={
                  <div style={{ minHeight: "100vh" }} aria-busy="true" />
                }
              >
                <Project1 ready={ready} />
              </Suspense>
            </PageTransition>
          }
        />

        {legacyProjectSections.map((section, index) => (
          <Route
            key={section}
            path={"/projects/" + (index + 2)}
            element={
              <Navigate
                replace
                state={location.state}
                to={{
                  pathname: "/projects/1",
                  search: location.search,
                  hash: section === "windows" && ["#cmd", "#troubleshooting"].includes(location.hash)
                    ? location.hash
                    : "#" + section,
                }}
              />
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
    {rackFlight && <RackTransition source={rackFlight} onNavigate={enterLab} onComplete={finishRackFlight} />}
    </>
  );
}
