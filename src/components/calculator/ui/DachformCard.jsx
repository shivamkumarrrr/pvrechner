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
  return (
    <TiltButton
      onClick={() => onSelect(item.label)}
      style={{
        padding: "14px 6px 10px",
        borderRadius: theme.radius.lg,
        border: active ? `2px solid ${theme.color.accent}` : `1.5px solid ${theme.color.border}`,
        background: active ? theme.color.accentSubtle : theme.color.white,
        cursor: "pointer",
        textAlign: "center",
        transition: "border-color 0.15s, background-color 0.15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
        <RoofIcon item={item} active={active} size={60} />
      </div>
      <div style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? theme.color.accentHover : theme.color.textSecondary }}>
        {item.label}
      </div>
      <div style={{ fontSize: 9, color: active ? theme.color.accentHover : theme.color.textMuted, marginTop: 1 }}>
        ~{Math.round(anzeigeFaktor * 100)}% nutzbar
      </div>
    </TiltButton>
  );
}
