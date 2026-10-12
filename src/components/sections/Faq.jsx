import { useState } from "react";
import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion.js";
import { IconChevronDown } from "../Icons.jsx";
import { SECTION_PAD } from "./sectionSpacing.js";

const FAQS = [
  // Reihenfolge nach Einwänden: Genauigkeit/Kosten zuerst. Die frühere
  // EEG-Umlage-Frage ist entfernt (Umlage seit 1.7.2022 abgeschafft, fragt
  // heute kaum noch jemand).
  {
    q: "Wie genau ist dieser Rechner?",
    a: "Wir verwenden reale Sonneneinstrahlungsdaten des EU-Programms PVGIS (Photovoltaic Geographical Information System, EU Science Hub), das auf Satellitenmessungen basiert — nicht auf einem bundesweiten Pauschalwert. Trotzdem bleibt jede Online-Berechnung eine Modellrechnung mit branchentypischen Annahmen, keine Vor-Ort-Vermessung: Die Ergebnisse sind belastbare Richtwerte für eine erste Einschätzung. Ein Fachbetrieb erstellt Ihnen nach einer Vor-Ort-Prüfung ein genaues, verbindliches Angebot.",
  },
  {
    q: "Was kostet eine Photovoltaikanlage?",
    a: "Eine typische Anlage für ein Einfamilienhaus (5–10 kWp) kostet laut Preisindex der Verbraucherzentrale (2026) rund 10.500–14.000 € ohne Speicher — kleine Anlagen sind je kWp deutlich teurer als große. Ein Batteriespeicher kostet laut Preisindex der Verbraucherzentrale je nach Größe rund 360–510 € pro kWh inklusive Installation, für typische 5–10 kWh also etwa 2.500–4.500 €. Seit 2023 fällt darauf keine Mehrwertsteuer mehr an. Mit Speicher amortisiert sich eine Anlage laut ADAC meist in 9 bis 15 Jahren — wie schnell genau, hängt von Ausrichtung, Verbrauch und Anlagengröße ab.",
  },
  // EEG-2027-Fragen: Stand = Regierungsentwurf vom 29.7.2026 (Quellen im Block
  // "EEG 2027" in calculate.js). Nach Verabschiedung des Gesetzes prüfen.
  {
    q: "Was ändert sich 2027 bei der Einspeisevergütung?",
    a: "Für neue Anlagen, die ab dem 1. Januar 2027 in Betrieb gehen, soll die feste Einspeisevergütung über 20 Jahre entfallen. Nach dem Regierungsentwurf zum EEG 2027 erhalten kleine Anlagen zunächst eine Übergangszahlung von 5,2 Ct/kWh für bis zu drei Jahre. Danach wird der überschüssige Strom über einen Direktvermarkter zum Marktwert verkauft, bei Anlagen unter 25 kW bis zu vier Jahre lang mit einem Bonus von 1,5 Ct/kWh. Anlagen, die vor dem 1. Januar 2027 in Betrieb gehen, behalten ihren festen Satz für 20 Jahre — maßgeblich ist die Inbetriebnahme, nicht die Bestellung. Wichtig: Das Gesetz ist noch nicht beschlossen, der Bundesrat hat Änderungen gefordert — Details können sich ändern.",
  },
  {
    q: "Lohnt sich Photovoltaik ohne feste Einspeisevergütung?",
    a: "In den meisten Fällen ja — denn der größte Teil der Ersparnis kam schon bisher aus dem Eigenverbrauch, nicht aus der Einspeisung. Jede selbst genutzte Kilowattstunde spart rund 37 Ct Netzstrom, eingespeist bringt sie nur wenige Cent. Entscheidend ist deshalb, wie viel Solarstrom im Haus bleibt: Speicher, Wallbox, Wärmepumpe und ein Energiemanagement, das sie zur richtigen Zeit einschaltet, werden wichtiger als die Vergütung. Unser Rechner rechnet für Neuanlagen bereits mit dem geplanten Modell ab 2027.",
  },
  {
    q: "Was ist MiSpeL und was bringt es mir?",
    a: "MiSpeL steht für die Festlegung der Bundesnetzagentur zur „Marktintegration von Speichern und Ladepunkten“, erlassen am 1. Oktober 2026. Sie regelt, dass ein Heimspeicher oder ein bidirektional ladendes E-Auto auch Netzstrom aufnehmen darf, ohne dass die Förderung für den gespeicherten Solarstrom verloren geht. Mit einem dynamischen Stromtarif kann der Speicher so zum Beispiel bei günstigen Börsenpreisen laden und teuren Netzstrom am Abend ersetzen. Bis Ende September 2027 gilt eine Übergangsphase, in der Netz- und Messstellenbetreiber zustimmen müssen. Feste Mehrerlöse lassen sich daraus nicht versprechen — wie viel es bringt, hängt von Stromtarif, Steuerung und Verbrauch ab.",
  },
  {
    q: "Kann ich meinen Solarstrom als Privatperson direkt vermarkten?",
    a: "Ja. Für neue Anlagen ab 2027 ist das nach dem Regierungsentwurf sogar der vorgesehene Weg: Nach der Übergangszahlung verkauft ein Direktvermarkter Ihren Überschuss zum Marktwert an der Strombörse und bündelt dafür viele kleine Anlagen. Er behält dafür eine Vermarktungsgebühr ein; bei negativen Börsenpreisen gibt es keine Zahlung. Ob es sich lohnt, die Einspeisung mit Speicher und Energiemanagement in teurere Stunden zu verschieben, hängt vom Vertrag ab: Manche Direktvermarkter rechnen mit einem Monatsmittel ab, andere steuern die Einspeisung aus dem Speicher nach den Börsenpreisen. Üblich sind eine monatliche Grundgebühr und rund 1 Ct pro verkaufter Kilowattstunde. Voraussetzung ist ein intelligentes Messsystem (Smart Meter) — für Solaranlagen über 7 kW ist es ohnehin Pflicht.",
  },
  {
    q: "Lohnt sich ein Batteriespeicher?",
    a: "Ohne Speicher decken Sie mit einer typischen Anlage etwa 30–40 % Ihres Stromverbrauchs selbst — der Rest kommt aus dem Netz. Mit passend dimensioniertem Speicher sind meist 55–75 % möglich (Simulationen der HTW Berlin). Der Speicher kostet zusätzlich Geld, rechnet sich aber umso eher, je weniger eingespeister Strom einbringt: Für neue Anlagen ab 2027 ist jede gespeicherte Kilowattstunde, die abends teuren Netzstrom ersetzt, deutlich mehr wert als ihre Einspeisung. Seit Oktober 2026 darf ein Speicher zudem unter bestimmten Voraussetzungen auch günstigen Netzstrom laden (MiSpeL-Festlegung der Bundesnetzagentur) — mit dynamischem Stromtarif und Energiemanagement kann das zusätzlich sparen. Ob sich die Mehrinvestition für Sie lohnt, hängt von Ihrem Verbrauchsprofil ab — genau das zeigt Ihnen der Speicher-Vergleich im Rechner oben.",
  },
];

// Personalisierung GENAU EINES FAQ-Eintrags (Speicher) nach abgeschlossenem
// Wizard-Durchlauf. Werte kommen ausschließlich aus dem bereits berechneten
// Ergebnis (result.autarkie, speicherKwh) — keine neue Rechnung, keine
// erfundenen Zahlen. Ohne abgeschlossenen Durchlauf bleibt der Eintrag generisch.
const SPEICHER_FAQ_Q = "Lohnt sich ein Batteriespeicher?";
function antwortMitPersoenlich(original, wizardResult) {
  if (!wizardResult) return original;
  const pct = Math.round(wizardResult.result.autarkie);
  const speicher = wizardResult.speicherKwh > 0;
  const satz = speicher
    ? ` In Ihrer Berechnung oben erreichen Sie mit ${wizardResult.speicherKwh} kWh Speicher einen Autarkiegrad von ${pct}% Ihres Verbrauchs.`
    : ` In Ihrer Berechnung oben liegt Ihre Autarkie ohne Speicher bei ${pct}%.`;
  return `${original}${satz}`;
}

export default function Faq({ wizardResult }) {
  const reduced = usePrefersReducedMotion();
  const [openIndex, setOpenIndex] = useState(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section aria-labelledby="faq-heading" style={{ background: theme.color.bg }}>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <style>{`
        .faq-grid { display: grid; grid-template-columns: 1fr; gap: 28px; }
        @media (min-width: 900px) {
          .faq-grid { grid-template-columns: 4fr 7fr; gap: 64px; align-items: start; }
          .faq-intro { position: sticky; top: 104px; }
        }
        .faq-list { border-top: 1px solid ${theme.color.border}; }
        .faq-item { border-bottom: 1px solid ${theme.color.border}; }
        .faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 22px 0; min-height: 44px; background: none; border: none; cursor: pointer; text-align: left; font-family: ${theme.font.display}; font-size: 18px; font-weight: 600; line-height: 1.35; color: ${theme.color.textPrimary}; letter-spacing: -0.2px; }
        .faq-q:hover { color: ${theme.color.accentText}; }
        .faq-q:focus-visible { outline: 2px solid ${theme.color.accent}; outline-offset: 4px; border-radius: 6px; }
        .faq-toggle { width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid ${theme.color.border}; background: ${theme.color.white}; color: ${theme.color.textPrimary}; }
        .faq-item.is-open .faq-toggle { background: ${theme.color.accent}; border-color: ${theme.color.accent}; color: ${theme.color.onAccent}; }
        .faq-toggle svg { stroke-width: 2.4; }
        .faq-a { padding: 0 56px 24px 0; }
        @media (max-width: 899px) { .faq-q { font-size: 16px; padding: 18px 0; } .faq-a { padding: 0 0 20px; } }
      `}</style>
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: `${SECTION_PAD} 20px` }}>
        <div className="faq-grid">
          <Reveal className="faq-intro">
            <h2 id="faq-heading" style={{ ...theme.type.h2, color: theme.color.textPrimary, margin: "0 0 14px" }}>
              Häufig gestellte Fragen
            </h2>
            <p style={{ fontSize: 16, color: theme.color.textSecondary, lineHeight: 1.6, margin: "0 0 22px", maxWidth: 360 }}>
              Die Fragen, die Hausbesitzer vor der Entscheidung am häufigsten stellen — kurz und ehrlich beantwortet.
            </p>
            <button
              type="button"
              onClick={() => document.getElementById("rechner")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })}
              style={{ minHeight: 44, padding: "11px 20px", borderRadius: theme.radius.pill, border: `1px solid ${theme.color.textPrimary}`, background: "transparent", color: theme.color.textPrimary, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Eigene Zahlen berechnen
            </button>
          </Reveal>

          <div className="faq-list">
            {FAQS.map((faq, i) => {
              const open = openIndex === i;
              const id = `faq-a-${i}`;
              return (
                <Reveal key={faq.q} delay={Math.min(i, 4) * 40} className={`faq-item${open ? " is-open" : ""}`}>
                  <h3 style={{ margin: 0 }}>
                    <button className="faq-q" onClick={() => setOpenIndex(open ? null : i)} aria-expanded={open} aria-controls={id}>
                      {faq.q}
                      <span className="faq-toggle" aria-hidden="true" style={{
                        transform: `rotate(${open ? 180 : 0}deg)`,
                        transition: reduced ? "none" : "transform 0.3s ease, background-color 0.2s, border-color 0.2s",
                      }}>
                        <IconChevronDown size={18} />
                      </span>
                    </button>
                  </h3>
                  <div id={id} role="region" style={{
                    display: "grid",
                    gridTemplateRows: open ? "1fr" : "0fr",
                    transition: reduced ? "none" : "grid-template-rows 0.35s ease",
                  }}>
                    <div style={{ overflow: "hidden", minHeight: 0 }}>
                      <p className="faq-a" style={{ margin: 0, fontSize: 16, color: theme.color.textSecondary, lineHeight: 1.7, maxWidth: 680 }}>
                        {faq.q === SPEICHER_FAQ_Q ? antwortMitPersoenlich(faq.a, wizardResult) : faq.a}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
