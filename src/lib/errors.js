// Fehlermeldungen aus dem Browser an unsere eigene Function /api/log melden
// (landen dort im Vercel-Log). Bewusst OHNE Drittanbieter: kein Cookie, kein
// Local Storage, keine Nutzereingaben, nur Fehlertext, gekürzter Stack, Seiten-
// pfad ohne Query/Hash und Browserkennung. Deshalb keine Einwilligung nötig.
// Wer Alarme per E-Mail/Slack und Gruppierung will: Sentry o. Ä. ergänzen
// (braucht Auftragsverarbeitung + Eintrag in der Datenschutzerklärung).
const ENDPOINT = import.meta.env.VITE_ERROR_ENDPOINT || "/api/log";
const MAX_PER_SESSION = 5;

let sent = 0;
const seen = new Set();

// Rauschen, das nicht von unserem Code kommt: Browser-Erweiterungen, fremde
// Skripte ("Script error." ohne Details), harmlose Layout-Meldungen.
function isNoise(message, source) {
  if (!message) return true;
  if (/^Script error\.?$/i.test(message)) return true;
  if (/ResizeObserver loop/i.test(message)) return true;
  if (/^(chrome|moz|safari)-extension:/i.test(source || "")) return true;
  return false;
}

export function reportError(error, source = "window", extra = {}) {
  try {
    const message = String(error?.message ?? error ?? "").slice(0, 300);
    if (isNoise(message, extra.file)) return;
    const key = `${source}:${message}`;
    if (seen.has(key) || sent >= MAX_PER_SESSION) return;
    seen.add(key);
    sent += 1;

    const body = JSON.stringify({
      source,
      message,
      stack: String(error?.stack ?? "").slice(0, 1500),
      path: window.location.pathname.slice(0, 100),
      release: typeof __COMMIT__ === "string" ? __COMMIT__ : "dev",
      ua: navigator.userAgent.slice(0, 160),
      ...(extra.component ? { component: String(extra.component).slice(0, 200) } : {}),
    });
    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon || !navigator.sendBeacon(ENDPOINT, blob)) {
      fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch {
    // Fehler-Meldung darf selbst nie einen Fehler auslösen.
  }
}

export function initErrorReporting() {
  window.addEventListener("error", (e) => reportError(e.error ?? e.message, "window", { file: e.filename }));
  window.addEventListener("unhandledrejection", (e) => reportError(e.reason, "promise"));
}
