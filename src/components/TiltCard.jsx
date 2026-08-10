import { useRef, useState } from "react";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion.js";
import { useSupportsHover } from "../lib/useSupportsHover.js";

// Dezenter Tilt-on-Hover für Kacheln/Logos (Vorbild vercel/linear, gleiche
// Technik wie TiltButton im Wizard): Die Kachel neigt sich leicht in Richtung
// der Mausposition (max ~7°, plus translateZ für Tiefe und weicherer Schatten).
// Ruhezustand: sehr leichter translateZ + dezenter Schatten, damit Kacheln
// auch ohne Interaktion leicht "schweben". Verhalten:
//  - Touch-/Stift-Geräte (kein Hover): keinerlei Tilt, normaler Tap-Zustand.
//  - prefers-reduced-motion: komplett flach/statisch — kein Tilt, kein
//    translateZ-Ruhezustand, kein Schatten-Elevation, keine Transitionen.
export default function TiltCard({ children, style, className, maxDeg = 7, idleDepth = 2, ...rest }) {
  const reduced = usePrefersReducedMotion();
  const hover = useSupportsHover();
  const ref = useRef(null);
  const [tilt, setTilt] = useState(null);

  const active = !reduced && hover;

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: (-py * maxDeg).toFixed(3), ry: (px * maxDeg).toFixed(3) });
  };

  const transform = active && tilt
    ? `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(10px)`
    : active
      ? `perspective(800px) translateZ(${idleDepth}px)`
      : "none";

  const boxShadow = active && tilt
    ? "0 10px 24px rgba(20,27,34,0.16)"
    : active
      ? "0 1px 3px rgba(20,27,34,0.08)"
      : "none";

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={active ? onMove : undefined}
      onMouseLeave={active ? () => setTilt(null) : undefined}
      style={{
        ...style,
        transformStyle: "preserve-3d",
        transform,
        boxShadow,
        transition: active ? "transform 0.18s ease-out, box-shadow 0.25s ease" : "none",
        willChange: active ? "transform" : undefined,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
