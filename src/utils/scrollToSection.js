export function navigateAndScroll(navigate, sectionId) {
  navigate("/", {
    replace: true,
    state: { scrollTo: sectionId },
  });
}

export const portfolioSections = [
  { id: "home", name: "Home" },
  { id: "about", name: "About" },
  { id: "projects", name: "Projects" },
  { id: "certifications", name: "Certs" },
  { id: "services", name: "Services" },
];

const projectReturns = new Map();

export function rememberProjectPosition(key, projectId, trigger) {
  const panel = trigger.closest(".scroll-deck__panel");
  projectReturns.set(key, {
    projectId,
    mobileTop: panel ? null : window.scrollY,
    desktopTop: panel?.scrollTop ?? null,
  });

  if (projectReturns.size > 20) {
    projectReturns.delete(projectReturns.keys().next().value);
  }
}

export function getProjectPosition(key) {
  return projectReturns.get(key);
}

export function restoreProjectPosition(position, panel) {
  const trigger = document.getElementById(`open-project-${position.projectId}`);
  const top = panel ? position.desktopTop : position.mobileTop;
  if (top !== null) {
    (panel || window).scrollTo({ top, behavior: "instant" });
  } else {
    // Re-anchor to the card if the viewport changed layout while it was open.
    trigger?.scrollIntoView({ block: "center", behavior: "instant" });
  }
  trigger?.focus({ preventScroll: true });
}
