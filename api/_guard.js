// Gemeinsame Helfer der API-Funktionen. Der Unterstrich im Dateinamen sorgt
// dafür, dass Vercel diese Datei NICHT als eigene Route veröffentlicht.

// ── Rate-Limit ──────────────────────────────────────────────────────────────
// Zähler pro IP im Speicher der Function-Instanz. Best-Effort: Vercel startet
// mehrere Instanzen, ein Angreifer kann das Limit also je Instanz ausschöpfen.
// Die eigentliche Entlastung kommt vom CDN-Cache (s-maxage) und vom Cache in
// den Funktionen; dieses Limit fängt nur versehentliche Schleifen und einfache
// Skripte ab. Für harte Grenzen: Vercel-Firewall-Regel im Dashboard.
const buckets = new Map();
const MAX_BUCKETS = 5000;

export function clientIp(req) {
  // Vercel setzt/überschreibt diese Header selbst, ein Client kann sie nicht fälschen.
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real) return real;
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd) return fwd.split(",")[0].trim();
  return "unknown";
}

// true = Limit überschritten
export function rateLimited(req, scope, limit, windowMs = 60_000) {
  const now = Date.now();
  const key = `${scope}:${clientIp(req)}`;
  let b = buckets.get(key);
  if (!b || now - b.start >= windowMs) {
    if (buckets.size >= MAX_BUCKETS) {
      for (const [k, v] of buckets) if (now - v.start >= windowMs) buckets.delete(k);
      if (buckets.size >= MAX_BUCKETS) buckets.clear();
    }
    b = { start: now, count: 0 };
    buckets.set(key, b);
  }
  b.count += 1;
  return b.count > limit;
}

// ── Eingaben ────────────────────────────────────────────────────────────────
// Strikte Zahl: nur Dezimalzahl als einzelner String (keine Arrays aus
// wiederholten Parametern, kein "1e3", kein "0x10", kein Leerstring).
export function parseNum(value, min, max) {
  if (typeof value !== "string" || !/^-?\d{1,4}(\.\d{1,8})?$/.test(value)) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

export function round(n, digits) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

// ── Netzwerk ────────────────────────────────────────────────────────────────
export async function fetchWithTimeout(url, options = {}, ms = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ── Kleiner Cache im Speicher (pro Instanz) ─────────────────────────────────
export function createCache(maxEntries, ttlMs) {
  const map = new Map();
  return {
    get(key) {
      const hit = map.get(key);
      if (!hit) return undefined;
      if (Date.now() - hit.at > ttlMs) { map.delete(key); return undefined; }
      return hit.value;
    },
    set(key, value) {
      if (map.size >= maxEntries) map.delete(map.keys().next().value);
      map.set(key, { at: Date.now(), value });
    },
  };
}

export const NO_STORE = "no-store";
