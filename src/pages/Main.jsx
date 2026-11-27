import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import Projects from "./Projects";
import Certifications from "./Certifications";
import Footer from "../components/footer";
import ScrollDeck from "../components/ScrollDeck";
import NativePortfolioScroll from "../components/NativePortfolioScroll";
import { getProjectPosition, portfolioSections } from "../utils/scrollToSection";

export default function Main({
  setActive,
  revealKey,
  onRequestQuote,
  onEnterLab,
  isQuoteOpen,
  compact = false,
  ready = Boolean(revealKey),
}) {
  const { key, hash, state } = useLocation();
  const request = useMemo(() => {
    const projectPosition = getProjectPosition(key);
    const section = state?.scrollTo || hash.slice(1);
    const target = projectPosition ? "projects" : section === "services" ? "certifications" : section;
    const id = portfolioSections.some((section) => section.id === target) ? target : null;
    return { id, projectPosition };
  }, [key, hash, state]);

  const pages = [
    <Home key="home" />,
    <About key="about" />,
    <Projects key="projects" onEnterLab={onEnterLab} />,
    <div key="certifications">
      <Certifications />
      <Footer onRequestQuote={onRequestQuote} />
    </div>,
  ];

  return (
    <div className="main-page">
      {compact ? (
        <NativePortfolioScroll ready={ready} request={request} setActive={setActive}>
          {pages}
        </NativePortfolioScroll>
      ) : (
        <ScrollDeck
          setActive={setActive}
          isQuoteOpen={isQuoteOpen}
          revealKey={revealKey}
          ready={ready}
          request={request}
        >
          {pages}
        </ScrollDeck>
      )}
    </div>
  );
}
