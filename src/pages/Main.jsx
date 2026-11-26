import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Home from "./Home";
import Projects from "./Projects";
import About from "./About";
import Certifications from "./Certifications";
import Services from "./Services";
import Footer from "../components/footer";

export default function Main({ onRequestQuote }) {
  const { hash, key, state } = useLocation();

  useEffect(() => {
    const sectionId = hash.slice(1) || state?.scrollTo;
    if (sectionId) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "instant" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [hash, key, state]);

  return (
    <>
      <main className="portfolio-main">
        <Home />
        <Projects />
        <About />
        <Certifications />
        <Services onRequestQuote={onRequestQuote} />
      </main>
      <Footer onRequestQuote={onRequestQuote} />
    </>
  );
}
