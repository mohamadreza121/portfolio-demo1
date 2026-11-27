import { useEffect, useState } from "react";
import "./PortfolioIntro.css";

const command = "show portfolio";
const desktopTiming = { lead: 540, interval: 48, hold: 360, exit: 940 };
const compactTiming = { lead: 270, interval: 38, hold: 230, exit: 680 };

export default function PortfolioIntro({ compact, onHandoff, onComplete }) {
  const [timing] = useState(() => compact ? compactTiming : desktopTiming);
  const [typed, setTyped] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const handoffAt = timing.lead + (command.length - 1) * timing.interval + timing.hold;
    let timer = window.setTimeout(tick, timing.lead);

    function tick() {
      const elapsed = performance.now() - start;
      const count = Math.max(0, Math.min(command.length, 1 + Math.floor((elapsed - timing.lead) / timing.interval)));
      setTyped(count);

      if (elapsed >= handoffAt) {
        setExiting(true);
        onHandoff();
        timer = window.setTimeout(onComplete, timing.exit);
        return;
      }

      const next = count === command.length ? handoffAt : timing.lead + count * timing.interval;
      timer = window.setTimeout(tick, Math.max(1, Math.ceil(next - elapsed)));
    }

    function handleKey(event) {
      if (event.key === "Escape") onComplete();
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onComplete, onHandoff, timing]);

  return (
    <div className="portfolio-intro" role="dialog" aria-modal="true" aria-label="Portfolio introduction"
      data-exiting={exiting || undefined} style={{ "--intro-exit": `${timing.exit}ms` }}>
      <div className="portfolio-intro__terminal" aria-hidden="true">
        <div className="portfolio-intro__rail">
          <i /> <span>CONSOLE / LOCAL SESSION</span>
        </div>
        <div className="portfolio-intro__console">
          <div className="portfolio-intro__prompt">
            <span>portfolio&gt;</span><span className="portfolio-intro__command">
              {command.slice(0, typed)}<i className="portfolio-intro__cursor" />
            </span>
          </div>
          <div className="portfolio-intro__result" data-visible={exiting || undefined}>
            <i /> Session ready
          </div>
        </div>
        <div className="portfolio-intro__bus"><i /></div>
      </div>
      <button className="portfolio-intro__skip" type="button" onClick={onComplete}>Skip intro</button>
    </div>
  );
}
