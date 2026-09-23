import theme from "../../../theme.js";
import { IconSun, IconPlug, IconBolt, IconBattery } from "../../Icons.jsx";
import { useAnimatedNumber } from "../../../lib/useAnimatedNumber.js";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion.js";

// Flussbild der Jahresbilanz: das Haus in der Mitte, die vier Energieströme als
// Bögen daran. Gedacht als EIN Signature-Element der Live-Vorschau (Design-Regel
// 11) — deshalb ersetzt es dort den Autarkie-Ring und das Monatschart, statt
// neben ihnen zu stehen.
//
// Auf der Ergebnisseite bleibt es bewusst weg: dort erklärt `Energiebilanz.jsx`
// dieselben Zahlen als Balkenpaar, weil dort Autarkie vs. Eigenverbrauchsquote
// nebeneinander liegen müssen — das kann ein Flussbild nicht.
//
// Alles steckt in EINEM SVG mit fester viewBox. Die Beschriftung ist also
// Vektor und skaliert mit: bei 288px Kartenbreite (360px-Viewport) schrumpft
// der Text mit, statt aus seiner Box zu laufen.
//
// Farben sind dieselben wie in MonthlyChart/Energiebilanz — orange = selbst
// erzeugt/genutzt, sky = eingespeist, grau = aus dem Netz. Eine zweite Legende
// soll niemand lernen müssen. Keine Verläufe: Volltonlinien mit Deckkraft.
// Die Strichstärke der Bahnen folgt der Energiemenge (siehe `breite()`).
const NF = new Intl.NumberFormat("de-DE");

const W = 340;
const H = 322;
const R = 20; // Radius der Knoten-Kreise

// Strichstärke proportional zur Wurzel der Energiemenge (3–12px). So liest man
// auf einen Blick, welcher Strom der große ist — die Breite trägt Information,
// sie ist keine Dekoration. Wurzel statt linear, damit ein kleiner Netzbezug
// neben 9.000 kWh Erzeugung nicht zur Haarlinie wird.
function breite(wert, max, bereit) {
  if (!bereit || max <= 0 || wert <= 0) return 3;
  return 3 + 9 * Math.sqrt(Math.min(1, wert / max));
}

// Ein Strom: Bahn + wandernde Punkte + Knoten (Kreis mit Signet) + Wert.
function Strom({ pfad, farbe, tint, icon, cx, cy, textX, textY, anchor, label, wert, einheit = "kWh", staerke, fluss, bereit = true }) {
  const animiert = useAnimatedNumber(wert);
  const punkt = Math.max(3, staerke * 0.5);
  return (
    <g opacity={bereit ? 1 : 0.5}>
      <path d={pfad} fill="none" stroke={farbe} strokeWidth={staerke} strokeLinecap="round" opacity="0.2" style={{ transition: "stroke-width 0.5s ease" }} />
      {fluss && wert > 0 && (
        <path
          className="energiefluss-strom"
          d={pfad}
          fill="none"
          stroke={farbe}
          strokeWidth={punkt}
          strokeLinecap="round"
          strokeDasharray="0.1 13.9"
        />
      )}
      <circle cx={cx} cy={cy} r={R} fill={bereit ? tint : theme.color.white} stroke={farbe} strokeWidth="1.5" style={{ transition: "fill 0.4s ease" }} />
      <g transform={`translate(${cx - 10} ${cy - 10})`} style={{ color: farbe }}>{icon}</g>
      <text x={textX} y={textY} textAnchor={anchor} fontSize="12" fill={theme.color.textSecondary} fontFamily={theme.font.family}>
        {label}
      </text>
      <text
        x={textX}
        y={textY + 18}
        textAnchor={anchor}
        fontSize="15"
        fontWeight="700"
        fill={bereit ? theme.color.textPrimary : theme.color.textMuted}
        fontFamily={theme.font.family}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {bereit ? NF.format(Math.round(animiert)) : "–"}{" "}
        <tspan fontSize="11" fontWeight="500" fill={theme.color.textSecondary}>{bereit ? einheit : ""}</tspan>
      </text>
    </g>
  );
}

export default function Energiefluss({ result, speicherKwh, bereit = true }) {
  const { jahresertrag = 0, einspeisung = 0, eigenverbrauch = 0, gesamtVerbrauch = 0, speicherBeitrag = 0 } = result;
  const netzbezug = Math.max(0, gesamtVerbrauch - eigenverbrauch);
  const reduced = usePrefersReducedMotion();
  const mitSpeicher = bereit && speicherKwh > 0 && speicherBeitrag > 0;
  const fluss = !reduced && bereit;
  const max = Math.max(jahresertrag, gesamtVerbrauch, 1);

  const beschreibung = !bereit
    ? "Jahresbilanz: noch keine Angaben — sobald Dachform und Stromverbrauch feststehen, stehen hier die Werte."
    :
    `Jahresbilanz: Erzeugung ${NF.format(Math.round(jahresertrag))} Kilowattstunden, ` +
    `Einspeisung ${NF.format(Math.round(einspeisung))}, Netzbezug ${NF.format(Math.round(netzbezug))}, ` +
    (mitSpeicher ? `aus dem Speicher ${NF.format(Math.round(speicherBeitrag))}, ` : "") +
    `Hausverbrauch ${NF.format(Math.round(gesamtVerbrauch))} Kilowattstunden.`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={beschreibung} style={{ display: "block" }}>
      <style>{`
        .energiefluss-strom {
          animation: energieflussLauf 0.9s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .energiefluss-strom { animation: none; opacity: 0; }
        }
        @keyframes energieflussLauf {
          from { stroke-dashoffset: 14; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Erzeugung — von der Sonne aufs Dach. */}
      <Strom
        pfad="M170 56 L170 114"
        farbe={theme.color.accent}
        tint={theme.color.accentSubtle}
        icon={<IconSun size={20} />}
        cx={170} cy={34}
        textX={198} textY={30} anchor="start"
        label="Erzeugung" wert={jahresertrag} staerke={breite(jahresertrag, max, bereit)} fluss={fluss} bereit={bereit}
      />

      {/* Netzbezug — vom Netz ins Haus (Richtung zum Haus hin, wie der Strom
          fließt). */}
      <Strom
        pfad="M62 150 C94 150 96 200 118 200"
        farbe={theme.color.textMuted}
        tint={theme.color.bg}
        icon={<IconPlug size={20} />}
        cx={40} cy={150}
        textX={40} textY={190} anchor="middle"
        label="Netzbezug" wert={netzbezug} staerke={breite(netzbezug, max, bereit)} fluss={fluss} bereit={bereit}
      />

      {/* Einspeisung — vom Haus ins Netz. */}
      <Strom
        pfad="M222 200 C244 200 246 150 278 150"
        farbe={theme.color.sky}
        tint={theme.color.skySubtle}
        icon={<IconBolt size={20} />}
        cx={300} cy={150}
        textX={300} textY={190} anchor="middle"
        label="Einspeisung" wert={einspeisung} staerke={breite(einspeisung, max, bereit)} fluss={fluss} bereit={bereit}
      />

      {/* Speicher — steht immer da, damit die Grafik nicht springt; ohne
          Speicher zurückgenommen. `speicherBeitrag` ist der Mehr-Eigenverbrauch
          aus calculate.js, nicht hier nachgerechnet (Invariante 4). */}
        <Strom
          pfad="M170 274 L170 250"
          farbe={theme.color.brandNavy}
        tint={theme.color.bg}
          icon={<IconBattery size={20} />}
          cx={170} cy={296}
          textX={198} textY={292} anchor="start"
          label={speicherKwh > 0 ? `aus Speicher (${speicherKwh} kWh)` : "kein Speicher"}
          wert={mitSpeicher ? speicherBeitrag : 0}
          staerke={breite(mitSpeicher ? speicherBeitrag : 0, max, mitSpeicher)}
          fluss={fluss && mitSpeicher} bereit={mitSpeicher}
        />

      {/* Haus. Bewusst dieselbe Strichstärke wie die Signets in Icons.jsx.
          Der Hausverbrauch steht IM Haus — er ist die Größe, auf die alle
          Ströme hinauslaufen. */}
      <line x1="96" y1="248" x2="244" y2="248" stroke={theme.color.border} strokeWidth="1.5" strokeLinecap="round" />
      <g stroke={theme.color.textPrimary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M122 160 V248 H218 V160" fill={theme.color.white} />
        <path d="M130 118 H210 L234 160 H106 Z" fill={theme.color.white} />
      </g>
      {/* Modulfeld: das Dach ist die zum Betrachter geneigte Fläche (Trapez),
          darauf 2 × 4 Module. Bis September 2026 saß hier ein schräges Feld auf
          einem Giebeldach in Frontansicht — perspektivisch nicht auflösbar,
          es sah immer aufgeklebt aus. */}
      <g stroke={theme.color.accent} strokeLinejoin="round" strokeLinecap="round">
        <path d="M138 125 H202 L218 153 H122 Z" fill={theme.color.accentSubtle} strokeWidth="1.4" />
        <path d="M130 139 H210 M154 125 L146 153 M170 125 V153 M186 125 L194 153" fill="none" strokeWidth="0.9" opacity="0.8" />
      </g>
      <HausText gesamtVerbrauch={gesamtVerbrauch} bereit={bereit} />
    </svg>
  );
}

// Eigene Komponente, weil `useAnimatedNumber` ein Hook ist und der Wert im
// Haus nicht zum <Strom>-Muster passt (kein Bogen, kein eigener Farbton).
function HausText({ gesamtVerbrauch, bereit = true }) {
  const animiert = useAnimatedNumber(gesamtVerbrauch);
  return (
    <g fontFamily={theme.font.family} textAnchor="middle">
      <text x="170" y="192" fontSize="10.5" fill={theme.color.textSecondary}>Hausverbrauch</text>
      <text
        x="170" y="216" fontSize="18" fontWeight="700"
        fill={bereit ? theme.color.textPrimary : theme.color.textMuted}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {bereit ? NF.format(Math.round(animiert)) : "–"}
      </text>
      <text x="170" y="232" fontSize="10.5" fill={theme.color.textSecondary}>{bereit ? "kWh im Jahr" : ""}</text>
    </g>
  );
}
