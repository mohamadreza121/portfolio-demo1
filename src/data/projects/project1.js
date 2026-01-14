export const project1 = {
  terminalPath: "portfolio / projects / 01",
  terminalLabel: "PROJECT 1",
  terminalCmd:
    "Flagship — Enterprise Architecture (HQ + Branch + Dual-ISP + Internet Simulation)",

  title: "Enterprise Multi-Site Network Lab",
  subtitle:
    "A full end-to-end design that demonstrates switching segmentation, resilient gateways, OSPF routing behavior, dual-ISP WAN simulation, edge policy/NAT, IPsec VTI, and Windows infrastructure (AD DS/DNS/DHCP).",

  badges: [
    "HQ + Branch",
    "VLANs + trunks",
    "VRRP gateways",
    "OSPF area 0",
    "BGP multihoming (simulated)",
    "NAT + policy control",
    "IPsec VTI (primary/backup)",
    "AD DS + DHCP + DNS",
  ],

  topologyAtAGlance: [
    { k: "HQ Access", v: "SW1 (VLAN10 Users, VLAN50 Servers, VLAN99 Mgmt, VLAN999 Native/Parking)" },
    { k: "HQ Gateways", v: "HQ-GW1 + HQ-GW2 (router-on-a-stick, VRRP 10/50/99, OSPF to HQ-EDGE)" },
    { k: "HQ Edge", v: "HQ-EDGE (NAT, edge policy ACL, BGP to ISP1/ISP2, OSPF default originate)" },
    { k: "Branch", v: "SW2 + R2 (VLAN10/30/50/99 via trunk, NAT, OSPF over VTI to HQ)" },
    { k: "Internet Core", v: "INET-RTR (BGP AS65000) + loopbacks simulating public services" },
    { k: "ISPs", v: "ISP1-RTR (AS65001) + ISP2-RTR (AS65002) default-only toward enterprise" },
    { k: "Windows", v: "SRV1 (AD DS, DNS, DHCP, GPM) on VLAN50 @ 192.168.50.10/24" },
  ],

  connections: [
    { from: "SW1", fromIf: "e0/0", to: "HQ-GW1", toIf: "Gi1/0", type: "TRUNK", notes: "native 999, allowed 10/50/99/999" },
    { from: "SW1", fromIf: "e1/0", to: "HQ-GW2", toIf: "Gi1/0", type: "TRUNK", notes: "native 999, allowed 10/50/99/999" },
    { from: "SW1", fromIf: "e0/1", to: "SRV1", toIf: "eth0", type: "ACCESS", notes: "VLAN50 (VMware VMnet2 via GNS3 Cloud)" },
    { from: "HQ-GW1", fromIf: "Gi2/0", to: "HQ-EDGE", toIf: "Gi3/0", type: "P2P", notes: "10.0.0.16/30 OSPF" },
    { from: "HQ-GW2", fromIf: "Gi2/0", to: "HQ-EDGE", toIf: "Gi4/0", type: "P2P", notes: "10.0.0.20/30 OSPF" },
    { from: "HQ-EDGE", fromIf: "Gi1/0", to: "ISP1-RTR", toIf: "Gi1/0", type: "EBGP", notes: "WAN1 160.1.1.0/30" },
    { from: "HQ-EDGE", fromIf: "Gi2/0", to: "ISP2-RTR", toIf: "Gi1/0", type: "EBGP", notes: "WAN2 160.1.1.4/30" },
    { from: "ISP1-RTR", fromIf: "Gi2/0", to: "INET-RTR", toIf: "Gi1/0", type: "EBGP", notes: "198.18.0.0/30" },
    { from: "ISP2-RTR", fromIf: "Gi2/0", to: "INET-RTR", toIf: "Gi2/0", type: "EBGP", notes: "198.18.0.4/30" },
    { from: "INET-RTR", fromIf: "Gi3/0", to: "R2", toIf: "Gi3/0", type: "UNDERLAY", notes: "203.0.113.0/30" },
    { from: "INET-RTR", fromIf: "Gi4/0", to: "R2", toIf: "Gi4/0", type: "UNDERLAY", notes: "203.0.113.4/30 (admin down unless failover)" },
    { from: "HQ-EDGE", fromIf: "Tunnel10", to: "R2", toIf: "Tunnel10", type: "IPSEC", notes: "Primary VTI 10.255.101.0/30 OSPF cost 10" },
    { from: "HQ-EDGE", fromIf: "Tunnel20", to: "R2", toIf: "Tunnel20", type: "IPSEC", notes: "Backup VTI 10.255.101.4/30 OSPF cost 100 (EEM controlled)" },
    { from: "SW2", fromIf: "e0/0", to: "R2", toIf: "Gi2/0", type: "TRUNK", notes: "native 999, allowed 10/30/50/99/999" },
  ],

  keyOutcomes: [
    "Resilient default gateway at HQ using VRRP across dual routers, with tracking to prevent blackholing.",
    "Single OSPF area 0 with passive-interface default; point-to-point on routed links/VTIs for stable adjacencies.",
    "Multihomed WAN simulation using EBGP toward two ISPs with default-only inbound policy and primary/secondary preference.",
    "Edge policy enforcement (example: block simulated services) while still permitting normal Internet access.",
    "Central Windows infrastructure delivered from SRV1 to both sites using DHCP relay across routed + VPN paths.",
    "Observable failover story: tunnel state, OSPF reconvergence, NAT behavior, and endpoint experience.",
  ],

  validationChecklist: [
    { check: "Gateway resiliency", command: "show vrrp", expected: "VIPs stable; master/backup as designed" },
    { check: "OSPF adjacency", command: "show ip ospf neighbor", expected: "All expected peers FULL" },
    { check: "Default propagation", command: "show ip route | include 0.0.0.0", expected: "O*E2 default learned from HQ-EDGE" },
    { check: "VPN status", command: "show crypto ipsec sa", expected: "Active SAs; counters increment on traffic" },
    { check: "NAT operation", command: "show ip nat statistics", expected: "Hits increment during tests" },
    { check: "DHCP/DNS", command: "ipconfig /all / nslookup", expected: "Leases + DNS point to SRV1" },
  ],

  media: {
    heroImage: "/Topology.png",
  },
};
