import theme from "../../../theme.js";

// Kompass-Icon für die Dach-Ausrichtungs-Optionen (Süd, Südwest, …): ein
// Kreisring mit Himmelsrichtungs-Strichen, dessen Nadel auf die jeweilige
// Himmelsrichtung zeigt. Gleiche Linien-Sprache wie die Dachform-Icons
// (Icons.jsx/DachformCard): dünne Striche, currentColor, keine Emojis.
const ANGLE = {
  Nord: 0,
  Ost: 90,
  Südost: 135,
  Süd: 180,
  Südwest: 225,
  West: 270,
};

export default function AusrichtungIcon({ label, active, size = 72 }) {
  const deg = ANGLE[label] ?? 0;
  const c = active ? theme.color.accent : theme.color.textSecondary;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={`Ausrichtung ${label}`}>
      <circle cx="24" cy="24" r="19" fill="none" stroke={c} strokeWidth="2.5" opacity={active ? 0.8 : 0.55} />
      <path d="M24 2.5v3.5M24 42v3.5M2.5 24H6M42 24h3.5" stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
      <g transform={`rotate(${deg} 24 24)`}>
        <path d="M24 8.5 28.5 25 24 21.5 19.5 25Z" fill={c} />
        <circle cx="24" cy="7" r="2.4" fill={c} />
      </g>
      <circle cx="24" cy="24" r="2" fill={c} />
    </svg>
  );
}
