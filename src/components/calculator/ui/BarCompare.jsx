import theme from "../../../theme.js";

export default function BarCompare({ label1, val1, label2, val2, unit, color1, color2 }) {
  const max = Math.max(val1, val2, 1);
  // Negative Werte (Einspeisevergütung übersteigt Reststromkosten) haben keine
  // Balkenlänge — Label dann neben dem leeren Balken statt als Vollbalken.
  const bar = (val, color) => {
    const pct = Math.max(0, (val / max) * 100);
    const inside = pct >= 30;
    return (
      <div style={{ flex: 1, height: 28, background: theme.color.bg, borderRadius: 6, overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: inside ? 8 : 0, boxSizing: "border-box", fontSize: 12, fontWeight: 600, color: theme.color.white, transition: "width 0.6s ease" }}>
          {inside && `${val.toLocaleString("de-DE")} ${unit}`}
        </div>
        {!inside && (
          <span style={{ paddingLeft: 8, fontSize: 12, fontWeight: 600, color: theme.color.textPrimary, whiteSpace: "nowrap" }}>
            {val.toLocaleString("de-DE")} {unit}{val < 0 ? " (Vergütung > Kosten)" : ""}
          </span>
        )}
      </div>
    );
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 100, fontSize: 12, color: theme.color.textSecondary, textAlign: "right" }}>{label1}</div>
        {bar(val1, color1)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 100, fontSize: 12, color: theme.color.textSecondary, textAlign: "right" }}>{label2}</div>
        {bar(val2, color2)}
      </div>
    </div>
  );
}
