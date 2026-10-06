import { useEffect, useRef, useState } from "react";
import theme from "../theme.js";
import {
  analyticsEnabled,
  readConsent,
  setConsent,
  CONSENT_OPEN_EVENT,
  CONSENT_CHANGE_EVENT,
} from "../lib/events.js";

// Einwilligungs-Banner für Statistik (Google Analytics über GTM).
// Erscheint nur, wenn eine GTM-ID konfiguriert ist UND noch keine
// Entscheidung vorliegt (oder sie älter als 12 Monate ist). "Ablehnen" und
// "Zustimmen" sind gleich groß und gleich gut erreichbar — kein Nudging.
export default function PrivacyChoice() {
  const [open, setOpen] = useState(() => analyticsEnabled() && readConsent() === null);
  const ref = useRef(null);
  const openedByUser = useRef(false);

  useEffect(() => {
    if (!analyticsEnabled()) return undefined;
    const reopen = () => {
      openedByUser.current = true;
      setOpen(true);
    };
    // Entscheidung in einem anderen Tab: Banner hier schließen.
    const close = () => { if (readConsent() !== null) setOpen(false); };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    window.addEventListener(CONSENT_CHANGE_EVENT, close);
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
      window.removeEventListener(CONSENT_CHANGE_EVENT, close);
    };
  }, []);

  // Wer das Banner bewusst über den Footer öffnet, bekommt den Fokus darauf
  // (Tastatur/Screenreader). Beim automatischen Erscheinen wird der Fokus
  // nicht gestohlen.
  useEffect(() => {
    if (open && openedByUser.current) ref.current?.focus();
  }, [open]);

  if (!open) return null;

  const decide = (granted) => {
    setConsent(granted);
    setOpen(false);
    openedByUser.current = false;
  };

  const btn = {
    flex: 1,
    minHeight: 44,
    padding: "10px 16px",
    borderRadius: theme.radius.pill,
    fontFamily: theme.font.family,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby="privacy-choice-title"
      tabIndex={-1}
      style={{
        position: "fixed",
        left: 12,
        bottom: 12,
        zIndex: 60,
        width: "min(440px, calc(100vw - 24px))",
        boxSizing: "border-box",
        padding: 18,
        background: theme.color.white,
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.floating,
        fontFamily: theme.font.family,
        color: theme.color.textPrimary,
        outline: "none",
      }}
    >
      <div id="privacy-choice-title" style={{ fontFamily: theme.font.display, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
        Nutzung messen?
      </div>
      <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.55, color: theme.color.textSecondary }}>
        Mit Ihrer Einwilligung messen wir mit Google Analytics, wie der Rechner genutzt wird,
        und verbessern ihn damit. Ohne Zustimmung wird nichts an Google übertragen.{" "}
        <a href="/datenschutz.html" style={{ color: theme.color.textPrimary, textUnderlineOffset: 3 }}>
          Datenschutz
        </a>
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={() => decide(false)}
          style={{ ...btn, background: theme.color.white, color: theme.color.textPrimary, border: `1px solid ${theme.color.textPrimary}` }}
        >
          Ablehnen
        </button>
        <button
          type="button"
          onClick={() => decide(true)}
          style={{ ...btn, background: theme.color.accent, color: theme.color.onAccent, border: `1px solid ${theme.color.accent}` }}
        >
          Zustimmen
        </button>
      </div>
    </div>
  );
}
