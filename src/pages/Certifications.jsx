import { FiArrowUpRight, FiAward } from "react-icons/fi";

const credentials = [
  ["Cisco Certified Specialist – Enterprise Core", 1],
  ["CCNA", 2],
];

const courses = [
  ["Computer Hardware Basics", 3],
  ["Endpoint Security", 4],
  ["Introduction to Cybersecurity", 5],
  ["Introduction to Java", 6],
  ["Network Support & Security", 7],
  ["Networking Basics", 8],
  ["Networking Devices and Initial Configuration", 9],
  ["Python Essentials 1", 10],
];

export default function Certifications() {
  return (
    <section id="certifications" className="portfolio-section portfolio-credentials" aria-labelledby="credentials-heading">
      <div className="portfolio-width">
        <header className="portfolio-section-header">
          <h2 id="credentials-heading">Professional credentials<span>.</span></h2>
          <a className="portfolio-text-link" href="https://www.credly.com/users/mohammadreza-heidarpoor" target="_blank" rel="noreferrer">
            Verify on Credly <FiArrowUpRight aria-hidden="true" />
          </a>
        </header>

        <ul className="portfolio-credentials-grid">
          {credentials.map(([title, id]) => (
            <li key={id}>
              <a href={`/assets/cert${id}.pdf`} target="_blank" rel="noreferrer" aria-label={`View ${title} certificate (PDF)`}>
                <FiAward className="portfolio-credential-icon" aria-hidden="true" />
                <span><span className="portfolio-eyebrow">Cisco certification</span><strong>{title}</strong></span>
                <FiArrowUpRight aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        <details className="portfolio-disclosure">
          <summary>Course certificates</summary>
          <ul className="portfolio-course-list">
            {courses.map(([title, id]) => (
              <li key={id}>
                <a href={`/assets/cert${id}.pdf`} target="_blank" rel="noreferrer" aria-label={`View ${title} certificate (PDF)`}>
                  {title} <FiArrowUpRight aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
