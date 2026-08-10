import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion.js";

// Echte Hover-Fähigkeit statt bloßem `hover:`-Media-Feature prüfen: Touch-
// Geräte (auch Hybrid-Tablets) haben keinen Mauszeiger, auf denen ein
// Cursor-Tracking-Tilt nie ausgelöst wird. Dort bleibt der bestehende
// Tap-Zustand — kein Tilt.
function useSupportsHover() {
  const [hover, setHover] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = () => setHover(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return hover;
}

// Dezent er Tilt-on-Hover für Auswahl-Karten (Vorbild vercel/linear): Die
// Karte neigt sich leicht in Richtung der Mausposition (max ~7°, plus ein
// kleines translateZ für Tiefe). Dient dem Verständnis der Auswahl — nie der
// reinen Dekoration. Verhalten:
//  - `as="div"` für nicht-interaktive Karten, die eigene Controls enthalten
//    (z. B. VerbraucherCard mit Segmented) — dort kein Klick-Handler.
//  - Touch-/Stift-Geräte (kein Hover) und prefers-reduced-motion: keinerlei
//    Transform, die Karte bleibt eine normale Karte.
export default function TiltButton({ as = "button", children, onClick, style, disabled, maxDeg = 7, ...rest }) {
  const reduced = usePrefersReducedMotion();
  const hover = useSupportsHover();
  const ref = useRef(null);
  const [tilt, setTilt] = useState(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: (-py * maxDeg).toFixed(3), ry: (px * maxDeg).toFixed(3) });
  };

  const active = !reduced && hover;
  const transform = active && tilt
    ? `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(4px)`
    : "none";

  const baseTransition = style?.transition;
  const transition = active
    ? [baseTransition, "transform 0.18s ease-out"].filter(Boolean).join(", ")
    : baseTransition || "transform 0.18s ease-out";

  const Tag = as === "div" ? "div" : "button";

  return (
    <Tag
      ref={ref}
      {...(Tag === "button" ? { type: "button", disabled } : {})}
      onClick={onClick}
      onMouseMove={active ? onMove : undefined}
      onMouseLeave={active ? () => setTilt(null) : undefined}
      style={{
        ...style,
        transformStyle: "preserve-3d",
        transform,
        transition,
        willChange: active ? "transform" : undefined,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}



