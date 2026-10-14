import theme from "../../../theme.js";
import Slider from "../ui/Slider.jsx";
import { IconBattery, IconBolt } from "../../Icons.jsx";
import { autarkieSchaetzung, speicherKostenProKwh, STROMPREIS, EEG_MODELL, einspeiseRateMittel } from "../../../lib/calculate.js";

export default function StepSpeicher({ speicherKwh, setSpeicherKwh, speicherWahl, setSpeicherWahl, kwp, gesamtVerbrauch, vorschlagKwh, tageszeit }) {
  const autarkieOhne = Math.round(autarkieSchaetzung(kwp, gesamtVerbrauch, 0, tageszeit) * 100);
  const autarkieMit = Math.round(autarkieSchaetzung(kwp, gesamtVerbrauch, speicherKwh, tageszeit) * 100);
  const autarkieVorschlag = Math.round(autarkieSchaetzung(kwp, gesamtVerbrauch, vorschlagKwh, tageszeit) * 100);

  const de = (v) => Number(v).toLocaleString("de-DE");
  // Wert einer Kilowattstunde: eingespeist (Ø der ersten 20 Jahre im aktiven
  // EEG-Modell, siehe calculate.js) vs. selbst genutzt (Strompreis). Gleiche
  // Werte wie in calculate() — keine eigene Rechnung.
  const einspeiseCt = Math.round(einspeiseRateMittel(kwp) * 1000) / 10;
  const stromCt = Math.round(STROMPREIS * 100);
  const waehle = (wahl) => {
    setSpeicherWahl(wahl);
    setSpeicherKwh(wahl === "mit" ? (speicherKwh > 0 ? speicherKwh : (vorschlagKwh || 5)) : 0);
  };
  // Zwei Auswahl-Karten statt vorausgewähltem Schalter: nichts ist
  // voreingestellt, der Nutzer entscheidet aktiv — mit direktem Autarkie-
  // Vergleich auf den Karten selbst.
  const Karte = ({ wahl, titel, sub, pct, Icon }) => {
    const active = speicherWahl === wahl;
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={() => waehle(wahl)}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: "100%",
          padding: active ? "17px 11px" : "18px 12px", borderRadius: theme.radius.lg, cursor: "pointer", fontFamily: "inherit",
          border: active ? `2px solid ${theme.color.accent}` : `1px solid ${theme.color.border}`,
          background: active ? theme.color.accentSubtle : theme.color.white,
          transition: "border-color 0.15s, background-color 0.15s",
        }}
      >
        <span style={{ width: 48, height: 48, borderRadius: theme.radius.md, display: "flex", alignItems: "center", justifyContent: "center", background: active ? theme.color.accent : theme.color.bg, color: active ? theme.color.onAccent : theme.color.textSecondary }}>
          <Icon size={26} />
        </span>
        <span style={{ fontFamily: theme.font.display, fontSize: 16, fontWeight: 600, color: theme.color.textPrimary }}>{titel}</span>
        <span style={{ fontSize: 13, color: theme.color.textSecondary, textAlign: "center", lineHeight: 1.4 }}>{sub}</span>
        <span style={{ marginTop: 4, fontFamily: theme.font.display, fontSize: 24, fontWeight: 800, color: active ? theme.color.accentText : theme.color.textPrimary }}>{pct}%</span>
        <span style={{ fontSize: 12, color: theme.color.textMuted }}>geschätzte Autarkie</span>
      </button>
    );
  };

  return (
    <>
      <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 4 }}>Möchten Sie einen Batteriespeicher?</div>
      <div style={{ fontSize: 13, color: theme.color.textMuted, marginBottom: 14 }}>
        ca. {speicherKostenProKwh(speicherWahl === "mit" ? speicherKwh : vorschlagKwh)} €/kWh Kapazität inkl. Installation · Faustregel für Ihren Verbrauch: ~{de(vorschlagKwh)} kWh
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: 16 }}>
        <Karte wahl="ohne" titel="Ohne Speicher" sub={`Überschuss eingespeist · Ø ${de(einspeiseCt)} Ct/kWh`} pct={autarkieOhne} Icon={IconBolt} />
        <Karte wahl="mit" titel="Mit Speicher" sub={`${de(speicherWahl === "mit" ? speicherKwh : vorschlagKwh)} kWh · abends selbst nutzen, spart ${stromCt} Ct/kWh`} pct={speicherWahl === "mit" ? autarkieMit : autarkieVorschlag} Icon={IconBattery} />
      </div>
      {speicherWahl === "mit" && (
        <Slider label="Speicherkapazität" value={speicherKwh} onChange={setSpeicherKwh} min={1} max={20} step={0.5} unit="kWh" />
      )}
      <div style={{ fontSize: 13, color: theme.color.textMuted, marginTop: 4, lineHeight: 1.5 }}>
        Schätzung anhand Anlagengröße, Verbrauch und Speicherkapazität — keine Lastgang-Simulation. 100% Autarkie ist mit einem realistisch dimensionierten Speicher nicht erreichbar.
      </div>
      {EEG_MODELL === "2027" && (
        <div style={{ fontSize: 13, color: theme.color.textSecondary, marginTop: 10, lineHeight: 1.55, borderTop: `1px solid ${theme.color.border}`, paddingTop: 10 }}>
          <strong style={{ color: theme.color.textPrimary }}>Der Speicher wird wichtiger:</strong> Für neue Anlagen ab 2027 soll die
          feste Vergütung durch Direktvermarktung ersetzt werden — selbst genutzter Solarstrom ist dann der größte Gewinn, und genau
          den erhöht der Speicher. Seit Oktober 2026 (MiSpeL-Festlegung der Bundesnetzagentur) darf er unter bestimmten
          Voraussetzungen zusätzlich günstigen Netzstrom laden, etwa mit einem dynamischen Stromtarif. Dieser Zusatznutzen ist in
          der Berechnung nicht enthalten.
        </div>
      )}
    </>
  );
}
