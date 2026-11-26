import { FiArrowUpRight } from "react-icons/fi";

const services = [
  ["Enterprise Network Design & Implementation", "LAN and WAN architecture, VLAN design, routing and redundancy.", "$250–$1,500 CAD"],
  ["Cisco Router & Switch Configuration", "Cisco IOS, VLANs, ACLs, NAT, DHCP and configuration tuning.", "$120–$900 CAD"],
  ["Firewall Deployment & Security Hardening", "FortiGate and Palo Alto firewall policies, segmentation and access controls.", "$350–$1,800 CAD"],
  ["VPN & Secure Remote Access", "Site-to-site IPsec, SSL VPN and remote workforce connectivity.", "$250–$900 CAD"],
  ["Windows Server & Active Directory", "AD DS, DNS, DHCP, Group Policy and NTFS permissions.", "$500–$1,200 CAD"],
  ["Network Security Audits & Hardening", "Configuration review, risk analysis and remediation planning.", "$300–$1,500 CAD"],
];

export default function Services({ onRequestQuote }) {
  return (
    <section id="services" className="portfolio-width portfolio-section" aria-labelledby="services-heading">
      <header className="portfolio-section-header">
        <h2 id="services-heading">Services<span>.</span></h2>
      </header>

      <div className="portfolio-service-grid">
        {services.map(([title, description, price]) => (
          <article className="portfolio-service" key={title}>
            <h3>{title}</h3>
            <p>{description}</p>
            <div>
              <span>{price}</span>
              <button type="button" className="portfolio-text-link" onClick={() => onRequestQuote?.(title)} aria-label={`Request a quote for ${title}`}>
                Get a quote <FiArrowUpRight aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
