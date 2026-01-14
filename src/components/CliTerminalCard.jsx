import { useMemo } from "react";

export default function CliTerminalCard({
  title,
  subtitle,
  content,
  lines,
  children,
  prompt = "#",
}) {
  const text = useMemo(() => {
    if (typeof content === "string") return content;
    if (Array.isArray(lines)) return lines.join("\n");
    if (typeof children === "string") return children;
    return "";
  }, [content, lines, children]);

  return (
    <section className="cli-card">
      <header className="cli-card__header">
        <div className="cli-card__headerLeft">
          <span className="cli-dot red" />
          <span className="cli-dot yellow" />
          <span className="cli-dot green" />
          <div className="cli-card__titles">
            <div className="cli-card__title">{title}</div>
            {subtitle ? (
              <div className="cli-card__subtitle">{subtitle}</div>
            ) : null}
          </div>
        </div>

        <div className="cli-card__headerRight" aria-hidden="true">
          <span className="cli-pill">CLI</span>
        </div>
      </header>

      <div className="cli-card__body">
        <div className="cli-promptRow">
          <span className="cli-prompt">{prompt}</span>
          <span className="cli-caret" />
        </div>

        <pre className="cli-pre">{text}</pre>
      </div>
    </section>
  );
}
