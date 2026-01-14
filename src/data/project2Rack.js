export const project2Rack = {
  title: "Project 2 Rack — Switching, VLANs, Trunks + VRRP",
  image: "/Rack.png",
  hotspots: [
    { id: "sw1", target: "sw1", style: { top: "17.3%", left: "20%", width: "59.5%", height: "4.8%" } },
    { id: "gw1", target: "gw1", style: { top: "28.1%", left: "20%", width: "59.5%", height: "4.8%" } },
    // FIXED: gw2 must target gw2 (not srv1)
    { id: "gw2", target: "gw2", style: { top: "33.5%", left: "20%", width: "59.5%", height: "4.8%" } },
  ],

  cards: [
    /* =====================================================
       SW1
    ====================================================== */
    {
      id: "sw1",
      title: "SW1 — HQ Access Switch (VLANs / Trunks / Port Security)",
      description:
        "HQ Layer-2 segmentation with explicit trunk VLAN allow-lists, a parked native VLAN (999), hardened access ports, and an out-of-band management SVI on VLAN99.",
      terminals: [
        {
          host: "SW1",
          command: "show running-config",
          output: `Building configuration...

Current configuration : 3790 bytes
!
! Last configuration change at 20:45:07 UTC Fri Jan 9 2026 by netadmin
!
version 15.1
service timestamps debug datetime msec
service timestamps log datetime msec
service password-encryption
service compress-config
!
hostname SW1
!
boot-start-marker
boot-end-marker
!
!
logging discriminator EXCESS severity drops 6 msg-body drops EXCESSCOLL
logging buffered 50000
logging console discriminator EXCESS
enable secret 4 pV7nvawNZETfuOxblt677HzUYv2hwT6g4fwY6fysF2U
!
username netadmin privilege 15 secret 4 75AFhubUaEkH7wxhhQy7gQUJUI.8P2xwr7dKsMdSod2
no aaa new-model
vtp mode transparent
no ip icmp rate-limit unreachable
!
no ip cef
!
no ip domain-lookup
ip domain-name lab.local
no ipv6 cef
ipv6 multicast rpf use-bgp
!
spanning-tree mode rapid-pvst
spanning-tree extend system-id
!
vlan internal allocation policy ascending
!
vlan 10
 name HQ-USERS
!
vlan 50
 name HQ-SERVERS
!
vlan 99
 name HQ-MGMT
!
vlan 999
 name NATIVE-PARKING
!
ip tcp synwait-time 5
ip ssh time-out 60
ip ssh version 2
!
interface Ethernet0/0
 description SW1 e0/0 <-> HQ-GW1 Gi1/0 (TRUNK)
 switchport trunk encapsulation dot1q
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,50,99,999
 switchport mode trunk
!
interface Ethernet0/1
 description SRV1 via VMware VMnet2 (Cloud)
 switchport access vlan 50
 switchport mode access
 switchport port-security maximum 5
 switchport port-security mac-address sticky
 switchport port-security mac-address sticky 000c.2998.8b0c
 switchport port-security mac-address sticky 0050.56c0.0008
 switchport port-security mac-address sticky 0050.56e2.0c1b
 switchport port-security mac-address sticky 0050.56ec.4213
 switchport port-security mac-address sticky 0050.56fb.f741
 duplex auto
 spanning-tree portfast
 spanning-tree bpduguard enable
!
interface Ethernet0/2
 description SW1 e0/2 <-> HQ-PC e0 (VLAN10)
 switchport access vlan 10
 switchport mode access
 switchport port-security maximum 5
 switchport port-security
 switchport port-security violation restrict
 switchport port-security mac-address sticky
 switchport port-security mac-address sticky 0050.7966.6800
 duplex auto
 spanning-tree portfast
 spanning-tree bpduguard enable
!
interface Ethernet0/3
 description SW1 e0/3 <-> MGMT-PC e0 (VLAN99)
 switchport access vlan 99
 switchport mode access
 switchport port-security maximum 5
 switchport port-security
 switchport port-security violation restrict
 switchport port-security mac-address sticky
 switchport port-security mac-address sticky 0050.7966.6801
 duplex auto
 spanning-tree portfast
 spanning-tree bpduguard enable
!
interface Ethernet1/0
 description SW1 e1/0 <-> HQ-GW2 Gi1/0 (TRUNK)
 switchport trunk encapsulation dot1q
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,50,99,999
 switchport mode trunk
!
interface Ethernet1/1
 duplex auto
!
interface Ethernet1/2
 duplex auto
!
interface Ethernet1/3
 duplex auto
!
interface Ethernet2/0
 duplex auto
!
interface Ethernet2/1
 duplex auto
!
interface Ethernet2/2
 duplex auto
!
interface Ethernet2/3
 duplex auto
!
interface Ethernet3/0
 duplex auto
!
interface Ethernet3/1
 duplex auto
!
interface Ethernet3/2
 duplex auto
!
interface Ethernet3/3
 duplex auto
!
interface Vlan1
 no ip address
 shutdown
!
interface Vlan99
 ip address 192.168.99.10 255.255.255.0
!
ip default-gateway 192.168.99.1
!
no ip http server
!
ip access-list standard VTY-MGMT
 permit 192.168.99.0 0.0.0.255
 permit 172.16.99.0 0.0.0.255
 deny   any log
!
control-plane
!
banner motd ^CCUnauthorized access prohibited.^C
!
line con 0
 privilege level 15
 logging synchronous
 login local
line aux 0
 exec-timeout 0 0
 privilege level 15
 logging synchronous
line vty 0 4
 access-class VTY-MGMT in
 login local
 transport input ssh
!
end`,
          badge: "FULL RUNNING-CONFIG",
        },

        {
          host: "SW1",
          command: "show interfaces trunk",
          output: `Port        Mode             Encapsulation  Status        Native vlan
Et0/0       on               802.1q         trunking      999
Et1/0       on               802.1q         trunking      999

Port        Vlans allowed on trunk
Et0/0       10,50,99,999
Et1/0       10,50,99,999

Port        Vlans allowed and active in management domain
Et0/0       10,50,99,999
Et1/0       10,50,99,999

Port        Vlans in spanning tree forwarding state and not pruned
Et0/0       10,50,99,999
Et1/0       10,50,99,999`,
          badge: "TRUNKS",
        },

        {
          host: "SW1",
          command: "show interfaces switchport (key ports)",
          output: `Et0/0 (TRUNK)
- Operational Mode: trunk
- Trunking Native VLAN: 999 (NATIVE-PARKING)
- Trunking VLANs Enabled: 10,50,99,999

Et0/1 (SRV1 / VLAN50)
- Operational Mode: static access
- Access Mode VLAN: 50 (HQ-SERVERS)

Et0/2 (HQ-PC / VLAN10)
- Operational Mode: static access
- Access Mode VLAN: 10 (HQ-USERS)

Et0/3 (MGMT-PC / VLAN99)
- Operational Mode: static access
- Access Mode VLAN: 99 (HQ-MGMT)

Et1/0 (TRUNK)
- Operational Mode: trunk
- Trunking Native VLAN: 999 (NATIVE-PARKING)
- Trunking VLANs Enabled: 10,50,99,999`,
          badge: "SWITCHPORT",
        },
      ],
      notes: [
        "VTP is transparent to avoid accidental VLAN database changes.",
        "Native VLAN is parked on 999 and trunks explicitly allow only required VLANs (10/50/99/999).",
        "Edge ports use PortFast + BPDU Guard; access ports enforce Port-Security with sticky MAC learning.",
        "Management is isolated on VLAN99 with an SVI (192.168.99.10/24) and VTY access-class filtering.",
      ],
    },

    /* =====================================================
       HQ-GW1
    ====================================================== */
    {
      id: "gw1",
      title: "HQ-GW1 — Redundant Gateway (VRRP Backup) + OSPF Uplink",
      description:
        "Router-on-a-stick gateway for HQ VLANs with VRRP VIPs and SLA tracking. OSPF runs only on the uplink to HQ-EDGE (point-to-point + MTU ignore).",
      terminals: [
        {
          host: "HQ-GW1",
          command: "show running-config",
          output: `Building configuration...

Current configuration : 3281 bytes
!
upgrade fpd auto
version 15.3
service timestamps debug datetime msec
service timestamps log datetime msec
service password-encryption
!
hostname HQ-GW1
!
boot-start-marker
boot-end-marker
!
aqm-register-fnf
!
enable secret 5 $1$73ar$JcS52YyIYMq1Gto1Yk2701
!
no aaa new-model
no ip icmp rate-limit unreachable
no ip domain lookup
ip domain name lab.local
ip cef
no ipv6 cef
!
username netadmin privilege 15 secret 5 $1$Fnda$uQMeYRlf3eyvWrqR5mOJu.
!
redundancy
!
track 1 interface GigabitEthernet2/0 line-protocol
track 2 ip sla 10 reachability
!
ip tcp synwait-time 5
ip ssh time-out 60
ip ssh version 2
!
interface GigabitEthernet1/0
 description HQ-GW1 Gi1/0 <-> SW1 e0/0 (TRUNK)
 no ip address
 negotiation auto
!
interface GigabitEthernet1/0.10
 description VLAN10 HQ-USERS
 encapsulation dot1Q 10
 ip address 192.168.10.2 255.255.255.0
 ip helper-address 192.168.50.10
 vrrp 10 ip 192.168.10.1
 vrrp 10 priority 120
 vrrp 10 track 1 decrement 30
 vrrp 10 track 2 decrement 20
!
interface GigabitEthernet1/0.50
 description VLAN50 HQ-SERVERS
 encapsulation dot1Q 50
 ip address 192.168.50.2 255.255.255.0
 ip helper-address 192.168.50.10
 vrrp 50 ip 192.168.50.254
 vrrp 50 priority 120
 vrrp 50 track 1 decrement 30
 vrrp 50 track 2 decrement 20
!
interface GigabitEthernet1/0.99
 description VLAN99 HQ-MGMT
 encapsulation dot1Q 99
 ip address 192.168.99.2 255.255.255.0
 ip helper-address 192.168.50.10
 vrrp 99 ip 192.168.99.1
 vrrp 99 priority 120
 vrrp 99 track 1 decrement 30
 vrrp 99 track 2 decrement 20
!
interface GigabitEthernet1/0.999
 description NATIVE VLAN 999 (PARKING)
 encapsulation dot1Q 999 native
!
interface GigabitEthernet2/0
 description HQ-GW1 Gi2/0 <-> FGT-HQ port1
 ip address 10.0.0.17 255.255.255.252
 ip ospf network point-to-point
 ip ospf mtu-ignore
 negotiation auto
!
router ospf 1
 router-id 1.1.1.1
 auto-cost reference-bandwidth 100000
 passive-interface default
 no passive-interface GigabitEthernet2/0
 network 10.0.0.16 0.0.0.3 area 0
 network 192.168.10.0 0.0.0.255 area 0
 network 192.168.50.0 0.0.0.255 area 0
 network 192.168.99.0 0.0.0.255 area 0
!
ip access-list standard VTY-MGMT
 permit 192.168.99.0 0.0.0.255
 permit 172.16.99.0 0.0.0.255
 deny   any log
!
ip sla 10
 icmp-echo 10.0.0.18 source-interface GigabitEthernet2/0
 frequency 5
ip sla schedule 10 life forever start-time now
!
banner motd ^CCUnauthorized access prohibited.^C
!
line vty 0 4
 access-class VTY-MGMT in
 login local
 transport input ssh
!
end`,
          badge: "FULL RUNNING-CONFIG",
        },

        {
          host: "HQ-GW1",
          command: "show vrrp",
          output: `GigabitEthernet1/0.10 - Group 10
  State is Backup
  Virtual IP address is 192.168.10.1
  Priority is 100 (cfgd 120)
  Master Router is 192.168.10.3, priority is 110

GigabitEthernet1/0.50 - Group 50
  State is Backup
  Virtual IP address is 192.168.50.254
  Priority is 100 (cfgd 120)
  Master Router is 192.168.50.3, priority is 110

GigabitEthernet1/0.99 - Group 99
  State is Backup
  Virtual IP address is 192.168.99.1
  Priority is 100 (cfgd 120)
  Master Router is 192.168.99.3, priority is 110`,
          badge: "VRRP",
        },

        {
          host: "HQ-GW1",
          command: "show ip ospf neighbor detail",
          output: `Neighbor 10.255.255.10, interface address 10.0.0.18
    In the area 0 via interface GigabitEthernet2/0
    Neighbor priority is 0, State is FULL
    DR is 0.0.0.0 BDR is 0.0.0.0
    Dead timer due in 00:00:37`,
          badge: "OSPF",
        },

        {
          host: "HQ-GW1",
          command: "show ip route (excerpt)",
          output: `Gateway of last resort is 10.0.0.18 to network 0.0.0.0

O*E2  0.0.0.0/0 [110/1] via 10.0.0.18, GigabitEthernet2/0
C        10.0.0.16/30 is directly connected, GigabitEthernet2/0
O        172.16.10.0 [110/210] via 10.0.0.18, GigabitEthernet2/0
O        172.16.30.0 [110/210] via 10.0.0.18, GigabitEthernet2/0
O        172.16.50.0 [110/210] via 10.0.0.18, GigabitEthernet2/0
O        172.16.99.0 [110/210] via 10.0.0.18, GigabitEthernet2/0`,
          badge: "ROUTING",
        },
      ],
      notes: [
        "Inter-VLAN routing is done with subinterfaces on Gi1/0 (router-on-a-stick).",
        "VRRP provides stable default gateways: 192.168.10.1, 192.168.50.254, 192.168.99.1.",
        "Tracking objects: interface state + IP SLA reachability reduce VRRP priority during upstream issues.",
        "OSPF is enabled only on the uplink, with point-to-point network type + MTU ignore for stable adjacency.",
      ],
    },

    /* =====================================================
       HQ-GW2
    ====================================================== */
    {
      id: "gw2",
      title: "HQ-GW2 — Redundant Gateway (VRRP Master) + OSPF Uplink",
      description:
        "Primary VRRP master for HQ VLANs. Operates as the active gateway while maintaining fast failover to HQ-GW1 if uplink health degrades.",
      terminals: [
        {
          host: "HQ-GW2",
          command: "show running-config",
          output: `Building configuration...

Current configuration : 3281 bytes
!
upgrade fpd auto
version 15.3
service timestamps debug datetime msec
service timestamps log datetime msec
service password-encryption
!
hostname HQ-GW2
!
boot-start-marker
boot-end-marker
!
aqm-register-fnf
!
enable secret 5 $1$i61.$VoPENhPh1ZyxF8CUSYlsS.
!
no aaa new-model
no ip icmp rate-limit unreachable
no ip domain lookup
ip domain name lab.local
ip cef
no ipv6 cef
!
username netadmin privilege 15 secret 5 $1$FCsw$Y62A0nmbdBN6Cpg7cvco3.
!
redundancy
!
track 1 interface GigabitEthernet2/0 line-protocol
track 2 ip sla 2 reachability
!
ip tcp synwait-time 5
ip ssh time-out 60
ip ssh version 2
!
interface GigabitEthernet1/0
 description HQ-GW2 Gi1/0 <-> SW1 e1/0 (TRUNK)
 no ip address
 negotiation auto
!
interface GigabitEthernet1/0.10
 description VLAN10 HQ-USERS
 encapsulation dot1Q 10
 ip address 192.168.10.3 255.255.255.0
 ip helper-address 192.168.50.10
 vrrp 10 ip 192.168.10.1
 vrrp 10 priority 110
 vrrp 10 track 1 decrement 30
 vrrp 10 track 2 decrement 20
!
interface GigabitEthernet1/0.50
 description VLAN50 HQ-SERVERS
 encapsulation dot1Q 50
 ip address 192.168.50.3 255.255.255.0
 ip helper-address 192.168.50.10
 vrrp 50 ip 192.168.50.254
 vrrp 50 priority 110
 vrrp 50 track 1 decrement 30
 vrrp 50 track 2 decrement 20
!
interface GigabitEthernet1/0.99
 description VLAN99 HQ-MGMT
 encapsulation dot1Q 99
 ip address 192.168.99.3 255.255.255.0
 ip helper-address 192.168.50.10
 vrrp 99 ip 192.168.99.1
 vrrp 99 priority 110
 vrrp 99 track 1 decrement 30
 vrrp 99 track 2 decrement 20
!
interface GigabitEthernet1/0.999
 description NATIVE VLAN 999 (PARKING)
 encapsulation dot1Q 999 native
!
interface GigabitEthernet2/0
 description HQ-GW2 Gi2/0 <-> FGT-HQ port4
 ip address 10.0.0.21 255.255.255.252
 ip ospf network point-to-point
 ip ospf mtu-ignore
 negotiation auto
!
router ospf 1
 router-id 10.10.10.2
 auto-cost reference-bandwidth 100000
 passive-interface default
 no passive-interface GigabitEthernet2/0
 network 10.0.0.20 0.0.0.3 area 0
 network 192.168.10.0 0.0.0.255 area 0
 network 192.168.50.0 0.0.0.255 area 0
 network 192.168.99.0 0.0.0.255 area 0
!
ip access-list standard VTY-MGMT
 permit 192.168.99.0 0.0.0.255
 permit 172.16.99.0 0.0.0.255
 deny   any log
!
ip sla 2
 icmp-echo 10.0.0.22 source-interface GigabitEthernet2/0
 frequency 5
ip sla schedule 2 life forever start-time now
!
banner motd ^CCUnauthorized access prohibited.^C
!
line vty 0 4
 access-class VTY-MGMT in
 login local
 transport input ssh
!
end`,
          badge: "FULL RUNNING-CONFIG",
        },

        {
          host: "HQ-GW2",
          command: "show vrrp",
          output: `GigabitEthernet1/0.10 - Group 10
  State is Master
  Virtual IP address is 192.168.10.1
  Priority is 110

GigabitEthernet1/0.50 - Group 50
  State is Master
  Virtual IP address is 192.168.50.254
  Priority is 110

GigabitEthernet1/0.99 - Group 99
  State is Master
  Virtual IP address is 192.168.99.1
  Priority is 110`,
          badge: "VRRP",
        },

        {
          host: "HQ-GW2",
          command: "show ip ospf neighbor detail",
          output: `Neighbor 10.255.255.10, interface address 10.0.0.22
    In the area 0 via interface GigabitEthernet2/0
    Neighbor priority is 0, State is FULL
    DR is 0.0.0.0 BDR is 0.0.0.0
    Dead timer due in 00:00:34`,
          badge: "OSPF",
        },

        {
          host: "HQ-GW2",
          command: "show ip route (excerpt)",
          output: `Gateway of last resort is 10.0.0.22 to network 0.0.0.0

O*E2  0.0.0.0/0 [110/1] via 10.0.0.22, GigabitEthernet2/0
C        10.0.0.20/30 is directly connected, GigabitEthernet2/0
O        172.16.10.0 [110/210] via 10.0.0.22, GigabitEthernet2/0
O        172.16.30.0 [110/210] via 10.0.0.22, GigabitEthernet2/0
O        172.16.50.0 [110/210] via 10.0.0.22, GigabitEthernet2/0
O        172.16.99.0 [110/210] via 10.0.0.22, GigabitEthernet2/0`,
          badge: "ROUTING",
        },
      ],
      notes: [
        "Active VRRP master for all HQ VLANs to keep end-user routing stable and predictable.",
        "VRRP VIPs are the only gateways clients need; failover happens without changing endpoint configs.",
        "OSPF neighbor remains FULL to HQ-EDGE using point-to-point settings.",
      ],
    },
  ],
};
