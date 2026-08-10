import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import { KOSTEN_PRO_KWP } from "../../lib/calculate.js";

// Seit 01.01.2023 gilt für die Lieferung und Installation kleiner PV-Anlagen
// (bis 30 kWp) an/auf Wohngebäuden der Nullsteuersatz (§12 Abs. 3 UStG) —
// keine Kalkulation mehr nötig, die 19% MwSt. fallen schlicht weg.
const BEISPIEL_KWP = 8;
const NETTOPREIS = BEISPIEL_KWP * KOSTEN_PRO_KWP;
const PREIS_MIT_MWST = Math.round(NETTOPREIS * 1.19);
const ERSPARNIS = PREIS_MIT_MWST - NETTOPREIS;

export default function MwstRechenbeispiel() {
  return (
    <section aria-labelledby="mwst-heading">
      <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", padding: "48px 20px" }}>
        <Reveal>
          <h2 id="mwst-heading" style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 10px" }}>
            0% Mehrwertsteuer auf Ihre Solaranlage
          </h2>
          <p style={{ fontSize: 14, color: theme.color.textSecondary, lineHeight: 1.7, margin: "0 0 20px" }}>
            Seit 2023 gilt für private Photovoltaikanlagen bis 30 kWp der sogenannte Nullsteuersatz:
            Sie zahlen auf Module, Wechselrichter, Montage und Speicher keine 19% Mehrwertsteuer mehr.
            Der Preis, den Ihnen ein Fachbetrieb nennt, ist bereits der Endpreis — ohne Aufschlag.
          </p>
          <div style={{
            background: theme.color.bg,
            border: `1.5px solid ${theme.color.border}`,
            borderRadius: theme.radius.lg,
            padding: "20px 22px",
          }}>
            <div style={{ fontSize: 12, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
              Rechenbeispiel: {BEISPIEL_KWP} kWp Anlage
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: theme.color.textSecondary, marginBottom: 8 }}>
              <span>Preis ohne Mehrwertsteuer (heute)</span>
              <span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{NETTOPREIS.toLocaleString("de-DE")} €</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: theme.color.textSecondary, marginBottom: 12 }}>
              <span>Preis mit 19% MwSt. (bis 2022)</span>
              <span style={{ fontWeight: 600, color: theme.color.textMuted, textDecoration: "line-through" }}>{PREIS_MIT_MWST.toLocaleString("de-DE")} €</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderTop: `1px solid ${theme.color.border}`, paddingTop: 12,
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: theme.color.success }}>Ihre Ersparnis</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: theme.color.success }}>{ERSPARNIS.toLocaleString("de-DE")} €</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
