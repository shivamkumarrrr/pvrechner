import theme from "../../../theme.js";
import TiltButton from "./TiltButton.jsx";

// Auto-Fit-Grid statt fester Spaltenzahl: breite Container zeigen die gewünschte Zahl an
// Spalten, schmale (Mobil) lassen die Optionen umbrechen statt sie auf Mini-Größe zu quetschen.
// Die Optionen sind Auswahl-Karten mit dezentem Tilt-on-Hover (TiltButton).
// `renderIcon?: (opt, active) => ReactNode` zeichnet ein Icon über dem Label (z. B. die
// Kompass-Nadeln der Dach-Ausrichtung) — rein textuelle Karten bleiben unverändert.
export default function OptionGroup({ options, selected, onSelect, minCol = 96, renderIcon }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${minCol}px, 1fr))`, gap: 8 }}>
      {options.map((opt) => {
        const label = typeof opt === "string" ? opt : opt.label;
        const active = selected === label;
        return (
          <TiltButton
            key={label}
            onClick={() => onSelect(label)}
            style={{
              padding: renderIcon ? "12px 6px 10px" : "10px 8px",
              borderRadius: 10,
              border: active ? `2px solid ${theme.color.accent}` : `1.5px solid ${theme.color.border}`,
              background: active ? theme.color.accentSubtle : theme.color.white,
              color: active ? theme.color.accentHover : theme.color.textSecondary,
              fontWeight: active ? 600 : 400,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {renderIcon && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 7 }}>{renderIcon(opt, active)}</div>
            )}
            {label}
          </TiltButton>
        );
      })}
    </div>
  );
}
