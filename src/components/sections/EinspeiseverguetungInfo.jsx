import { useState } from "react";
import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion.js";
import { EINSPEISEVERGUETUNG_TEIL, EINSPEISEVERGUETUNG_VOLL } from "../../lib/calculate.js";
import { IconSun, IconHouse, IconPlug, IconChevronDown } from "../Icons.jsx";

// EEG-Degression: laut Quellen-Kommentar zu EINSPEISE in calculate.js sinkt der
// Satz halbjährlich um 1% (nächster Schritt 1.8.2026 → 7,70 Ct/kWh). Die Zeitachse
// unten rechnet den aktuell belegten Basiswert (Teileinspeisung ODER Volleinspeisung,
// je nach Toggle-Zustand) mit dieser gesetzlichen Regel rechnerisch fort — KEINE
// extern recherchierten historischen Zahlen erfinden. EINE gemeinsame Funktion für
// beide Modi, der aktive Basiswert wird pro Render übergeben (kein fest gekoppelter
// Pfad, damit die Zeitachse dem Toggle folgt). Rundung auf zwei Nachkommastellen wie
// von § 49 EEG vorgeschrieben.
const DEGRESSIONS_DATEN = ["1.8.2026", "1.2.2027", "1.8.2027", "1.2.2028", "1.8.2028"];
function degressionsPfad(basisCt) {
  return DEGRESSIONS_DATEN.map((datum, i) => ({
    datum,
    ct: Math.round(basisCt * Math.pow(0.99, i) * 100) / 100,
  }));
}
const fmtCt = (x) => x.toFixed(2).replace(".", ",");

export default function EinspeiseverguetungInfo({ wizardResult }) {
  const reduced = usePrefersReducedMotion();
  // Standardfall Teileinspeisung (Eigenverbrauch + Überschuss) — bewusst default,
  // weil der Rechner konservativ mit diesem Satz rechnet. Volleinspeisung ist
  // der Sonderfall für reine Stromerzeuger ohne Eigenverbrauch.
  const [mode, setMode] = useState("teil");

  const teilCt = EINSPEISEVERGUETUNG_TEIL * 100; // €/kWh → Ct/kWh
  const vollCt = EINSPEISEVERGUETUNG_VOLL * 100;

  const aktiv = mode === "teil";
  const aktivCt = aktiv ? teilCt : vollCt;

  // Personalisierung NUR nach abgeschlossenem Wizard-Durchlauf. kwp > 10 kWp ist
  // bei Einfamilienhäusern selten — dann gelten die oben genannten Sätze (bis
  // 10 kWp) nicht mehr; ohne belegten >10-kWp-Wert zeigen wir bewusst keine Zahl.
  const kwp = wizardResult?.kwp ?? null;
  const hatPersoenlicheAnlage = kwp != null && kwp > 0;
  const passend = hatPersoenlicheAnlage && kwp <= 10;

  const pfad = degressionsPfad(aktivCt);

  return (
    <section aria-labelledby="einspeisung-heading" style={{ background: theme.color.white }}>
      <style>{`
        .einspeise-flow { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 32px; }
        @media (min-width: 900px) { .einspeise-flow { grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 12px; } }
        .einspeise-flow__step { display: flex; gap: 12px; align-items: center; background: ${theme.color.bg}; border: 1px solid ${theme.color.border}; border-radius: ${theme.radius.lg}px; padding: 14px 16px; }
        .einspeise-flow__step.is-feed { background: ${theme.color.skySubtle}; border-color: ${theme.color.sky}; }
        .einspeise-flow__step b { display: block; font-size: 15px; color: ${theme.color.textPrimary}; }
        .einspeise-flow__step span { font-size: 13px; color: ${theme.color.textSecondary}; }
        .einspeise-flow__step > span { display: flex; flex-shrink: 0; }
        .einspeise-flow__arrow, .einspeise-flow__or { align-self: center; justify-self: center; color: ${theme.color.textMuted}; font-size: 13px; font-weight: 600; }
        .einspeise-flow__arrow { font-size: 20px; }
        @media (max-width: 899px) { .einspeise-flow__arrow { transform: rotate(90deg); } }
        .einspeise-panel { background: ${theme.color.white}; border: 1px solid ${theme.color.border}; border-radius: ${theme.radius.lg}px; overflow: hidden; margin-bottom: 8px; }
        .einspeise-top { display: grid; grid-template-columns: 1fr; }
        @media (min-width: 820px) { .einspeise-top { grid-template-columns: 5fr 6fr; } }
        .einspeise-rate { padding: 28px 28px 26px; background: ${theme.color.accentSubtle}; }
        .einspeise-info { padding: 28px; display: flex; flex-direction: column; justify-content: center; gap: 18px; }
        .einspeise-fact { display: flex; gap: 12px; align-items: flex-start; }
        .einspeise-fact b { display: block; font-size: 15px; color: ${theme.color.textPrimary}; margin-bottom: 2px; }
        .einspeise-fact span { font-size: 14px; color: ${theme.color.textSecondary}; line-height: 1.55; }
        .einspeise-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
        .einspeise-track { border-top: 1px solid ${theme.color.border}; padding: 24px 28px 26px; }
        .einspeise-stops { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, 1fr); position: relative; }
        .einspeise-stops::before { content: ""; position: absolute; left: 10%; right: 10%; top: 6px; height: 2px; background: ${theme.color.border}; }
        .einspeise-stop { text-align: center; position: relative; }
        .einspeise-stop i { display: block; width: 14px; height: 14px; border-radius: 50%; margin: 0 auto 12px; background: ${theme.color.white}; border: 2px solid ${theme.color.border}; box-sizing: border-box; }
        .einspeise-stop.is-now i { background: ${theme.color.accent}; border-color: ${theme.color.accent}; box-shadow: 0 0 0 5px ${theme.color.accentSubtle}; }
        @media (max-width: 819px) {
          .einspeise-rate, .einspeise-info { padding: 22px 20px; }
          .einspeise-track { padding: 20px 12px 22px; }
        }
        .einspeise-more { border-top: 1px solid ${theme.color.border}; padding-top: 4px; }
        .einspeise-more > summary { cursor: pointer; list-style: none; padding: 14px 0; min-height: 44px; box-sizing: border-box; font-size: 15px; font-weight: 600; color: ${theme.color.textPrimary}; display: flex; align-items: center; justify-content: space-between; }
        .einspeise-more > summary::-webkit-details-marker { display: none; }
        .einspeise-more > summary::after { content: "+"; font-size: 20px; font-weight: 400; color: ${theme.color.textSecondary}; }
        .einspeise-more[open] > summary::after { content: "–"; }
      `}</style>
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: "56px 20px" }}>
        <Reveal>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: theme.color.accentText, marginBottom: 10 }}>
            Aktueller Stand
          </div>
          <h2 id="einspeisung-heading" style={{ fontFamily: theme.font.display, fontSize: "clamp(26px, 3.2vw, 36px)", fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.12, color: theme.color.textPrimary, margin: "0 0 14px" }}>
            Was ist die Einspeisevergütung?
          </h2>
          {/* Definition zuerst — Laien verstehen den Begriff, bevor Zahlen kommen. */}
          <p style={{ fontSize: 18, lineHeight: 1.6, color: theme.color.textPrimary, margin: "0 0 24px", maxWidth: 760 }}>
            <strong>Einspeisevergütung heißt:</strong> Strom, den Sie nicht selbst verbrauchen, speisen Sie ins
            öffentliche Netz ein. Dafür bekommen Sie von Ihrem Netzbetreiber eine gesetzlich garantierte
            Vergütung — und zwar <strong>20 Jahre lang</strong>.
          </p>

          {/* Der Weg des Solarstroms in einer Zeile: erzeugen → selbst nutzen ODER einspeisen. */}
          <div className="einspeise-flow" aria-label="So wird Ihr Solarstrom genutzt">
            <div className="einspeise-flow__step">
              <span style={{ color: theme.color.accentText }}><IconSun size={26} /></span>
              <div><b>Ihre Anlage erzeugt Strom</b><span>auf Ihrem Dach — kostenlos durch Sonnenlicht</span></div>
            </div>
            <div className="einspeise-flow__arrow" aria-hidden="true">→</div>
            <div className="einspeise-flow__step">
              <span style={{ color: theme.color.success }}><IconHouse size={24} /></span>
              <div><b>Sie nutzen ihn selbst</b><span>spart Ihnen Stromkosten</span></div>
            </div>
            <div className="einspeise-flow__or" aria-hidden="true">oder</div>
            <div className="einspeise-flow__step is-feed">
              <span style={{ color: theme.color.sky }}><IconPlug size={24} /></span>
              <div><b>Überschuss geht ins Netz</b><span>dafür gibt es die Einspeisevergütung</span></div>
            </div>
          </div>

          {hatPersoenlicheAnlage && (
            <div style={{
              background: theme.color.accentSubtle,
              border: `1px solid ${theme.color.accent}`,
              borderRadius: theme.radius.md,
              padding: "12px 16px",
              marginBottom: 14,
              fontSize: 14,
              color: theme.color.accentText,
              lineHeight: 1.55,
            }}>
              {passend ? (
                <>Für Ihre <strong>{String(kwp).replace(".", ",")} kWp-Anlage</strong> gilt der Teileinspeisung-Satz von{" "}
                <strong>{fmtCt(teilCt)} Ct/kWh</strong> — dieser Satz ist für 20 Jahre fest zugesichert.</>
              ) : (
                <>Ihre Anlage hat <strong>{String(kwp).replace(".", ",")} kWp</strong>. Die unten genannten Sätze gelten
                für Anlagen bis 10 kWp — bei größeren Anlagen liegen die Sätze etwas niedriger, die exakte Höhe
                erfahren Sie im Beratungsgespräch.</>
              )}
            </div>
          )}

          {/* EIN Panel statt loser Blöcke: oben der heutige Satz (mit
              Umschalter) + zwei Kernfakten, unten die Zeitachse quer über die
              volle Breite. */}
          <div className="einspeise-panel">
            <div className="einspeise-top">
              <div className="einspeise-rate">
                <div role="radiogroup" aria-label="Vergütungsart wählen" style={{
                  display: "inline-flex", gap: 4, padding: 4, marginBottom: 22,
                  background: theme.color.white, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.pill,
                }}>
                  {[
                    { key: "teil", label: "Teileinspeisung" },
                    { key: "voll", label: "Volleinspeisung" },
                  ].map((o) => {
                    const active = mode === o.key;
                    return (
                      <button
                        key={o.key}
                        role="radio"
                        aria-checked={active}
                        onClick={() => setMode(o.key)}
                        style={{
                          minHeight: 40,
                          padding: "8px 16px",
                          borderRadius: theme.radius.pill,
                          border: "none",
                          background: active ? theme.color.textPrimary : "transparent",
                          color: active ? theme.color.white : theme.color.textSecondary,
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: "pointer",
                          transition: reduced ? "none" : "background-color 0.2s, color 0.2s",
                        }}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: 14, color: theme.color.accentText, fontWeight: 600, marginBottom: 6 }}>
                  Heute gültiger Satz · Anlagen bis 10 kWp
                </div>
                <div style={{ fontFamily: theme.font.display, fontSize: "clamp(44px, 6vw, 60px)", fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                  {fmtCt(aktivCt)}<span style={{ fontSize: 20, fontWeight: 600, letterSpacing: 0, marginLeft: 6 }}>Ct/kWh</span>
                </div>
                <div style={{ fontSize: 14, color: theme.color.textSecondary, lineHeight: 1.55, marginTop: 14, maxWidth: 420 }}>
                  {aktiv
                    ? "Der Standardfall für Eigenverbrauch: Sie nutzen Ihren Solarstrom selbst und speisen nur den Überschuss ein. Unser Rechner rechnet konservativ mit diesem Satz."
                    : "Sonderfall ohne Eigenverbrauch: Die gesamte Erzeugung fließt ins Netz, Ihren Hausstrom kaufen Sie separat. Höherer Satz, aber Sie verlieren den Eigenverbrauchsvorteil von ~0,37 €/kWh."}
                </div>
              </div>

              <div className="einspeise-info">
                <div className="einspeise-fact">
                  <div className="einspeise-dot" style={{ background: theme.color.accent }} />
                  <div>
                    <b>20 Jahre festgeschrieben</b>
                    <span>Ihr Satz wird bei der Inbetriebnahme einmal fixiert und ändert sich danach nicht mehr.</span>
                  </div>
                </div>
                <div className="einspeise-fact">
                  <div className="einspeise-dot" style={{ background: theme.color.sky }} />
                  <div>
                    <b>Sinkt nur für neue Anlagen</b>
                    <span>Alle sechs Monate −1 % gemäß § 49 EEG — früher in Betrieb heißt dauerhaft höherer Satz.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="einspeise-track">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: theme.color.textPrimary }}>So sinkt der Satz für neue Anlagen</div>
                <div style={{ fontSize: 13, color: theme.color.textMuted }}>ab 1.2.2027: rechnerische Fortschreibung</div>
              </div>
              <ol className="einspeise-stops">
                {pfad.map((st, i) => {
                  // Ab 1.2.2027 (i >= 1) zusätzlich mit der Unsicherheit der
                  // geplanten EEG-Reform 2027 behaftet — blasser statt schwarz.
                  const jetzt = i === 0;
                  return (
                    <li key={st.datum} className={`einspeise-stop${jetzt ? " is-now" : ""}`}>
                      <i aria-hidden="true" />
                      <div style={{ fontFamily: theme.font.display, fontSize: "clamp(15px, 2vw, 20px)", fontWeight: 700, color: jetzt ? theme.color.textPrimary : theme.color.textMuted, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
                        {fmtCt(st.ct)}
                      </div>
                      <div style={{ fontSize: 12, color: jetzt ? theme.color.accentText : theme.color.textMuted, fontWeight: jetzt ? 600 : 400, marginTop: 4 }}>
                        {jetzt ? "heute" : st.datum}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          <p style={{ fontSize: 13, color: theme.color.textMuted, lineHeight: 1.6, margin: "14px 0 28px", maxWidth: 860 }}>
            Werte in Ct/kWh, fortgeschrieben für {aktiv ? "Teileinspeisung" : "Volleinspeisung"} (Anlagen bis 10 kWp) aus dem
            amtlich bestätigten Satz von {fmtCt(aktivCt)} Ct/kWh (Stand {DEGRESSIONS_DATEN[0]}): −1 % pro Halbjahr gemäß § 49 EEG.
            Der heute gültige Satz ist für 20 Jahre festgeschrieben — die Folgejahre sind eine rechnerische
            Fortschreibung. Ab 1.2.2027 hängt die weitere Entwicklung von der noch nicht beschlossenen
            EEG-Novelle 2027 ab; die dortigen Werte sind daher keine zugesicherten Sätze.
          </p>

          <details className="einspeise-more">
            <summary>Mehr dazu: Warum der Satz sinkt · Teil- oder Volleinspeisung</summary>
            <div style={{ paddingTop: 14 }}>
          {/* 3. Warum sinkt der Satz — normal, kein Alarm */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 3 }}>Warum sinkt der Satz?</div>
            <div style={{ fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.6 }}>
              Die Vergütung sinkt planmäßig alle sechs Monate — aber <strong>nur für neue Anlagen</strong>. Das ist gesetzlich
              so vorgesehen und hat nichts damit zu tun, ob sich Solar lohnt. Ihr eigener Satz wird bei der Inbetriebnahme{" "}
              <strong>einmal festgeschrieben und für 20 Jahre garantiert</strong> — er ändert sich danach nicht mehr.
            </div>
          </div>

          {/* 4. Teil- vs. Volleinspeisung kurz erklärt, dann der Toggle */}
          <div style={{ fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
            Zwei Arten der Einspeisung: Bei der <strong style={{ color: theme.color.textPrimary }}>Teileinspeisung</strong> nutzen Sie
            einen Teil des Solarstroms selbst und speisen nur den Rest ein — das lohnt sich meist mehr, auch wenn der Satz pro
            Kilowattstunde niedriger ist. Bei der <strong style={{ color: theme.color.textPrimary }}>Volleinspeisung</strong> geht der
            gesamte Strom ins Netz und der Satz ist höher. Unser Rechner geht vom üblichen Fall aus: Teileinspeisung.
          </div>

            </div>
          </details>
        </Reveal>
      </div>
    </section>
  );
}
