import { useState } from "react";
import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion.js";
import { IconChevronDown } from "../Icons.jsx";

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
    a: "Eine typische Anlage für ein Einfamilienhaus (5–10 kWp) kostet zwischen 7.000 und 14.000 € ohne Speicher. Mit Batteriespeicher kommen ca. 5.000–8.000 € dazu. Seit 2023 fällt darauf keine Mehrwertsteuer mehr an. Bei guter Ausrichtung und passendem Verbrauch rechnet sich die Investition häufig innerhalb von 8–13 Jahren.",
  },
  {
    q: "Wie spare ich Geld mit einer Photovoltaik-Anlage?",
    a: "Auf zwei Wegen. Erstens: Jede Kilowattstunde, die Sie selbst verbrauchen, spart Ihnen den vollen Strompreis von durchschnittlich rund 0,37 €/kWh — der Strom aus Ihrer eigenen Anlage kostet Sie übers Anlagenleben gerechnet nur wenige Cent pro Kilowattstunde. Zweitens: Den Strom, den Sie nicht selbst brauchen, speisen Sie ins Netz ein und erhalten dafür die gesetzlich garantierte Vergütung (die aktuellen Sätze weiter oben auf dieser Seite). Wie viel Sie insgesamt sparen, hängt von Dachgröße, Ausrichtung, Standort und Ihrem Verbrauch ab — bei gut geplanter Anlage summiert sich die Ersparnis über die übliche Lebensdauer von rund 25 Jahren auf mehrere tausend Euro. Die genaue Zahl für Ihre Situation liefert der Rechner oben.",
  },
  {
    q: "Lohnt sich ein Batteriespeicher?",
    a: "Ohne Speicher decken Sie je nach Anlagengröße ca. 30–55% Ihres Stromverbrauchs selbst — der Rest kommt aus dem Netz. Mit passend dimensioniertem Speicher steigt dieser Anteil auf bis zu 85%. Allerdings kostet der Speicher zusätzliches Geld, und diese Mehrinvestition verlängert die Amortisationszeit der Gesamtanlage in der Regel eher, als dass sie sie verkürzt — der Speicher rechnet sich vor allem dann, wenn ein großer Teil Ihres Verbrauchs in die Abend- und Nachtstunden fällt und sonst zu teurem Netzstrom-Preis zugekauft würde. Ob sich die Mehrinvestition für Sie wirtschaftlich lohnt, hängt von Ihrem Verbrauchsprofil ab — genau das zeigt Ihnen der ehrliche Speicher-Vergleich im Rechner oben.",
  },
  {
    q: "Wie viel Strom erzeugt eine Solaranlage in Deutschland?",
    a: "Im bundesweiten Durchschnitt produziert 1 kWp Solarleistung ca. 950–1.000 kWh Strom pro Jahr, je nach Region auch mehr. Eine typische 8-kWp-Anlage erzeugt also rund 7.600–8.000 kWh — genug für einen 4-Personen-Haushalt. Unser Rechner oben nutzt für Ihren genauen Standort echte PVGIS-Satellitendaten statt dieses bundesweiten Durchschnittswerts.",
  },
  {
    q: "Welche Ausrichtung und Neigung ist optimal für meine Solaranlage?",
    a: "Süd-Ausrichtung bei 25–35° Neigung bringt den höchsten Jahresertrag. Ost- oder West-Dächer verlieren dagegen nur ca. 10–15% Ertrag gegenüber Süd, liefern den Strom aber gleichmäßiger über den Tag verteilt — für den Eigenverbrauch morgens und abends oft ein Vorteil. Flachdächer (0–15°) verlieren durch die flachere Sonneneinstrahlung ebenfalls etwas Ertrag, lassen sich aber mit Aufständerung ausgleichen. Der Rechner oben berücksichtigt Ihre konkrete Ausrichtung und Neigung automatisch in der Ertragsberechnung.",
  },
  {
    q: "Welche Finanzierungsmöglichkeiten gibt es?",
    a: "Neben dem Kauf aus Eigenkapital sind zinsgünstige Kredite wie der KfW 270 (Erneuerbare Energien – Standard) verbreitet, ebenso Solar-Leasing- oder Pacht-Modelle ohne hohe Anfangsinvestition. Je nach Bundesland und Kommune gibt es zusätzlich regionale Förderprogramme. Ein Fachberater prüft mit Ihnen, welche Variante zu Ihrer Situation passt.",
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
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: "72px 20px" }}>
        <div className="faq-grid">
          <Reveal className="faq-intro">
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: theme.color.accentText, marginBottom: 10 }}>
              FAQ
            </div>
            <h2 id="faq-heading" style={{ fontFamily: theme.font.display, fontSize: "clamp(26px, 3.2vw, 36px)", fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.12, color: theme.color.textPrimary, margin: "0 0 14px" }}>
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
                      <p className="faq-a" style={{ margin: 0, fontSize: 15.5, color: theme.color.textSecondary, lineHeight: 1.7, maxWidth: 680 }}>
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
