import theme from "../../../theme.js";
import TiltButton from "./TiltButton.jsx";
import RoofIcon from "./RoofIcon.jsx";
import { M2_PRO_KWP, M2_PRO_KWP_FLACHDACH } from "../../../lib/calculate.js";

export default function DachformCard({ item, selected, onSelect }) {
  const active = selected === item.label;
  // Flachdach hat factor 1.0 (die geringere Flächen-Effizienz steckt in M2_PRO_KWP_FLACHDACH).
  // Für die Anzeige den Effekt als äquivalente "Nutzbarkeit" relativ zum Schrägdach ausdrücken,
  // damit die Karte nicht irreführend "~100% nutzbar" zeigt.
  const anzeigeFaktor = item.label === "Flachdach" ? M2_PRO_KWP / M2_PRO_KWP_FLACHDACH : item.factor;
  const pct = Math.round(anzeigeFaktor * 100);
  return (
    <TiltButton
      onClick={() => onSelect(item.label)}
      aria-pressed={active}
      style={{
        padding: active ? "15px 11px 13px" : "16px 12px 14px",
        borderRadius: theme.radius.lg,
        border: active ? `2px solid ${theme.color.accent}` : `1px solid ${theme.color.border}`,
        background: active ? theme.color.accentSubtle : theme.color.white,
        cursor: "pointer",
        textAlign: "center",
        width: "100%",
        height: "100%",
        transition: "border-color 0.15s, background-color 0.15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <RoofIcon item={item} active={active} size={96} />
      </div>
      <div style={{ fontFamily: theme.font.display, fontSize: 16, fontWeight: 600, color: theme.color.textPrimary }}>
        {item.label}
      </div>
      <div style={{ fontSize: 13, color: theme.color.textSecondary, marginTop: 3 }}>
        ca. <strong style={{ color: active ? theme.color.accentText : theme.color.textPrimary }}>{pct} %</strong> nutzbar
      </div>
      {/* Anteil nutzbarer Dachfläche als Mini-Balken — vergleichbar auf einen Blick */}
      <div aria-hidden="true" style={{ height: 4, borderRadius: 2, background: active ? theme.color.white : theme.color.bg, marginTop: 10, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: active ? theme.color.accent : theme.color.textMuted }} />
      </div>
    </TiltButton>
  );
}
