import { useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { contactUsesEmailClient } from "../services/messaging";
import "./ContactForm.css";

export default function ContactForm({
  title = "Send an inquiry",
  subtitle = "",
  showServiceSelect = true,
  onSubmit,
}) {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const opensEmail = contactUsesEmailClient();

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const { website, ...data } = Object.fromEntries(new FormData(form));
    if (website.trim()) return;

    setSubmitting(true);
    setStatus("");
    try {
      const result = await onSubmit(data);
      if (!result?.ok) throw new Error("Message provider rejected the inquiry");
      if (result.provider === "mailto") {
        setStatus("Finish sending the message in your email app.");
      } else if (result.provider === "mock") {
        setStatus("Test mode. No email was sent.");
      } else {
        setStatus("Message sent.");
        form.reset();
      }
    } catch {
      setStatus("Couldn’t send the message. Try again or use the email link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="portfolio-form-card" aria-labelledby="inquiry-heading">
      <h3 id="inquiry-heading">{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      <form className="portfolio-form" onSubmit={handleSubmit}>
        <div className="portfolio-form-trap" aria-hidden="true">
          <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>
        <div className="portfolio-form-pair">
          <label>Name<input name="name" autoComplete="name" required /></label>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
        </div>
        {showServiceSelect && (
          <label>Service (optional)
            <select name="service">
              <option value="">Select a service</option>
              <option value="network">Network Architecture</option>
              <option value="security">Security Hardening</option>
              <option value="consulting">Consulting</option>
              <option value="web">Web / App</option>
            </select>
          </label>
        )}
        <label>Message<textarea name="message" rows={3} required /></label>
        <button className="portfolio-button portfolio-button-primary" type="submit" disabled={submitting}>
          {submitting ? "Preparing…" : opensEmail ? "Open email draft" : "Send message"} <FiArrowUpRight aria-hidden="true" />
        </button>
        {status && <p className="portfolio-form-status" role="status">{status}</p>}
      </form>
    </section>
  );
}
