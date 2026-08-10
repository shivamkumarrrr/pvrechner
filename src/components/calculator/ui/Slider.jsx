import { useState } from "react";
import theme from "../../../theme.js";

export default function Slider({ value, onChange, min, max, step, unit, label }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(String(value));

  const commit = () => {
    let n = parseFloat(temp.replace(/\./g, "").replace(",", "."));
    if (isNaN(n)) n = min;
    n = Math.max(min, Math.min(max, n));
    n = Math.round(n / step) * step;
    onChange(n);
    setTemp(String(n));
    setEditing(false);
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500 }}>{label}</span>
        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              autoFocus
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              style={{
                width: 72,
                fontSize: 16,
                fontWeight: 700,
                color: theme.color.textPrimary,
                border: `1.5px solid ${theme.color.accent}`,
                borderRadius: 8,
                padding: "4px 8px",
                textAlign: "right",
                outline: "none",
                fontVariantNumeric: "tabular-nums",
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.color.textSecondary }}>{unit}</span>
          </div>
        ) : (
          <span
            onClick={() => { setTemp(String(value)); setEditing(true); }}
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: theme.color.textPrimary,
              fontVariantNumeric: "tabular-nums",
              cursor: "text",
              padding: "2px 8px",
              borderRadius: 6,
              border: "1.5px dashed transparent",
              transition: "border 0.15s",
            }}
            onMouseEnter={(e) => e.target.style.borderColor = theme.color.border}
            onMouseLeave={(e) => e.target.style.borderColor = "transparent"}
            title="Klicken zum Bearbeiten"
          >
            {value.toLocaleString("de-DE")} {unit}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: theme.color.accent, height: 6, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: theme.color.textMuted, marginTop: 4 }}>
        <span>{min.toLocaleString("de-DE")} {unit}</span>
        <span>{max.toLocaleString("de-DE")} {unit}</span>
      </div>
    </div>
  );
}
