import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import { EINSPEISEVERGUETUNG_STAND, EINSPEISEVERGUETUNG_TEIL, EINSPEISEVERGUETUNG_VOLL } from "../../lib/calculate.js";

export default function EinspeiseverguetungInfo() {
  return (
    <section aria-labelledby="einspeisung-heading">
      <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", padding: "48px 20px" }}>
        <Reveal>
          <h2 id="einspeisung-heading" style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 10px" }}>
            Einspeisevergütung: aktueller Stand
          </h2>
          <p style={{ fontSize: 14, color: theme.color.textSecondary, lineHeight: 1.7, margin: "0 0 20px" }}>
            Strom, den Sie nicht selbst verbrauchen, speisen Sie ins öffentliche Netz ein und erhalten dafür
            eine gesetzlich garantierte Vergütung nach dem EEG. Die Höhe hängt davon ab, ob Sie einen Teil
            Ihres Stroms selbst nutzen (Teileinspeisung) oder die gesamte Erzeugung einspeisen (Volleinspeisung).
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ background: theme.color.bg, border: `1.5px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Teileinspeisung</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: theme.color.textPrimary }}>{(EINSPEISEVERGUETUNG_TEIL * 100).toFixed(1)} Ct<span style={{ fontSize: 13, fontWeight: 500 }}>/kWh</span></div>
              <div style={{ fontSize: 12, color: theme.color.textSecondary, marginTop: 2 }}>Anlagen bis 10 kWp</div>
            </div>
            <div style={{ background: theme.color.bg, border: `1.5px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Volleinspeisung</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: theme.color.textPrimary }}>{(EINSPEISEVERGUETUNG_VOLL * 100).toFixed(1)} Ct<span style={{ fontSize: 13, fontWeight: 500 }}>/kWh</span></div>
              <div style={{ fontSize: 12, color: theme.color.textSecondary, marginTop: 2 }}>Anlagen bis 10 kWp</div>
            </div>
          </div>
          <p style={{ fontSize: 11.5, color: theme.color.textMuted, lineHeight: 1.6, margin: 0 }}>
            Stand {EINSPEISEVERGUETUNG_STAND}. Die EEG-Vergütungssätze sinken halbjährlich (Degression) — für Ihre Anlage
            gilt der zum Zeitpunkt der Inbetriebnahme gültige Satz für 20 Jahre fest. Unser Rechner oben verwendet
            zur Ersparnis-Berechnung konservativ den Teileinspeisung-Satz.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
