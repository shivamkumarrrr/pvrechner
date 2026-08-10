// Server-side proxy for the EU PVGIS API. Needed because re.jrc.ec.europa.eu
// does not send an Access-Control-Allow-Origin header, so the browser blocks
// a direct fetch() with a CORS error (confirmed via real browser testing,
// Aug 2026 — every PVGIS call was silently failing and calculate() was
// always falling back to the location-independent estimate, regardless of
// PLZ). Vercel serves this function from the same origin as the site, so no
// CORS restriction applies to calls made from the browser to /api/pvgis.
export default async function handler(req, res) {
  const { lat, lon, peakpower, loss, angle, aspect } = req.query;

  if (!lat || !lon) {
    res.status(400).json({ error: "lat and lon are required" });
    return;
  }

  const url = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&peakpower=${encodeURIComponent(peakpower ?? 1)}&loss=${encodeURIComponent(loss ?? 14)}&angle=${encodeURIComponent(angle ?? 30)}&aspect=${encodeURIComponent(aspect ?? 0)}&outputformat=json`;

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "PVGIS upstream error" });
      return;
    }
    const data = await upstream.json();
    res.setHeader("Cache-Control", "public, max-age=86400"); // Ertragsdaten ändern sich nicht stündlich
    res.status(200).json(data);
  } catch {
    res.status(502).json({ error: "PVGIS unreachable" });
  }
}
