import theme from "../../../theme.js";

// Kompass für die Dach-Ausrichtung: Himmelsrichtungs-Buchstaben (N oben),
// ein 45°-Sektor zeigt, wohin die Dachfläche blickt, in der Mitte ein
// Dach-Grundriss mit Firstlinie quer zur Blickrichtung. Die Sonne sitzt
// fest im Süden — so sieht man ohne Erklärung, wie gut eine Richtung zur
// Mittagssonne passt.
const ANGLE = { Nord: 0, Ost: 90, Südost: 135, Süd: 180, Südwest: 225, West: 270 };
const rad = (d) => ((d - 90) * Math.PI) / 180; // 0° = oben (Nord)

export default function AusrichtungIcon({ label, active, size = 72 }) {
  const deg = ANGLE[label] ?? 0;
  const ink = active ? theme.color.textPrimary : theme.color.textSecondary;
  const wedge = active ? theme.color.accent : "#C9CED3";
  const c = 32, R = 26;
  const a0 = rad(deg - 22.5), a1 = rad(deg + 22.5);
  const wedgePath = `M${c} ${c} L${c + R * Math.cos(a0)} ${c + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${c + R * Math.cos(a1)} ${c + R * Math.sin(a1)} Z`;
  const letters = [["N", 0], ["O", 90], ["S", 180], ["W", 270]];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={`Ausrichtung ${label}`}>
      <circle cx={c} cy={c} r={R} fill={active ? theme.color.white : theme.color.bg} stroke={ink} strokeWidth="1.5" opacity={active ? 1 : 0.8} />
      <path d={wedgePath} fill={wedge} opacity={active ? 0.9 : 1} />
      {letters.map(([t, d]) => (
        <text key={t} x={c + 20 * Math.cos(rad(d))} y={c + 20 * Math.sin(rad(d)) + 3} textAnchor="middle" fontSize="7.5" fontWeight="700" fill={t === "S" ? (active ? theme.color.accentText : ink) : ink} style={{ fontFamily: theme.font.display }}>{t}</text>
      ))}
      {/* Dach-Grundriss: Fläche blickt in Richtung `deg` */}
      <g transform={`rotate(${deg} ${c} ${c})`}>
        <rect x={c - 7} y={c - 5} width="14" height="10" rx="1" fill={theme.color.white} stroke={ink} strokeWidth="1.5" />
        <rect x={c - 7} y={c} width="14" height="5" rx="1" fill={active ? theme.color.brandNavy : "#8A93A0"} />
        <line x1={c - 7} y1={c} x2={c + 7} y2={c} stroke={ink} strokeWidth="1.5" />
      </g>
    </svg>
  );
}
