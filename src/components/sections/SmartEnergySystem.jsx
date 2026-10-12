import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion.js";
import { SECTION_PAD } from "./sectionSpacing.js";
import {
  EINSPEISEVERGUETUNG_TEIL,
  EEG2027_UEBERGANG,
  EEG2027_UEBERGANG_JAHRE,
  EEG2027_DV_BONUS,
  EEG2027_DV_BONUS_JAHRE,
  MARKTWERT_SOLAR,
} from "../../lib/calculate.js";

const fmtCt = (eurProKwh) => (eurProKwh * 100).toFixed(2).replace(".", ",");

// Ersetzt die frühere eigene Einspeisevergütungs-Sektion (Patrick, Mail
// 2.10.2026: "Einspeisevergütung aus den USPs raus, intelligentes
// Energiesystem pushen"). Die Vergütungs-Fakten bleiben als Hintergrund der
// Direktvermarktung erhalten, aber ohne große Satz-Zahl als Blickfang.
const PHASEN_2027 = [
  { zeit: `Jahr 1–${EEG2027_UEBERGANG_JAHRE}`, text: `${fmtCt(EEG2027_UEBERGANG)} Ct/kWh Übergangszahlung` },
  { zeit: `Jahr ${EEG2027_UEBERGANG_JAHRE + 1}–${EEG2027_UEBERGANG_JAHRE + EEG2027_DV_BONUS_JAHRE}`, text: `Börsen-Marktwert + ${fmtCt(EEG2027_DV_BONUS)} Ct Bonus (Anlagen unter 25 kW)` },
  { zeit: "danach", text: `Börsen-Marktwert (Solar 2025: ${fmtCt(MARKTWERT_SOLAR)} Ct/kWh) abzüglich Vermarktungskosten` },
];

// Die 2027-Story (Briefing "Von der PV-Anlage zum intelligenten Energiesystem",
// Stand 2.10.2026): 2027 ist kein Verlust, sondern der Wechsel vom passiven
// Stromerzeuger zum gesteuerten Energiesystem. Rechtlich sauber formuliert:
// KEINE garantierten Mehrerlöse, keine €-Zahlen für Arbitrage/Flexibilität
// (EEG 2027 ist ein Entwurf; Quellen und Rechtsstand im Block "EEG 2027" in
// calculate.js). MiSpeL-Fakten nach Pressemitteilung der Bundesnetzagentur
// vom 1.10.2026. Keine Fähigkeits-Behauptungen über "uns" (CLAUDE.md
// Verbot erfundener Firmenidentität) — beschrieben wird, was ein System kann.

const SIGNALE = ["Wetterprognose", "erwartete Solarproduktion", "Ladezustand des Speichers", "aktueller Strompreis", "Verbrauch im Haus", "Ladebedarf des E-Autos"];

const ENTSCHEIDUNGEN = [
  { titel: "Jetzt selbst nutzen", text: "Waschmaschine, Wärmepumpe und Wallbox laufen, wenn die Sonne scheint." },
  { titel: "Speichern", text: "Überschuss vom Mittag deckt den Abend — statt Netzstrom zu kaufen." },
  { titel: "Günstig laden", text: "Mit dynamischem Stromtarif nimmt der Speicher bei niedrigen Preisen auch Netzstrom auf." },
  { titel: "Einspeisen, wenn es sich lohnt", text: "Bei einem börsenpreis-optimierten Vertrag geht Überschuss in Stunden ins Netz, in denen er mehr wert ist." },
];

function Pfeil() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function SmartEnergySystem() {
  const reduced = usePrefersReducedMotion();
  const scrollToRechner = () =>
    document.getElementById("rechner")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

  return (
    <section aria-labelledby="smart-energy-heading" style={{ background: theme.color.white }}>
      <style>{`
        .se-wende { display: grid; grid-template-columns: 1fr; gap: 0; border: 1px solid ${theme.color.border}; border-radius: ${theme.radius.lg}px; overflow: hidden; margin: 36px 0 56px; }
        @media (min-width: 860px) { .se-wende { grid-template-columns: 2fr 3fr; } }
        .se-jahr { padding: 26px 28px; }
        .se-jahr--alt { background: ${theme.color.bg}; }
        .se-jahr--neu { border-top: 1px solid ${theme.color.border}; }
        @media (min-width: 860px) { .se-jahr--neu { border-top: none; border-left: 1px solid ${theme.color.border}; } }
        .se-jahr__zahl { font-family: ${theme.font.display}; font-size: 40px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; margin-bottom: 12px; font-variant-numeric: tabular-nums; }
        .se-jahr p { font-size: 16px; line-height: 1.6; color: ${theme.color.textSecondary}; margin: 0; }
        .se-verben { list-style: none; margin: 14px 0 0; padding: 0; display: grid; grid-template-columns: 1fr; gap: 8px; }
        @media (min-width: 520px) { .se-verben { grid-template-columns: 1fr 1fr; column-gap: 24px; } }
        .se-verben li { font-size: 16px; font-weight: 600; color: ${theme.color.textPrimary}; padding-left: 18px; position: relative; }
        .se-verben li::before { content: ""; position: absolute; left: 0; top: 0.6em; width: 8px; height: 8px; border-radius: 50%; background: ${theme.color.accent}; }

        .se-dv { display: grid; grid-template-columns: 1fr; gap: 28px; margin: 0 0 56px; }
        @media (min-width: 900px) { .se-dv { grid-template-columns: 3fr 2fr; gap: 48px; align-items: start; } }
        .se-dv__fakten { background: ${theme.color.bg}; border-radius: ${theme.radius.lg}px; padding: 22px 24px; }
        .se-dv__fakten ul { list-style: none; margin: 0; padding: 0; }
        .se-dv__fakten li { display: grid; grid-template-columns: 78px 1fr; gap: 12px; font-size: 15px; line-height: 1.5; color: ${theme.color.textPrimary}; padding: 9px 0; border-top: 1px solid ${theme.color.border}; }
        .se-dv__fakten li span { color: ${theme.color.textMuted}; font-size: 14px; }
        .se-hirn { display: grid; grid-template-columns: 1fr; gap: 20px; align-items: center; }
        @media (min-width: 960px) { .se-hirn { grid-template-columns: 1fr auto 1.1fr auto 1.4fr; gap: 20px; } }
        .se-spalte__titel { font-size: 14px; font-weight: 600; color: ${theme.color.textMuted}; margin-bottom: 10px; }
        .se-signale { list-style: none; margin: 0; padding: 0; }
        .se-signale li { font-size: 16px; color: ${theme.color.textPrimary}; padding: 9px 0; border-top: 1px solid ${theme.color.border}; }
        .se-signale li:first-child { border-top: none; padding-top: 0; }
        .se-kern { background: ${theme.color.brandNavy || theme.color.textPrimary}; color: ${theme.color.white}; border-radius: ${theme.radius.lg}px; padding: 26px 24px; }
        .se-kern b { display: block; font-family: ${theme.font.display}; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 8px; }
        .se-kern span { font-size: 15px; line-height: 1.55; color: rgba(255,255,255,0.82); }
        .se-pfeil { color: ${theme.color.textMuted}; justify-self: center; }
        @media (max-width: 959px) { .se-pfeil { transform: rotate(90deg); } }
        .se-entscheidungen { list-style: none; margin: 0; padding: 0; }
        .se-entscheidungen li { padding: 10px 0; border-top: 1px solid ${theme.color.border}; }
        .se-entscheidungen li:first-child { border-top: none; padding-top: 0; }
        .se-entscheidungen b { display: block; font-size: 16px; font-weight: 700; color: ${theme.color.textPrimary}; }
        .se-entscheidungen span { font-size: 15px; line-height: 1.5; color: ${theme.color.textSecondary}; }

        .se-cta { min-height: 48px; padding: 13px 26px; border-radius: ${theme.radius.pill}px; border: none; background: ${theme.color.accent}; color: ${theme.color.onAccent}; font-size: 16px; font-weight: 700; cursor: pointer; transition: background-color 0.15s, transform 0.15s; }
        @media (hover: hover) { .se-cta:hover { background: ${theme.color.accentHover}; transform: translateY(-1px); } }
      `}</style>
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: `${SECTION_PAD} 20px` }}>
        <Reveal>
          <h2 id="smart-energy-heading" style={{ ...theme.type.h2, color: theme.color.textPrimary, margin: "0 0 16px", maxWidth: 760 }}>
            Aus der Solaranlage wird ein intelligentes Energiesystem
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: theme.color.textPrimary, margin: 0, maxWidth: 720 }}>
            Bisher lautete die Frage: Wie hoch ist meine Einspeisevergütung? Heute lautet sie:{" "}
            <strong>Wie viel holt mein gesamtes Energiesystem für mich heraus?</strong>
          </p>

          <div className="se-wende">
            <div className="se-jahr se-jahr--alt">
              <div className="se-jahr__zahl" style={{ color: theme.color.textMuted }}>Bisher</div>
              <p>Die Anlage erzeugt Strom. Was Sie nicht selbst brauchen, geht zu einem festen Satz ins Netz — egal, ob der Strom gerade gebraucht wird.</p>
            </div>
            <div className="se-jahr se-jahr--neu">
              <div className="se-jahr__zahl" style={{ color: theme.color.accentText }}>Heute</div>
              <p>Die Anlage wird Teil eines gesteuerten Systems — und mit den neuen Regeln für Anlagen ab 2027 wird genau das zum entscheidenden Vorteil:</p>
              <ul className="se-verben">
                <li>Günstig einkaufen</li>
                <li>Solarstrom speichern</li>
                <li>Verbrauch verschieben</li>
                <li>Teuren Netzstrom vermeiden</li>
                <li>Überschüsse marktorientiert verkaufen</li>
                <li>Flexibilität nutzen</li>
              </ul>
            </div>
          </div>

          <div className="se-dv">
            <div>
              <h3 style={{ ...theme.type.h3, fontSize: 22, color: theme.color.textPrimary, margin: "0 0 10px" }}>
                Direktvermarktung: Überschuss zum Börsenpreis verkaufen
              </h3>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: theme.color.textSecondary, margin: "0 0 12px" }}>
                Für neue Anlagen ab 2027 soll die 20 Jahre garantierte Einspeisevergütung entfallen. An ihre Stelle rückt
                die Direktvermarktung: Ein Direktvermarkter verkauft Ihren überschüssigen Strom an der Strombörse — Sie erhalten den Marktwert abzüglich einer Gebühr.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: theme.color.textSecondary, margin: 0 }}>
                Dieser Preis schwankt über den Tag: Mittags, wenn viele Solaranlagen gleichzeitig einspeisen, ist Strom
                wenig wert, morgens und abends mehr. Ein intelligentes Energiemanagement speichert deshalb den
                Mittagsüberschuss und nutzt ihn selbst, wenn er am meisten wert ist. Ob sich auch das Verschieben der
                Einspeisung lohnt, hängt vom Vermarktungsvertrag ab: Manche Anbieter rechnen mit einem Monatsmittel ab,
                andere steuern die Einspeisung aus dem Speicher nach den Börsenpreisen. Dazu kommt: Neue Anlagen sollen höchstens 50 % ihrer Leistung einspeisen
                dürfen. Was darüber hinaus erzeugt wird, bringt nur mit Speicher oder Eigenverbrauch etwas.
              </p>
            </div>
            <div className="se-dv__fakten">
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.color.textPrimary, marginBottom: 4 }}>Einspeisevergütung 2027 — geplantes Modell</div>
              <div style={{ fontSize: 14, color: theme.color.textSecondary, marginBottom: 10 }}>für Anlagen mit Inbetriebnahme ab 1.1.2027</div>
              <ul>
                {PHASEN_2027.map((ph) => (
                  <li key={ph.zeit}><span>{ph.zeit}</span>{ph.text}</li>
                ))}
              </ul>
              <div style={{ fontSize: 14, color: theme.color.textSecondary, lineHeight: 1.55, marginTop: 12 }}>
                Anlagen, die bis 31.12.2026 in Betrieb gehen, behalten {fmtCt(EINSPEISEVERGUETUNG_TEIL)} Ct/kWh fest für 20 Jahre.
              </div>
            </div>
          </div>

          <h3 style={{ ...theme.type.h3, fontSize: 22, color: theme.color.textPrimary, margin: "0 0 8px" }}>
            Das Gehirn des Hauses: Energiemanagement
          </h3>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: theme.color.textSecondary, margin: "0 0 28px", maxWidth: 680 }}>
            Smart Meter und Energiemanagement verbinden Solaranlage, Batteriespeicher, Wallbox und E-Auto, Wärmepumpe und
            dynamischen Stromtarif. Sie müssen keine Strombörse beobachten — die Software entscheidet automatisch.
          </p>

          <div className="se-hirn">
            <div>
              <div className="se-spalte__titel">Das System berücksichtigt</div>
              <ul className="se-signale">
                {SIGNALE.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div className="se-pfeil"><Pfeil /></div>
            <div className="se-kern">
              <b>Energiemanagement</b>
              <span>wägt alle Signale ab — rund um die Uhr, für jede Viertelstunde.</span>
            </div>
            <div className="se-pfeil"><Pfeil /></div>
            <div>
              <div className="se-spalte__titel">… und entscheidet</div>
              <ul className="se-entscheidungen">
                {ENTSCHEIDUNGEN.map((e) => (
                  <li key={e.titel}><b>{e.titel}</b><span>{e.text}</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20, margin: "44px 0 0" }}>
            <button type="button" className="se-cta" onClick={scrollToRechner}>Meine Anlage mit Speicher berechnen</button>
            <span style={{ fontSize: 15, color: theme.color.textSecondary }}>Ertrag, Ersparnis und Amortisation — in 60 Sekunden.</span>
          </div>

          <p style={{ fontSize: 13, color: theme.color.textMuted, lineHeight: 1.6, margin: "28px 0 0", maxWidth: 880 }}>
            Neue Erlös- und Einsparmöglichkeiten zusätzlich zur klassischen Eigenverbrauchsoptimierung — keine garantierten
            Mehrerlöse; wie viel sie bringen, hängt von Tarif, Steuerung und Netzbetreiber ab. Grundlage für das Laden mit
            Netzstrom ist die MiSpeL-Festlegung der Bundesnetzagentur vom 1.10.2026: Bis Ende September 2027 ist dafür das
            Einverständnis von Netz- und Messstellenbetreiber nötig, die vereinfachte Pauschaloption wartet noch auf die
            EU-Beihilfegenehmigung. Direktvermarktung und dynamische Tarife setzen ein intelligentes Messsystem (Smart Meter)
            voraus. Einspeisevergütung 2027: Regierungsentwurf vom 29.7.2026, noch nicht beschlossen — der Bundesrat hat
            Änderungen gefordert. Der Entwurf sieht außerdem vor, dass neue Anlagen unter 100 kW höchstens 50 % ihrer
            Leistung einspeisen und bei negativen Börsenpreisen keine Zahlung erhalten. Unser Rechner nutzt für Neuanlagen
            dieses geplante Modell.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
