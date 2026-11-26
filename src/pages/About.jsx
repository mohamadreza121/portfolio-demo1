import { FiArrowUpRight } from "react-icons/fi";

const specialties = [
  ["Networking", "Cisco IOS, VLANs, OSPF, BGP, WAN design and troubleshooting"],
  ["Security", "Firewalls, IPsec VPNs, segmentation and access control"],
  ["Systems & tools", "Windows Server, Active Directory, GNS3 and Packet Tracer"],
  ["Web development", "React, JavaScript and browser-based learning tools"],
];

export default function About() {
  return (
    <section id="about" className="portfolio-width portfolio-section portfolio-about" aria-labelledby="about-heading">
      <div className="portfolio-portrait">
        <img src="/portfolio/portrait.webp" alt="Mohammadreza Heidarpoor" width="675" height="900" loading="lazy" />
      </div>
      <div className="portfolio-about-copy">
        <h2 id="about-heading">About me<span>.</span></h2>
        <p className="portfolio-about-intro">
          I’m Mohammadreza Heidarpoor, a Toronto-based network engineer and web developer. My networking work spans routing, switching, security and Windows infrastructure. I also build browser-based tools that make it easier to practice technical skills.
        </p>
        <dl className="portfolio-specialties">
          {specialties.map(([name, skills]) => (
            <div key={name}><dt>{name}</dt><dd>{skills}</dd></div>
          ))}
        </dl>
        <details className="portfolio-disclosure">
          <summary>Experience &amp; education</summary>
          <p>I’ve configured VoIP and QoS, built site-to-site and remote-access VPNs, and taught networking with Packet Tracer and GNS3.</p>
          <p>Bachelor of Information Technology, Networking &amp; IT Security<br />Ontario Tech University · Expected 2027</p>
        </details>
        <a className="portfolio-text-link" href="https://www.linkedin.com/in/mohammadreza-heidarpoor/" target="_blank" rel="noreferrer">
          View LinkedIn profile <FiArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
