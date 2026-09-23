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

const ANTEIL_NETTO = (NETTOPREIS / PREIS_MIT_MWST) * 100; // Balkenlänge, rein visuell

export default function MwstRechenbeispiel() {
  const eur = (v) => `${v.toLocaleString("de-DE")} €`;
  return (
    <section aria-labelledby="mwst-heading" style={{ background: theme.color.bg }}>
      <style>{`
        .mwst-grid { display: grid; grid-template-columns: 1fr; gap: 28px; align-items: center; }
        @media (min-width: 900px) { .mwst-grid { grid-template-columns: 5fr 6fr; gap: 64px; } }
        .mwst-card { background: ${theme.color.white}; border: 1px solid ${theme.color.border}; border-radius: ${theme.radius.lg}px; padding: 26px 26px 22px; }
        .mwst-row { margin-bottom: 18px; }
        .mwst-row__top { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 8px; font-size: 14px; color: ${theme.color.textSecondary}; }
        .mwst-bar { height: 12px; border-radius: 6px; background: ${theme.color.bg}; overflow: hidden; }
        .mwst-bar > div { height: 100%; border-radius: 6px; }
        @media (max-width: 899px) { .mwst-card { padding: 22px 18px 18px; } }
      `}</style>
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: "72px 20px" }}>
        <div className="mwst-grid">
          <Reveal>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: theme.color.accentText, marginBottom: 10 }}>
              Steuervorteil seit 2023
            </div>
            <div style={{ fontFamily: theme.font.display, fontSize: "clamp(64px, 9vw, 104px)", fontWeight: 700, letterSpacing: -3, lineHeight: 0.95, color: theme.color.textPrimary }}>
              0<span style={{ color: theme.color.accent }}>%</span>
            </div>
            <h2 id="mwst-heading" style={{ fontFamily: theme.font.display, fontSize: "clamp(22px, 2.6vw, 28px)", fontWeight: 600, letterSpacing: -0.3, color: theme.color.textPrimary, margin: "8px 0 14px" }}>
              Mehrwertsteuer auf Ihre Solaranlage
            </h2>
            <p style={{ fontSize: 16, color: theme.color.textSecondary, lineHeight: 1.65, margin: 0, maxWidth: 480 }}>
              Seit 2023 gilt für private Photovoltaikanlagen bis 30 kWp der sogenannte Nullsteuersatz:
              Sie zahlen auf Module, Wechselrichter, Montage und Speicher keine 19% Mehrwertsteuer mehr.
              Der Preis, den Ihnen ein Fachbetrieb nennt, ist bereits der Endpreis — ohne Aufschlag.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="mwst-card">
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 20 }}>
                Rechenbeispiel: {BEISPIEL_KWP} kWp Anlage
              </div>

              <div className="mwst-row">
                <div className="mwst-row__top">
                  <span>Preis mit 19% MwSt. (bis 2022)</span>
                  <span style={{ fontWeight: 600, color: theme.color.textMuted, textDecoration: "line-through", fontVariantNumeric: "tabular-nums" }}>{eur(PREIS_MIT_MWST)}</span>
                </div>
                <div className="mwst-bar"><div style={{ width: "100%", background: theme.color.border }} /></div>
              </div>

              <div className="mwst-row">
                <div className="mwst-row__top">
                  <span style={{ color: theme.color.textPrimary, fontWeight: 600 }}>Preis ohne Mehrwertsteuer (heute)</span>
                  <span style={{ fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{eur(NETTOPREIS)}</span>
                </div>
                <div className="mwst-bar"><div style={{ width: `${ANTEIL_NETTO}%`, background: theme.color.accent }} /></div>
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                marginTop: 22, padding: "14px 16px", borderRadius: theme.radius.md,
                background: theme.color.successSubtle,
              }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: theme.color.success }}>Ihre Ersparnis</span>
                <span style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 700, color: theme.color.success, fontVariantNumeric: "tabular-nums" }}>{eur(ERSPARNIS)}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
