// src/data/project6Evidence.js
// Evidence and validation artifacts for the overall enterprise design.

export const project6Evidence = {
  title: "Project 6 — Validation & Operational Evidence",
  subtitle:
    "Command evidence, control-plane validation, and security enforcement checks across HQ, branch, edge, and provider simulation.",

  checklist: [
    {
      title: "Control plane",
      items: [
        "OSPF adjacencies established; LSDB consistent across expected areas",
        "BGP peers stable (no flapping) on the edge / ISP handoff as implemented",
        "Primary/backup path behavior validated (preferred route + failover)",
      ],
    },
    {
      title: "Services",
      items: [
        "HQ DHCP leases for VLAN 10 (Users) and VLAN 99 (Management)",
        "DNS resolution from HQ + management networks via SRV1 (192.168.50.10)",
        "Branch reachability to HQ services over R1 ↔ R2 transit",
      ],
    },
    {
      title: "Security & visibility",
      items: [
        "FortiGate policies enforced (expected allow/deny results)",
        "NAT for outbound traffic via ISP1/ISP2 simulation",
        "Logging available for audit/troubleshooting (firewall events, session traces)",
      ],
    },
  ],

  carousel: [
    {
      id: "ospf-db",
      type: "image",
      title: "OSPF LSDB Validation",
      mediaSrc: "/screenshots/show-ip-ospf-database.png",
    },
    {
      id: "bgp-summary",
      type: "image",
      title: "BGP Peer Stability",
      mediaSrc: "/screenshots/show-ip-bgp-summary.png",
    },
    {
      id: "ipsec-sa",
      type: "image",
      title: "IPsec Tunnel Status",
      mediaSrc: "/screenshots/show-crypto-ipsec-sa.png",
    },
    {
      id: "cef-route",
      type: "image",
      title: "CEF Path Inspection",
      mediaSrc: "/screenshots/show-ip-cef-exact-route.png",
    },
    {
      id: "firewall-logs",
      type: "image",
      title: "Firewall Enforcement Logs",
      mediaSrc: "/screenshots/firewall-logging.png",
    },
  ],

  quickCommands: [
    {
      title: "Routing & convergence",
      items: [
        "show ip route",
        "show ip ospf neighbor",
        "show ip ospf database",
        "show ip bgp summary",
        "show ip cef exact-route <src> <dst>",
      ],
    },
    {
      title: "VPN & security",
      items: [
        "show crypto isakmp sa",
        "show crypto ipsec sa",
        "diag vpn ike gateway list (FortiGate)",
        "diag debug flow (FortiGate)",
      ],
    },
    {
      title: "Services",
      items: [
        "ipconfig /all (Windows)",
        "Get-DhcpServerv4Lease (PowerShell)",
        "nslookup <name>",
      ],
    },
  ],
};
