# Skalierung: PVGIS- und Geocoding-Proxy

Stand Oktober 2026. Beide Endpunkte liegen als Vercel-Functions in `api/`.

## Was schützt vor Last
| Maßnahme | PVGIS (`/api/pvgis`) | Geocoding (`/api/geocode`) |
|---|---|---|
| CDN-Cache (`s-maxage`) | 30 Tage | 30 Tage (Treffer), 1 Tag (kein Treffer) |
| Cache in der Function | 6 h, 500 Einträge | 24 h, 1000 Einträge |
| Gleiche parallele Anfragen zusammenfassen | ja | ja |
| Eingaben strikt geprüft | Zahlen in festen Grenzen (Europa-Rahmen) | PLZ 5 Ziffern, Adresse 3–120 Zeichen |
| Rate-Limit pro IP und Minute | 40 | 15 |
| Drosselung nach außen | – | ≥ 1,1 s zwischen Nominatim-Aufrufen |
| Timeout | 8,5 s gesamt, 1 Wiederholung bei 5xx | 6 s |
| Fehler werden gecacht | nein (außer „kein Datenbereich“, 1 h) | nein |

Fällt ein Dienst aus, antwortet die Function mit 4xx/5xx und der Rechner nutzt die
Ertrags-Schätzung bzw. das PLZ-Zentrum. Der Besucher sieht keinen Fehler.

## Grenzen (ehrlich)
- Das Rate-Limit zählt **pro Function-Instanz**. Vercel startet bei Last mehrere. Es fängt Schleifen
  und einfache Skripte ab, ist aber keine harte Grenze. Für eine harte Grenze eine Regel unter
  *Vercel → Projekt → Firewall → Rate Limiting* anlegen (Verfügbarkeit hängt vom Tarif ab).
- Die 1-Anfrage-pro-Sekunde-Regel von Nominatim gilt **pro Instanz**, nicht global. Bei wenigen
  Besuchern reicht Cache + Debounce (800 ms, erst ab 4 Zeichen Straße). Bei dauerhaft mehr als
  ca. 1 neuer, nicht gecachter Adresse pro Sekunde auf einen kommerziellen Geocoder
  (z. B. Mapbox, Geoapify) oder eine eigene Nominatim-Instanz wechseln. Nur `api/geocode.js` ändern.
- PVGIS erlaubt laut Betreiber 30 Aufrufe/Sekunde pro IP. Vercel-Functions teilen sich Ausgangs-IPs,
  daher hilft der 30-Tage-Cache am meisten.

## Tests
`npm test` (ohne Netzwerk, `fetch` ist gemockt).
