import RackProjectPage from "../components/RackProjectPage";
import { project4Rack } from "../data/project4Rack";

export default function Project4() {
  return (
    <RackProjectPage
      projectId={4}
      headerTitle="Project 4 — HQ Core & Edge Routing"
      headerSubtitle="HQRouter and WAN/edge path assembly with primary and backup routing towards the FortiGate perimeter."
      rack={project4Rack}
      prevPath="/projects/3"
      nextPath="/projects/5"
    />
  );
}
