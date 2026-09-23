import { useEffect, useState } from "react";
import theme from "../theme.js";
import BrandLogo from "./BrandLogo.jsx";

const scrollToCalculator = () => {
  document.getElementById("rechner")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function Header() {
  // Header-CTA nur zeigen, wenn der Hero-CTA ("Ersparnis für mein Dach
  // berechnen") NICHT im Bild ist — sonst stehen zwei gleiche Aufforderungen
  // gleichzeitig auf dem Screen. Button bleibt im Layout (visibility), damit
  // die Header-Höhe stabil bleibt (die mobile Vorschau-Zeile klebt darunter).
  const [heroCtaVisible, setHeroCtaVisible] = useState(true);
  useEffect(() => {
    const el = document.getElementById("hero-cta");
    if (!el || typeof IntersectionObserver === "undefined") { setHeroCtaVisible(false); return; }
    const obs = new IntersectionObserver(([e]) => setHeroCtaVisible(e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
          aria-hidden={heroCtaVisible}
          tabIndex={heroCtaVisible ? -1 : 0}
          style={{
            visibility: heroCtaVisible ? "hidden" : "visible",
            opacity: heroCtaVisible ? 0 : 1,
            padding: "12px 20px",
            minHeight: 44,
            borderRadius: theme.radius.pill,
            border: "none",
            background: theme.color.accent,
            color: theme.color.onAccent,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "background-color 0.15s, transform 0.15s, opacity 0.2s, visibility 0.2s",
          }}
          onPointerEnter={(e) => { if (e.pointerType !== "mouse") return; e.currentTarget.style.background = theme.color.accentHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onPointerLeave={(e) => { e.currentTarget.style.background = theme.color.accent; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          Jetzt berechnen
        </button>
      </div>
    </header>
  );
}
