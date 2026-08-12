import { useState } from "react";
import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion.js";
import { IconChevronDown } from "../Icons.jsx";

const FAQS = [
  {
    q: "Was kostet eine Photovoltaikanlage?",
    a: "Eine typische Anlage für ein Einfamilienhaus (5–10 kWp) kostet zwischen 7.000 und 14.000 € ohne Speicher. Mit Batteriespeicher kommen ca. 5.000–8.000 € dazu. Seit 2023 fällt darauf keine Mehrwertsteuer mehr an. Bei guter Ausrichtung und passendem Verbrauch rechnet sich die Investition häufig innerhalb von 8–13 Jahren.",
  },
  {
    q: "Wie spare ich Geld mit einer Photovoltaik-Anlage?",
    a: "Auf zwei Wegen. Erstens: Jede Kilowattstunde, die Sie selbst verbrauchen, spart Ihnen den vollen Strompreis von durchschnittlich rund 0,37 €/kWh — der Strom aus Ihrer eigenen Anlage kostet Sie übers Anlagenleben gerechnet nur wenige Cent pro Kilowattstunde. Zweitens: Den Strom, den Sie nicht selbst brauchen, speisen Sie ins Netz ein und erhalten dafür die gesetzlich garantierte Vergütung (die aktuellen Sätze weiter oben auf dieser Seite). Wie viel Sie insgesamt sparen, hängt von Dachgröße, Ausrichtung, Standort und Ihrem Verbrauch ab — bei gut geplanter Anlage summiert sich die Ersparnis über die übliche Lebensdauer von rund 25 Jahren auf mehrere tausend Euro. Die genaue Zahl für Ihre Situation liefert der Rechner oben.",
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
    q: "Lohnt sich ein Batteriespeicher?",
    a: "Ohne Speicher decken Sie je nach Anlagengröße ca. 30–55% Ihres Stromverbrauchs selbst — der Rest kommt aus dem Netz. Mit passend dimensioniertem Speicher steigt dieser Anteil auf bis zu 85%. Allerdings kostet der Speicher zusätzliches Geld, und diese Mehrinvestition verlängert die Amortisationszeit der Gesamtanlage in der Regel eher, als dass sie sie verkürzt — der Speicher rechnet sich vor allem dann, wenn ein großer Teil Ihres Verbrauchs in die Abend- und Nachtstunden fällt und sonst zu teurem Netzstrom-Preis zugekauft würde. Ob sich die Mehrinvestition für Sie wirtschaftlich lohnt, hängt von Ihrem Verbrauchsprofil ab — genau das zeigt Ihnen der ehrliche Speicher-Vergleich im Rechner oben.",
  },
  {
    q: "Muss ich noch EEG-Umlage zahlen?",
    a: "Nein. Die EEG-Umlage, die früher auf jede verbrauchte Kilowattstunde Strom erhoben wurde, ist seit dem 1. Juli 2022 vollständig abgeschafft. Sie taucht in keiner aktuellen Stromrechnung mehr auf und spielt für die Wirtschaftlichkeit einer neuen PV-Anlage keine Rolle mehr.",
  },
  {
    q: "Welche Finanzierungsmöglichkeiten gibt es?",
    a: "Neben dem Kauf aus Eigenkapital sind zinsgünstige Kredite wie der KfW 270 (Erneuerbare Energien – Standard) verbreitet, ebenso Solar-Leasing- oder Pacht-Modelle ohne hohe Anfangsinvestition. Je nach Bundesland und Kommune gibt es zusätzlich regionale Förderprogramme. Ein Fachberater prüft mit Ihnen, welche Variante zu Ihrer Situation passt.",
  },
  {
    q: "Wie genau ist dieser Rechner?",
    a: "Wir verwenden reale Sonneneinstrahlungsdaten des EU-Programms PVGIS (Photovoltaic Geographical Information System, EU Science Hub), das auf Satellitenmessungen basiert — nicht auf einem bundesweiten Pauschalwert. Trotzdem bleibt jede Online-Berechnung eine Modellrechnung mit branchentypischen Annahmen, keine Vor-Ort-Vermessung: Die Ergebnisse sind belastbare Richtwerte für eine erste Einschätzung. Ein Fachbetrieb erstellt Ihnen nach einer Vor-Ort-Prüfung ein genaues, verbindliches Angebot.",
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
    <section aria-labelledby="faq-heading">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", padding: "56px 20px" }}>
        <Reveal>
          <h2 id="faq-heading" style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 24px" }}>
            Häufig gestellte Fragen
          </h2>
        </Reveal>
        {FAQS.map((faq, i) => {
          const open = openIndex === i;
          return (
            <Reveal key={faq.q} delay={Math.min(i, 4) * 40}>
              <div style={{
                marginBottom: 8,
                border: `1.5px solid ${open ? theme.color.accent : theme.color.border}`,
                borderRadius: 10,
                overflow: "hidden",
                background: theme.color.white,
                transition: reduced ? "none" : "border-color 0.2s",
              }}>
                <button
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "13px 16px",
                    fontSize: 14,
                    fontWeight: 500,
                    color: theme.color.textPrimary,
                    cursor: "pointer",
                    background: open ? theme.color.bg : theme.color.white,
                    border: "none",
                    textAlign: "left",
                    fontFamily: "inherit",
                    transition: reduced ? "none" : "background-color 0.2s",
                  }}
                >
                  {faq.q}
                  <span style={{
                    color: open ? theme.color.accent : theme.color.textMuted,
                    display: "flex",
                    flexShrink: 0,
                    transform: `rotate(${open ? 180 : 0}deg)`,
                    transition: reduced ? "none" : "transform 0.3s ease",
                  }}>
                    <IconChevronDown size={16} />
                  </span>
                </button>
                <div style={{
                  display: "grid",
                  gridTemplateRows: open ? "1fr" : "0fr",
                  transition: reduced ? "none" : "grid-template-rows 0.35s ease",
                }}>
                  <div style={{ overflow: "hidden", minHeight: 0 }}>
                    <div style={{ padding: open ? "0 16px 15px" : "0 16px", fontSize: 13, color: theme.color.textSecondary, lineHeight: 1.65 }}>
                      {faq.q === SPEICHER_FAQ_Q ? antwortMitPersoenlich(faq.a, wizardResult) : faq.a}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
