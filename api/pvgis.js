// Server-seitiger Proxy für die EU-PVGIS-API. Nötig, weil re.jrc.ec.europa.eu
// keinen Access-Control-Allow-Origin-Header sendet: ein direkter Browser-
// fetch() wird per CORS blockiert (per echtem Browser-Test bestätigt, Aug
// 2026 — jeder Aufruf schlug still fehl, calculate() nutzte immer den
// standortunabhängigen Schätzwert). Der Proxy liegt auf derselben Origin.
//
// Härtung (Okt 2026, vor Werbe-Traffic):
//   • nur GET/HEAD; nur die fünf bekannten Parameter, alle strikt als Zahl in
//     festen Grenzen geprüft (kein Durchreichen beliebiger Eingaben an PVGIS)
//   • Koordinaten auf 3 Nachkommastellen (~110 m) normalisiert — PVGIS rechnet
//     ohnehin auf einem Raster von mehreren km; so teilen sich Anfragen aus
//     derselben Gegend einen Cache-Eintrag
//   • CDN-Cache 30 Tage (s-maxage): PVGIS liefert Mehrjahresmittel, die sich
//     nicht ändern. Zusätzlich Cache + Zusammenfassen gleicher paralleler
//     Anfragen in der Function selbst
//   • Timeout (Vercel-Limit beachtet), ein Wiederholungsversuch bei 5xx
//   • Antwort auf die genutzten Felder gekürzt (monatliche Werte + Summen)
//   • einfaches Rate-Limit pro IP (siehe _guard.js)
// Berechnungs-Parameter (lat/lon/peakpower/loss/angle/aspect) sind unverändert.
import { rateLimited, parseNum, round, fetchWithTimeout, createCache, NO_STORE } from "./_guard.js";

const UPSTREAM = "https://re.jrc.ec.europa.eu/api/v5_2/PVcalc";
const RATE_LIMIT_PER_MIN = 40;
const DEADLINE_MS = 8500; // Vercel-Hobby-Function-Limit liegt bei 10 s
const OK_CACHE = "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800";

// Europa-Rahmen: großzügig genug für Einbettungen außerhalb Deutschlands,
// aber kein Weltweit-Rechner für Dritte.
const LAT = [34, 72];
const LON = [-25, 45];

const cache = createCache(500, 6 * 60 * 60 * 1000);
const inflight = new Map();

function send(res, status, body, cacheControl) {
  res.setHeader("Cache-Control", cacheControl);
  res.status(status).json(body);
}

async function callUpstream(url) {
  const deadline = Date.now() + DEADLINE_MS;
  let last = { status: 502, error: "PVGIS unreachable" };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const remaining = deadline - Date.now();
    if (remaining < 1500) break;
    try {
      const upstream = await fetchWithTimeout(url, {}, remaining);
      if (upstream.ok) {
        const data = await upstream.json();
        const monthly = data?.outputs?.monthly?.fixed;
        if (!Array.isArray(monthly) || !monthly.length) return { status: 502, error: "PVGIS response invalid" };
        return { status: 200, body: { outputs: { monthly: { fixed: monthly }, totals: { fixed: data.outputs?.totals?.fixed ?? null } } } };
      }
      // 4xx (z. B. Standort außerhalb des Datenbereichs): kein Retry, kurz cachen.
      if (upstream.status >= 400 && upstream.status < 500 && upstream.status !== 429) {
        return { status: 422, error: "PVGIS has no data for this location", cacheShort: true };
      }
      last = { status: 502, error: "PVGIS upstream error" };
    } catch {
      last = { status: 502, error: "PVGIS unreachable" };
    }
  }
  return last;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return send(res, 405, { error: "method not allowed" }, NO_STORE);
  }

  if (rateLimited(req, "pvgis", RATE_LIMIT_PER_MIN)) {
    res.setHeader("Retry-After", "30");
    return send(res, 429, { error: "too many requests" }, NO_STORE);
  }

  const q = req.query || {};
  const lat = parseNum(q.lat, LAT[0], LAT[1]);
  const lon = parseNum(q.lon, LON[0], LON[1]);
  const peakpower = q.peakpower === undefined ? 1 : parseNum(q.peakpower, 0.1, 1000);
  const loss = q.loss === undefined ? 14 : parseNum(q.loss, 0, 50);
  const angle = q.angle === undefined ? 30 : parseNum(q.angle, 0, 90);
  const aspect = q.aspect === undefined ? 0 : parseNum(q.aspect, -180, 180);

  if ([lat, lon, peakpower, loss, angle, aspect].some((v) => v === null)) {
    return send(res, 400, { error: "invalid or missing parameters" }, NO_STORE);
  }

  const params = new URLSearchParams({
    lat: String(round(lat, 3)),
    lon: String(round(lon, 3)),
    peakpower: String(round(peakpower, 2)),
    loss: String(round(loss, 1)),
    angle: String(round(angle, 1)),
    aspect: String(round(aspect, 1)),
    outputformat: "json",
  });
  const url = `${UPSTREAM}?${params}`;

  const hit = cache.get(url);
  if (hit) return send(res, 200, hit, OK_CACHE);

  let pending = inflight.get(url);
  if (!pending) {
    pending = callUpstream(url).finally(() => inflight.delete(url));
    inflight.set(url, pending);
  }
  const result = await pending;

  if (result.status === 200) {
    cache.set(url, result.body);
    return send(res, 200, result.body, OK_CACHE);
  }
  return send(res, result.status, { error: result.error }, result.cacheShort ? "public, s-maxage=3600" : NO_STORE);
}
