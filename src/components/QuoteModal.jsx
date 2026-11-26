import { useLayoutEffect, useRef, useState } from "react";
import { FiArrowUpRight, FiX } from "react-icons/fi";
import { contactUsesEmailClient } from "../services/messaging";
import "./ContactForm.css";
import "./QuoteModal.css";

const SERVICE_MAP = {
  "Enterprise Network Design & Implementation": "network",
  "Cisco Router & Switch Configuration": "network",
  "Firewall Deployment & Security Hardening": "security",
  "VPN & Secure Remote Access": "security",
  "Network Security Audits & Hardening": "security",
  "Windows Server & Active Directory": "network",
  "Web / App": "website",
  Consulting: "consulting",
};

function QuoteDialog({ service, onClose, onSubmit }) {
  const dialog = useRef(null);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const opensEmail = contactUsesEmailClient();

  useLayoutEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const { website, ...data } = Object.fromEntries(new FormData(form));
    if (website.trim()) return;

    setSubmitting(true);
    setStatus("");
    try {
      const result = await onSubmit(data);
      if (!result?.ok) throw new Error("Message provider rejected the quote request");
      if (result.provider === "mailto") {
        setStatus("Finish sending the quote request in your email app.");
      } else if (result.provider === "mock") {
        setStatus("Test mode. No email was sent.");
      } else {
        setStatus("Quote request sent.");
        form.reset();
      }
    } catch {
      setStatus("Couldn’t send the quote request. Try again or contact me by email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="portfolio-quote"
      aria-labelledby="quote-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header>
        <div>
          <h2 id="quote-title">Request a quote</h2>
          {service && <p>{service}</p>}
        </div>
        <button type="button" className="portfolio-icon-button" onClick={onClose} aria-label="Close quote form">
          <FiX aria-hidden="true" />
        </button>
      </header>
      <form className="portfolio-form" onSubmit={handleSubmit}>
        <div className="portfolio-form-trap" aria-hidden="true">
          <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>
        <div className="portfolio-form-pair">
          <label>Name<input name="name" autoComplete="name" required /></label>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
        </div>
        <div className="portfolio-form-pair">
          <label>Project type (optional)
            <select name="projectType" defaultValue={SERVICE_MAP[service] || ""}>
              <option value="">Select a type</option>
              <option value="website">Website / App</option>
              <option value="network">Network Design</option>
              <option value="security">Security / Hardening</option>
              <option value="consulting">Consulting</option>
            </select>
          </label>
          <label>Budget (optional)
            <select name="budget">
              <option value="">Select a range</option>
              <option value="under-1k">Under $1k</option>
              <option value="1k-3k">$1k–$3k</option>
              <option value="3k-5k">$3k–$5k</option>
              <option value="5k+">$5k+</option>
            </select>
          </label>
        </div>
        <label>Project details<textarea name="message" rows={4} required /></label>
        <button className="portfolio-button portfolio-button-primary" type="submit" disabled={submitting}>
          {submitting ? "Preparing…" : opensEmail ? "Open email draft" : "Send quote request"} <FiArrowUpRight aria-hidden="true" />
        </button>
        {status && <p className="portfolio-form-status" role="status">{status}</p>}
      </form>
    </dialog>
  );
}

export default function QuoteModal({ open, service = "", onClose, onSubmit }) {
  return open ? <QuoteDialog key={service} service={service} onClose={onClose} onSubmit={onSubmit} /> : null;
}
