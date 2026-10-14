// Adress-Geocoding über Nominatim (OpenStreetMap), serverseitig statt direkt
// aus dem Browser. Gründe:
//   • Nominatims Nutzungsrichtlinie verlangt max. 1 Anfrage/Sekunde insgesamt
//     und einen identifizierbaren User-Agent — ein Browser darf den nicht setzen
//   • Ergebnisse sollen gecacht werden (CDN 30 Tage + Cache hier)
//   • Datenschutz: Nominatim sieht nur unseren Server, nicht die IP der Besucher
// Grenzen: Vercel startet mehrere Instanzen, die 1/s-Drosselung gilt pro
// Instanz. Bei dauerhaft hohem Traffic auf einen kommerziellen Geocoder (oder
// eigene Nominatim-Instanz) wechseln — siehe docs/skalierung.md.
// Fehlschläge sind unkritisch: der Wizard fällt still auf das PLZ-Zentrum zurück.
import { rateLimited, fetchWithTimeout, createCache, round, NO_STORE } from "./_guard.js";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "rechner.photovoltaik.marketing/1.0 (info@photovoltaik.marketing)";
const RATE_LIMIT_PER_MIN = 15;
const MIN_GAP_MS = 1100; // > 1 s zwischen zwei Nominatim-Aufrufen
const MAX_QUEUE_MS = 3000; // länger warten lassen wir niemanden
const HIT_CACHE = "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800";
const MISS_CACHE = "public, max-age=3600, s-maxage=86400";

const cache = createCache(1000, 24 * 60 * 60 * 1000);
const inflight = new Map();
let nextSlot = 0;

const clean = (v, max) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";

function send(res, status, body, cacheControl) {
  res.setHeader("Cache-Control", cacheControl);
  res.status(status).json(body);
}

async function lookup(query) {
  const now = Date.now();
  const startAt = Math.max(now, nextSlot);
  if (startAt - now > MAX_QUEUE_MS) return { status: 503, error: "geocoder busy" };
  nextSlot = startAt + MIN_GAP_MS;
  if (startAt > now) await new Promise((r) => setTimeout(r, startAt - now));

  try {
    const params = new URLSearchParams({ format: "json", limit: "1", countrycodes: "de", q: query });
    const upstream = await fetchWithTimeout(`${NOMINATIM}?${params}`, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } }, 6000);
    if (!upstream.ok) return { status: 503, error: "geocoder unavailable" };
    const data = await upstream.json();
    const first = Array.isArray(data) ? data[0] : null;
    const lat = Number(first?.lat);
    const lon = Number(first?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return { status: 404, error: "no match" };
    return { status: 200, body: { lat: round(lat, 5), lon: round(lon, 5) } };
  } catch {
    return { status: 503, error: "geocoder unreachable" };
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return send(res, 405, { error: "method not allowed" }, NO_STORE);
  }
  if (rateLimited(req, "geocode", RATE_LIMIT_PER_MIN)) {
    res.setHeader("Retry-After", "30");
    return send(res, 429, { error: "too many requests" }, NO_STORE);
  }

  const q = req.query || {};
  const address = clean(q.address, 120);
  const plz = typeof q.plz === "string" ? q.plz : "";
  const city = clean(q.city, 80);
  if (address.length < 3 || !/^\d{5}$/.test(plz)) {
    return send(res, 400, { error: "invalid or missing parameters" }, NO_STORE);
  }

  const query = `${address}, ${plz}${city ? " " + city : ""}, Germany`.toLowerCase();

  const hit = cache.get(query);
  if (hit) return hit.body ? send(res, 200, hit.body, HIT_CACHE) : send(res, 404, { error: "no match" }, MISS_CACHE);

  let pending = inflight.get(query);
  if (!pending) {
    pending = lookup(query).finally(() => inflight.delete(query));
    inflight.set(query, pending);
  }
  const result = await pending;

  if (result.status === 200) {
    cache.set(query, { body: result.body });
    return send(res, 200, result.body, HIT_CACHE);
  }
  if (result.status === 404) {
    cache.set(query, { body: null });
    return send(res, 404, { error: result.error }, MISS_CACHE);
  }
  return send(res, result.status, { error: result.error }, NO_STORE);
}
