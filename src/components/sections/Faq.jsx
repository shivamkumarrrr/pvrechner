import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";

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
    q: "Welche Modultypen gibt es und welchen Unterschied macht das?",
    a: "Monokristalline Module sind heute bei Dachanlagen der Standard: höchster Wirkungsgrad, dadurch am wenigsten Fläche pro kWp nötig. Polykristalline Module sind etwas günstiger, brauchen bei gleicher Leistung aber mehr Dachfläche und werden kaum noch neu verbaut. Dünnschichtmodule haben den geringsten Wirkungsgrad, sind dafür leicht und flexibel — meist nur bei Nischenanwendungen (z.B. gewölbte Dächer) relevant, nicht beim klassischen Einfamilienhausdach.",
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
    q: "Wie funktioniert die Einspeisung ins Netz?",
    a: "Ihr Netzbetreiber baut einen Zweirichtungszähler ein, der Bezug und Einspeisung getrennt erfasst. Strom, den Sie nicht selbst verbrauchen, fließt automatisch ins öffentliche Netz und wird nach EEG vergütet — die aktuellen Sätze finden Sie weiter oben auf dieser Seite. Die Anmeldung beim Netzbetreiber und im Marktstammdatenregister übernimmt in der Regel der installierende Fachbetrieb für Sie.",
  },
  {
    q: "Verdiene ich mit einer PV-Anlage Geld?",
    a: "Die kurze Antwort ist ja. Wenn Sie den überschüssigen Strom aus Ihrer Photovoltaikanlage ins Stromnetz einspeisen, erhalten Sie 20 Jahre lang (plus das Jahr der Inbetriebnahme) eine gesetzlich garantierte Vergütung nach EEG. Ob Sie mit Ihrer Anlage einen Gewinn erzielen, hängt davon ab, ab wann sich die Kosten amortisiert haben — und das hängt wiederum stark davon ab, wie viel Ihres selbst erzeugten Stroms Sie selbst verbrauchen statt einzuspeisen: Jede selbst verbrauchte Kilowattstunde spart den vollen Strompreis und ist damit wirtschaftlich deutlich mehr wert als die Einspeisung. Genau diese Rechnung macht der Rechner oben individuell für Ihre Anlage.",
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

export default function Faq() {
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
        {FAQS.map((faq, i) => (
          <Reveal key={faq.q} delay={Math.min(i, 4) * 40}>
            <details style={{
              marginBottom: 8,
              border: `1.5px solid ${theme.color.border}`,
              borderRadius: 10,
              overflow: "hidden",
            }}>
              <summary style={{
                padding: "13px 16px",
                fontSize: 14,
                fontWeight: 500,
                color: theme.color.textPrimary,
                cursor: "pointer",
                background: theme.color.bg,
                listStyle: "none",
              }}>
                {faq.q}
              </summary>
              <div style={{ padding: "8px 16px 15px", fontSize: 13, color: theme.color.textSecondary, lineHeight: 1.65 }}>
                {faq.a}
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
