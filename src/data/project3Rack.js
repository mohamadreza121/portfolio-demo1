export const project3Rack = {
  title: "Project 3 Rack — Routing (OSPF Design + Failover Behavior)",
  image: "/Rack.png",
  hotspots: [
    {
      id: "edge",
      target: "edge",
      style: { top: "38.5%", left: "20%", width: "59.5%", height: "4.8%" },
    },
  ],
  cards: [
    {
      id: "edge",
      title: "HQ-EDGE — OSPF Core, Dual-WAN VTI Failover, NAT + BGP Default",
      description:
        "Edge router providing default injection into OSPF, encrypted overlay via VTI (primary up / backup tracked), dual ISP upstream with BGP-learned default and NAT overload.",
      terminals: [
        {
          host: "HQ-EDGE",
          badge: "OSPF Neighbors",
          command: "show ip ospf neighbor",
          output: `Neighbor ID     Pri   State           Dead Time   Address         Interface
10.10.10.2        0   FULL/  -        00:00:39    10.0.0.21       GigabitEthernet4/0
1.1.1.1           0   FULL/  -        00:00:30    10.0.0.17       GigabitEthernet3/0
2.2.2.2           0   FULL/  -        00:00:39    10.255.101.2    Tunnel10`,
        },
        {
          host: "HQ-EDGE",
          badge: "OSPF DB + Default LSA",
          command: "show ip ospf database",
          output: `            OSPF Router with ID (10.255.255.10) (Process ID 1)

                Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
1.1.1.1         1.1.1.1         1529        0x80000002 0x003B98 5
2.2.2.2         2.2.2.2         1423        0x80000003 0x003951 6
10.10.10.2      10.10.10.2      1528        0x80000002 0x00BED4 5
10.255.255.10   10.255.255.10   1423        0x80000004 0x002876 6

                Type-5 AS External Link States

Link ID         ADV Router      Age         Seq#       Checksum Tag
0.0.0.0         10.255.255.10   1533        0x80000001 0x00A4F9 1`,
        },
        {
          host: "HQ-EDGE",
          badge: "VTI Primary Status",
          command: "show interface tunnel10",
          output: `Tunnel10 is up, line protocol is up
  Hardware is Tunnel
  Description: VTI to R2 (Primary) over WAN1
  Internet address is 10.255.101.1/30
  Keepalive set (10 sec), retries 3
  Tunnel source 160.1.1.1 (GigabitEthernet1/0), destination 203.0.113.2
  Tunnel protocol/transport IPSEC/IP
  Tunnel protection via IPSec (profile "IPSEC-VTI-WAN1")`,
        },
        {
          host: "HQ-EDGE",
          badge: "VTI Backup Posture",
          command: "show interface tunnel20",
          output: `Tunnel20 is administratively down, line protocol is down
  Hardware is Tunnel
  Description: VTI to R2 (Backup) over WAN2
  Internet address is 10.255.101.5/30
  Keepalive set (10 sec), retries 3
  Tunnel source 160.1.1.5 (GigabitEthernet2/0), destination 203.0.113.6
  Tunnel protocol/transport IPSEC/IP
  Tunnel protection via IPSec (profile "IPSEC-VTI-WAN2")`,
        },
        {
          host: "HQ-EDGE",
          badge: "NAT Evidence",
          command: "show ip nat statistics",
          output: `Total active translations: 0 (0 static, 0 dynamic; 0 extended)
Peak translations: 13, occurred 00:19:48 ago
Outside interfaces:
  GigabitEthernet1/0, GigabitEthernet2/0
Inside interfaces:
  GigabitEthernet3/0, GigabitEthernet4/0
Hits: 64  Misses: 0
CEF Translated packets: 0, CEF Punted packets: 64
Expired translations: 32
Dynamic mappings:
-- Inside Source
[Id: 1] route-map NAT-ISP1 interface GigabitEthernet1/0 refcount 0
[Id: 2] route-map NAT-ISP2 interface GigabitEthernet2/0 refcount 0`,
        },
        {
          host: "HQ-EDGE",
          badge: "Routing Table",
          command: "show ip route",
          output: `Gateway of last resort is 160.1.1.2 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 160.1.1.2
      10.0.0.0/8 is variably subnetted, 6 subnets, 2 masks
C        10.0.0.16/30 is directly connected, GigabitEthernet3/0
L        10.0.0.18/32 is directly connected, GigabitEthernet3/0
C        10.0.0.20/30 is directly connected, GigabitEthernet4/0
L        10.0.0.22/32 is directly connected, GigabitEthernet4/0
C        10.255.101.0/30 is directly connected, Tunnel10
L        10.255.101.1/32 is directly connected, Tunnel10
      160.1.0.0/16 is variably subnetted, 4 subnets, 2 masks
C        160.1.1.0/30 is directly connected, GigabitEthernet1/0
L        160.1.1.1/32 is directly connected, GigabitEthernet1/0
C        160.1.1.4/30 is directly connected, GigabitEthernet2/0
L        160.1.1.5/32 is directly connected, GigabitEthernet2/0
      172.16.0.0/24 is subnetted, 4 subnets
O        172.16.10.0 [110/110] via 10.255.101.2, 00:23:10, Tunnel10
O        172.16.30.0 [110/110] via 10.255.101.2, 00:23:10, Tunnel10
O        172.16.50.0 [110/110] via 10.255.101.2, 00:23:10, Tunnel10
O        172.16.99.0 [110/110] via 10.255.101.2, 00:23:10, Tunnel10
O     192.168.10.0/24 [110/200] via 10.0.0.21, 00:24:54, GigabitEthernet4/0
                      [110/200] via 10.0.0.17, 00:25:04, GigabitEthernet3/0
O     192.168.50.0/24 [110/200] via 10.0.0.21, 00:24:54, GigabitEthernet4/0
                      [110/200] via 10.0.0.17, 00:25:04, GigabitEthernet3/0
O     192.168.99.0/24 [110/200] via 10.0.0.21, 00:24:54, GigabitEthernet4/0
                      [110/200] via 10.0.0.17, 00:25:04, GigabitEthernet3/0`,
        },
        {
          host: "HQ-EDGE",
          badge: "BGP Default",
          command: "show ip bgp",
          output: `BGP table version is 2, local router ID is 160.1.1.5

     Network          Next Hop            Metric LocPrf Weight Path
 r>  0.0.0.0          160.1.1.6                     100      0 65002 i`,
        },
        {
          host: "HQ-EDGE",
          badge: "Config Excerpt",
          command: "show run | section interface Tunnel|router ospf|ip nat|router bgp|track|event manager",
          output: `track 10 ip sla 10 reachability

interface Tunnel10
 description VTI to R2 (Primary) over WAN1
 ip address 10.255.101.1 255.255.255.252
 ip mtu 1400
 ip tcp adjust-mss 1360
 ip ospf network point-to-point
 ip ospf 1 area 0
 ip ospf cost 10
 keepalive 10 3
 tunnel source GigabitEthernet1/0
 tunnel mode ipsec ipv4
 tunnel destination 203.0.113.2
 tunnel protection ipsec profile IPSEC-VTI-WAN1

interface Tunnel20
 description VTI to R2 (Backup) over WAN2
 ip address 10.255.101.5 255.255.255.252
 ip mtu 1400
 ip tcp adjust-mss 1360
 ip ospf network point-to-point
 ip ospf 1 area 0
 ip ospf cost 100
 shutdown
 keepalive 10 3
 tunnel source GigabitEthernet2/0
 tunnel mode ipsec ipv4
 tunnel destination 203.0.113.6
 tunnel protection ipsec profile IPSEC-VTI-WAN2

router ospf 1
 router-id 10.255.255.10
 auto-cost reference-bandwidth 100000
 passive-interface default
 no passive-interface GigabitEthernet3/0
 no passive-interface GigabitEthernet4/0
 no passive-interface Tunnel10
 no passive-interface Tunnel20
 network 10.0.0.16 0.0.0.3 area 0
 network 10.0.0.20 0.0.0.3 area 0
 network 10.255.101.0 0.0.0.3 area 0
 default-information originate always

ip nat inside source route-map NAT-ISP1 interface GigabitEthernet1/0 overload
ip nat inside source route-map NAT-ISP2 interface GigabitEthernet2/0 overload

router bgp 65010
 bgp log-neighbor-changes
 neighbor 160.1.1.2 remote-as 65001
 neighbor 160.1.1.2 description ISP1-RTR
 neighbor 160.1.1.2 route-map RM-ISP1-IN in
 neighbor 160.1.1.6 remote-as 65002
 neighbor 160.1.1.6 description ISP2-RTR
 neighbor 160.1.1.6 route-map RM-ISP2-IN in

event manager applet TUN20_UP_ON_TUN10_FAIL
 event track 10 state down
 action 1.0 cli command "enable"
 action 2.0 cli command "conf t"
 action 3.0 cli command "interface Tunnel20"
 action 4.0 cli command "no shutdown"
 action 5.0 cli command "end"

event manager applet TUN20_DOWN_ON_TUN10_OK
 event track 10 state up
 action 1.0 cli command "enable"
 action 2.0 cli command "conf t"
 action 3.0 cli command "interface Tunnel20"
 action 4.0 cli command "shutdown"
 action 5.0 cli command "end"`,
        },
      ],
      notes: [
        "OSPF runs as point-to-point on inside links and VTIs (no DR/BDR, fewer adjacency edge cases).",
        "Default is originated into OSPF as a Type-5 LSA (0.0.0.0) from router-id 10.255.255.10.",
        "Primary VTI (Tunnel10) is up; Backup VTI (Tunnel20) is administratively down until IP SLA tracking triggers EEM to enable it.",
        "Dual NAT overload uses route-maps per ISP interface (inside = Gi3/0 & Gi4/0, outside = Gi1/0 & Gi2/0).",
        "BGP receives default (shown) and route-maps apply local-preference to bias path selection.",
      ],
    },
  ],
};
