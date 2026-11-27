export const consoleGroups = [
  {
    name: "Headquarters",
    nodes: [
      ["SW1", "Access switch"],
      ["HQ-GW1", "VRRP backup"],
      ["HQ-GW2", "VRRP master"],
      ["HQ-EDGE", "WAN and VPN edge"],
      ["SRV1", "Windows Server"],
    ],
  },
  {
    name: "WAN",
    nodes: [
      ["ISP1-RTR", "Provider · AS 65001"],
      ["ISP2-RTR", "Provider · AS 65002"],
      ["INET-RTR", "Internet simulation"],
    ],
  },
  {
    name: "Branch",
    nodes: [
      ["R2", "Branch gateway"],
      ["SW2", "Access switch"],
    ],
  },
];

export const rackDevices = [
  { host: "SW1", kind: "switch", ports: 8 },
  { host: "HQ-GW1", kind: "gateway", ports: 4 },
  { host: "HQ-GW2", kind: "gateway", ports: 4 },
  { host: "HQ-EDGE", kind: "edge", ports: 4 },
  { host: "ISP1-RTR", kind: "router", ports: 3 },
  { host: "ISP2-RTR", kind: "router", ports: 3 },
  { host: "INET-RTR", kind: "router", ports: 4 },
  { host: "R2", kind: "gateway", ports: 4 },
  { host: "SW2", kind: "switch", ports: 8 },
  { host: "SRV1", kind: "server", ports: 0 },
];
