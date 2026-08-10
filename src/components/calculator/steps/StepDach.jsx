import theme from "../../../theme.js";
import Slider from "../ui/Slider.jsx";
import OptionGroup from "../ui/OptionGroup.jsx";
import DachformCard from "../ui/DachformCard.jsx";
import { AUSRICHTUNG, NEIGUNG, DACHFORM } from "../../../lib/calculate.js";

export default function StepDach({ dachform, setDachform, dach, setDach, ausrichtung, setAusrichtung, neigung, setNeigung }) {
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 10 }}>Dachform</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {DACHFORM.map((d) => (
            <DachformCard key={d.label} item={d} selected={dachform} onSelect={setDachform} />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 11, color: theme.color.textMuted, marginBottom: 6, fontStyle: "italic" }}>Tipp: Klicken Sie auf die Zahl, um einen genauen Wert einzugeben</div>
      <Slider label="Verfügbare Dachfläche" value={dach} onChange={setDach} min={20} max={200} step={5} unit="m²" />
      {dachform === "Satteldach" && (
        <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 6 }}>
          Satteldach: bitte die <strong>gesamte Dachfläche über beide Dachseiten</strong> angeben — auch wenn nur eine Seite gut ausgerichtet ist.
        </div>
      )}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 10 }}>Dachausrichtung</div>
        <OptionGroup options={AUSRICHTUNG} selected={ausrichtung} onSelect={setAusrichtung} minCol={62} />
        {ausrichtung === "Nord" && (
          <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 8, lineHeight: 1.5 }}>
            Nordausrichtung liefert deutlich weniger Ertrag — eine Beratung vor Ort ist hier besonders empfehlenswert.
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 10 }}>Dachneigung</div>
        <OptionGroup options={NEIGUNG} selected={neigung} onSelect={setNeigung} minCol={96} />
      </div>
    </>
  );
}
