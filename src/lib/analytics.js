// ─────────────────────────────────────────────────────────────────────────────
// Analytics + Einwilligung (Google Tag Manager, Consent Mode v2).
//
// Prinzipien:
//   • Ohne `siteConfig.analytics.gtmId` passiert NICHTS: kein Skript, kein
//     Banner, keine Events. Die Seite bleibt dann komplett tracking-frei.
//   • GTM wird erst NACH aktiver Einwilligung geladen (kein "Advanced Mode").
//     Vorher findet keine Verbindung zu Google statt.
//   • Events (`track`) werden nur bei erteilter Einwilligung in den dataLayer
//     geschrieben und enthalten keine personenbezogenen Daten (keine PLZ,
//     keine Adresse, keine Kontaktdaten).
//   • Consent Mode: alle vier Signale standardmäßig "denied". Das Banner
//     fragt nur nach Statistik; ad_* bleiben denied, bis es Werbung gibt.
//   • Die Entscheidung liegt in localStorage (nur im Browser, nie auf einem
//     Server) und läuft nach 12 Monaten ab, dann wird erneut gefragt.
// ─────────────────────────────────────────────────────────────────────────────
import { siteConfig } from "../config.js";

const STORAGE_KEY = "pvr_consent";
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export const CONSENT_CHANGE_EVENT = "pvr-consent-change";
export const CONSENT_OPEN_EVENT = "pvr-consent-open";

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{4,10}$/;

const gtmId = () => siteConfig.analytics?.gtmId || "";

// Die ID landet in einer Skript-URL — nur das exakte GTM-Format zulassen.
export const analyticsEnabled = () => GTM_ID_PATTERN.test(gtmId());

// "granted" | "denied" | null (noch keine Entscheidung / abgelaufen)
export function readConsent() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw);
    if ((value !== "granted" && value !== "denied") || !Number.isFinite(ts)) return null;
    if (Date.now() - ts > MAX_AGE_MS) return null;
    return value;
  } catch {
    return null;
  }
}

function writeConsent(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, ts: Date.now() }));
  } catch {
    // localStorage gesperrt (z. B. privater Modus): Entscheidung gilt nur
    // für diese Sitzung, das Banner erscheint beim nächsten Besuch erneut.
  }
}

function gtag() {
  window.dataLayer = window.dataLayer || [];
  // GTM erwartet das `arguments`-Objekt, kein Array.
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

let gtmLoaded = false;
function loadGtm() {
  if (gtmLoaded) return;
  gtmLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId())}`;
  document.head.appendChild(script);
}

function grantAnalytics() {
  gtag("consent", "update", { analytics_storage: "granted" });
  loadGtm();
}

// Beim Widerruf die GA-Cookies entfernen. Nur ausgeführt, wenn hier vorher
// zugestimmt wurde (siehe setConsent) — so löschen wir keine Cookies, die auf
// der Hauptseite unter derselben Domain gesetzt wurden.
function clearGaCookies() {
  const parts = window.location.hostname.split(".");
  const domains = [window.location.hostname];
  for (let i = 0; i < parts.length - 1; i += 1) domains.push(`.${parts.slice(i).join(".")}`);
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (!/^_ga(_|$)|^_gid$/.test(name)) return;
    domains.forEach((d) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${d}`;
    });
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
}

// Einmal beim Start (main.jsx), VOR dem ersten Render.
export function initAnalytics() {
  if (!analyticsEnabled()) return;
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  if (readConsent() === "granted") grantAnalytics();
}

export function setConsent(granted) {
  if (!analyticsEnabled()) return;
  const before = readConsent();
  writeConsent(granted ? "granted" : "denied");
  if (granted) {
    grantAnalytics();
  } else {
    gtag("consent", "update", { analytics_storage: "denied" });
    if (before === "granted") clearGaCookies();
  }
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

// Für den Footer-Link "Cookie-Einstellungen": Banner erneut öffnen.
export function openConsentDialog() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

export function track(event, params = {}) {
  if (!analyticsEnabled() || readConsent() !== "granted") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
