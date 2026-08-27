import theme from "../../../theme.js";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion.js";
import { DACHFORM, NEIGUNG } from "../../../lib/calculate.js";
import RoofIcon from "./RoofIcon.jsx";

// Live-Dach-Vorschau zur Neigungswahl: Das aktuell gewählte Dach-Icon wird
// per rotateX um die gewählte Neigung gekippt — flache Neigung = fast flach
// liegend (stark verkürzt), steile Neigung = deutlich aufgerichtet. Die
// Auswirkung der Auswahl ist damit sofort sichtbar, statt nur als Zahl.
// Transform entspricht (85° − Neigungswinkel): 10°→75°, 30°→55°, 50°→35°.
// Rein visuell — ändert keine Berechnung. prefers-reduced-motion: statische
// Ansicht ohne Kippen.
export default function Roof3DPreview({ dachform, neigung, size = 140 }) {
  const reduced = usePrefersReducedMotion();
  const form = DACHFORM.find((d) => d.label === dachform) || DACHFORM[0];
  const angle = NEIGUNG.find((n) => n.label === neigung)?.angle ?? 30;
  const tilt = reduced ? 0 : 85 - angle;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ perspective: 700, height: Math.round(size * 0.8), width: size }}>
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${tilt}deg)`,
            transition: reduced ? "none" : "transform 0.4s ease-out",
          }}
        >
          <RoofIcon item={form} active size={size} />
        </div>
      </div>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 11.5, color: theme.color.textMuted }}>Dachneigung</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
          {angle}°
        </div>
      </div>
    </div>
  );
}
