// src/data/project3Rack.js

export const project3Rack = {
  image: "/hq-core-and-edge.png",
  title: "HQ Core & Edge",
  hotspots: [
    {
      id: "firewall",
      label: "FortiGate Firewall",
      target: "firewall",
      style: { top: "66%", left: "12%", width: "78%", height: "12%" },
    },
  ],
  cards: [
    {
      id: "firewall",
      title: "FortiGate — Perimeter Firewall",
      description:
        "Primary security enforcement point providing zone-based firewalling, NAT, VPN termination, and traffic inspection.",
      sections: [
        {
          title: "Interfaces",
          items: [
            "port1 → R3 g2/0 (Primary inside path)",
            "port4 → R4 g2/0 (Backup inside path)",
            "port2 → ISP1 (Primary WAN)",
            "port3 → ISP2 (Backup WAN)",
          ],
        },
        {
          title: "Security Functions",
          items: [
            "Zone-based firewall policies",
            "Stateful inspection & session tracking",
            "Source & destination NAT",
            "Full traffic logging",
          ],
        },
        {
          title: "VPN",
          items: [
            "Site-to-site IPsec tunnels",
            "SSL VPN for remote access",
            "Routing over encrypted overlays",
          ],
        },
      ],
    },
  ],
};
