import RackProjectPage from "../components/RackProjectPage";
import { project5Rack } from "../data/project5Rack";

export default function Project5() {
  return (
    <RackProjectPage
      projectId={5}
      headerTitle="Project 5 — Providers / Internet Simulation"
      headerSubtitle="Dual provider simulation: ISP1/ISP2 routers with upstream NAT nodes to validate NAT, policy, and failover behavior."
      rack={project5Rack}
      prevPath="/projects/4"
      nextPath="/projects/6"
    />
  );
}
