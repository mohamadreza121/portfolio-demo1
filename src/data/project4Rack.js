// src/data/project4Rack.js

export const project4Rack = {
  image: "/hq-core-and-edge.png",
  title: "HQ Core & Edge",
  hotspots: [
    {
      id: "hqrouter",
      label: "HQ Router",
      target: "hqrouter",
      style: { top: "16%", left: "10%", width: "82%", height: "7%" },
    },
    {
      id: "r1",
      label: "R1 WAN Router",
      target: "r1",
      style: { top: "27.5%", left: "10%", width: "82%", height: "6.5%" },
    },
    {
      id: "r3",
      label: "R3 Edge Router",
      target: "r3",
      style: { top: "36.5%", left: "10%", width: "82%", height: "7%" },
    },
    {
      id: "r4",
      label: "R4 Backup Edge Router",
      target: "r4",
      style: { top: "45.9%", left: "10%", width: "82%", height: "7%" },
    },
  ],
  cards: [
    {
      id: "hqrouter",
      title: "HQRouter — Internal Gateway",
      description: "Primary routing gateway between HQ LANs and the WAN.",
      sections: [
        {
          title: "Interfaces",
          items: [
            "g1/0 → SW1 e0/0 (802.1Q trunk VLANs 10, 50, 99)",
            "g2/0 → R1 g1/0",
          ],
        },
      ],
      carousel: [
        {
          id: "hq-ospf",
          type: "image",
          title: "OSPF Config",
          mediaSrc: "/screenshots/hqrouter-ospf.png",
        },
      ],
    },
    {
      id: "r1",
      title: "R1 — WAN Aggregation Router",
      description: "WAN aggregation point between HQ and edge routers.",
      sections: [
        {
          title: "Links",
          items: [
            "g1/0 → HQRouter g2/0",
            "g2/0 → R2 g1/0 (Branch transit)",
            "g3/0 → R3 g1/0 (Primary edge)",
            "g4/0 → R4 g1/0 (Backup edge)",
          ],
        },
      ],
      carousel: [
        {
          id: "r1-routing",
          type: "image",
          title: "WAN Routing",
          mediaSrc: "/screenshots/r1-routing.png",
        },
      ],
    },
    {
      id: "r3",
      title: "R3 — Primary Edge Router",
      description: "Primary edge path forwarding traffic to the firewall.",
      sections: [
        {
          title: "Edge Connectivity",
          items: ["g1/0 → R1 g3/0", "g2/0 → FortiGate port1"],
        },
      ],
      carousel: [
        {
          id: "r3-edge",
          type: "image",
          title: "Primary Path",
          mediaSrc: "/screenshots/r3-edge.png",
        },
      ],
    },
    {
      id: "r4",
      title: "R4 — Backup Edge Router",
      description: "Secondary edge router providing failover redundancy.",
      sections: [
        {
          title: "Backup Connectivity",
          items: ["g1/0 → R1 g4/0", "g2/0 → FortiGate port4"],
        },
      ],
      carousel: [
        {
          id: "r4-backup",
          type: "image",
          title: "Backup Path",
          mediaSrc: "/screenshots/r4-backup.png",
        },
      ],
    },
  ],
};
