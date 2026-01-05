// src/data/project5Rack.js

export const project5Rack = {
  image: "/providers-internet-simulation.png",
  title: "Providers / Internet Simulation",
  hotspots: [
    {
      id: "r6",
      label: "R6 — ISP1 Router",
      target: "r6",
      style: { top: "16%", left: "8%", width: "84%", height: "10%" },
    },
    {
      id: "r7",
      label: "R7 — ISP2 Router",
      target: "r7",
      style: { top: "29.5%", left: "8%", width: "84%", height: "9.5%" },
    },
    {
      id: "nat",
      label: "Internet NAT Nodes",
      target: "nat",
      style: { top: "42.3%", left: "8%", width: "84%", height: "16%" },
    },
  ],
  cards: [
    {
      id: "r6",
      title: "R6 — ISP1 Router",
      description:
        "Primary ISP router providing upstream connectivity to the enterprise firewall.",
      sections: [
        {
          title: "Connectivity",
          items: [
            "FortiGate port2 → R6 g1/0",
            "R6 g2/0 → NAT1 nat0",
          ],
        },
      ],
      carousel: [
        {
          id: "r6-routing",
          type: "image",
          title: "ISP1 Routing",
          mediaSrc: "/screenshots/r6-routing.png",
        },
      ],
    },
    {
      id: "r7",
      title: "R7 — ISP2 Router",
      description:
        "Secondary ISP router used for redundancy and failover testing.",
      sections: [
        {
          title: "Connectivity",
          items: [
            "FortiGate port3 → R7 g1/0",
            "R7 g2/0 → NAT2 nat0",
          ],
        },
      ],
      carousel: [
        {
          id: "r7-routing",
          type: "image",
          title: "ISP2 Routing",
          mediaSrc: "/screenshots/r7-routing.png",
        },
      ],
    },
    {
      id: "nat",
      title: "Internet NAT Nodes",
      description: "NAT devices simulating upstream Internet access.",
      sections: [
        {
          title: "Function",
          items: [
            "Address translation for outbound traffic",
            "Independent Internet simulation per ISP",
            "Reachability validation for firewall policies",
          ],
        },
      ],
    },
  ],
};
