import theme from "../../../theme.js";
import { M2_PRO_KWP, M2_PRO_KWP_FLACHDACH } from "../../../lib/calculate.js";

export default function DachformCard({ item, selected, onSelect }) {
  const active = selected === item.label;
  // Flachdach hat factor 1.0 (die geringere Flächen-Effizienz steckt in M2_PRO_KWP_FLACHDACH).
  // Für die Anzeige den Effekt als äquivalente "Nutzbarkeit" relativ zum Schrägdach ausdrücken,
  // damit die Karte nicht irreführend "~100% nutzbar" zeigt.
  const anzeigeFaktor = item.label === "Flachdach" ? M2_PRO_KWP / M2_PRO_KWP_FLACHDACH : item.factor;
  return (
    <button
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
      <svg viewBox="0 0 100 80" style={{ width: 60, height: 44, display: "block", margin: "0 auto 6px" }} role="img" aria-label={`${item.label}-Illustration`}>
        {/* Ground line */}
        <line x1="5" y1="68" x2="95" y2="68" stroke={active ? theme.color.accentHover : theme.color.textMuted} strokeWidth="1.5" />
        {/* House body */}
        <rect x="15" y="45" width="70" height="23" fill={active ? theme.color.accentSubtle : theme.color.bg} stroke={active ? theme.color.accentHover : theme.color.textMuted} strokeWidth="1.5" rx="1" />
        {/* Window */}
        <rect x="25" y="51" width="10" height="8" rx="1" fill={active ? theme.color.accent : theme.color.border} opacity="0.6" />
        <rect x="55" y="51" width="10" height="8" rx="1" fill={active ? theme.color.accent : theme.color.border} opacity="0.6" />
        {/* Door */}
        <rect x="40" y="55" width="8" height="13" rx="1" fill={active ? theme.color.accentHover : theme.color.textMuted} opacity="0.5" />
        {/* Roof shape */}
        <path d={item.icon} fill={active ? theme.color.accent : theme.color.border} stroke={active ? theme.color.accentHover : theme.color.textMuted} strokeWidth="1.5" strokeLinejoin="round" opacity="0.85" />
        {/* Solar panel lines on roof */}
        {item.label === "Satteldach" && <>
          <rect x="22" y="30" width="8" height="5" fill={active ? theme.color.sky : theme.color.textSecondary} opacity="0.6" transform="rotate(-30 26 32)" rx="0.5" />
          <rect x="33" y="26" width="8" height="5" fill={active ? theme.color.sky : theme.color.textSecondary} opacity="0.6" transform="rotate(-30 37 28)" rx="0.5" />
        </>}
        {item.label === "Pultdach" && <>
          <rect x="20" y="30" width="10" height="5" fill={active ? theme.color.sky : theme.color.textSecondary} opacity="0.6" transform="rotate(-12 25 32)" rx="0.5" />
          <rect x="40" y="33" width="10" height="5" fill={active ? theme.color.sky : theme.color.textSecondary} opacity="0.6" transform="rotate(-12 45 35)" rx="0.5" />
          <rect x="60" y="36" width="10" height="5" fill={active ? theme.color.sky : theme.color.textSecondary} opacity="0.6" transform="rotate(-12 65 38)" rx="0.5" />
        </>}
        {item.label === "Flachdach" && <>
          <rect x="25" y="36" width="10" height="4" fill={active ? theme.color.sky : theme.color.textSecondary} opacity="0.6" rx="0.5" />
          <rect x="40" y="36" width="10" height="4" fill={active ? theme.color.sky : theme.color.textSecondary} opacity="0.6" rx="0.5" />
          <rect x="55" y="36" width="10" height="4" fill={active ? theme.color.sky : theme.color.textSecondary} opacity="0.6" rx="0.5" />
        </>}
        {item.label === "Walmdach" && <>
          <rect x="35" y="28" width="8" height="5" fill={active ? theme.color.sky : theme.color.textSecondary} opacity="0.6" rx="0.5" />
          <rect x="50" y="32" width="8" height="5" fill={active ? theme.color.sky : theme.color.textSecondary} opacity="0.6" rx="0.5" />
        </>}
      </svg>
      <div style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? theme.color.accentHover : theme.color.textSecondary }}>
        {item.label}
      </div>
      <div style={{ fontSize: 9, color: active ? theme.color.accentHover : theme.color.textMuted, marginTop: 1 }}>
        ~{Math.round(anzeigeFaktor * 100)}% nutzbar
      </div>
    </button>
  );
}
