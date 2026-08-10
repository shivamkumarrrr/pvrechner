import theme from "../../../theme.js";
import Slider from "../ui/Slider.jsx";
import OptionGroup from "../ui/OptionGroup.jsx";
import DachformCard from "../ui/DachformCard.jsx";
import Roof3DPreview from "../ui/Roof3DPreview.jsx";
import AusrichtungIcon from "../ui/AusrichtungIcon.jsx";
import SubFlow from "../ui/SubFlow.jsx";
import ContinueButton from "../ui/ContinueButton.jsx";
import { AUSRICHTUNG, NEIGUNG, DACHFORM } from "../../../lib/calculate.js";

// Der Dach-Schritt ist in 4 Sub-Screens aufgeteilt (eine Entscheidung pro
// Screen): Dachform → Dachfläche → Ausrichtung → Neigung. Reine Karten-Aus-
// wahlen (Dachform/Ausrichtung/Neigung) gehen automatisch weiter (~350ms),
// die Dachfläche (Slider) braucht einen expliziten "Weiter"-Klick.
export default function StepDach({ dachform, setDachform, dach, setDach, ausrichtung, setAusrichtung, neigung, setNeigung, onReadyChange }) {
  return (
    <SubFlow total={4} onReadyChange={onReadyChange}>
      {({ index, forward, autoAdvance }) => (
        <>
          {index === 0 && (
            <div>
              <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 10 }}>Welche Dachform hat Ihr Haus?</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {DACHFORM.map((d) => (
                  <DachformCard key={d.label} item={d} selected={dachform} onSelect={(label) => autoAdvance(() => setDachform(label))} />
                ))}
              </div>
            </div>
          )}

          {index === 1 && (
            <div>
              <div style={{ fontSize: 11, color: theme.color.textMuted, marginBottom: 6, fontStyle: "italic" }}>Tipp: Klicken Sie auf die Zahl, um einen genauen Wert einzugeben</div>
              <Slider label="Verfügbare Dachfläche" value={dach} onChange={setDach} min={20} max={200} step={5} unit="m²" />
              {dachform === "Satteldach" && (
                <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 6 }}>
                  Satteldach: bitte die <strong>gesamte Dachfläche über beide Dachseiten</strong> angeben — auch wenn nur eine Seite gut ausgerichtet ist.
                </div>
              )}
              <ContinueButton onClick={forward} />
            </div>
          )}

          {index === 2 && (
            <div>
              <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 10 }}>Wohin zeigt die Hauptdachfläche?</div>
              <OptionGroup
                options={AUSRICHTUNG}
                selected={ausrichtung}
                onSelect={(label) => autoAdvance(() => setAusrichtung(label))}
                minCol={72}
                renderIcon={(opt, active) => <AusrichtungIcon label={typeof opt === "string" ? opt : opt.label} active={active} />}
              />
              {ausrichtung === "Nord" && (
                <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 8, lineHeight: 1.5 }}>
                  Nordausrichtung liefert deutlich weniger Ertrag — eine Beratung vor Ort ist hier besonders empfehlenswert.
                </div>
              )}
            </div>
          )}

          {index === 3 && (
            <div>
              <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 10 }}>Wie ist das Dach geneigt?</div>
              {/* Live-Vorschau: Das Dach-Icon kippt mit der gewählten Neigung mit —
                  flache Auswahl = fast flach liegend, steile = aufgerichtet. */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <Roof3DPreview dachform={dachform} neigung={neigung} />
              </div>
              <OptionGroup options={NEIGUNG} selected={neigung} onSelect={(label) => autoAdvance(() => setNeigung(label))} minCol={96} />
            </div>
          )}
        </>
      )}
    </SubFlow>
  );
}
