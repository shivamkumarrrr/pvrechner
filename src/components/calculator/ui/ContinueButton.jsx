import theme from "../../../theme.js";

// Weiter-Button für Sub-Screens, die einen expliziten Klick brauchen
// (Slider- oder Mehrfach-Entscheidungen). Optisch identisch mit dem
// Haupt-"Weiter →" im Wizard (rechtsbündig, gleiche Größe/Farbe), damit es
// nur EINEN Stil für die Weiter-Aktion gibt.
export default function ContinueButton({ onClick, label = "Weiter →", disabled = false }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      style={{
        opacity: disabled ? 0.45 : 1,
        padding: "14px 28px",
        borderRadius: 12,
        border: "none",
        background: theme.color.accent,
        color: theme.color.onAccent,
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background-color 0.15s, transform 0.1s, opacity 0.15s",
        marginTop: 8,
      }}
      onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
      onMouseUp={(e) => e.target.style.transform = "scale(1)"}
    >
      {label}
    </button>
    </div>
  );
}
