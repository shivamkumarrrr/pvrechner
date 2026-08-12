import { useEffect, useRef, useState } from "react";
import theme from "../../../theme.js";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion.js";

// Teilt einen Wizard-Hauptschritt in granularere Sub-Screens auf (eine
// Entscheidung pro Screen). Gemeinsame UI:
//  - Dünner Mini-Fortschrittsbalken (3px, Akzentfarbe) — bewusst OHNE
//    "Unterschritt X von Y"-Text.
//  - Dezenter Text-Link "← Zurück" oben links ab dem zweiten Sub-Screen.
//  - Horizontale Slide+Fade-Transition (~350ms ease-out); bei
//    prefers-reduced-motion nur Fade (kein Versatz).
//
// `total`: Anzahl der Sub-Screens.
// `children`: Render-Prop bekommt { index, back, forward, autoAdvance, isLast }.
//   - `autoAdvance(apply?)` setzt zuerst `apply()` (falls gegeben), wartet
//     dann ~350ms und geht automatisch einen Screen weiter — für reine
//     Karten-Auswahlen (eine Entscheidung), ohne extra "Weiter"-Klick.
//   - `forward()` für Slider-/Mehrfach-Screens mit explizitem Weiter-Button.
// `onReadyChange`: wird aufgerufen, sobald der letzte Sub-Screen erreicht ist
//   (true) bzw. verlassen wird (false) — der Wizard nutzt das, um seinen
//   übergeordneten "Weiter →"-Button erst am Ende des Sub-Flows freizuschalten.
export default function SubFlow({ total, children, onReadyChange, onIndexChange, backRef }) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState("right");
  const timer = useRef(null);

  useEffect(() => {
    onReadyChange?.(index === total - 1);
    onIndexChange?.(index);
  }, [index, total, onReadyChange, onIndexChange]);

  // Expose the back() function to the parent Wizard so its own "← Zurück"
  // button can step back within the sub-flow instead of skipping it entirely.
  const backFn = useRef(null);
  backFn.current = () => go(index - 1, "left");
  useEffect(() => {
    if (backRef) backRef.current = backFn.current;
  });

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const go = (next, direction) => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    setDir(direction);
    setIndex(Math.max(0, Math.min(total - 1, next)));
  };

  const back = () => go(index - 1, "left");
  const forward = () => go(index + 1, "right");

  // Karten-Auswahl: Auswahl setzen, dann nach kurzer Verzögerung automatisch
  // weiter — der Nutzer sieht den Tap bestätigt, muss aber nicht klicken.
  const autoAdvance = (apply) => {
    if (apply) apply();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      go(index + 1, "right");
    }, 350);
  };

  const animation = reduced
    ? "subFadeIn 0.2s ease"
    : dir === "right"
      ? "subSlideInRight 0.55s ease-out"
      : "subSlideInLeft 0.55s ease-out";

  return (
    <>
      <style>{`
        @keyframes subSlideInRight { from { opacity: 0; transform: translateX(26px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes subSlideInLeft { from { opacity: 0; transform: translateX(-26px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes subFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 22, marginBottom: 14 }}>
        {index > 0 ? (
          <button
            onClick={back}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 12,
              fontWeight: 500,
              color: theme.color.textSecondary,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ← Zurück
          </button>
        ) : (
          <span />
        )}
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i <= index ? theme.color.accent : theme.color.border,
                transition: "background 0.25s",
              }}
            />
          ))}
        </div>
      </div>
      <div key={index} style={{ animation }}>
        {children({ index, back, forward, autoAdvance, isLast: index === total - 1 })}
      </div>
    </>
  );
}
