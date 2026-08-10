import theme from "../../../theme.js";
import LocationMap from "../ui/LocationMap.jsx";
import { IconMapPin, IconLoader, IconCheck } from "../../Icons.jsx";

export default function StepStandort({
  plz, setPlz, address, setAddress, resolvedCity, pvgisLoading, pvgisData, coords, onLocationChange,
}) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="plz-input" style={{ display: "block", fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 8 }}>Postleitzahl *</label>
        <div style={{ position: "relative" }}>
          <input
            id="plz-input"
            type="text"
            inputMode="numeric"
            placeholder="z.B. 66111"
            maxLength={5}
            value={plz}
            onChange={(e) => setPlz(e.target.value.replace(/\D/g, "").slice(0, 5))}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: resolvedCity ? `2px solid ${theme.color.success}` : `1.5px solid ${theme.color.border}`,
              fontSize: 14,
              color: theme.color.textPrimary,
              outline: "none",
              boxSizing: "border-box",
              background: resolvedCity ? theme.color.successSubtle : theme.color.white,
              transition: "all 0.2s",
            }}
            onFocus={(e) => { if (!resolvedCity) e.target.style.borderColor = theme.color.accent; }}
            onBlur={(e) => { if (!resolvedCity) e.target.style.borderColor = theme.color.border; }}
          />
          {resolvedCity && (
            <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 4, color: theme.color.success }}>
              <IconMapPin size={14} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>{resolvedCity}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: pvgisLoading ? theme.color.accent : pvgisData ? theme.color.success : theme.color.textMuted, marginTop: 5 }}>
          {pvgisLoading ? (
            <><IconLoader size={12} /> Lade Solardaten vom EU Science Hub...</>
          ) : pvgisData ? (
            <><IconCheck size={12} /> Reale Satellitendaten geladen (PVGIS)</>
          ) : resolvedCity ? (
            `Standort erkannt: ${resolvedCity}`
          ) : plz.length > 0 && plz.length < 5 ? (
            `Noch ${5 - plz.length} Ziffern...`
          ) : (
            "Für standortgenaue Sonneneinstrahlung"
          )}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="address-input" style={{ display: "block", fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 8 }}>Straße & Hausnummer (optional)</label>
        <input
          id="address-input"
          type="text"
          placeholder="z.B. Viktoriastr. 19"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: `1.5px solid ${theme.color.border}`,
            fontSize: 14,
            color: theme.color.textPrimary,
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => e.target.style.borderColor = theme.color.accent}
          onBlur={(e) => e.target.style.borderColor = theme.color.border}
        />
        <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 4 }}>Für eine genauere Lokalisierung auf der Karte</div>
      </div>
      {(plz.length === 5) && (
        <LocationMap lat={coords?.lat} lon={coords?.lon} address={address} plz={plz} onLocationChange={onLocationChange} />
      )}
    </>
  );
}
