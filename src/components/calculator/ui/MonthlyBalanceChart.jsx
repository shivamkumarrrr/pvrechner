import theme from "../../../theme.js";

const MONTH_LABELS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

const LEGEND = [
  { label: "Eigenverbrauch", color: theme.color.accent },
  { label: "Einspeisung", color: theme.color.sky },
  { label: "Netzbezug", color: theme.color.textMuted },
];

// Divergierender Monats-Balken um eine Nulllinie (Muster SMA Energy App):
// OBERHALB der Linie liegen Eigenverbrauch (orange, an der Nulllinie) + Einspeisung
// (blau, darüber) — gestapelt ergeben sie den Monatsertrag, den die Anlage produziert
// hat. UNTERHALB liegt der Netzbezug (grau) — der Teil des Verbrauchs, der NICHT durch
// die eigene Anlage gedeckt war. Damit summiert jede Hälfte zu einer realen Größe
// (oben: Erzeugung, unten: zugekaufter Strom) und die drei Segmente werden nicht mehr
// zu einer physikalisch sinnlosen Gesamthöhe gestapelt. Eigenverbrauch sitzt bewusst
// an der Nulllinie als Verbindung zwischen beiden Konzepten.
const CHART_HEIGHT = 170;

export default function MonthlyBalanceChart({ balance }) {
  if (!balance || balance.length !== 12) return null;

  const halfHeight = CHART_HEIGHT / 2;
  const maxHalf = Math.max(
    ...balance.map((m) => m.eigenverbrauch + m.einspeisung),
    ...balance.map((m) => m.netzbezug),
    1
  );

  const toHeight = (v) => Math.max((v / maxHalf) * halfHeight, 2);

  return (
    <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, padding: "18px 16px", marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 2 }}>Ihr Strom über das Jahr</div>
      <div style={{ fontSize: 11, color: theme.color.textMuted, marginBottom: 14 }}>Oben: Erzeugung Ihrer Anlage (Eigenverbrauch + Einspeisung) · Unten: zugekaufter Netzstrom</div>

      {/* Balkenbereich: Oben = Erzeugung, Unten = Netzbezug, getrennt durch Nulllinie */}
      <div style={{ display: "flex", gap: 4, height: CHART_HEIGHT, marginBottom: 6 }}>
        {balance.map((m) => {
          const eigH = toHeight(m.eigenverbrauch);
          const einH = toHeight(m.einspeisung);
          const netzH = toHeight(m.netzbezug);
          return (
            <div key={m.month} style={{ flex: 1, position: "relative" }}>
              {/* Nulllinie */}
              <div style={{ position: "absolute", top: halfHeight, left: 0, right: 0, height: 1, background: theme.color.border, zIndex: 1 }} />
              {/* Oberhalb: Eigenverbrauch (an der Nulllinie) + Einspeisung (darüber) = Monatsertrag */}
              <div style={{ position: "absolute", bottom: halfHeight, left: "12%", right: "12%", display: "flex", flexDirection: "column-reverse" }}>
                <div
                  title={`${MONTH_LABELS[m.month - 1]}: Eigenverbrauch ${m.eigenverbrauch.toLocaleString("de-DE")} kWh`}
                  style={{ background: theme.color.accent, height: eigH, borderRadius: 2 }}
                />
                {m.einspeisung > 0 && (
                  <div
                    title={`${MONTH_LABELS[m.month - 1]}: Einspeisung ${m.einspeisung.toLocaleString("de-DE")} kWh`}
                    style={{ background: theme.color.sky, height: einH, borderRadius: 2 }}
                  />
                )}
              </div>
              {/* Unterhalb: Netzbezug */}
              {m.netzbezug > 0 && (
                <div style={{ position: "absolute", top: halfHeight, left: "12%", right: "12%" }}>
                  <div
                    title={`${MONTH_LABELS[m.month - 1]}: Netzbezug ${m.netzbezug.toLocaleString("de-DE")} kWh`}
                    style={{ background: theme.color.textMuted, height: netzH, borderRadius: 2 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Monatslabels als eigene Zeile unterhalb der Balken (kein Überlappen mit Balken) */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {balance.map((m) => (
          <div key={m.month} style={{ flex: 1, fontSize: 9, color: theme.color.textMuted, textAlign: "center" }}>
            {MONTH_LABELS[m.month - 1]}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        {LEGEND.map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: theme.color.textSecondary }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: l.color, display: "inline-block" }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
