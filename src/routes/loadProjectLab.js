let pendingLab;

export function loadProjectLab() {
  pendingLab ??= import("../pages/Project1.jsx").catch((error) => {
    pendingLab = undefined;
    throw error;
  });
  return pendingLab;
}
