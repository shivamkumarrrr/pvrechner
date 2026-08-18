// Nominatim (OSM) Adress-Geocoding — löst Straße+Hausnummer+PLZ zu präzisen
// Koordinaten auf (Straßen-Level statt PLZ-Zentrum). Öffentlicher Endpunkt,
// respektiert Nominatims Nutzungsrichtlinie für leichten Traffic (~1 req/s,
// kein Bulk) — Aufrufer MUSS debouncen, kein eigenes Rate-Limiting hier.
export async function geocodeAddress(address, plz, city) {
  const query = `${address}, ${plz}${city ? " " + city : ""}, Germany`;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const data = await res.json();
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (e) {
    // Netzwerkfehler/geblockt → Aufrufer fällt still auf PLZ-Lookup zurück
  }
  return null;
}
