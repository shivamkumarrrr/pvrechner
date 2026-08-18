import { useState, useEffect, useRef } from "react";
import theme from "../../../theme.js";
import { IconMapPin, IconMap, IconSatellite } from "../../Icons.jsx";

const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>-Mitwirkende';
const ESRI_SAT_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const ESRI_ATTRIBUTION = "Satellitenbilder &copy; Esri";

// Shows a map centered on the PLZ location, defaulting to standard
// OpenStreetMap tiles (community-run, not a US tech platform — matches the
// "EU Science Hub" / "Datenschutzkonform" trust story). An optional
// satellite layer stays available via toggle since seeing the actual roof
// shape is genuinely useful here. The marker is draggable and the map is
// click-to-move — both report back precise coordinates via onLocationChange
// so the PVGIS request can use the exact spot instead of only the coarse
// PLZ-prefix center.
export default function LocationMap({ lat, lon, address, plz, onLocationChange }) {
  const [mapReady, setMapReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [satellite, setSatellite] = useState(false);
  const mapInstanceRef = useState({ current: null })[0];
  const markerRef = useState({ current: null })[0];
  const layersRef = useState({ current: { osm: null, sat: null, ref: null } })[0];
  const satelliteRef = useRef(satellite);
  satelliteRef.current = satellite;
  const containerId = "leaflet-map";

  useEffect(() => {
    if (!lat || !lon) return;
    setMapReady(false);
    setTimedOut(false);

    const timer = setTimeout(() => setTimedOut(true), 4000);

    const placeMarker = (map, latlng) => {
      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        markerRef.current = window.L.marker(latlng, { draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const p = markerRef.current.getLatLng();
          onLocationChange?.(p.lat, p.lng);
        });
      }
      markerRef.current.bindPopup(address ? `${address}, ${plz}` : plz);
    };

    const initMap = () => {
      const container = document.getElementById(containerId);
      if (!container || !window.L) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }

      const map = window.L.map(containerId, {
        center: [lat, lon],
        zoom: 18,
        zoomControl: true,
        attributionControl: true, // required to credit OpenStreetMap contributors
      });

      const osmLayer = window.L.tileLayer(OSM_TILE_URL, { maxZoom: 19, attribution: OSM_ATTRIBUTION });
      const satLayer = window.L.tileLayer(ESRI_SAT_URL, { maxZoom: 20, attribution: ESRI_ATTRIBUTION });
      layersRef.current = { osm: osmLayer, sat: satLayer };
      (satelliteRef.current ? satLayer : osmLayer).addTo(map);

      placeMarker(map, [lat, lon]);

      map.on("click", (e) => {
        placeMarker(map, e.latlng);
        onLocationChange?.(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      setMapReady(true);
      clearTimeout(timer);
    };

    if (window.L) {
      initMap();
    } else {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => setTimeout(initMap, 100);
        script.onerror = () => setTimedOut(true);
        document.head.appendChild(script);
      }
    }

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon, address, plz]);

  const toggleSatellite = () => {
    const next = !satellite;
    setSatellite(next);
    const map = mapInstanceRef.current;
    const { osm, sat } = layersRef.current;
    if (!map || !osm || !sat) return;
    if (next) { map.removeLayer(osm); map.addLayer(sat); }
    else { map.removeLayer(sat); map.addLayer(osm); }
  };

  // Fallback: static map preview when Leaflet can't load
  if (timedOut && !mapReady) {
    return (
      <div style={{ marginBottom: 12 }}>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "block", textDecoration: "none" }}
        >
          <div style={{
            borderRadius: 12,
            overflow: "hidden",
            border: `1.5px solid ${theme.color.border}`,
            height: 200,
            background: theme.color.textPrimary,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            transition: "transform 0.15s",
            color: theme.color.white,
          }}>
            <IconMapPin size={32} />
            <div style={{ fontSize: 16, fontWeight: 600 }}>{plz} {address || ""}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Klicken für Kartenansicht auf OpenStreetMap →</div>
          </div>
        </a>
        <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 4, textAlign: "center" }}>
          Im Vollbild mit interaktiver Karte
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ position: "relative" }}>
        <div
          id={containerId}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: `1.5px solid ${theme.color.border}`,
            height: 220,
            background: theme.color.bg,
            display: mapReady ? "block" : "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!mapReady && (
            <div style={{ fontSize: 13, color: theme.color.textMuted, textAlign: "center" }}>
              <IconMap size={22} />
              <div style={{ marginTop: 4 }}>Karte wird geladen...</div>
            </div>
          )}
        </div>
        {mapReady && (
          <button
            onClick={toggleSatellite}
            type="button"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 10px",
              borderRadius: 8,
              border: `1.5px solid ${theme.color.border}`,
              background: theme.color.white,
              color: theme.color.textSecondary,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: theme.shadow.floating,
            }}
          >
            <IconSatellite size={13} />
            {satellite ? "Kartenansicht" : "Satellitenansicht"}
          </button>
        )}
      </div>
      {mapReady && (
        <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 4, textAlign: "center" }}>
          Marker ziehen oder auf die Karte klicken, um Ihren genauen Standort zu markieren
        </div>
      )}
    </div>
  );
}
