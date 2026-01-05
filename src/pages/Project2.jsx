import RackProjectPage from "../components/RackProjectPage";
import { project2Rack } from "../data/project2Rack";

export default function Project2() {
  return (
    <RackProjectPage
      projectId={2}
      headerTitle="Project 2 — HQ Access & Services"
      headerSubtitle="Rack view of HQ access switching, Windows Server services, and the management/monitoring endpoint."
      rack={project2Rack}
      prevPath="/projects/1"
      nextPath="/projects/3"
    />
  );
}
