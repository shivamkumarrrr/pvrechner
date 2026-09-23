import theme from "../../../theme.js";
import Slider from "../ui/Slider.jsx";
import OptionGroup from "../ui/OptionGroup.jsx";
import DachformCard from "../ui/DachformCard.jsx";
import Roof3DPreview from "../ui/Roof3DPreview.jsx";
import AusrichtungIcon from "../ui/AusrichtungIcon.jsx";
import TiltButton from "../ui/TiltButton.jsx";
import SubFlow from "../ui/SubFlow.jsx";
import ContinueButton from "../ui/ContinueButton.jsx";
import { AUSRICHTUNG, NEIGUNG, DACHFORM } from "../../../lib/calculate.js";

// Der Dach-Schritt ist in 4 Sub-Screens aufgeteilt (eine Entscheidung pro
// Screen): Dachform → Dachfläche → Ausrichtung → Neigung. Reine Karten-Aus-
// wahlen (Dachform/Ausrichtung/Neigung) gehen automatisch weiter (~350ms),
// die Dachfläche (Slider) braucht einen expliziten "Weiter"-Klick.
export default function StepDach({ dachform, setDachform, dach, setDach, ausrichtung, setAusrichtung, neigung, setNeigung, onReadyChange, onIndexChange, backRef }) {
  return (
    <SubFlow total={4} onReadyChange={onReadyChange} onIndexChange={onIndexChange} backRef={backRef}>
      {({ index, forward, autoAdvance }) => (
        <>
          {index === 0 && (
            <div>
              <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 10 }}>Welche Dachform hat Ihr Haus?</div>
              {/* auto-fit statt fixer repeat(4, ...): mit dem größeren 72px-Icon
                  (siehe RoofIcon.jsx) passen 4 Spalten nicht mehr in schmale
                  Mobile-Breiten (409px Inhalt in 390px Viewport, letzte Karte
                  wurde abgeschnitten) — reflowt jetzt selbst auf 2 Spalten,
                  ohne Breakpoint/JS nötig, bleibt auf breiteren Screens 4-spaltig. */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                {DACHFORM.map((d) => (
                  <DachformCard key={d.label} item={d} selected={dachform} onSelect={(label) => autoAdvance(() => setDachform(label))} />
                ))}
              </div>
              {!dachform && (
                <div style={{ fontSize: 12, color: theme.color.textMuted, marginTop: 10, textAlign: "center" }}>
                  Bitte wählen Sie eine Dachform, um fortzufahren.
                </div>
              )}
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
              <style>{`
                /* Immer 3 Spalten (2 Reihen): die Wizard-Karte ist auch auf Desktop
                   nur ~600px breit, 6 Spalten liefen dort über den Rand. */
                .ausr-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
                .ausr-card { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%; min-width: 0; height: 100%; padding: 12px 6px 12px; border-radius: ${theme.radius.lg}px; cursor: pointer; font-family: inherit; box-sizing: border-box; }
              `}</style>
              <div className="ausr-grid">
                {AUSRICHTUNG.map((o) => {
                  const active = ausrichtung === o.label;
                  const pct = Math.round(o.factor * 100);
                  return (
                    <TiltButton
                      key={o.label}
                      className="ausr-card"
                      aria-pressed={active}
                      onClick={() => autoAdvance(() => setAusrichtung(o.label))}
                      style={{
                        border: active ? `2px solid ${theme.color.accent}` : `1px solid ${theme.color.border}`,
                        background: active ? theme.color.accentSubtle : theme.color.white,
                        padding: active ? "11px 5px 11px" : undefined,
                        transition: "border-color 0.15s, background-color 0.15s",
                      }}
                    >
                      <AusrichtungIcon label={o.label} active={active} size={60} />
                      <span style={{ fontFamily: theme.font.display, fontSize: 15, fontWeight: 600, color: theme.color.textPrimary }}>{o.label}</span>
                      {/* Ertragsfaktor aus AUSRICHTUNG (calculate.js) — nur angezeigt */}
                      <span style={{ fontSize: 12, color: theme.color.textSecondary, textAlign: "center" }}>
                        ca. <strong style={{ color: active ? theme.color.accentText : theme.color.textPrimary }}>{pct} %</strong> Ertrag
                      </span>
                    </TiltButton>
                  );
                })}
              </div>
              <div style={{ fontSize: 12.5, color: theme.color.textMuted, marginTop: 10 }}>
                Ertrag im Vergleich zur optimalen Südausrichtung. Tipp: Die Hauptdachfläche ist die Seite, auf die mittags die Sonne scheint.
              </div>
              {ausrichtung === "Nord" && (
                <div style={{ fontSize: 13, color: theme.color.textSecondary, background: theme.color.bg, borderRadius: theme.radius.md, padding: "10px 14px", marginTop: 10, lineHeight: 1.5 }}>
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
