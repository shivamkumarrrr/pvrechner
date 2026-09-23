import theme from "../../../theme.js";

// Eigene, klar lesbare Dachform-Illustrationen (viewBox 100×80): weiße
// Hauswand mit dunkler Kontur, Dachfläche als kräftige Form, Module in
// Marken-Navy genau dort, wo sie bei dieser Dachform typischerweise liegen.
// Aktiv: Dach in Markenorange.
export default function RoofIcon({ item, active, size = 60 }) {
  const ink = active ? theme.color.textPrimary : theme.color.textSecondary;
  const roof = active ? theme.color.accent : "#D5DADF";
  const panel = active ? theme.color.brandNavy : "#8A93A0";
  const wall = theme.color.white;
  const win = active ? theme.color.skySubtle : theme.color.bg;
  const common = { stroke: ink, strokeWidth: 2, strokeLinejoin: "round" };

  const windows = (y) => (
    <>
      <rect x="28" y={y} width="10" height="8" rx="1.5" fill={win} stroke={ink} strokeWidth="1.5" />
      <rect x="62" y={y} width="10" height="8" rx="1.5" fill={win} stroke={ink} strokeWidth="1.5" />
      <rect x="45" y="56" width="10" height="12" rx="1.5" fill={win} stroke={ink} strokeWidth="1.5" />
    </>
  );

  let body;
  switch (item.label) {
    case "Pultdach":
      body = (
        <>
          <path d="M20 68 L20 30 L80 44 L80 68 Z" fill={wall} {...common} />
          <path d="M13 27 L87 44 L87 49 L13 32 Z" fill={roof} {...common} />
          <path d="M24 26.5 L76 38.4 L76 34.4 L24 22.5 Z" fill={panel} />
          {[37, 50, 63].map((x) => <line key={x} x1={x} y1={22.5 + (x - 24) * 0.229 - 0.5} x2={x} y2={26.5 + (x - 24) * 0.229 + 0.5} stroke={wall} strokeWidth="1.2" />)}
          {windows(50)}
        </>
      );
      break;
    case "Flachdach":
      body = (
        <>
          <rect x="18" y="38" width="64" height="30" fill={wall} {...common} />
          <rect x="14" y="33" width="72" height="6" rx="1" fill={roof} {...common} />
          {/* aufgeständerte Module */}
          {[22, 42, 62].map((x) => (
            <g key={x}>
              <path d={`M${x} 32 L${x + 14} 24 L${x + 16} 27 L${x + 2} 33 Z`} fill={panel} />
              <line x1={x + 14} y1={27} x2={x + 14} y2={33} stroke={ink} strokeWidth="1.2" />
            </g>
          ))}
          {windows(46)}
        </>
      );
      break;
    case "Walmdach":
      body = (
        <>
          <rect x="20" y="44" width="60" height="24" fill={wall} {...common} />
          <path d="M12 47 L34 20 L66 20 L88 47 Z" fill={roof} {...common} />
          <path d="M36 26 L64 26 L70 38 L30 38 Z" fill={panel} />
          <line x1="50" y1="26" x2="50" y2="38" stroke={wall} strokeWidth="1.2" />
          {windows(50)}
        </>
      );
      break;
    default: // Satteldach
      body = (
        <>
          <path d="M20 68 L20 44 L50 20 L80 44 L80 68 Z" fill={wall} {...common} />
          <path d="M12 48 L50 16 L88 48 L83 51 L50 23 L17 51 Z" fill={roof} {...common} />
          <path d="M55 24.5 L79 44.5 L83.5 41 L59.5 21 Z" fill={panel} />
          <line x1="63" y1="31.2" x2="67.5" y2="27.6" stroke={wall} strokeWidth="1.2" />
          <line x1="71" y1="37.9" x2="75.5" y2="34.3" stroke={wall} strokeWidth="1.2" />
          {windows(50)}
        </>
      );
  }

  return (
    <svg viewBox="0 0 100 80" style={{ width: size, height: Math.round(size * 0.8), display: "block" }} role="img" aria-label={`${item.label}-Illustration`}>
      <line x1="6" y1="68" x2="94" y2="68" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      {body}
    </svg>
  );
}
