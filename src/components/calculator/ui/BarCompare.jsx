import theme from "../../../theme.js";

export default function BarCompare({ label1, val1, label2, val2, unit, color1, color2 }) {
  const max = Math.max(val1, val2);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 100, fontSize: 12, color: theme.color.textSecondary, textAlign: "right" }}>{label1}</div>
        <div style={{ flex: 1, height: 28, background: theme.color.bg, borderRadius: 6, overflow: "hidden" }}>
          <div
            style={{
              width: `${(val1 / max) * 100}%`,
              height: "100%",
              background: color1,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 8,
              fontSize: 12,
              fontWeight: 600,
              color: theme.color.white,
              transition: "width 0.6s ease",
            }}
          >
            {val1.toLocaleString("de-DE")} {unit}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 100, fontSize: 12, color: theme.color.textSecondary, textAlign: "right" }}>{label2}</div>
        <div style={{ flex: 1, height: 28, background: theme.color.bg, borderRadius: 6, overflow: "hidden" }}>
          <div
            style={{
              width: `${(val2 / max) * 100}%`,
              height: "100%",
              background: color2,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 8,
              fontSize: 12,
              fontWeight: 600,
              color: theme.color.white,
              transition: "width 0.6s ease",
            }}
          >
            {val2.toLocaleString("de-DE")} {unit}
          </div>
        </div>
      </div>
    </div>
  );
}
