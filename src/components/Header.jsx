import theme from "../theme.js";
import BrandLogo from "./BrandLogo.jsx";

const scrollToCalculator = () => {
  document.getElementById("rechner")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function Header() {
  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 40,
      background: theme.color.bg,
      borderBottom: `1px solid ${theme.color.border}`,
    }}>
      <div style={{
        maxWidth: theme.maxWidthWide,
        margin: "0 auto",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <BrandLogo />
        <button
          onClick={scrollToCalculator}
          style={{
            padding: "9px 18px",
            borderRadius: theme.radius.pill,
            border: "none",
            background: theme.color.accent,
            color: theme.color.white,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "background-color 0.15s, transform 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = theme.color.accentHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = theme.color.accent; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          Jetzt berechnen
        </button>
      </div>
    </header>
  );
}
