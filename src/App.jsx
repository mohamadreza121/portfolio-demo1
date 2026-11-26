import { useCallback, useEffect, useState } from "react";
import Router from "./routes/Router";
import PortfolioHeader from "./components/PortfolioHeader";
import QuoteModal from "./components/QuoteModal";
import { sendQuoteMessage } from "./services/messaging";

import "./index.css";
import "./portfolio.css";

const themeKey = "portfolio-theme";

export default function App() {
  const [theme, setTheme] = useState(() =>
    window.localStorage.getItem(themeKey) === "day" ? "day" : "night"
  );
  const [quoteService, setQuoteService] = useState(null);
  const closeQuote = useCallback(() => setQuoteService(null), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeKey, theme);
  }, [theme]);

  return (
    <div className="app-root">
      <a className="portfolio-skip" href="#main-content">Skip to content</a>
      <PortfolioHeader
        theme={theme}
        onToggleTheme={() => setTheme((current) => current === "night" ? "day" : "night")}
      />
      <div className="portfolio-content" id="main-content" tabIndex={-1}>
        <Router onRequestQuote={(service = "") => setQuoteService(service)} />
      </div>
      <QuoteModal
        open={quoteService !== null}
        service={quoteService ?? ""}
        onClose={closeQuote}
        onSubmit={(data) => sendQuoteMessage(data, quoteService)}
      />
    </div>
  );
}
