import DecryptedText from "../components/DecryptedText";
import { lazy, Suspense } from "react";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import GalleryCarousel from "../components/GalleryCarousel";
import GalleryViewer from "../components/GalleryViewer";
import "./Certifications.css";

import cert1 from "../assets/cert1.png";
import cert2 from "../assets/cert2.png";
import cert3 from "../assets/cert3.png";
import cert4 from "../assets/cert4.png";
import cert5 from "../assets/cert5.png";
import cert6 from "../assets/cert6.png";
import cert7 from "../assets/cert7.png";
import cert8 from "../assets/cert8.png";
import cert9 from "../assets/cert9.png";
import cert10 from "../assets/cert10.png";

const PdfViewerLightbox = lazy(() => import("../components/PdfViewerLightbox"));

const certificates = [
  { title: "Cisco Certified Specialist – Enterprise Core", thumb: cert1, issuer: "Cisco", issued: "Sep 2024", expires: "Sep 2027" },
  { title: "CCNA – Routing & Switching", thumb: cert2, issuer: "Cisco", issued: "Aug 2017", expires: "Aug 2020" },
  { title: "Computer Hardware Basics", thumb: cert3, issuer: "Cisco Networking Academy", issued: "Oct 2023" },
  { title: "Endpoint Security", thumb: cert4, issuer: "Cisco Networking Academy", issued: "Nov 2023" },
  { title: "Introduction to Cybersecurity", thumb: cert5, issuer: "Cisco Networking Academy", issued: "Aug 2022" },
  { title: "Introduction to Java", thumb: cert6, issuer: "Sololearn", issued: "Jul 2025" },
  { title: "Network Support & Security", thumb: cert7, issuer: "Cisco Networking Academy", issued: "Nov 2023" },
  { title: "Networking Basics", thumb: cert8, issuer: "Cisco Networking Academy", issued: "Sep 2022" },
  { title: "Networking Devices and Initial Configuration", thumb: cert9, issuer: "Cisco Networking Academy", issued: "Nov 2023" },
  { title: "Python Essentials 1", thumb: cert10, issuer: "Cisco Networking Academy", issued: "Oct 2023" },
];

function renderCertificateCaption(certificate) {
  return (
    <>
      <p className="credential-info__issuer">{certificate.issuer}</p>
      <h2>{certificate.title}</h2>
      <p className="credential-info__date">
        {certificate.expires ? "Issued " : "Completed "}{certificate.issued}
        {certificate.expires && <span>Valid through {certificate.expires}</span>}
      </p>
    </>
  );
}

function renderCertificateViewer(certificate, view, onClose) {
  const url = "/assets/cert" + (view.index + 1) + ".pdf";
  return (
    <GalleryViewer title={certificate.title} closeLabel="Close certificate" view={view} onClose={onClose}
      actions={<a href={url} target="_blank" rel="noreferrer">Open PDF <FaArrowUpRightFromSquare aria-hidden="true" /></a>}>
      <div className="credential-viewer__document">
        <Suspense fallback={<div className="credential-viewer__preview"><img src={certificate.thumb} alt="" /><p role="status">Loading certificate…</p></div>}>
          <PdfViewerLightbox fileUrl={url} />
        </Suspense>
      </div>
    </GalleryViewer>
  );
}

export default function Certifications() {
  return (
    <section id="certifications" className="certifications-page" aria-labelledby="credentials-heading">
      <span className="spy-marker" />
      <div className="credential-gallery">
        <header className="credential-header">
          <div className="credential-heading-copy">
            <h1 id="credentials-heading">
              <DecryptedText text="Professional" animateOn="view" sequential speed={45} revealDirection="center" />{" "}
              <span className="credential-title-accent"><DecryptedText text="Certifications" animateOn="view" sequential speed={45} revealDirection="center" revealDelay={75} /></span>
            </h1>
            <p>Networking, security, hardware, and programming credentials.</p>
          </div>
          <a className="credential-credly cursor-target" href="https://www.credly.com/users/mohammadreza-heidarpoor" target="_blank" rel="noreferrer">
            Verify on Credly <FaArrowUpRightFromSquare aria-hidden="true" />
          </a>
        </header>
        <GalleryCarousel items={certificates} label="Certification gallery" itemLabel="certificate"
          viewLabel="View certificate" renderCaption={renderCertificateCaption} renderViewer={renderCertificateViewer} />
      </div>
    </section>
  );
}
