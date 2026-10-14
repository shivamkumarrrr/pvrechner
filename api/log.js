// Nimmt Fehlermeldungen aus dem Browser entgegen (src/lib/errors.js) und
// schreibt sie als eine JSON-Zeile ins Function-Log (Vercel → Projekt → Logs,
// Suche nach "client-error"). Kein Speicher, keine Drittanbieter.
// Schutz: nur POST von der eigenen Origin, Größenlimit, Feldprüfung,
// Rate-Limit pro IP — das Log lässt sich so nicht beliebig fluten.
import { rateLimited, NO_STORE } from "./_guard.js";

const SOURCES = new Set(["window", "promise", "react", "csp"]);
const RATE_LIMIT_PER_MIN = 10;
const MAX_BODY_BYTES = 6000;

const str = (v, max) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, max) : "");

export default async function handler(req, res) {
  res.setHeader("Cache-Control", NO_STORE);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const origin = req.headers.origin;
  if (origin) {
    let host = "";
    try { host = new URL(origin).host; } catch { /* ungültig */ }
    if (host !== req.headers.host) return res.status(403).end();
  }

  if (rateLimited(req, "log", RATE_LIMIT_PER_MIN)) return res.status(429).end();

  let body = req.body;
  if (typeof body === "string") {
    if (body.length > MAX_BODY_BYTES) return res.status(413).end();
    try { body = JSON.parse(body); } catch { return res.status(400).end(); }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return res.status(400).end();

  const message = str(body.message, 300);
  if (!message || !SOURCES.has(body.source)) return res.status(400).end();

  console.error(JSON.stringify({
    type: "client-error",
    source: body.source,
    message,
    stack: str(body.stack, 1500),
    component: str(body.component, 200),
    path: str(body.path, 100),
    release: str(body.release, 20),
    ua: str(body.ua, 160),
  }));
  return res.status(204).end();
}
