// src/data/project1Plan.js
// -----------------------------------------------------------------------------
// Project 1 (Option A): Enterprise blueprint style page.
// Source of truth for wiring, addressing, and verification.

export const project1Plan = {
  summary: {
    title: "Project 1 — Master Enterprise Topology",
    subtitle:
      "Router-on-a-stick HQ LAN, WAN hub, branch site, dual edge routers, FortiGate dual-ISP perimeter, and Windows Server services.",
    highlights: [
      "HQ VLANs: Users (10), Servers (50), Management (99)",
      "Dual edge path: R3 (primary) + R4 (backup) into FortiGate",
      "Dual ISPs: ISP1 (R6) + ISP2 (R7) with upstream NAT nodes",
      "Windows Server provides DHCP/DNS for user + management scopes",
    ],
  },

  // ---------------------------------------------------------------------------
  // Wiring / Link matrix (authoritative)
  // ---------------------------------------------------------------------------
  connections: [
    // HQ LAN
    {
      from: "SW1",
      fromIf: "e0/0",
      to: "HQRouter",
      toIf: "g1/0",
      type: "802.1Q trunk",
      notes: "Carries VLANs 10, 50, 99",
    },
    {
      from: "SW1",
      fromIf: "e0/1",
      to: "SRV1",
      toIf: "eth0",
      type: "access",
      notes: "VLAN 50 (Servers)",
    },
    {
      from: "SW1",
      fromIf: "e0/2",
      to: "VPCS",
      toIf: "eth0",
      type: "access",
      notes: "VLAN 10 (Users)",
    },
    {
      from: "SW1",
      fromIf: "e0/3",
      to: "MGMT PC",
      toIf: "eth0",
      type: "access",
      notes: "VLAN 99 (Management)",
    },

    // HQ core / WAN
    {
      from: "HQRouter",
      fromIf: "g2/0",
      to: "R1",
      toIf: "g1/0",
      type: "p2p",
      notes: "HQ core/WAN",
    },

    // HQ <-> Branch
    {
      from: "R1",
      fromIf: "g2/0",
      to: "R2",
      toIf: "g1/0",
      type: "p2p",
      notes: "HQ ↔ Branch transit",
    },
    {
      from: "R2",
      fromIf: "g2/0",
      to: "SW2",
      toIf: "e0/0",
      type: "LAN",
      notes: "Branch LAN access",
    },

    // HQ <-> Primary/Backup edges
    {
      from: "R1",
      fromIf: "g3/0",
      to: "R3",
      toIf: "g1/0",
      type: "p2p",
      notes: "Primary edge path",
    },
    {
      from: "R1",
      fromIf: "g4/0",
      to: "R4",
      toIf: "g1/0",
      type: "p2p",
      notes: "Backup edge path",
    },

    // Edge routers <-> FortiGate (inside)
    {
      from: "R3",
      fromIf: "g2/0",
      to: "FortiGate",
      toIf: "port1",
      type: "inside",
      notes: "Primary inside path",
    },
    {
      from: "R4",
      fromIf: "g2/0",
      to: "FortiGate",
      toIf: "port4",
      type: "inside",
      notes: "Backup inside path",
    },

    // FortiGate <-> ISPs
    {
      from: "FortiGate",
      fromIf: "port2",
      to: "R6",
      toIf: "g1/0",
      type: "WAN",
      notes: "ISP1 uplink",
    },
    {
      from: "FortiGate",
      fromIf: "port3",
      to: "R7",
      toIf: "g1/0",
      type: "WAN",
      notes: "ISP2 uplink",
    },

    // ISP <-> Internet simulation (NAT)
    {
      from: "R6",
      fromIf: "g2/0",
      to: "NAT1",
      toIf: "nat0",
      type: "upstream",
      notes: "Internet/NAT node",
    },
    {
      from: "R7",
      fromIf: "g2/0",
      to: "NAT2",
      toIf: "nat0",
      type: "upstream",
      notes: "Internet/NAT node",
    },
  ],

  // ---------------------------------------------------------------------------
  // Addressing plan
  // ---------------------------------------------------------------------------
  devices: [
    {
      name: "HQRouter",
      role: "Inter-VLAN routing (router-on-a-stick) + WAN handoff to R1",
      interfaces: [
        { if: "g1/0", ip: "—", notes: "802.1Q trunk to SW1 (VLANs 10/50/99)" },
        { if: "g1/0.10", ip: "192.168.10.1/24", notes: "Gateway for HQ Users (VLAN 10)" },
        { if: "g1/0.50", ip: "192.168.50.1/24", notes: "Gateway for Servers (VLAN 50)" },
        { if: "g1/0.99", ip: "192.168.99.1/24", notes: "Gateway for Management (VLAN 99)" },
        { if: "g2/0", ip: "10.0.0.1/30", notes: "To R1 g1/0" },
      ],
    },
    {
      name: "SW1 (HQ access switch)",
      role: "HQ access switch providing VLAN segmentation + management SVI",
      interfaces: [
        { if: "e0/0", ip: "—", notes: "Trunk to HQRouter g1/0" },
        { if: "e0/1", ip: "—", notes: "Access VLAN 50 → SRV1" },
        { if: "e0/2", ip: "—", notes: "Access VLAN 10 → VPCS (HQ PC)" },
        { if: "e0/3", ip: "—", notes: "Access VLAN 99 → MGMT PC" },
        { if: "Vlan10", ip: "—", notes: "Shutdown / no IP (routed by HQRouter)" },
        { if: "Vlan50", ip: "—", notes: "No IP (routed by HQRouter)" },
        { if: "Vlan99", ip: "192.168.99.2/24", notes: "SW1 management SVI; GW 192.168.99.1" },
      ],
    },
    {
      name: "SRV1 (Windows Server)",
      role: "DNS + DHCP scopes for VLAN 10 and VLAN 99",
      interfaces: [{ if: "eth0", ip: "192.168.50.10/24", notes: "VLAN 50 via SW1 e0/1; GW 192.168.50.1" }],
      services: [
        { name: "DNS", value: "192.168.50.10 (self)" },
        { name: "DHCP Scope (VLAN 10)", value: "192.168.10.0/24 (GW 192.168.10.1, DNS 192.168.50.10)" },
        { name: "DHCP Scope (VLAN 99)", value: "192.168.99.0/24 (GW 192.168.99.1, DNS 192.168.50.10)" },
        { name: "DHCP Reservation (MGMT)", value: "192.168.99.10 reserved for MGMT PC" },
      ],
    },
    {
      name: "HQ VPCS (HQ user PC on VLAN 10)",
      role: "HQ user endpoint",
      interfaces: [{ if: "eth0", ip: "DHCP", notes: "Receives 192.168.10.x/24; GW 192.168.10.1; DNS 192.168.50.10" }],
    },
    {
      name: "MGMT PC (VLAN 99)",
      role: "Management workstation (SSH / validation)",
      interfaces: [
        { if: "eth0", ip: "192.168.99.10/24", notes: "Static; GW 192.168.99.1; SSH to SW1/HQRouter/R1/etc." },
      ],
    },
    {
      name: "R1 (HQ WAN router)",
      role: "WAN aggregation router: branch + primary/backup edges",
      interfaces: [
        { if: "g1/0", ip: "10.0.0.2/30", notes: "To HQRouter g2/0" },
        { if: "g2/0", ip: "10.0.0.5/30", notes: "To R2 g1/0" },
        { if: "g3/0", ip: "10.0.0.9/30", notes: "To R3 g1/0 (primary edge)" },
        { if: "g4/0", ip: "10.0.0.13/30", notes: "To R4 g1/0 (backup edge)" },
      ],
    },
    {
      name: "R2 (Branch router)",
      role: "Branch router + LAN gateway",
      interfaces: [
        { if: "g1/0", ip: "10.0.0.6/30", notes: "To R1 g2/0" },
        { if: "g2/0", ip: "172.16.10.1/24", notes: "Branch LAN → SW2 e0/0" },
      ],
    },
    {
      name: "SW2 (Branch access switch)",
      role: "Branch access switch",
      interfaces: [{ if: "e0/0", ip: "—", notes: "Access for Branch LAN (172.16.10.x/24; GW 172.16.10.1)" }],
    },
    {
      name: "R3 (Primary edge router)",
      role: "Primary edge path forwarding traffic to the firewall",
      interfaces: [
        { if: "g1/0", ip: "10.0.0.10/30", notes: "To R1 g3/0" },
        { if: "g2/0", ip: "10.0.0.17/30", notes: "To FortiGate port1 (inside)" },
      ],
    },
    {
      name: "R4 (Backup edge router)",
      role: "Backup edge router providing failover redundancy",
      interfaces: [
        { if: "g1/0", ip: "10.0.0.14/30", notes: "To R1 g4/0" },
        { if: "g2/0", ip: "10.0.0.21/30", notes: "To FortiGate port4 (inside)" },
      ],
    },
    {
      name: "FortiGate (HQ firewall)",
      role: "Security enforcement (inside primary/backup + dual ISP)",
      interfaces: [
        { if: "port1", ip: "10.0.0.18/30", notes: "To R3 g2/0 (inside primary)" },
        { if: "port4", ip: "10.0.0.22/30", notes: "To R4 g2/0 (inside backup)" },
        { if: "port2", ip: "160.1.1.1/30", notes: "To R6 g1/0 (ISP1)" },
        { if: "port3", ip: "160.1.1.5/30", notes: "To R7 g1/0 (ISP2)" },
      ],
    },
    {
      name: "R6 (ISP1)",
      role: "ISP1 router upstream of FortiGate",
      interfaces: [
        { if: "g1/0", ip: "160.1.1.2/30", notes: "To FortiGate port2" },
        { if: "g2/0", ip: "180.1.1.1/24", notes: "To NAT1 nat0" },
      ],
    },
    {
      name: "R7 (ISP2)",
      role: "ISP2 router upstream of FortiGate",
      interfaces: [
        { if: "g1/0", ip: "160.1.1.6/30", notes: "To FortiGate port3" },
        { if: "g2/0", ip: "180.1.2.1/24", notes: "To NAT2 nat0" },
      ],
    },
    {
      name: "NAT1",
      role: "Upstream NAT node (ISP1 Internet simulation)",
      interfaces: [{ if: "nat0", ip: "180.1.1.254/24", notes: "To R6 g2/0" }],
    },
    {
      name: "NAT2",
      role: "Upstream NAT node (ISP2 Internet simulation)",
      interfaces: [{ if: "nat0", ip: "180.1.2.254/24", notes: "To R7 g2/0" }],
    },
  ],

  verification: [
    "VLAN 10/50/99 trunk up between SW1 ↔ HQRouter; host ports in correct access VLANs",
    "DHCP leases for HQ Users (VLAN 10) and Management (VLAN 99) as intended",
    "Reachability from MGMT PC to SW1/HQRouter/R1 via SSH",
    "Branch LAN (172.16.10.0/24) reachability to HQ services as designed",
    "Primary/backup edge path behavior validated (route preference / failover)",
    "Dual-ISP behavior validated (ISP1 primary, ISP2 failover)",
  ],
};
