import { Component } from "react";
import theme from "../theme.js";
import { reportError } from "../lib/errors.js";

// Fängt Render-Fehler ab, damit ein Fehler in EINEM Teil der Seite nicht mehr
// die ganze Seite leer macht (so ein Absturz hat im Aug 2026 den gesamten
// Rechner lahmgelegt). Zwei Einsatzarten:
//   • `fallback` weggelassen: der Bereich verschwindet still (Marketing-Sektionen,
//     die Seite um sie herum funktioniert weiter)
//   • `fallback="page"` / "calculator": sichtbare Meldung mit "Neu laden"
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    reportError(error, "react", { component: info?.componentStack?.split("\n").find((l) => l.trim())?.trim() });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const { fallback } = this.props;
    if (!fallback) return null;

    const full = fallback === "page";
    return (
      <div role="alert" style={{
        maxWidth: 560,
        margin: full ? "20vh auto" : "24px auto",
        padding: "28px 24px",
        textAlign: "center",
        fontFamily: theme.font.family,
        color: theme.color.textPrimary,
        background: theme.color.white,
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.lg,
      }}>
        <div style={{ fontFamily: theme.font.display, fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          {full ? "Die Seite konnte nicht geladen werden" : "Der Rechner ist gerade nicht verfügbar"}
        </div>
        <p style={{ margin: "0 0 18px", fontSize: 15, lineHeight: 1.55, color: theme.color.textSecondary }}>
          Bitte laden Sie die Seite neu. Besteht das Problem weiter, versuchen Sie es in ein paar Minuten noch einmal.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            minHeight: 44, padding: "10px 24px", borderRadius: theme.radius.pill, cursor: "pointer",
            background: theme.color.accent, color: theme.color.onAccent, border: `1px solid ${theme.color.accent}`,
            fontFamily: theme.font.family, fontSize: 15, fontWeight: 600,
          }}
        >
          Seite neu laden
        </button>
      </div>
    );
  }
}
