export const project4Rack = {
  title: "Project 4 Rack — WAN + Internet Simulation (Dual ISP BGP + Public Services)",
  image: "/Rack.png",
  hotspots: [
    {
      id: "isp1",
      target: "isp1",
      style: { top: "43.9%", left: "20%", width: "59.5%", height: "4.8%" },
    },
    {
      id: "isp2",
      target: "isp2",
      style: { top: "48.9%", left: "20%", width: "59.5%", height: "4.8%" },
    },
    {
      id: "inet",
      target: "inet",
      style: { top: "54.1%", left: "20%", width: "59.5%", height: "4.8%" },
    },
  ],
  cards: [
    {
      id: "isp1",
      title: "ISP1-RTR — eBGP Upstream + Default Originate (WAN1)",
      description:
        "ISP1 provides WAN1 connectivity and advertises default toward HQ (FGT-HQ). Transit to the simulated Internet is via INET-RTR.",
      terminals: [
        {
          host: "ISP1-RTR",
          badge: "Config",
          command: "show run | section interface|router bgp|ip route|prefix-list|route-map",
          output: `interface Loopback0
 description ISP1 Router-ID
 ip address 1.1.1.1 255.255.255.255

interface GigabitEthernet1/0
 description ISP1-RTR Gi1/0 <-> FGT-HQ port2 (WAN1)
 ip address 160.1.1.2 255.255.255.252

interface GigabitEthernet2/0
 description ISP1-RTR Gi2/0 <-> INET-RTR Gi1/0 (Transit)
 ip address 198.18.0.2 255.255.255.252

router bgp 65001
 bgp log-neighbor-changes
 network 160.1.1.0 mask 255.255.255.252
 neighbor 160.1.1.1 remote-as 65010
 neighbor 160.1.1.1 description FGT-HQ WAN1
 neighbor 160.1.1.1 default-originate
 neighbor 160.1.1.1 route-map RM-DEFAULT-ONLY out
 neighbor 198.18.0.1 remote-as 65000
 neighbor 198.18.0.1 description INET-RTR

ip route 0.0.0.0 0.0.0.0 198.18.0.1

ip prefix-list PL-DEFAULT seq 5 permit 0.0.0.0/0
route-map RM-DEFAULT-ONLY permit 10
 match ip address prefix-list PL-DEFAULT`,
        },
        {
          host: "ISP1-RTR",
          badge: "BGP Table",
          command: "show ip bgp",
          output: `BGP table version is 11, local router ID is 1.1.1.1

     Network          Next Hop            Metric LocPrf Weight Path
 r>  0.0.0.0          160.1.1.1                              0 65010 65002 i
 r                    0.0.0.0                                0 i
 *>  160.1.1.0/30     0.0.0.0                  0         32768 i
 *>  160.1.1.4/30     198.18.0.1                             0 65000 65002 i
 *>  192.0.2.10/32    198.18.0.1               0             0 65000 i
 *>  192.0.2.20/32    198.18.0.1               0             0 65000 i
 *>  198.51.100.10/32 198.18.0.1               0             0 65000 i
 *>  198.51.100.20/32 198.18.0.1               0             0 65000 i
 *>  198.51.100.30/32 198.18.0.1               0             0 65000 i
 *>  203.0.113.0/30   198.18.0.1               0             0 65000 i
 *>  203.0.113.4/30   198.18.0.1               0             0 65000 i`,
        },
        {
          host: "ISP1-RTR",
          badge: "Routing",
          command: "show ip route",
          output: `Gateway of last resort is 198.18.0.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 198.18.0.1
C        1.1.1.1 is directly connected, Loopback0
C        160.1.1.0/30 is directly connected, GigabitEthernet1/0
L        160.1.1.2/32 is directly connected, GigabitEthernet1/0
B        160.1.1.4/30 [20/0] via 198.18.0.1, 00:23:22
C        198.18.0.0/30 is directly connected, GigabitEthernet2/0
L        198.18.0.2/32 is directly connected, GigabitEthernet2/0
B        198.51.100.10 [20/0] via 198.18.0.1, 00:23:22
B        198.51.100.20 [20/0] via 198.18.0.1, 00:23:22
B        198.51.100.30 [20/0] via 198.18.0.1, 00:23:22
B        192.0.2.10 [20/0] via 198.18.0.1, 00:23:22
B        192.0.2.20 [20/0] via 198.18.0.1, 00:23:22
B        203.0.113.0 [20/0] via 198.18.0.1, 00:23:22
B        203.0.113.4 [20/0] via 198.18.0.1, 00:23:22`,
        },
      ],
      notes: [
        "Default is originated toward HQ over eBGP, filtered by prefix-list + route-map (default-only).",
        "Transit to INET-RTR provides reachability to multiple simulated public services (loopbacks).",
      ],
    },

    {
      id: "isp2",
      title: "ISP2-RTR — eBGP Upstream + Default Originate (WAN2)",
      description:
        "ISP2 provides WAN2 connectivity and advertises default toward HQ (FGT-HQ). It peers to INET-RTR for the simulated Internet service space.",
      terminals: [
        {
          host: "ISP2-RTR",
          badge: "Config",
          command: "show run | section interface|router bgp|ip route|prefix-list|route-map",
          output: `interface GigabitEthernet1/0
 description ISP2 Gi1/0 <-> FGT-HQ port3 (WAN2)
 ip address 160.1.1.6 255.255.255.252

interface GigabitEthernet2/0
 description ISP2 Gi2/0 <-> INET-RTR Gi2/0
 ip address 198.18.0.6 255.255.255.252

router bgp 65002
 bgp log-neighbor-changes
 network 160.1.1.4 mask 255.255.255.252
 neighbor 160.1.1.5 remote-as 65010
 neighbor 160.1.1.5 description FGT-HQ WAN2
 neighbor 160.1.1.5 default-originate
 neighbor 160.1.1.5 route-map RM-DEFAULT-ONLY out
 neighbor 198.18.0.5 remote-as 65000
 neighbor 198.18.0.5 description INET-RTR

ip route 0.0.0.0 0.0.0.0 198.18.0.5

ip prefix-list PL-DEFAULT seq 5 permit 0.0.0.0/0
route-map RM-DEFAULT-ONLY permit 10
 match ip address prefix-list PL-DEFAULT`,
        },
        {
          host: "ISP2-RTR",
          badge: "BGP Table",
          command: "show ip bgp",
          output: `BGP table version is 12, local router ID is 198.18.0.6

     Network          Next Hop            Metric LocPrf Weight Path
     0.0.0.0          0.0.0.0                                0 i
 *>  160.1.1.0/30     198.18.0.5                             0 65000 65001 i
 *>  160.1.1.4/30     0.0.0.0                  0         32768 i
 *>  192.0.2.10/32    198.18.0.5               0             0 65000 i
 *>  192.0.2.20/32    198.18.0.5               0             0 65000 i
 *>  198.51.100.10/32 198.18.0.5               0             0 65000 i
 *>  198.51.100.20/32 198.18.0.5               0             0 65000 i
 *>  198.51.100.30/32 198.18.0.5               0             0 65000 i
 *>  203.0.113.0/30   198.18.0.5               0             0 65000 i
 *>  203.0.113.4/30   198.18.0.5               0             0 65000 i`,
        },
        {
          host: "ISP2-RTR",
          badge: "Routing",
          command: "show ip route",
          output: `Gateway of last resort is 198.18.0.5 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 198.18.0.5
B        160.1.1.0/30 [20/0] via 198.18.0.5, 00:23:03
C        160.1.1.4/30 is directly connected, GigabitEthernet1/0
L        160.1.1.6/32 is directly connected, GigabitEthernet1/0
C        198.18.0.4/30 is directly connected, GigabitEthernet2/0
L        198.18.0.6/32 is directly connected, GigabitEthernet2/0
B        198.51.100.10 [20/0] via 198.18.0.5, 00:23:34
B        198.51.100.20 [20/0] via 198.18.0.5, 00:23:34
B        198.51.100.30 [20/0] via 198.18.0.5, 00:23:34
B        192.0.2.10 [20/0] via 198.18.0.5, 00:23:34
B        192.0.2.20 [20/0] via 198.18.0.5, 00:23:34
B        203.0.113.0 [20/0] via 198.18.0.5, 00:23:34
B        203.0.113.4 [20/0] via 198.18.0.5, 00:23:34`,
        },
      ],
      notes: [
        "WAN2 mirrors WAN1 behavior: default to HQ is originated but constrained to 0/0 only.",
        "INET-RTR provides the simulated public service networks (CDN/NEWS + APP loopbacks).",
      ],
    },

    {
      id: "inet",
      title: "INET-RTR — Internet Simulation (Public Services via Loopbacks)",
      description:
        "Core 'internet' router advertising public service IPs (Google/YouTube/Instagram + CDN/News) to both ISPs using BGP.",
      terminals: [
        {
          host: "INET-RTR",
          badge: "Config",
          command: "show run | section interface Loopback|interface GigabitEthernet|router bgp",
          output: `interface Loopback10
 description GOOGLE-SIM
 ip address 198.51.100.10 255.255.255.255
interface Loopback20
 description YOUTUBE-SIM
 ip address 198.51.100.20 255.255.255.255
interface Loopback30
 description INSTAGRAM-SIM
 ip address 198.51.100.30 255.255.255.255
interface Loopback40
 description CDN-SIM
 ip address 192.0.2.10 255.255.255.255
interface Loopback50
 description NEWS-SIM
 ip address 192.0.2.20 255.255.255.255

interface GigabitEthernet1/0
 description INET Gi1/0 <-> ISP1-RTR Gi2/0
 ip address 198.18.0.1 255.255.255.252
interface GigabitEthernet2/0
 description INET Gi2/0 <-> ISP2-RTR Gi2/0
 ip address 198.18.0.5 255.255.255.252
interface GigabitEthernet3/0
 description INET Gi3/0 <-> R2 Gi3/0 (Underlay A)
 ip address 203.0.113.1 255.255.255.252
interface GigabitEthernet4/0
 description INET Gi4/0 <-> R2 Gi4/0 (Underlay B)
 ip address 203.0.113.5 255.255.255.252

router bgp 65000
 bgp log-neighbor-changes
 network 192.0.2.10 mask 255.255.255.255
 network 192.0.2.20 mask 255.255.255.255
 network 198.51.100.10 mask 255.255.255.255
 network 198.51.100.20 mask 255.255.255.255
 network 198.51.100.30 mask 255.255.255.255
 network 203.0.113.0 mask 255.255.255.252
 network 203.0.113.4 mask 255.255.255.252
 neighbor 198.18.0.2 remote-as 65001
 neighbor 198.18.0.2 description ISP1-RTR
 neighbor 198.18.0.6 remote-as 65002
 neighbor 198.18.0.6 description ISP2-RTR`,
        },
        {
          host: "INET-RTR",
          badge: "BGP Table",
          command: "show ip bgp",
          output: `BGP table version is 11, local router ID is 198.51.100.30

     Network          Next Hop            Metric LocPrf Weight Path
 *>  0.0.0.0          198.18.0.2                             0 65001 65010 65002 i
 *>  160.1.1.0/30     198.18.0.2               0             0 65001 i
 *>  160.1.1.4/30     198.18.0.6               0             0 65002 i
 *>  192.0.2.10/32    0.0.0.0                  0         32768 i
 *>  192.0.2.20/32    0.0.0.0                  0         32768 i
 *>  198.51.100.10/32 0.0.0.0                  0         32768 i
 *>  198.51.100.20/32 0.0.0.0                  0         32768 i
 *>  198.51.100.30/32 0.0.0.0                  0         32768 i
 *>  203.0.113.0/30   0.0.0.0                  0         32768 i
 *>  203.0.113.4/30   0.0.0.0                  0         32768 i`,
        },
        {
          host: "INET-RTR",
          badge: "Routing",
          command: "show ip route",
          output: `Gateway of last resort is 198.18.0.2 to network 0.0.0.0

B*    0.0.0.0/0 [20/0] via 198.18.0.2, 00:24:35
B        160.1.1.0 [20/0] via 198.18.0.2, 00:24:35
B        160.1.1.4 [20/0] via 198.18.0.6, 00:24:36
C        192.0.2.10 is directly connected, Loopback40
C        192.0.2.20 is directly connected, Loopback50
C        198.18.0.0/30 is directly connected, GigabitEthernet1/0
L        198.18.0.1/32 is directly connected, GigabitEthernet1/0
C        198.18.0.4/30 is directly connected, GigabitEthernet2/0
L        198.18.0.5/32 is directly connected, GigabitEthernet2/0
C        198.51.100.10 is directly connected, Loopback10
C        198.51.100.20 is directly connected, Loopback20
C        198.51.100.30 is directly connected, Loopback30
C        203.0.113.0/30 is directly connected, GigabitEthernet3/0
L        203.0.113.1/32 is directly connected, GigabitEthernet3/0
C        203.0.113.4/30 is directly connected, GigabitEthernet4/0
L        203.0.113.5/32 is directly connected, GigabitEthernet4/0`,
        },
      ],
      notes: [
        "Loopbacks emulate public internet services used by the lab (Google/YouTube/Instagram + CDN/News).",
        "Both ISPs peer to INET-RTR (AS65000) to learn service routes; ISPs then provide upstream default toward HQ.",
        "Underlay subnets (203.0.113.0/30 and 203.0.113.4/30) represent dual internet paths used by the overlay/VTI design.",
      ],
    },
  ],
};
