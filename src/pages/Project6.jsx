import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DecryptedText from "../components/DecryptedText";
import CarouselProject from "../components/CarouselProject";
import ProjectLightbox from "../components/ProjectLightbox";
import CliTerminalCard from "../components/CliTerminalCard";
import { project6Evidence } from "../data/project6Evidence";
import "./ProjectDetail.css";
import "./ProjectCli.css";

function pad(value, width) {
  const s = String(value ?? "");
  return s.length >= width ? s.slice(0, width - 1) + "…" : s.padEnd(width, " ");
}

function formatChecklist(checklist = []) {
  const lines = checklist.map((section) => {
    const title = section?.title ? section.title.toUpperCase() : "SECTION";
    const items = (section?.items || []).map((i) => `- ${i}`);
    return [`[${title}]`, ...items].join("\n");
  });

  return lines.join("\n\n");
}

function formatEvidenceIndex(items = []) {
  const header = pad("ID", 14) + pad("TYPE", 10) + "TITLE";
  const sep = "-".repeat(72);
  const lines = items.map((i) => {
    return pad(i.id, 14) + pad(i.type, 10) + (i.title || "");
  });
  return [header, sep, ...lines].join("\n");
}

export default function Project6() {
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = lightboxItem ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [lightboxItem]);

  const checklistText = useMemo(
    () => formatChecklist(project6Evidence.checklist),
    []
  );

  const evidenceIndex = useMemo(
    () => formatEvidenceIndex(project6Evidence.carousel || []),
    []
  );

  return (
    <div className="project-page project-cli-page" id="project-6">
      <span className="spy-marker" />

      <div className="project-cli-container">
        <header className="project-cli-hero">
          <h1 className="project-cli-title">
            <span className="decrypt-stable">
              <DecryptedText
                text={project6Evidence.title}
                animateOn="view"
                sequential
                speed={55}
                revealDirection="start"
              />
            </span>
          </h1>

          <p className="project-cli-subtitle">{project6Evidence.subtitle}</p>
        </header>

        <div className="cli-grid">
          <CliTerminalCard
            id="p6-01"
            label="neteng@lab:~/projects$ open p6-01"
            host="NOC"
            cmd="run validation --all --verbose"
          >
            <pre className="cli-pre">{checklistText}</pre>
          </CliTerminalCard>

          <CliTerminalCard
            id="p6-02"
            label="neteng@lab:~/projects$ open p6-02"
            host="EVIDENCE"
            cmd="ls -la ./screenshots"
          >
            <pre className="cli-pre">{evidenceIndex}</pre>
          </CliTerminalCard>

          <CliTerminalCard
            id="p6-03"
            label="neteng@lab:~/projects$ open p6-03"
            host="ANALYST"
            cmd="open evidence-carousel --mode review"
          >
            <div>
              <CarouselProject
                items={project6Evidence.carousel}
                onOpen={setLightboxItem}
              />
            </div>
          </CliTerminalCard>

          <CliTerminalCard
            id="p6-04"
            label="neteng@lab:~/projects$ open p6-04"
            host="OPS"
            cmd="notes --what-this-proves"
          >
            <pre className="cli-pre">{`This page captures operational proof points for the full enterprise topology:\n\n- Control-plane stability (OSPF/BGP)\n- Service reachability (DHCP/DNS)\n- Perimeter enforcement (policy + NAT)\n- Artifacts to support troubleshooting and audit narratives\n\nUse the carousel to open evidence screenshots at full size.`}</pre>
          </CliTerminalCard>
        </div>

        <div className="cli-actions" aria-label="Project navigation">
          <Link to="/projects/5" className="nav-btn cursor-target">
            ← Previous Project
          </Link>
          <Link to="/" className="nav-btn cursor-target">
            Back to Home
          </Link>
        </div>

        {lightboxItem && (
          <ProjectLightbox
            item={lightboxItem}
            onClose={() => setLightboxItem(null)}
          />
        )}
      </div>
    </div>
  );
}
