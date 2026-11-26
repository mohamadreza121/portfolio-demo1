// src/services/messaging/index.js
import { sendWithMock } from "./providers/mock";
import { sendWithMailto } from "./providers/mailto";
import { sendWithEmailJS } from "./providers/emailjs";

function getProvider() {
  return (import.meta.env.VITE_CONTACT_PROVIDER || "mailto").toLowerCase();
}

export function contactUsesEmailClient() {
  return !["emailjs", "mock"].includes(getProvider());
}

function getSiteMeta() {
  return {
    siteName: import.meta.env.VITE_SITE_NAME || "Portfolio",
    siteUrl: window.location.origin,
  };
}

function normalizePayload(payload) {
  const rest = { ...(payload || {}) };

  // Drop spam fields if present
  delete rest.company;
  delete rest.honeypot;
  delete rest.website;

  const trimmed = {};
  for (const [k, v] of Object.entries(rest)) {
    trimmed[k] = typeof v === "string" ? v.trim() : v;
  }
  return trimmed;
}


export async function sendMessage(payload) {
  const provider = getProvider();
  const meta = getSiteMeta();

  const clean = normalizePayload(payload);

  const enriched = {
    ...clean,
    pagePath: clean.pagePath || window.location.pathname + window.location.hash,
    userAgent: clean.userAgent || navigator.userAgent,
    siteName: meta.siteName,
    siteUrl: meta.siteUrl,
    timestamp: new Date().toISOString(),
  };

  switch (provider) {
    case "emailjs":
      return sendWithEmailJS(enriched);
    case "mock":
      return sendWithMock(enriched);
    default:
      return sendWithMailto(enriched);
  }
}

export async function sendContactMessage(formState) {
  return sendMessage({ kind: "contact", ...formState });
}

export async function sendQuoteMessage(formState, selectedServiceLabel = "") {
  return sendMessage({
    kind: "quote",
    ...formState,
    service: selectedServiceLabel || formState.projectType || "",
  });
}
