import RackProjectPage from "../components/RackProjectPage";
import { project3Rack } from "../data/project3Rack";

export default function Project3() {
  return (
    <RackProjectPage
      projectId={3}
      headerTitle="Project 3 — Firewall & VPN Security"
      headerSubtitle="Perimeter enforcement view: FortiGate dual-inside paths and dual-ISP WAN connectivity, with policy controls and VPN overlays."
      rack={project3Rack}
      prevPath="/projects/2"
      nextPath="/projects/4"
    />
  );
}
