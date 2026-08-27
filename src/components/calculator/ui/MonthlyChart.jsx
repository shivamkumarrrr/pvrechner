import theme from "../../../theme.js";

const MONTH_LABELS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

// Simple 12-bar SVG/CSS chart of the monthly PVGIS yield — no charting
// library needed for something this small. `compact` rendert eine reduzierte
// Variante ohne Subtitle/Innenabstand für schmale Kontexte (Live-Panel).
export default function MonthlyChart({ monthly, compact }) {
  if (!monthly || monthly.length !== 12) return null;
  const max = Math.max(...monthly.map((m) => m.kwh));

  return (
    <div style={compact
      ? { borderRadius: theme.radius.lg }
      : { background: theme.color.white, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, padding: "18px 16px", marginBottom: 16 }
    }>
      <div style={{ fontSize: compact ? 12 : 13, fontWeight: 600, color: theme.color.textPrimary, marginBottom: compact ? 6 : 2 }}>
        Monatlicher Solarertrag
      </div>
      {!compact && (
        <div style={{ fontSize: 11, color: theme.color.textMuted, marginBottom: 14 }}>Prognose in kWh, basierend auf realen PVGIS-Satellitendaten für Ihren Standort</div>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: compact ? 64 : 120 }}>
        {monthly.map((m, i) => (
          <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
            <div
              title={`${MONTH_LABELS[i]}: ${m.kwh.toLocaleString("de-DE")} kWh`}
              style={{
                width: "100%",
                height: `${Math.max((m.kwh / max) * 100, 4)}%`,
                background: theme.color.sky,
                // Niedrigere Monate leicht gedämpfter statt alle exakt gleich —
                // gibt dem Balkenverlauf eine ruhige, wertegetriebene Tiefe
                // ohne Verlauf/Schatten auf einem einzelnen Balken.
                opacity: 0.6 + (m.kwh / max) * 0.4,
                borderRadius: "4px 4px 0 0",
              }}
            />
            {!compact && <span style={{ fontSize: 9, color: theme.color.textMuted }}>{MONTH_LABELS[i]}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
