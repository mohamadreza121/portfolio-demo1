export const project6 = {
  terminalPath: "portfolio / projects / 06",
  terminalLabel: "PROJECT 6",
  terminalCmd: "Windows Infrastructure Runbook (AD DS + DNS + DHCP) + Troubleshooting",

  title: "Windows Infrastructure Runbook",
  subtitle:
    "A documentation-first workflow for SRV1: static IP baseline, AD DS/DNS/DHCP role deployment, scope strategy for HQ/Branch VLANs, and a repeatable join + validation sequence.",

  badges: ["Windows Server 2022", "AD DS", "DNS", "DHCP", "GPO", "DHCP Relay", "HQ + Branch Scopes"],

  srv1: [
    { k: "Role placement", v: "SRV1 on HQ VLAN50 (HQ-SERVERS)" },
    { k: "IP address", v: "192.168.50.10/24 (static)" },
    { k: "Gateway", v: "192.168.50.254 (VRRP VIP)" },
    { k: "DNS", v: "Self (192.168.50.10) + forwarders as needed" },
    { k: "Core roles", v: "AD DS, DNS, DHCP, Group Policy Management" },
  ],

  scopes: [
    { site: "HQ", vlan: 10, subnet: "192.168.10.0/24", router: "192.168.10.1", dns: "192.168.50.10" },
    { site: "HQ", vlan: 99, subnet: "192.168.99.0/24", router: "192.168.99.1", dns: "192.168.50.10" },
    { site: "Branch", vlan: 10, subnet: "172.16.10.0/24", router: "172.16.10.1", dns: "192.168.50.10" },
    { site: "Branch", vlan: 30, subnet: "172.16.30.0/24", router: "172.16.30.1", dns: "192.168.50.10" },
    { site: "Branch", vlan: 50, subnet: "172.16.50.0/24", router: "172.16.50.1", dns: "192.168.50.10" },
    { site: "Branch", vlan: 99, subnet: "172.16.99.0/24", router: "172.16.99.1", dns: "192.168.50.10" },
  ],

  joinWorkflow: [
    "Confirm SRV1 static IP and DNS set to self.",
    "Install AD DS + DNS, promote to domain controller, verify AD-integrated DNS zones.",
    "Install DHCP, authorize in AD, create scopes per VLAN, configure options (router, DNS, domain).",
    "On routers/L3 devices: configure DHCP relay (ip helper-address 192.168.50.10) for each client VLAN SVI/subinterface.",
    "On endpoints: obtain DHCP, validate DNS, then join domain and confirm GPO applies.",
  ],

  cmdRunbook: [
    {
      title: "Baseline identity",
      lines: [
        "whoami",
        "hostname",
        "systeminfo | findstr /B /C:\"OS Name\" /C:\"OS Version\"",
      ],
    },
    {
      title: "Network baseline",
      lines: [
        "ipconfig /all",
        "route print",
        "ping 192.168.50.254",
        "nslookup srv1",
      ],
    },
    {
      title: "AD/DNS quick checks",
      lines: [
        "dcdiag /q",
        "nltest /dsgetdc:YOURDOMAIN.LOCAL",
        "nslookup -type=SRV _ldap._tcp.dc._msdcs.YOURDOMAIN.LOCAL",
      ],
    },
    {
      title: "DHCP quick checks",
      lines: [
        "powershell -NoProfile -Command \"Get-DhcpServerv4Scope\"",
        "powershell -NoProfile -Command \"Get-DhcpServerv4Lease -ScopeId 192.168.10.0 | Select -First 5\"",
      ],
    },
  ],

  troubleshootingScreenshots: [
    {
      id: "p6-dhcp",
      title: "DHCP Validation",
      caption: "Scopes and leases prove relay + routing are correct.",
      mediaSrc: "/project-media/SRV1-info-DHCP.png",
      fullSrc: "/project-media/SRV1-info-DHCP.png",
    },
    {
      id: "p6-dns",
      title: "DNS Validation",
      caption: "Forwarders + AD-integrated DNS for consistent naming.",
      mediaSrc: "/project-media/SRV1-DNS.png",
      fullSrc: "/project-media/SRV1-DNS.png",
    },
    {
      id: "p6-srv1",
      title: "SRV1 Baseline",
      caption: "Static addressing on VLAN50 keeps infrastructure stable.",
      mediaSrc: "/project-media/SRV1-info1.png",
      fullSrc: "/project-media/SRV1-info1.png",
    },
  ],
};
