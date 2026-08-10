import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";

// Zählt beim ersten Erscheinen (IntersectionObserver) von 0 auf `target`
// hoch — easeOutCubic, ~1.4s. Läuft genau einmal; der Wert bleibt danach
// stehen (Ergebnis-Zahlen verändern sich nach dem ersten Render nicht mehr).
// prefers-reduced-motion: sofort der Endwert, kein Hochzählen.
// Liefert [ref, value] — ref an das zu beobachtende Element hängen.
export function useCountUpOnView(target, { duration = 1400, threshold = 0.3 } = {}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const [value, setValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const tween = () => {
      const from = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - from) / duration);
        setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // Bereits im Viewport (z. B. Ergebnis direkt nach "Berechnen" sichtbar)?
    // Dann sofort starten statt auf den ersten Observer-Callback zu warten —
    // vermeidet das sonst sichtbare Blitzen auf "0".
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh && rect.bottom > 0) {
      tween();
      return () => cancelAnimationFrame(raf);
    }

    if (typeof IntersectionObserver === "undefined") {
      tween();
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        tween();
      }
    }, { threshold });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, threshold, reduced]);

  return [ref, value];
}
