// PVGIS aspect: 0=south, -90=east, 90=west, 180=north (PVGIS rechnet die Nord-Fläche
// dann als echte Nordfläche — sonst würde der Fallback-Faktor 0.29 nie greifen, sobald
// PVGIS-Daten vorliegen).
export const PVGIS_ASPECT = {
  "Süd": 0, "Südwest": 45, "Südost": -45, "Ost": -90, "West": 90, "Nord": 180,
};
export const PVGIS_ANGLE = {
  "Flach (0–15°)": 10, "Mittel (25–35°)": 30, "Steil (40–60°)": 50,
};

// Läuft über einen serverseitigen Proxy statt direkt gegen re.jrc.ec.europa.eu
// — die PVGIS-API schickt keinen Access-Control-Allow-Origin-Header, ein
// direkter Browser-fetch() wird also per CORS blockiert (per echtem Browser-
// Test bestätigt, Aug 2026: jeder Aufruf schlug fehl, calculate() griff
// deshalb IMMER auf den standortunabhängigen Schätzwert zurück, unabhängig
// von der PLZ). Der Proxy liegt auf derselben Origin wie die Seite, daher
// kein CORS-Problem mehr.
//
// Der Proxy-Pfad ist per Build-Env konfigurierbar, weil derselbe Build auf
// verschiedene Ziele geht: Standard "/api/pvgis" ist die Vercel-Function
// (Vite-Dev-Proxy in vite.config.js spiegelt das lokal); der WordPress-Plugin-
// Build (wordpress-plugin/) setzt VITE_PVGIS_ENDPOINT auf die WP-REST-Route
// (includes/pvgis-proxy.php), die serverseitig via wp_remote_get dasselbe tut.
const PVGIS_ENDPOINT = import.meta.env.VITE_PVGIS_ENDPOINT || "/api/pvgis";

export async function fetchPVGIS(lat, lon, peakpower, angle, aspect) {
  try {
    const url = `${PVGIS_ENDPOINT}?lat=${lat}&lon=${lon}&peakpower=${peakpower}&loss=14&angle=${angle}&aspect=${aspect}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`PVGIS-Fetch fehlgeschlagen (HTTP ${res.status}) für lat=${lat}, lon=${lon} — verwende Fallback-Schätzung.`);
      return null;
    }
    const data = await res.json();
    const monthly = data?.outputs?.monthly?.fixed || [];
    if (!monthly.length) {
      console.warn(`PVGIS-Antwort ohne Monatsdaten für lat=${lat}, lon=${lon} — verwende Fallback-Schätzung.`);
      return null;
    }
    const yearlyKwh = monthly.reduce((sum, m) => sum + m.E_m, 0);
    return { yearlyKwh: Math.round(yearlyKwh), monthly, source: "PVGIS" };
  } catch (err) {
    console.error("PVGIS-Fetch fehlgeschlagen (Netzwerk-/CORS-Fehler) — verwende Fallback-Schätzung.", err);
    return null;
  }
}
