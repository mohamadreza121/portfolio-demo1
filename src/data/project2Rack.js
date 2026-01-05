// src/data/project2Rack.js

export const project2Rack = {
  image: "/hq-access-and-services.png",
  title: "HQ Access & Services Rack",
  hotspots: [
    {
      id: "sw1",
      label: "SW1 Access Switch",
      target: "sw1",
      style: { top: "16%", left: "11%", width: "78%", height: "14%" },
    },
    {
      id: "srv1",
      label: "SRV1 Windows Server",
      target: "srv1",
      style: { top: "34%", left: "11%", width: "78%", height: "9%" },
    },
    {
      id: "mgmt",
      label: "Monitoring Laptop",
      target: "mgmt",
      style: { top: "55%", left: "32%", width: "36%", height: "14%" },
    },
  ],
  cards: [
    {
      id: "sw1",
      title: "SW1 — HQ Access Switch",
      description: "Layer 2 access switch providing VLAN segmentation.",
      sections: [
        {
          title: "Interfaces & VLANs",
          items: [
            "e0/0 → HQRouter g1/0 (802.1Q trunk: VLANs 10, 50, 99)",
            "e0/1 → SRV1 eth0 (Access VLAN 50)",
            "e0/2 → VPCS eth0 (Access VLAN 10)",
            "e0/3 → MGMT Laptop (Access VLAN 99)",
          ],
        },
        {
          title: "Management",
          items: [
            "SVI VLAN 99 — 192.168.99.2/24",
            "Gateway — 192.168.99.1",
          ],
        },
      ],
    },
    {
      id: "srv1",
      title: "SRV1 — Windows Server",
      description: "DHCP and DNS services.",
      sections: [
        {
          title: "IP Configuration",
          items: [
            "eth0 — 192.168.50.10/24",
            "Gateway — 192.168.50.1",
            "DNS — self",
          ],
        },
        {
          title: "Services",
          items: [
            "DHCP VLAN 10 — 192.168.10.0/24",
            "DHCP VLAN 99 — 192.168.99.0/24",
          ],
        },
      ],
    },
    {
      id: "mgmt",
      title: "Management & Monitoring",
      description: "Administrative validation and monitoring point.",
      sections: [
        {
          title: "Functions",
          items: [
            "SSH access to all devices",
            "DHCP & routing verification",
            "Monitoring dashboards",
          ],
        },
      ],
      carousel: [
        {
          id: "mgmt-ssh",
          type: "image",
          title: "SSH Access",
          mediaSrc: "/screenshots/mgmt-ssh.png",
        },
        {
          id: "mgmt-dhcp",
          type: "image",
          title: "DHCP Validation",
          mediaSrc: "/screenshots/mgmt-dhcp.png",
        },
      ],
    },
  ],
};
