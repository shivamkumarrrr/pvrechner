import theme from "../../../theme.js";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion.js";

// Rein taktile Rückmeldung beim Antippen (kurzes "Eindrücken") — keine
// Zusatzinfos, keine neue Funktion, nur Bewegung. Folgt demselben
// onMouseDown/onMouseUp-Scale-Muster wie die Wizard-Buttons (Wizard.jsx).
export default function ResultCard({ label, value, unit, highlight, sub }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div
      role="button"
      tabIndex={0}
      onMouseDown={(e) => { if (!reduced) e.currentTarget.style.transform = "scale(0.96)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        if (reduced) return;
        e.currentTarget.style.transform = "scale(0.96)";
        setTimeout(() => { e.currentTarget.style.transform = "scale(1)"; }, 120);
      }}
      style={{
        background: highlight ? theme.color.accent : theme.color.white,
        borderRadius: theme.radius.lg,
        padding: "18px 16px",
        border: highlight ? "none" : `1.5px solid ${theme.color.border}`,
        textAlign: "center",
        cursor: "pointer",
        transition: reduced ? "none" : "transform 0.12s ease",
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
