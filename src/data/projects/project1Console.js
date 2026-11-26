import { project1 } from "./project1";
import { project2Rack } from "../project2Rack";
import { project3Rack } from "../project3Rack";
import { project4Rack } from "../project4Rack";
import { project5Rack } from "../project5Rack";

const captured = [project2Rack, project3Rack, project4Rack, project5Rack]
  .flatMap((rack) => rack.cards.flatMap((card) => card.terminals));

function fromLab(host, command) {
  return captured.find((entry) => entry.host === host && entry.command.toLowerCase() === command)?.output ?? "";
}

function columns(rows, widths) {
  return rows.map((row) => row.map((cell, index) =>
    widths[index] ? String(cell).padEnd(widths[index]) : String(cell)
  ).join("").trimEnd()).join("\n");
}

const groups = [
  {
    name: "Headquarters",
    nodes: [
      ["SW1", "Access switch"],
      ["HQ-GW1", "VRRP backup"],
      ["HQ-GW2", "VRRP master"],
      ["HQ-EDGE", "WAN and VPN edge"],
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

export const consoleGroups = groups;
export const defaultConsole = "HQ-EDGE";

const unassigned = "unassigned";
const standby = "administratively down";
const gi = (port) => `GigabitEthernet${port}`;

const interfaces = {
  SW1: [
    ["Ethernet0/0", unassigned], ["Ethernet0/1", unassigned], ["Ethernet0/2", unassigned],
    ["Ethernet0/3", unassigned], ["Ethernet1/0", unassigned], ["Vlan99", "192.168.99.10"],
  ],
  "HQ-GW1": [
    [gi("1/0"), unassigned], [gi("1/0.10"), "192.168.10.2"], [gi("1/0.50"), "192.168.50.2"],
    [gi("1/0.99"), "192.168.99.2"], [gi("1/0.999"), unassigned], [gi("2/0"), "10.0.0.17"],
  ],
  "HQ-GW2": [
    [gi("1/0"), unassigned], [gi("1/0.10"), "192.168.10.3"], [gi("1/0.50"), "192.168.50.3"],
    [gi("1/0.99"), "192.168.99.3"], [gi("1/0.999"), unassigned], [gi("2/0"), "10.0.0.21"],
  ],
  "HQ-EDGE": [
    [gi("1/0"), "160.1.1.1"], [gi("2/0"), "160.1.1.5"], [gi("3/0"), "10.0.0.18"],
    [gi("4/0"), "10.0.0.22"], ["Loopback0", "10.255.255.10"],
    ["Tunnel10", "10.255.101.1"], ["Tunnel20", "10.255.101.5", standby],
  ],
  "ISP1-RTR": [[gi("1/0"), "160.1.1.2"], [gi("2/0"), "198.18.0.2"], ["Loopback0", "1.1.1.1"]],
  "ISP2-RTR": [[gi("1/0"), "160.1.1.6"], [gi("2/0"), "198.18.0.6"]],
  "INET-RTR": [
    [gi("1/0"), "198.18.0.1"], [gi("2/0"), "198.18.0.5"], [gi("3/0"), "203.0.113.1"],
    [gi("4/0"), "203.0.113.5", standby], ["Loopback10", "198.51.100.10"],
    ["Loopback20", "198.51.100.20"], ["Loopback30", "198.51.100.30"],
    ["Loopback40", "192.0.2.10"], ["Loopback50", "192.0.2.20"],
  ],
  R2: [
    [gi("2/0"), unassigned], [gi("2/0.10"), "172.16.10.1"], [gi("2/0.30"), "172.16.30.1"],
    [gi("2/0.50"), "172.16.50.1"], [gi("2/0.99"), "172.16.99.1"], [gi("2/0.999"), unassigned],
    [gi("3/0"), "203.0.113.2"], [gi("4/0"), "203.0.113.6", standby],
    ["Tunnel10", "10.255.101.2"], ["Tunnel20", "10.255.101.6", standby],
  ],
  SW2: [["Ethernet0/0", unassigned], ["Ethernet0/1", unassigned], ["Ethernet0/2", unassigned]],
};

function interfaceBrief(host) {
  return columns([
    ["Interface", "IP-Address", "OK?", "Method", "Status", "Protocol"],
    ...interfaces[host].map(([port, address, status = "up"]) =>
      [port, address, "YES", address === unassigned ? "unset" : "manual", status, status === "up" ? "up" : "down"]
    ),
  ], [26, 16, 4, 8, 23]);
}

const iosPorts = { e: "Eth ", Gi: "Gig " };

function cdpPort(port) {
  return port.replace(/^e|^Gi/, (type) => iosPorts[type]);
}

function cdpNeighbors(host) {
  const links = project1.connections.filter((link) =>
    [link.from, link.to].includes(host) && !["IPSEC", "ACCESS"].includes(link.type) &&
      !link.notes.includes("admin down")
  );
  return [
    "Capability Codes: R - Router, S - Switch, I - IGMP",
    "",
    columns([
      ["Device ID", "Local Intrfce", "Holdtme", "Capability", "Platform", "Port ID"],
      ...links.map((link) => {
        const outgoing = link.from === host;
        const peer = outgoing ? link.to : link.from;
        const switchPeer = peer.startsWith("SW");
        return [peer, cdpPort(outgoing ? link.fromIf : link.toIf), "153",
          switchPeer ? "S I" : "R", switchPeer ? "IOSvL2" : "IOSv", cdpPort(outgoing ? link.toIf : link.fromIf)];
      }),
    ], [15, 15, 9, 13, 10]),
    "",
    `Total cdp entries displayed : ${links.length}`,
  ].join("\n");
}

const vlans = {
  SW1: [[10, "HQ-USERS", "Et0/2"], [50, "HQ-SERVERS", "Et0/1"], [99, "HQ-MGMT", "Et0/3"], [999, "NATIVE-PARKING", ""]],
  SW2: [[10, "BR-USERS", "Et0/1"], [30, "BR-GUEST", "Et0/2"], [50, "BR-SERVERS", ""], [99, "BR-MGMT", ""], [999, "NATIVE-PARKING", ""]],
};

function vlanBrief(host) {
  const header = "VLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------------------";
  const rows = [[1, "default", ""], ...vlans[host]];
  return `${header}\n${columns(rows.map(([id, name, ports]) => [id, name, "active", ports]), [5, 33, 10])}`;
}

const bgp = {
  "HQ-EDGE": ["160.1.1.5", 65010, [["160.1.1.2", 65001, 1], ["160.1.1.6", 65002, 1]]],
  "ISP1-RTR": ["1.1.1.1", 65001, [["160.1.1.1", 65010, 0], ["198.18.0.1", 65000, 9]]],
  "ISP2-RTR": ["198.18.0.6", 65002, [["160.1.1.5", 65010, 0], ["198.18.0.5", 65000, 9]]],
  "INET-RTR": ["198.18.0.1", 65000, [["198.18.0.2", 65001, 1], ["198.18.0.6", 65002, 1]]],
};

function bgpSummary(host) {
  const [id, localAs, peers] = bgp[host];
  return [
    `BGP router identifier ${id}, local AS number ${localAs}`,
    "BGP table version is 12, main routing table version 12",
    "",
    columns([
      ["Neighbor", "V", "AS", "MsgRcvd", "MsgSent", "TblVer", "InQ", "OutQ", "Up/Down", "State/PfxRcd"],
      ...peers.map(([peer, asn, prefixes]) => [peer, 4, asn, 38, 36, 12, 0, 0, "00:28:42", prefixes]),
    ], [16, 3, 8, 8, 8, 7, 5, 6, 10]),
  ].join("\n");
}

const ospfHeader = "Neighbor ID     Pri   State           Dead Time   Address         Interface";
const gatewayOspf = (address) =>
  `${ospfHeader}\n10.255.255.10     0   FULL/  -        00:00:37    ${address.padEnd(16)}GigabitEthernet2/0`;

function gatewayRoutes(gateway) {
  return `Codes: C - connected, L - local, O - OSPF, O E2 - OSPF external type 2

Gateway of last resort is ${gateway} to network 0.0.0.0

O*E2  0.0.0.0/0 [110/1] via ${gateway}, 00:24:35, GigabitEthernet2/0
O     172.16.10.0/24 [110/210] via ${gateway}, 00:24:35, GigabitEthernet2/0
C     192.168.10.0/24 is directly connected, GigabitEthernet1/0.10
C     192.168.50.0/24 is directly connected, GigabitEthernet1/0.50
C     192.168.99.0/24 is directly connected, GigabitEthernet1/0.99`;
}

const branchRoutes = `Codes: C - connected, L - local, S - static, O - OSPF

Gateway of last resort is 203.0.113.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 203.0.113.1
C     10.255.101.0/30 is directly connected, Tunnel10
C     172.16.10.0/24 is directly connected, GigabitEthernet2/0.10
C     172.16.30.0/24 is directly connected, GigabitEthernet2/0.30
O     192.168.10.0/24 [110/110] via 10.255.101.1, 00:22:19, Tunnel10
O     192.168.50.0/24 [110/110] via 10.255.101.1, 00:22:19, Tunnel10
O     192.168.99.0/24 [110/110] via 10.255.101.1, 00:22:19, Tunnel10
C     203.0.113.0/30 is directly connected, GigabitEthernet3/0`;

function ipsec(local, peer) {
  return `interface: Tunnel10
    Crypto map tag: Tunnel10-head-0, local addr ${local}

   protected vrf: (none)
   local  ident (addr/mask/prot/port): (0.0.0.0/0.0.0.0/0/0)
   remote ident (addr/mask/prot/port): (0.0.0.0/0.0.0.0/0/0)
   current_peer ${peer} port 500
     PERMIT, flags={origin_is_acl,}
    #pkts encaps: 48, #pkts encrypt: 48, #pkts digest: 48
    #pkts decaps: 48, #pkts decrypt: 48, #pkts verify: 48
    #send errors 0, #recv errors 0
    local crypto endpt.: ${local}, remote crypto endpt.: ${peer}
    path mtu 1500, ip mtu 1500, ip mtu idb Tunnel10

    inbound esp sas:
      spi: 0x6A112CF2
      Status: ACTIVE(ACTIVE)
    outbound esp sas:
      spi: 0x1B9236D4
      Status: ACTIVE(ACTIVE)`;
}

const routerRoutes = {
  "HQ-GW1": gatewayRoutes("10.0.0.18"),
  "HQ-GW2": gatewayRoutes("10.0.0.22"),
  "HQ-EDGE": fromLab("HQ-EDGE", "show ip route"),
  "ISP1-RTR": fromLab("ISP1-RTR", "show ip route"),
  "ISP2-RTR": fromLab("ISP2-RTR", "show ip route"),
  "INET-RTR": fromLab("INET-RTR", "show ip route"),
  R2: branchRoutes,
};

const common = [
  ["show ip interface brief", "Interface addresses and link state", interfaceBrief],
  ["show cdp neighbors", "Directly connected Cisco devices", cdpNeighbors],
];

const routing = [
  ["show ip route", "Installed IPv4 routes", (host) => routerRoutes[host]],
];

const switching = [
  ["show vlan brief", "VLANs and access-port assignments", vlanBrief],
  ["show interfaces trunk", "802.1Q trunks and allowed VLANs", (host) => fromLab(host, "show interfaces trunk")],
];

const gateway = [
  ["show vrrp", "Virtual IP addresses and gateway roles", (host) => fromLab(host, "show vrrp")],
  ["show ip ospf neighbor", "OSPF adjacencies", (host) => gatewayOspf(host === "HQ-GW1" ? "10.0.0.18" : "10.0.0.22")],
];

const bgpCommands = [["show ip bgp summary", "BGP peers and accepted prefix counts", bgpSummary]];
const tunnelCommands = [
  ["show ip ospf neighbor", "OSPF adjacencies", (host) => fromLab(host, "show ip ospf neighbor")],
  ["show interfaces tunnel10", "Primary VPN tunnel interface", (host) => fromLab(host, "show interface tunnel10")],
  ["show crypto ipsec sa", "IPsec security associations and counters", (host) =>
    host === "HQ-EDGE" ? ipsec("160.1.1.1", "203.0.113.2") : ipsec("203.0.113.2", "160.1.1.1")],
];

const deviceCommands = {
  SW1: switching,
  SW2: switching,
  "HQ-GW1": gateway,
  "HQ-GW2": gateway,
  "HQ-EDGE": [
    ...tunnelCommands,
    ["show interfaces tunnel20", "Standby VPN tunnel interface", (host) => fromLab(host, "show interface tunnel20")],
    ...bgpCommands,
    ["show ip ospf database", "Area 0 link-state database", (host) => fromLab(host, "show ip ospf database")],
    ["show ip nat statistics", "NAT interface roles and counters", (host) => fromLab(host, "show ip nat statistics")],
  ],
  "ISP1-RTR": bgpCommands,
  "ISP2-RTR": bgpCommands,
  "INET-RTR": bgpCommands,
  R2: [
    ...tunnelCommands,
    ["show ip nat translations", "Active NAT translations", (host) => fromLab(host, "show ip nat translations")],
  ],
};

export function commandsFor(host) {
  const routes = routerRoutes[host] ? routing : [];
  return [...(deviceCommands[host] ?? []), ...common, ...routes].map(([name, description, output]) => ({
    name, description, output: () => output(host),
  }));
}

export const verificationSteps = [
  { host: "SW1", command: "show interfaces trunk", label: "Trace HQ VLANs", finding: "Check both uplinks for native VLAN 999 and allowed VLANs 10, 50, and 99." },
  { host: "HQ-GW2", command: "show vrrp", label: "Find the active gateway", finding: "Check the master state and the shared virtual IP for each HQ VLAN." },
  { host: "HQ-EDGE", command: "show ip ospf neighbor", label: "Verify OSPF adjacency", finding: "Look for FULL neighbors on the two HQ gateway links and Tunnel10." },
  { host: "HQ-EDGE", command: "show ip bgp summary", label: "Inspect both ISPs", finding: "Check the neighbor AS numbers and prefix counts in State/PfxRcd." },
  { host: "R2", command: "show ip route", label: "Trace routes back to HQ", finding: "Find the HQ subnets learned by OSPF through Tunnel10." },
  { host: "HQ-EDGE", command: "show interfaces tunnel20", label: "Check backup tunnel status", finding: "Compare Tunnel20’s standby state with Tunnel10’s up/up state." },
];
