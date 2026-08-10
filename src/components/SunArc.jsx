import theme from "../theme.js";

// The one signature illustration for the whole page: a sun tracing its arc
// over a roofline, evoking both "solar yield over the day" and the literal
// product (a roof with panels). Used large in the Hero and echoed small in
// the result header — nowhere else, so it stays a single strong motif
// instead of competing with a handful of minor decorations.
export default function SunArc({ variant = "hero", onDark = true }) {
  const large = variant === "hero";
  const w = large ? 340 : 130;
  const h = large ? 190 : 76;

  // Roofline strokes must read on whatever sits behind them: white on the
  // dark result-header panel, dark text-muted on the light hero surface.
  const roof = onDark ? "rgba(255,255,255,0.5)" : theme.color.textSecondary;
  const base = onDark ? "rgba(255,255,255,0.28)" : theme.color.border;

  return (
    <svg width={w} height={h} viewBox="0 0 340 190" role="img" aria-label="Sonnenverlauf über einem Hausdach mit Solarmodulen" style={{ display: "block", margin: large ? "0 auto" : undefined }}>
      {/* Arc path (sun's daily trajectory) */}
      <path d="M20 150 A150 150 0 0 1 320 150" fill="none" stroke={theme.color.accent} strokeWidth={large ? 2 : 1.5} strokeDasharray="1 9" strokeLinecap="round" opacity="0.55" />
      {/* Sun, positioned along the arc */}
      <circle cx="245" cy="70" r={large ? 16 : 8} fill={theme.color.accent} opacity="0.95" />
      <circle cx="245" cy="70" r={large ? 26 : 13} fill="none" stroke={theme.color.accent} strokeWidth="1" opacity="0.3" />

      {/* Roofline */}
      <path d="M40 150 L170 90 L300 150" fill="none" stroke={roof} strokeWidth={large ? 2.5 : 2} strokeLinejoin="round" />
      <path d="M60 150 L60 178 L280 178 L280 150" fill="none" stroke={base} strokeWidth={large ? 2 : 1.5} />

      {/* Panels on the roof slopes */}
      {[
        [90, 128, -32], [118, 112, -32], [146, 96, -32],
        [196, 96, 32], [224, 112, 32], [252, 128, 32],
      ].map(([x, y, rot], i) => (
        <rect key={i} x={x - 11} y={y - 5} width="22" height="10" rx="1.5"
          fill={theme.color.accent} opacity={large ? 0.9 : 0.75}
          transform={`rotate(${rot} ${x} ${y})`} />
      ))}
    </svg>
  );
}
