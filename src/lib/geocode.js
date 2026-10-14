// Adress-Geocoding: löst Straße+Hausnummer+PLZ zu präzisen Koordinaten auf
// (Straßen-Level statt PLZ-Zentrum). Der Aufruf läuft über unsere Function
// /api/geocode (api/geocode.js), die Nominatim (OSM) mit identifizierbarem
// User-Agent, Cache und 1-Anfrage-pro-Sekunde-Drosselung anspricht — nicht
// mehr direkt aus dem Browser. Aufrufer MUSS weiterhin debouncen.
const GEOCODE_ENDPOINT = import.meta.env.VITE_GEOCODE_ENDPOINT || "/api/geocode";

export async function geocodeAddress(address, plz, city) {
  // Kleinschreibung + einfache Leerzeichen: gleiche Adresse = gleiche URL =
  // Treffer im CDN-Cache, egal wie sie getippt wurde.
  const params = new URLSearchParams({
    address: address.trim().replace(/\s+/g, " ").toLowerCase(),
    plz,
  });
  if (city) params.set("city", city.trim().toLowerCase());
  try {
    const res = await fetch(`${GEOCODE_ENDPOINT}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (Number.isFinite(data?.lat) && Number.isFinite(data?.lon)) {
      return { lat: data.lat, lon: data.lon };
    }
  } catch {
    // Netzwerkfehler → Aufrufer fällt still auf PLZ-Lookup zurück
  }
  return null;
}
