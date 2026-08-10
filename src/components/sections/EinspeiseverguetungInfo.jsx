import { useState } from "react";
import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion.js";
import { EINSPEISEVERGUETUNG_TEIL, EINSPEISEVERGUETUNG_VOLL } from "../../lib/calculate.js";

// EEG-Degression: laut Quellen-Kommentar zu EINSPEISE in calculate.js sinkt der
// Satz halbjährlich um 1% (nächster Schritt 1.8.2026 → 7,70 Ct/kWh). Die Zeitachse
// unten rechnet diesen aktuellen, belegten Satz mit dieser gesetzlichen Regel
// rechnerisch fort — KEINE extern recherchierten historischen Zahlen erfinden.
const DEGRESSIONS_DATEN = ["1.8.2026", "1.2.2027", "1.8.2027", "1.2.2028", "1.8.2028"];
function degressionsPfad(aktuellerCt) {
  let v = aktuellerCt;
  return DEGRESSIONS_DATEN.map((datum, i) => {
    const wert = i === 0 ? v : (v = v * 0.99);
    return { datum, ct: wert };
  });
}
const fmtCt = (x) => x.toFixed(2).replace(".", ",");

export default function EinspeiseverguetungInfo({ wizardResult }) {
  const reduced = usePrefersReducedMotion();
  // Standardfall Teileinspeisung (Eigenverbrauch + Überschuss) — bewusst default,
  // weil der Rechner konservativ mit diesem Satz rechnet. Volleinspeisung ist
  // der Sonderfall für reine Stromerzeuger ohne Eigenverbrauch.
  const [mode, setMode] = useState("teil");

  const teilCt = Math.round(EINSPEISEVERGUETUNG_TEIL * 1000) / 10; // €/kWh → Ct/kWh
  const vollCt = Math.round(EINSPEISEVERGUETUNG_VOLL * 1000) / 10;

  const aktiv = mode === "teil";
  const aktivCt = aktiv ? teilCt : vollCt;

  // Personalisierung NUR nach abgeschlossenem Wizard-Durchlauf. kwp > 10 kWp ist
  // bei Einfamilienhäusern selten — dann gelten die oben genannten Sätze (bis
  // 10 kWp) nicht mehr; ohne belegten >10-kWp-Wert zeigen wir bewusst keine Zahl.
  const kwp = wizardResult?.kwp ?? null;
  const hatPersoenlicheAnlage = kwp != null && kwp > 0;
  const passend = hatPersoenlicheAnlage && kwp <= 10;

  const pfad = degressionsPfad(teilCt);

  return (
    <section aria-labelledby="einspeisung-heading">
      <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", padding: "48px 20px" }}>
        <Reveal>
          <h2 id="einspeisung-heading" style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 20px" }}>
            Einspeisevergütung: aktueller Stand
          </h2>

          {hatPersoenlicheAnlage && (
            <div style={{
              background: theme.color.accentSubtle,
              border: `1.5px solid ${theme.color.accent}`,
              borderRadius: theme.radius.md,
              padding: "12px 14px",
              marginBottom: 14,
              fontSize: 13,
              color: theme.color.accentHover,
              lineHeight: 1.55,
            }}>
              {passend ? (
                <>Für Ihre <strong>{String(kwp).replace(".", ",")} kWp-Anlage</strong> gilt der Teileinspeisung-Satz von{" "}
                <strong>{fmtCt(teilCt)} Ct/kWh</strong> — dieser Satz ist für 20 Jahre fest zugesichert.</>
              ) : (
                <>Ihre Anlage hat <strong>{String(kwp).replace(".", ",")} kWp</strong>. Die oben genannten Sätze gelten
                für Anlagen bis 10 kWp — bei größeren Anlagen liegen die Sätze etwas niedriger, die exakte Höhe
                erfahren Sie im Beratungsgespräch.</>
              )}
            </div>
          )}

          {/* Umschalter Teil-/Volleinspeisung statt starrem Nebeneinander */}
          <div role="radiogroup" aria-label="Vergütungsart wählen" style={{
            display: "flex",
            gap: 4,
            background: theme.color.bg,
            border: `1.5px solid ${theme.color.border}`,
            borderRadius: theme.radius.md,
            padding: 4,
            marginBottom: 10,
          }}>
            {[
              { key: "teil", label: "Teileinspeisung", desc: "Eigenverbrauch + Überschuss" },
              { key: "voll", label: "Volleinspeisung", desc: "Gesamte Erzeugung einspeisen" },
            ].map((o) => {
              const active = mode === o.key;
              return (
                <button
                  key={o.key}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMode(o.key)}
                  style={{
                    flex: 1,
                    padding: "9px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: active ? theme.color.white : "transparent",
                    color: active ? theme.color.textPrimary : theme.color.textSecondary,
                    fontWeight: active ? 600 : 400,
                    fontSize: 12.5,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: reduced ? "none" : "background-color 0.2s, color 0.2s",
                  }}
                >
                  {o.label}
                  <div style={{ fontSize: 10.5, fontWeight: 400, color: theme.color.textMuted, marginTop: 1 }}>{o.desc}</div>
                </button>
              );
            })}
          </div>

          <div style={{
            background: aktiv ? theme.color.accentSubtle : theme.color.skySubtle,
            border: `1.5px solid ${aktiv ? theme.color.accent : theme.color.sky}`,
            borderRadius: theme.radius.lg,
            padding: "18px 18px",
            marginBottom: 18,
            transition: reduced ? "none" : "background-color 0.25s, border-color 0.25s",
          }}>
            <div style={{ fontSize: 11, color: aktiv ? theme.color.accentHover : theme.color.sky, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              {aktiv ? "Teileinspeisung" : "Volleinspeisung"}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>
              {fmtCt(aktivCt)} Ct<span style={{ fontSize: 14, fontWeight: 500 }}>/kWh</span>
            </div>
            <div style={{ fontSize: 12, color: theme.color.textSecondary, marginTop: 2 }}>Anlagen bis 10 kWp</div>
            <div style={{ fontSize: 12, color: theme.color.textSecondary, lineHeight: 1.55, marginTop: 8 }}>
              {aktiv
                ? "Der Standardfall für Eigenverbrauch: Sie nutzen Ihren Solarstrom selbst und speisen nur den Überschuss ein. Unser Rechner rechnet konservativ mit diesem Satz."
                : "Sonderfall ohne Eigenverbrauch: Die gesamte Erzeugung fließt ins Netz, Ihren Hausstrom kaufen Sie separat. Höherer Satz, aber Sie verlieren den Eigenverbrauchsvorteil von ~0,37 €/kWh."}
            </div>
          </div>

          {/* Degression-Zeitachse */}
          <div style={{ fontSize: 12.5, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 6 }}>
            So sinkt der Satz für neue Anlagen
          </div>
          <div style={{ marginBottom: 10 }}>
            {pfad.map((s, i) => {
              // Ab 1.2.2027 (i >= 1) sind die Werte zusätzlich mit der Unsicherheit
              // der geplanten EEG-Reform 2027 behaftet (siehe Kommentar bei
              // EINSPEISE in calculate.js) — dezent blasser statt schwarz.
              const reformUnsicher = i >= 1;
              return (
                <div key={s.datum} style={{ position: "relative", paddingBottom: 12 }}>
                  {i < pfad.length - 1 && (
                    <div style={{ position: "absolute", left: 3, top: 14, bottom: 0, width: 2, background: theme.color.border }} />
                  )}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      flexShrink: 0,
                      width: 8,
                      height: 8,
                      marginTop: 5,
                      borderRadius: "50%",
                      background: i === 0 ? theme.color.accent : theme.color.border,
                    }} />
                    <div>
                      <div style={{ fontSize: 11, color: theme.color.textMuted }}>{s.datum}{i === 0 && " · heute"}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: reformUnsicher ? theme.color.textMuted : theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                        {fmtCt(s.ct)} Ct<span style={{ fontSize: 11, fontWeight: 400, color: theme.color.textSecondary }}>/kWh</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
