export const project5Rack = {
  title: "Project 5 Rack — Branch Side (VTI + Router-on-a-Stick + Access Switching)",
  image: "/Rack.png",
  hotspots: [
    // Tune these top/left/width/height values to your updated Rack.png labels
    { id: "r2", target: "r2", style: { top: "59.6%", left: "20%", width: "59.5%", height: "4.9%" } },
    { id: "sw2", target: "sw2", style: { top: "22.7%", left: "20%", width: "59.5%", height: "4.9%" } },
  ],
  cards: [
    {
      id: "r2",
      title: "R2 — Branch VTI + OSPF + Inter-VLAN Routing + NAT Proof",
      description:
        "Branch router terminates the VTI, runs OSPF area 0 over the encrypted overlay, performs router-on-a-stick for VLANs, and NATs branch networks to the underlay.",
      terminals: [
        {
          host: "R2",
          command: "show ip ospf neighbor",
          output: `Neighbor ID     Pri   State           Dead Time   Address         Interface
10.255.255.10     0   FULL/  -        00:00:36    10.255.101.1    Tunnel10`,
          badge: "OSPF",
        },
        {
          host: "R2",
          command: "show interface Tunnel10",
          output: `Tunnel10 is up, line protocol is up
  Description: VTI to FGT-HQ WAN1 (preferred)
  Internet address is 10.255.101.2/30
  Tunnel source 203.0.113.2 (GigabitEthernet3/0), destination 160.1.1.1
  Tunnel protocol/transport IPSEC/IP
  Tunnel protection via IPSec (profile "IPSEC-VTI-WAN1")`,
          badge: "VTI",
        },
        {
          host: "R2",
          command: "show ip route | include 0.0.0.0",
          output: `S*    0.0.0.0/0 [1/0] via 203.0.113.1`,
          badge: "Default",
        },
        {
          host: "R2",
          command: "show run interface GigabitEthernet2/0.10",
          output: `interface GigabitEthernet2/0.10
 description BR VLAN10 USERS
 encapsulation dot1Q 10
 ip address 172.16.10.1 255.255.255.0
 ip helper-address 192.168.50.10
 ip nat inside`,
          badge: "ROAS",
        },
        {
          host: "R2",
          command: "show run | include ip nat inside source|ip access-list standard BR_NAT",
          output: `ip nat inside source list BR_NAT interface GigabitEthernet3/0 overload
ip access-list standard BR_NAT
 permit 172.16.0.0 0.0.255.255`,
          badge: "NAT",
        },
        {
          host: "R2",
          command: "show ip nat translations",
          output: `Pro Inside global      Inside local       Outside local      Outside global
icmp 203.0.113.2:29292 172.16.30.50:29292 198.50.100.20:29292 198.50.100.20:29292
icmp 203.0.113.2:31852 172.16.30.50:31852 198.50.100.30:31852 198.50.100.30:31852`,
          badge: "Proof",
        },
      ],
      notes: [
        "Tunnel10 is the preferred VTI (lower cost). Tunnel20 is higher cost and administratively controlled for failover behavior.",
        "Router-on-a-stick provides per-VLAN gateways and DHCP relay (ip helper-address) back to the server at HQ.",
        "NAT on the branch provides deterministic internet reachability for branch VLANs during simulation tests.",
      ],
    },

    {
      id: "sw2",
      title: "SW2 — Trunk + VLAN Segmentation + Port Security + Edge STP Protections",
      description:
        "Branch access switch enforces segmentation via VLANs, uplinks to R2 as a dot1q trunk (native VLAN 999), and hardens access ports with PortFast/BPDU Guard + sticky MAC.",
      terminals: [
        {
          host: "SW2",
          command: "show interfaces trunk",
          output: `Port        Mode             Encapsulation  Status        Native vlan
Et0/0       on               802.1q         trunking      999

Port        Vlans allowed on trunk
Et0/0       10,30,50,99,999

Port        Vlans allowed and active in management domain
Et0/0       10,30,50,99,999

Port        Vlans in spanning tree forwarding state and not pruned
Et0/0       10,30,50,99,999`,
          badge: "TRUNK",
        },
        {
          host: "SW2",
          command: "show run interface Ethernet0/0",
          output: `interface Ethernet0/0
 description SW2 e0/0 <-> R2 Gi2/0 (TRUNK)
 switchport trunk encapsulation dot1q
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,30,50,99,999
 switchport mode trunk`,
          badge: "DOT1Q",
        },
        {
          host: "SW2",
          command: "show run interface Ethernet0/1",
          output: `interface Ethernet0/1
 description SW2 e0/1 <-> BR-PC e0 (VLAN10)
 switchport access vlan 10
 switchport mode access
 switchport port-security maximum 5
 switchport port-security
 switchport port-security violation restrict
 switchport port-security mac-address sticky
 spanning-tree portfast
 spanning-tree bpduguard enable`,
          badge: "Access",
        },
        {
          host: "SW2",
          command: "show run | section VTY-MGMT",
          output: `ip access-list standard VTY-MGMT
 permit 192.168.99.0 0.0.0.255
 permit 172.16.99.0 0.0.0.255
 deny   any log`,
          badge: "Mgmt",
        },
      ],
      notes: [
        "Native VLAN 999 is a parking/native VLAN to reduce VLAN hopping risk and keep unused L2 space clean.",
        "Port-security + sticky MAC provides deterministic endpoint enforcement for lab validation.",
        "PortFast + BPDU Guard hardens edge ports against accidental loops and rogue switch insertion.",
      ],
    },
  ],
};
