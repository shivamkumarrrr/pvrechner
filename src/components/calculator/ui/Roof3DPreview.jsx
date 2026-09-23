import theme from "../../../theme.js";
import { NEIGUNG } from "../../../lib/calculate.js";
import { useAnimatedNumber } from "../../../lib/useAnimatedNumber.js";

// Maßstäbliche Seitenansicht zur Neigungswahl: Die Dachfläche wird im exakt
// gewählten Winkel gezeichnet (Winkelbogen + Gradzahl an der Traufe), die
// Module liegen auf der sonnenzugewandten Seite. Ersetzt die frühere
// rotateX-Kippung, die den Winkel nur perspektivisch angedeutet hat und
// dadurch falsch aussah (30° wirkte wie ~10°).
// Rein visuell — ändert keine Berechnung. Der Winkel animiert weich
// (useAnimatedNumber respektiert prefers-reduced-motion).
const W = 300;
const H = 170;
const GROUND = 150;
const WALL_TOP = 108;
const rad = (d) => (d * Math.PI) / 180;

function geometry(dachform, a) {
  const t = Math.tan(rad(a));
  if (dachform === "Pultdach" || dachform === "Flachdach") {
    // Pultdach: eine Dachfläche über die ganze Hausbreite (niedrig rechts).
    const x0 = 88, x1 = 192, over = 10;
    const rise = (x1 - x0) * t;
    return {
      house: `M${x0} ${GROUND} L${x0} ${WALL_TOP - rise} L${x1} ${WALL_TOP} L${x1} ${GROUND} Z`,
      roof: [[x0 - over, WALL_TOP - rise - over * t], [x1 + over, WALL_TOP + over * t]],
      eave: [x1, WALL_TOP],
    };
  }
  // Sattel-/Walmdach: symmetrischer Giebel, Module auf der rechten Seite.
  const x0 = 80, x1 = 200, mid = (x0 + x1) / 2, over = 10;
  const rise = (mid - x0) * t;
  const peak = [mid, WALL_TOP - rise];
  return {
    house: `M${x0} ${GROUND} L${x0} ${WALL_TOP} L${mid} ${WALL_TOP - rise} L${x1} ${WALL_TOP} L${x1} ${GROUND} Z`,
    roofLeft: [[x0 - over, WALL_TOP + over * t], peak],
    roof: [peak, [x1 + over, WALL_TOP + over * t]],
    eave: [x1, WALL_TOP],
  };
}

export default function Roof3DPreview({ dachform, neigung }) {
  const selected = NEIGUNG.find((n) => n.label === neigung);
  const target = selected?.angle ?? 30;
  const a = useAnimatedNumber(target, { duration: 450 });
  const g = geometry(dachform, a);
  const [[rx0, ry0], [rx1, ry1]] = g.roof;

  // Module: Abschnitt der sonnenseitigen Dachfläche, leicht über der Dachhaut.
  const lerp = (p) => [rx0 + (rx1 - rx0) * p, ry0 + (ry1 - ry0) * p];
  const len = Math.hypot(rx1 - rx0, ry1 - ry0);
  const nx = (ry1 - ry0) / len, ny = -(rx1 - rx0) / len; // Normale nach außen (oben)
  const off = 5;
  const [p0x, p0y] = lerp(0.14);
  const [p1x, p1y] = lerp(0.8);
  const modules = 4;

  // Winkelbogen außen an der Traufe: zwischen Horizontale (nach rechts) und
  // der Verlängerung der Dachfläche nach unten-rechts — freie Fläche, der
  // Winkel ist identisch mit der Dachneigung und überlappt nichts.
  const [ex, ey] = g.eave;
  const r = 34;
  const arcEnd = [ex + r * Math.cos(rad(a)), ey + r * Math.sin(rad(a))];
  const labelPos = [ex + (r + 18) * Math.cos(rad(a / 2)) + 4, ey + (r + 18) * Math.sin(rad(a / 2)) + 5];

  const dim = !selected;

  // viewBox wächst nach oben mit, sobald das Dach (steile Neigung, v. a.
  // Pultdach) über den Standard-Rahmen hinausragt — nie abgeschnitten.
  const roofTop = Math.min(ry0, ry1, ...(g.roofLeft ? [g.roofLeft[0][1], g.roofLeft[1][1]] : []));
  const vbTop = Math.min(0, Math.floor(roofTop - 16));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <svg
        viewBox={`0 ${vbTop} ${W} ${H - vbTop}`}
        width="100%"
        style={{ maxWidth: 320, display: "block", opacity: dim ? 0.55 : 1, transition: "opacity 0.3s" }}
        role="img"
        aria-label={selected ? `Seitenansicht: Dach mit ${target} Grad Neigung` : "Seitenansicht: Dachneigung noch nicht gewählt"}
      >
        {/* Sonne */}
        <circle cx={262} cy={26} r={11} fill={theme.color.accent} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
          <line key={d}
            x1={262 + 16 * Math.cos(rad(d))} y1={26 + 16 * Math.sin(rad(d))}
            x2={262 + 21 * Math.cos(rad(d))} y2={26 + 21 * Math.sin(rad(d))}
            stroke={theme.color.accent} strokeWidth="2" strokeLinecap="round" />
        ))}

        {/* Boden */}
        <line x1={20} y1={GROUND} x2={W - 20} y2={GROUND} stroke={theme.color.border} strokeWidth="2" strokeLinecap="round" />

        {/* Haus */}
        <path d={g.house} fill={theme.color.white} stroke={theme.color.textPrimary} strokeWidth="2" strokeLinejoin="round" />
        {/* Tür + Fenster */}
        <rect x={132} y={GROUND - 26} width={16} height={26} rx={2} fill={theme.color.bg} stroke={theme.color.textPrimary} strokeWidth="1.5" />
        <rect x={100} y={GROUND - 30} width={18} height={14} rx={2} fill={theme.color.skySubtle} stroke={theme.color.textPrimary} strokeWidth="1.5" />
        <rect x={162} y={GROUND - 30} width={18} height={14} rx={2} fill={theme.color.skySubtle} stroke={theme.color.textPrimary} strokeWidth="1.5" />

        {/* Dachhaut */}
        {g.roofLeft && (
          <line x1={g.roofLeft[0][0]} y1={g.roofLeft[0][1]} x2={g.roofLeft[1][0]} y2={g.roofLeft[1][1]}
            stroke={theme.color.textPrimary} strokeWidth="5" strokeLinecap="round" />
        )}
        <line x1={rx0} y1={ry0} x2={rx1} y2={ry1} stroke={theme.color.textPrimary} strokeWidth="5" strokeLinecap="round" />

        {/* Module auf der Sonnenseite */}
        {Array.from({ length: modules }).map((_, i) => {
          const s = i / modules, e = (i + 1) / modules - 0.02;
          const ax = p0x + (p1x - p0x) * s + nx * off, ay = p0y + (p1y - p0y) * s + ny * off;
          const bx = p0x + (p1x - p0x) * e + nx * off, by = p0y + (p1y - p0y) * e + ny * off;
          return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={theme.color.brandNavy} strokeWidth="6" strokeLinecap="butt" />;
        })}

        {/* Winkel: Horizontale + Dach-Verlängerung (gestrichelt), Bogen, Gradzahl */}
        <line x1={ex} y1={ey} x2={ex + r + 14} y2={ey} stroke={theme.color.accentText} strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1={ex} y1={ey} x2={ex + (r + 14) * Math.cos(rad(a))} y2={ey + (r + 14) * Math.sin(rad(a))} stroke={theme.color.accentText} strokeWidth="1.5" strokeDasharray="3 3" />
        <path d={`M${ex + r} ${ey} A${r} ${r} 0 0 1 ${arcEnd[0]} ${arcEnd[1]}`} fill="none" stroke={theme.color.accentText} strokeWidth="2" />
        <text x={labelPos[0]} y={labelPos[1]} textAnchor="start" fontSize="13" fontWeight="700" fill={theme.color.accentText} style={{ fontFamily: theme.font.display }}>
          {Math.round(a)}°
        </text>
      </svg>
      <div style={{ fontSize: 13, color: theme.color.textSecondary, marginTop: 4 }}>
        {selected ? <>Dachneigung ca. <strong style={{ color: theme.color.textPrimary }}>{target}°</strong></> : "Bitte wählen Sie die Neigung"}
      </div>
    </div>
  );
}
