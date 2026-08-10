import theme from "../../../theme.js";

// Voll breiter Weiter-Button für Sub-Screens, die einen expliziten Klick
// brauchen (Slider- oder Mehrfach-Entscheidungen). Die eine Akzentfarbe für
// den einen klaren Zweck (Weiter im Sub-Flow) — die Haupt-"Weiter →"-Schalt-
// fläche im Wizard bleibt bewusst dunkel.
export default function ContinueButton({ onClick, label = "Weiter →" }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: theme.radius.lg,
        border: "none",
        background: theme.color.accent,
        color: theme.color.white,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.15s, transform 0.1s",
        marginTop: 8,
      }}
      onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
      onMouseUp={(e) => e.target.style.transform = "scale(1)"}
    >
      {label}
    </button>
  );
}
