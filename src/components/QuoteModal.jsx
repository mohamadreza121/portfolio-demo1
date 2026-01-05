import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const EMPTY_FORM = {
  name: "",
  email: "",
  projectType: "",
  budget: "",
  message: "",
};

export default function QuoteModal({
  open = false,
  service = "",
  onClose,
  onSubmit,
}) {
  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  const [formState, setFormState] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle");

  // Honeypot (kept OUT of formState)
  const [honeypot, setHoneypot] = useState("");
  const openedAtRef = useRef(Date.now());

  useEffect(() => {
    if (!open) return;

    openedAtRef.current = Date.now();
    setStatus("idle");
    setHoneypot("");

    setFormState({
      ...EMPTY_FORM,
      projectType: SERVICE_MAP[service] || "",
    });

    firstInputRef.current?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, service]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const elapsed = Date.now() - openedAtRef.current;
    const isBot = honeypot.trim().length > 0 || elapsed < 1200;

    if (isBot) {
      setStatus("success");
      setFormState(EMPTY_FORM);
      setHoneypot("");
      return;
    }

    setStatus("submitting");
    try {
      if (!onSubmit) throw new Error("QuoteModal missing onSubmit");
      const res = await onSubmit(formState);
      if (res && res.ok === false)
        throw new Error("Message provider returned ok=false");

      setStatus("success");
      setFormState(EMPTY_FORM);
      setHoneypot("");
    } catch {
      setStatus("error");
    }
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="quote-modal-overlay"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className="quote-modal quote-chassis" role="document">
        <header className="quote-chassis__header">
          <div className="quote-chassis__title">
            <h3>Request a Quote</h3>
            {service ? (
              <p className="quote-chassis__subtitle">
                Service:{" "}
                <span className="quote-chassis__service">{service}</span>
              </p>
            ) : (
              <p className="quote-chassis__subtitle">
                Tell me a bit about your project.
              </p>
            )}
          </div>

          <button
            type="button"
            className="quote-chassis__close cursor-target"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form
          className="contact-form contact-form--footer"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Honeypot */}
          <div
            style={{
              position: "absolute",
              left: "-10000px",
              top: "auto",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
            aria-hidden="true"
          >
            <label htmlFor="qm-website">Website</label>
            <input
              id="qm-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Recessed tray (same module language as footer/contact form) */}
          <div className="contact-tray quote-tray">
            <div className="form-grid quote-grid">
              {/* Accessible labels (visually hidden) */}
              <label className="quote-sr" htmlFor="q-name">
                Name
              </label>
              <input
                ref={firstInputRef}
                id="q-name"
                name="name"
                type="text"
                placeholder="Name"
                value={formState.name}
                onChange={handleChange}
                required
              />

              <label className="quote-sr" htmlFor="q-email">
                Email
              </label>
              <input
                id="q-email"
                name="email"
                type="email"
                placeholder="Email"
                value={formState.email}
                onChange={handleChange}
                required
              />

              <label className="quote-sr" htmlFor="q-projectType">
                Project Type
              </label>
              <select
                id="q-projectType"
                name="projectType"
                className="cursor-target"
                value={formState.projectType}
                onChange={handleChange}
              >
                <option value="">Project type</option>
                <option value="website">Website / App</option>
                <option value="network">Network Design</option>
                <option value="security">Security / Hardening</option>
                <option value="consulting">Consulting</option>
              </select>

              <label className="quote-sr" htmlFor="q-budget">
                Budget
              </label>
              <select
                id="q-budget"
                name="budget"
                className="cursor-target"
                value={formState.budget}
                onChange={handleChange}
              >
                <option value="">Budget range</option>
                <option value="under-1k">Under $1k</option>
                <option value="1k-3k">$1k – $3k</option>
                <option value="3k-5k">$3k – $5k</option>
                <option value="5k+">$5k+</option>
              </select>

              <label className="quote-sr" htmlFor="q-message">
                Project Details
              </label>
              <textarea
                id="q-message"
                name="message"
                rows={4}
                placeholder="Short project summary"
                value={formState.message}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions quote-actions">
            <button
              type="submit"
              className="contact-submit-btn cursor-target"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Submitting…" : "Request Quote"}
            </button>

            {status === "success" && (
              <span className="form-status success">
                Request sent successfully.
              </span>
            )}

            {status === "error" && (
              <span className="form-status error">
                Something went wrong. Please try again.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
