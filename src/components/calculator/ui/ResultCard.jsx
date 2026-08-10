import theme from "../../../theme.js";

export default function ResultCard({ label, value, unit, highlight, sub }) {
  return (
    <div
      style={{
        background: highlight ? theme.color.accent : theme.color.white,
        borderRadius: theme.radius.lg,
        padding: "18px 16px",
        border: highlight ? "none" : `1.5px solid ${theme.color.border}`,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 12, color: highlight ? "rgba(255,255,255,0.85)" : theme.color.textMuted, fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: highlight ? theme.color.white : theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>
        {value} <span style={{ fontSize: 14, fontWeight: 500 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 11, color: highlight ? "rgba(255,255,255,0.7)" : theme.color.textMuted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
