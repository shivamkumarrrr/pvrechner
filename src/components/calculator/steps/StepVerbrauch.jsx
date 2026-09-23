import { useState, useEffect } from "react";
import theme from "../../../theme.js";
import Slider from "../ui/Slider.jsx";
import Segmented from "../ui/Segmented.jsx";
import TiltButton from "../ui/TiltButton.jsx";
import SubFlow from "../ui/SubFlow.jsx";
import ContinueButton from "../ui/ContinueButton.jsx";
import { HAUSHALT, TAGESZEITEN, E_AUTO_PROFILE, WAERMEPUMPE_KWH } from "../../../lib/calculate.js";
import { IconPerson, IconClock } from "../../Icons.jsx";

// Himmel-Szene je Tageszeit: Sonnenstand auf einem Tagesbogen (tief am
// Morgen, hoch am Mittag, tief am Abend), nachts Mond. Zeigt ohne Worte,
// wann die Anlage Strom liefert.
function DaySky({ label, active }) {
  const sun = active ? theme.color.accent : "#C9CED3";
  const line = active ? theme.color.accentText : theme.color.textMuted;
  const pos = { Morgens: [18, 34], Mittags: [40, 12], Abends: [62, 34] }[label];
  return (
    <svg viewBox="0 0 80 48" width="80" height="48" aria-hidden="true" style={{ display: "block", marginBottom: 4 }}>
      <path d="M8 42 Q40 -6 72 42" fill="none" stroke={line} strokeWidth="1.2" strokeDasharray="2 3" opacity="0.6" />
      <line x1="4" y1="42" x2="76" y2="42" stroke={line} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      {pos ? (
        <g>
          <circle cx={pos[0]} cy={pos[1]} r={label === "Mittags" ? 7.5 : 6} fill={sun} />
          {label === "Mittags" && [0, 45, 90, 135, 180, 225, 270, 315].map((d) => {
            const r1 = 10.5, r2 = 14, rr = (d * Math.PI) / 180;
            return <line key={d} x1={pos[0] + r1 * Math.cos(rr)} y1={pos[1] + r1 * Math.sin(rr)} x2={pos[0] + r2 * Math.cos(rr)} y2={pos[1] + r2 * Math.sin(rr)} stroke={sun} strokeWidth="1.8" strokeLinecap="round" />;
          })}
        </g>
      ) : (
        <g>
          <path d="M46 10a11 11 0 1 0 8 19 9 9 0 1 1-8-19z" fill={active ? theme.color.brandNavy : "#C9CED3"} />
          <circle cx="22" cy="14" r="1.4" fill={line} />
          <circle cx="30" cy="26" r="1" fill={line} />
          <circle cx="64" cy="18" r="1.2" fill={line} />
        </g>
      )}
    </svg>
  );
}

// Haushalts-Gruppe als eigene Illustration: überlappende Figuren (Kopf +
// Schultern), abwechselnd groß/klein, damit ein Haushalt statt einer
// Icon-Reihe entsteht. Ab 5 Personen: 4 Figuren + "+".
function PeopleGroup({ count, active }) {
  const n = Math.min(count, 4);
  const sizes = [1, 0.82, 0.92, 0.74];
  const fills = active
    ? [theme.color.accent, theme.color.accentText, "#E9A441", "#B8721A"]
    : [theme.color.textSecondary, theme.color.textMuted, "#9AA1A9", "#B7BDC3"];
  const step = 17;
  const width = 28 + (n - 1) * step + (count > 4 ? 14 : 0);
  return (
    <svg viewBox={`0 0 ${width} 44`} height="44" width={width} aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      {Array.from({ length: n }).map((_, i) => {
        const k = sizes[i];
        const cx = 14 + i * step;
        const base = 44;
        const headR = 6.2 * k;
        const shoulderW = 12 * k;
        const bodyTop = base - 22 * k;
        return (
          <g key={i}>
            <path
              d={`M${cx - shoulderW} ${base} Q${cx - shoulderW} ${bodyTop} ${cx} ${bodyTop} Q${cx + shoulderW} ${bodyTop} ${cx + shoulderW} ${base} Z`}
              fill={fills[i]} stroke={theme.color.white} strokeWidth="2"
            />
            <circle cx={cx} cy={bodyTop - headR - 2} r={headR} fill={fills[i]} stroke={theme.color.white} strokeWidth="2" />
          </g>
        );
      })}
      {count > 4 && (
        <text x={width - 4} y={24} textAnchor="middle" fontSize="16" fontWeight="700" fill={active ? theme.color.accentText : theme.color.textSecondary}>+</text>
      )}
    </svg>
  );
}

const HAUSHALT_MAX_KWH = Math.max(...HAUSHALT.map((h) => h.kwh));

function PersonOption({ opt, active, onClick }) {
  const pct = (opt.kwh / HAUSHALT_MAX_KWH) * 100;
  return (
    <TiltButton
      onClick={onClick}
      aria-pressed={active}
      className={`hh-card${active ? " is-active" : ""}`}
      style={{
        borderRadius: theme.radius.lg,
        border: active ? `2px solid ${theme.color.accent}` : `1px solid ${theme.color.border}`,
        background: active ? theme.color.accentSubtle : theme.color.white,
        cursor: "pointer",
        transition: "border-color 0.15s, background-color 0.15s",
      }}
    >
      <div className="hh-card__art"><PeopleGroup count={opt.persons} active={active} /></div>
      <div className="hh-card__text">
        <div style={{ fontFamily: theme.font.display, fontSize: 15, fontWeight: 600, color: theme.color.textPrimary, whiteSpace: "nowrap" }}>{opt.label}</div>
        <div style={{ fontSize: 13, marginTop: 2, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          <strong style={{ color: active ? theme.color.accentText : theme.color.textPrimary, fontWeight: 600 }}>{opt.kwh.toLocaleString("de-DE")} kWh</strong>
          <span className="hh-card__per" style={{ color: theme.color.textMuted }}> pro Jahr</span>
        </div>
        {/* Mini-Balken: Verbrauch relativ zum größten Haushalt — macht die
            Unterschiede zwischen den Karten auf einen Blick vergleichbar. */}
        <div aria-hidden="true" style={{ height: 4, borderRadius: 2, background: active ? theme.color.white : theme.color.bg, marginTop: 10, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: active ? theme.color.accent : theme.color.textMuted }} />
        </div>
      </div>
    </TiltButton>
  );
}

// Eigenständig gezeichnete Szenen-Illustrationen im Stil der Dachform-Karten
// (viewBox 100×80, dünne Striche, Akzenttöne) — keine generischen Glyphen.
// SMA-Muster: jede Verbraucher-Option bekommt eine eigene kleine Illustration,
// statt nur einem Icon + Text.

function CarChargeScene({ active }) {
  const s = active ? theme.color.accentText : theme.color.textMuted;
  const f = active ? theme.color.accentSubtle : theme.color.bg;
  return (
    <svg viewBox="0 0 100 80" style={{ width: 74, height: 56, flexShrink: 0 }} role="img" aria-label="E-Auto an Ladesäule">
      <line x1="4" y1="68" x2="96" y2="68" stroke={s} strokeWidth="2" />
      <rect x="18" y="45" width="54" height="12" rx="4" fill={f} stroke={s} strokeWidth="2" />
      <path d="M31 45 37 35h23l9 10" fill={f} stroke={s} strokeWidth="2" strokeLinejoin="round" />
      <path d="M41 37h11l5 8h-9z" fill={active ? theme.color.accent : theme.color.border} opacity="0.6" />
      <circle cx="30" cy="58" r="5" fill={f} stroke={s} strokeWidth="2" />
      <circle cx="60" cy="58" r="5" fill={f} stroke={s} strokeWidth="2" />
      <rect x="84" y="30" width="9" height="26" rx="2" fill={f} stroke={s} strokeWidth="2" />
      <path d="M88.5 24 91 30h-2.4l3 6" fill="none" stroke={active ? theme.color.accent : theme.color.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M84 46q-8 2-10 6" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeatpumpScene({ active }) {
  const s = active ? theme.color.accentText : theme.color.textMuted;
  const f = active ? theme.color.accentSubtle : theme.color.bg;
  return (
    <svg viewBox="0 0 100 80" style={{ width: 74, height: 56, flexShrink: 0 }} role="img" aria-label="Wärmepumpe mit Wärmewellen">
      <line x1="4" y1="68" x2="96" y2="68" stroke={s} strokeWidth="2" />
      <path d="M62 32q2-4 0-8M72 32q2-4 0-8M82 32q2-4 0-8" fill="none" stroke={active ? theme.color.accent : theme.color.textSecondary} strokeWidth="2" strokeLinecap="round" />
      <rect x="30" y="38" width="46" height="30" rx="4" fill={f} stroke={s} strokeWidth="2" />
      <circle cx="46" cy="53" r="9" fill="none" stroke={s} strokeWidth="2" />
      <circle cx="46" cy="53" r="2.5" fill={active ? theme.color.accent : theme.color.textSecondary} />
      <path d="M47 46l6 5-6 4" fill="none" stroke={active ? theme.color.accent : theme.color.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VerbraucherCard({ Illustration, title, sub, active, badge, children }) {
  return (
    <TiltButton
      as="div"
      style={{
        border: active ? `2px solid ${theme.color.accent}` : `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.lg,
        padding: active ? "15px" : "16px",
        background: theme.color.white,
        marginBottom: 12,
        transition: "border-color 0.15s",
      }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 14 }}>
        <div style={{
          width: 88, height: 68, flexShrink: 0, borderRadius: theme.radius.md,
          background: active ? theme.color.accentSubtle : theme.color.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background-color 0.2s",
        }}>
          <Illustration active={active} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontFamily: theme.font.display, fontSize: 16, fontWeight: 600, color: theme.color.textPrimary }}>{title}</div>
            {badge && (
              <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: theme.radius.pill, background: theme.color.accentSubtle, color: theme.color.accentText, whiteSpace: "nowrap" }}>{badge}</span>
            )}
          </div>
          <div style={{ fontSize: 13, color: theme.color.textSecondary, lineHeight: 1.45, marginTop: 3 }}>{sub}</div>
        </div>
      </div>
      {children}
    </TiltButton>
  );
}

// Der Verbrauch-Schritt ist in 4 Sub-Screens aufgeteilt (eine Entscheidung
// pro Screen): Haushalt → Verbrauch → Zusatzverbraucher → Tageszeit. Karten-
// Auswahl (Haushalt) geht automatisch weiter, Slider-/Mehrfach-Screens haben
// einen expliziten "Weiter"-Button. Der letzte Screen (Tageszeit, Mehrfach-
// auswahl) verlässt sich auf den übergeordneten "Weiter →"-Button des Wizards.
export default function StepVerbrauch({ haushalt, onHaushaltChange, verbrauch, setVerbrauch, setHaushalt, eauto, setEauto, eautoProfil, setEautoProfil, waermepumpe, setWaermepumpe, tageszeit, setTageszeit, onReadyChange, onIndexChange, backRef }) {
  // Gespiegelt an Slider.jsx: das Feld zeigt immer den tatsächlichen, aktuell
  // committeten Verbrauch (nicht nur ein leeres Eingabe-Feld) und bleibt mit
  // `verbrauch` synchron, wenn dieser von anderswo geändert wird (Slider,
  // Personenzahl-Auswahl) — solange das Feld nicht gerade fokussiert ist.
  // Bug vorher: onBlur committete den Wert korrekt an `verbrauch`, setzte das
  // Feld selbst danach aber auf "" zurück — dadurch verschwand der gerade
  // eingegebene Wert sofort wieder zum grauen Platzhaltertext.
  const [customKwh, setCustomKwh] = useState(String(verbrauch));
  const [customKwhFocused, setCustomKwhFocused] = useState(false);

  useEffect(() => {
    if (!customKwhFocused) setCustomKwh(String(verbrauch));
  }, [verbrauch, customKwhFocused]);

  const commitCustomKwh = () => {
    const v = parseInt(customKwh, 10);
    if (!isNaN(v) && v >= 500 && v <= 20000) {
      setVerbrauch(v);
      setHaushalt("");
      setCustomKwh(String(v));
    } else {
      setCustomKwh(String(verbrauch)); // ungültige Eingabe: zurück auf aktuellen Wert, nicht leer
    }
  };

  const toggleTageszeit = (label) =>
    setTageszeit((prev) => prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]);

  const eautoProfilWert = E_AUTO_PROFILE.find((p) => p.label === eautoProfil) || E_AUTO_PROFILE[1];

  const hintBox = (text) => (
    <div style={{ fontSize: 13, color: theme.color.textSecondary, background: theme.color.bg, borderRadius: theme.radius.md, padding: "10px 14px", marginTop: 10, lineHeight: 1.55 }}>
      {text}
    </div>
  );

  return (
    <SubFlow total={4} onReadyChange={onReadyChange} onIndexChange={onIndexChange} backRef={backRef}>
      {({ index, forward, autoAdvance }) => (
        <>
          {index === 0 && (
            <div>
              <style>{`
                .hh-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
                .hh-card { width: 100%; display: flex; align-items: center; gap: 16px; padding: 12px 16px; text-align: left; font-family: inherit; }
                .hh-card__art { width: 96px; flex-shrink: 0; display: flex; justify-content: center; }
                .hh-card__text { flex: 1; min-width: 0; }
                @media (min-width: 640px) {
                  .hh-grid { grid-template-columns: repeat(5, 1fr); gap: 10px; }
                  .hh-card { flex-direction: column; align-items: stretch; gap: 12px; padding: 18px 8px 16px; text-align: center; height: 100%; }
                  .hh-card__art { width: auto; height: 48px; align-items: flex-end; }
                  .hh-card__per { display: block; }
                }
              `}</style>
              <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 4 }}>Wie viele Personen leben in Ihrem Haushalt?</div>
              <div style={{ fontSize: 13, color: theme.color.textMuted, marginBottom: 14 }}>Typischer Jahresverbrauch — im nächsten Schritt können Sie ihn anpassen.</div>
              <div className="hh-grid">
                {HAUSHALT.map((opt) => (
                  <PersonOption key={opt.label} opt={opt} active={haushalt === opt.label} onClick={() => autoAdvance(() => onHaushaltChange(opt.label))} />
                ))}
              </div>
            </div>
          )}

          {index === 1 && (
            <div>
              <Slider label="Jährlicher Stromverbrauch" value={verbrauch} onChange={(v) => { setVerbrauch(v); setHaushalt(""); }} min={1000} max={15000} step={250} unit="kWh" />
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: theme.color.textMuted, marginBottom: 6 }}>Oder genauen Wert eingeben:</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="z.B. 3800"
                    aria-label="Jahresverbrauch in kWh genau eingeben"
                    value={customKwh}
                    onChange={(e) => setCustomKwh(e.target.value.replace(/[^0-9]/g, ""))}
                    onFocus={(e) => { setCustomKwhFocused(true); e.target.style.borderColor = theme.color.accent; }}
                    onBlur={(e) => { setCustomKwhFocused(false); commitCustomKwh(); e.target.style.borderColor = theme.color.border; }}
                    onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                    style={{
                      width: 120, padding: "10px 12px", borderRadius: 8,
                      border: `1.5px solid ${theme.color.border}`, fontSize: 14, color: theme.color.textPrimary,
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                  <span style={{ fontSize: 14, color: theme.color.textSecondary }}>kWh/Jahr</span>
                  <span style={{ fontSize: 11, color: theme.color.textMuted }}>Steht auf Ihrer Stromrechnung</span>
                </div>
              </div>
              <ContinueButton onClick={forward} />
            </div>
          )}

          {index === 2 && (
            <div>
              <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 4 }}>Zusätzliche Verbraucher</div>
              <div style={{ fontSize: 13, color: theme.color.textMuted, marginBottom: 14 }}>Rechnet den Mehrverbrauch in Ihre Anlage ein — „Geplant" bleibt außen vor.</div>

              <VerbraucherCard
                Illustration={CarChargeScene}
                title="Elektroauto / Wallbox"
                sub="Rechnet den Ladebedarf nach Ihrem Nutzungsprofil ein."
                active={eauto !== "nein"}
                badge={eauto === "ja" ? "wird eingerechnet" : eauto === "geplant" ? "noch nicht eingerechnet" : null}
              >
                <Segmented
                  options={[
                    { value: "nein", label: "Nein" },
                    { value: "ja", label: "Ja" },
                    { value: "geplant", label: "Geplant" },
                  ]}
                  value={eauto}
                  onChange={setEauto}
                />
                {eauto === "ja" && (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 500, color: theme.color.textSecondary, margin: "14px 0 8px" }}>Wie stark ist das Auto in Nutzung?</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                      {E_AUTO_PROFILE.map((p) => {
                        const active = eautoProfil === p.label;
                        return (
                          <button
                            key={p.label}
                            onClick={() => setEautoProfil(p.label)}
                            style={{
                              padding: "10px 8px",
                              borderRadius: theme.radius.md,
                              border: active ? `2px solid ${theme.color.accent}` : `1px solid ${theme.color.border}`,
                              background: active ? theme.color.accentSubtle : theme.color.white,
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            <div style={{ fontSize: 14, fontWeight: 600, color: theme.color.textPrimary }}>{p.label}</div>
                            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 1 }}>{p.kwh.toLocaleString("de-DE")} kWh/Jahr</div>
                            <div style={{ fontSize: 12, color: theme.color.textMuted }}>{p.sub}</div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
                {eauto === "geplant" && hintBox("E-Auto geplant: Wir rechnen aktuell noch ohne den Mehrverbrauch. Planen Sie die Anlage im Zweifel etwas größer — darum kümmern wir uns im Beratungsgespräch.")}
              </VerbraucherCard>

              <VerbraucherCard
                Illustration={HeatpumpScene}
                title="Wärmepumpe oder Heizstab"
                sub={`Heizung + Warmwasser · +${WAERMEPUMPE_KWH.toLocaleString("de-DE")} kWh/Jahr`}
                active={waermepumpe !== "nein"}
                badge={waermepumpe === "ja" ? "wird eingerechnet" : waermepumpe === "geplant" ? "noch nicht eingerechnet" : null}
              >
                <Segmented
                  options={[
                    { value: "nein", label: "Nein" },
                    { value: "ja", label: "Ja" },
                    { value: "geplant", label: "Geplant" },
                  ]}
                  value={waermepumpe}
                  onChange={setWaermepumpe}
                />
                {waermepumpe === "geplant" && hintBox("Wärmepumpe geplant: Der Mehrverbrauch bleibt noch unberücksichtigt, bis die Wärmepumpe installiert ist — die Anlage lässt sich danach bei Bedarf erweitern.")}
              </VerbraucherCard>

              <ContinueButton onClick={forward} />
            </div>
          )}

          {index === 3 && (
            <div>
              <style>{`
                .tz-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                @media (min-width: 640px) { .tz-grid { grid-template-columns: repeat(4, 1fr); } }
                .tz-card { position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 10px 14px; border-radius: ${theme.radius.lg}px; cursor: pointer; font-family: inherit; text-align: center; transition: border-color 0.15s, background-color 0.15s; }
                .tz-card:focus-visible { outline: 2px solid ${theme.color.accent}; outline-offset: 2px; }
              `}</style>
              <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 4 }}>Wann nutzen Sie den meisten Strom?</div>
              <div style={{ fontSize: 13, color: theme.color.textMuted, marginBottom: 14 }}>Mehrfachauswahl möglich — mittags verbrauchter Strom erhöht Ihren Eigenverbrauch.</div>
              <div className="tz-grid">
                {TAGESZEITEN.map((t) => {
                  const active = tageszeit.includes(t.label);
                  const solar = t.label === "Mittags";
                  return (
                    <button
                      key={t.label}
                      className="tz-card"
                      aria-pressed={active}
                      onClick={() => toggleTageszeit(t.label)}
                      style={{
                        border: active ? `2px solid ${theme.color.accent}` : `1px solid ${theme.color.border}`,
                        background: active ? theme.color.accentSubtle : theme.color.white,
                        padding: active ? "13px 9px 13px" : undefined,
                      }}
                    >
                      {/* Mehrfachauswahl-Häkchen */}
                      <span aria-hidden="true" style={{
                        position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 6,
                        border: active ? "none" : `1.5px solid ${theme.color.border}`,
                        background: active ? theme.color.accent : theme.color.white,
                        color: theme.color.onAccent, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {active && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </span>
                      <DaySky label={t.label} active={active} />
                      <span style={{ fontFamily: theme.font.display, fontSize: 16, fontWeight: 600, color: theme.color.textPrimary }}>{t.label}</span>
                      <span style={{ fontSize: 13, color: theme.color.textSecondary, fontVariantNumeric: "tabular-nums" }}>{t.zeiten}</span>
                      {solar && (
                        <span style={{ marginTop: 4, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", padding: "2px 8px", borderRadius: theme.radius.pill, background: active ? theme.color.white : theme.color.accentSubtle, color: theme.color.accentText }}>
                          beste Solarzeit
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {eauto === "ja" && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: theme.color.textSecondary, lineHeight: 1.55, marginTop: 14, padding: "12px 14px", borderRadius: theme.radius.md, background: theme.color.bg }}>
                  <span style={{ color: theme.color.accentText, display: "flex", marginTop: 1, flexShrink: 0 }}><IconClock size={16} /></span>
                  <span>
                    Ihr Haushalt verbraucht inkl. E-Auto ({eautoProfilWert.label}, +{eautoProfilWert.kwh.toLocaleString("de-DE")} kWh/Jahr) ca.{" "}
                    <strong style={{ color: theme.color.textPrimary }}>{(verbrauch + (waermepumpe === "ja" ? WAERMEPUMPE_KWH : 0) + eautoProfilWert.kwh).toLocaleString("de-DE")} kWh</strong> pro Jahr.
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </SubFlow>
  );
}
