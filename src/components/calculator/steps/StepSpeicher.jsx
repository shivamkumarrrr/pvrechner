import theme from "../../../theme.js";
import Toggle from "../ui/Toggle.jsx";
import Slider from "../ui/Slider.jsx";
import { IconBattery, IconBolt } from "../../Icons.jsx";
import { autarkieSchaetzung, SPEICHER_KOSTEN_PRO_KWH } from "../../../lib/calculate.js";

export default function StepSpeicher({ speicherKwh, setSpeicherKwh, kwp, gesamtVerbrauch, vorschlagKwh, tageszeit }) {
  const hatSpeicher = speicherKwh > 0;
  const autarkieOhne = Math.round(autarkieSchaetzung(kwp, gesamtVerbrauch, 0, tageszeit) * 100);
  const autarkieMit = Math.round(autarkieSchaetzung(kwp, gesamtVerbrauch, speicherKwh, tageszeit) * 100);
  const autarkieVorschlag = Math.round(autarkieSchaetzung(kwp, gesamtVerbrauch, vorschlagKwh, tageszeit) * 100);

  return (
    <>
      <div style={{ textAlign: "center", padding: "20px 0 10px" }}>
        <div style={{ color: theme.color.accent, marginBottom: 12, display: "flex", justifyContent: "center" }}>
          {hatSpeicher ? <IconBattery size={44} /> : <IconBolt size={44} />}
        </div>
        <div style={{ fontSize: 15, color: theme.color.textSecondary, lineHeight: 1.6, maxWidth: 400, margin: "0 auto 24px" }}>
          {hatSpeicher
            ? `Mit ${speicherKwh} kWh Speicherkapazität decken Sie schätzungsweise ${autarkieMit}% Ihres Stromverbrauchs selbst — statt ihn aus dem Netz zu kaufen.`
            : `Ohne Speicher decken Sie bei Ihrer Anlagengröße schätzungsweise ${autarkieOhne}% Ihres Verbrauchs selbst. Der Rest kommt aus dem Netz.`}
        </div>
      </div>
      <Toggle
        label="Batteriespeicher hinzufügen"
        sub={`ca. ${SPEICHER_KOSTEN_PRO_KWH} €/kWh Kapazität · Faustregel für Ihren Verbrauch: ~${vorschlagKwh} kWh`}
        checked={hatSpeicher}
        onChange={(checked) => setSpeicherKwh(checked ? (vorschlagKwh || 5) : 0)}
      />
      {hatSpeicher && (
        <Slider label="Speicherkapazität" value={speicherKwh} onChange={setSpeicherKwh} min={1} max={20} step={0.5} unit="kWh" />
      )}
      <div style={{
        marginTop: 20,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}>
        <div style={{
          textAlign: "center", padding: 16, borderRadius: 12,
          background: !hatSpeicher ? theme.color.accentSubtle : theme.color.bg,
          border: !hatSpeicher ? `1.5px solid ${theme.color.accent}` : `1.5px solid ${theme.color.border}`,
        }}>
          <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Ohne Speicher</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: theme.color.textPrimary }}>{autarkieOhne}%</div>
          <div style={{ fontSize: 12, color: theme.color.textSecondary }}>Autarkie</div>
        </div>
        <div style={{
          textAlign: "center", padding: 16, borderRadius: 12,
          background: hatSpeicher ? theme.color.accentSubtle : theme.color.bg,
          border: hatSpeicher ? `1.5px solid ${theme.color.accent}` : `1.5px solid ${theme.color.border}`,
        }}>
          <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Mit {hatSpeicher ? `${speicherKwh} kWh` : "Speicher"}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: theme.color.textPrimary }}>{hatSpeicher ? autarkieMit : autarkieVorschlag}%</div>
          <div style={{ fontSize: 12, color: theme.color.textSecondary }}>Autarkie</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 10, lineHeight: 1.5 }}>
        Schätzung anhand Anlagengröße, Verbrauch und Speicherkapazität — keine Lastgang-Simulation. 100% Autarkie ist mit einem realistisch dimensionierten Speicher nicht erreichbar.
      </div>
    </>
  );
}
