import { useState, useEffect } from "react";
import theme from "../../../theme.js";
import Slider from "../ui/Slider.jsx";
import Segmented from "../ui/Segmented.jsx";
import TiltButton from "../ui/TiltButton.jsx";
import SubFlow from "../ui/SubFlow.jsx";
import ContinueButton from "../ui/ContinueButton.jsx";
import { HAUSHALT, TAGESZEITEN, E_AUTO_PROFILE, WAERMEPUMPE_KWH } from "../../../lib/calculate.js";
import { IconPerson, IconClock } from "../../Icons.jsx";

function PersonOption({ opt, active, onClick }) {
  const icons = Math.min(opt.persons, 4);
  return (
    <TiltButton
      onClick={onClick}
      style={{
        padding: "12px 6px",
        borderRadius: 10,
        border: active ? `2px solid ${theme.color.accent}` : `1.5px solid ${theme.color.border}`,
        background: active ? theme.color.accentSubtle : theme.color.white,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", gap: 1, justifyContent: "center", marginBottom: 6 }}>
        {Array.from({ length: icons }).map((_, i) => (
          <span key={i} style={{ color: active ? theme.color.accentHover : theme.color.textMuted, display: "flex" }}>
            <IconPerson size={14} />
          </span>
        ))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: active ? theme.color.accentHover : theme.color.textPrimary }}>{opt.label}</div>
      <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>{opt.kwh.toLocaleString("de-DE")} kWh/Jahr</div>
    </TiltButton>
  );
}

// Eigenständig gezeichnete Szenen-Illustrationen im Stil der Dachform-Karten
// (viewBox 100×80, dünne Striche, Akzenttöne) — keine generischen Glyphen.
// SMA-Muster: jede Verbraucher-Option bekommt eine eigene kleine Illustration,
// statt nur einem Icon + Text.

function CarChargeScene({ active }) {
  const s = active ? theme.color.accentHover : theme.color.textMuted;
  const f = active ? theme.color.accentSubtle : theme.color.bg;
  return (
    <svg viewBox="0 0 100 80" style={{ width: 74, height: 56, flexShrink: 0 }} role="img" aria-label="E-Auto an Ladesäule">
      <line x1="4" y1="68" x2="96" y2="68" stroke={s} strokeWidth="1.5" />
      <rect x="18" y="45" width="54" height="12" rx="4" fill={f} stroke={s} strokeWidth="1.5" />
      <path d="M31 45 37 35h23l9 10" fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M41 37h11l5 8h-9z" fill={active ? theme.color.accent : theme.color.border} opacity="0.6" />
      <circle cx="30" cy="58" r="5" fill={f} stroke={s} strokeWidth="1.5" />
      <circle cx="60" cy="58" r="5" fill={f} stroke={s} strokeWidth="1.5" />
      <rect x="84" y="30" width="9" height="26" rx="2" fill={f} stroke={s} strokeWidth="1.5" />
      <path d="M88.5 24 91 30h-2.4l3 6" fill="none" stroke={active ? theme.color.accent : theme.color.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M84 46q-8 2-10 6" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HeatpumpScene({ active }) {
  const s = active ? theme.color.accentHover : theme.color.textMuted;
  const f = active ? theme.color.accentSubtle : theme.color.bg;
  return (
    <svg viewBox="0 0 100 80" style={{ width: 74, height: 56, flexShrink: 0 }} role="img" aria-label="Wärmepumpe mit Wärmewellen">
      <line x1="4" y1="68" x2="96" y2="68" stroke={s} strokeWidth="1.5" />
      <path d="M62 32q2-4 0-8M72 32q2-4 0-8M82 32q2-4 0-8" fill="none" stroke={active ? theme.color.accent : theme.color.textSecondary} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="30" y="38" width="46" height="30" rx="4" fill={f} stroke={s} strokeWidth="1.5" />
      <circle cx="46" cy="53" r="9" fill="none" stroke={s} strokeWidth="1.5" />
      <circle cx="46" cy="53" r="2.5" fill={active ? theme.color.accent : theme.color.textSecondary} />
      <path d="M47 46l6 5-6 4" fill="none" stroke={active ? theme.color.accent : theme.color.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VerbraucherCard({ Illustration, title, sub, active, children }) {
  return (
    <TiltButton
      as="div"
      style={{
        border: active ? `1.5px solid ${theme.color.accent}` : `1.5px solid ${theme.color.border}`,
        borderRadius: theme.radius.lg,
        padding: "14px 14px 12px",
        background: theme.color.white,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
        <Illustration active={active} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textPrimary }}>{title}</div>
          <div style={{ fontSize: 11.5, color: theme.color.textMuted, lineHeight: 1.4, marginTop: 2 }}>{sub}</div>
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
    <div style={{ fontSize: 12, color: theme.color.textSecondary, background: theme.color.bg, borderRadius: 10, padding: "10px 12px", marginTop: 8, lineHeight: 1.6 }}>
      {text}
    </div>
  );

  return (
    <SubFlow total={4} onReadyChange={onReadyChange} onIndexChange={onIndexChange} backRef={backRef}>
      {({ index, forward, autoAdvance }) => (
        <>
          {index === 0 && (
            <div>
              <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 10 }}>Wie viele Personen leben in Ihrem Haushalt?</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(84px, 1fr))", gap: 8 }}>
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
              <div style={{ fontSize: 12, color: theme.color.textMuted, marginBottom: 12 }}>Rechnet den Mehrverbrauch in Ihre Anlage ein — „Geplant" bleibt außen vor.</div>

              <VerbraucherCard
                Illustration={CarChargeScene}
                title="Elektroauto / Wallbox"
                sub="Rechnet den Ladebedarf nach Ihrem Nutzungsprofil ein."
                active={eauto !== "nein"}
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
                    <div style={{ fontSize: 12, color: theme.color.textSecondary, margin: "10px 0 6px" }}>Wie stark ist das Auto in Nutzung?</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                      {E_AUTO_PROFILE.map((p) => {
                        const active = eautoProfil === p.label;
                        return (
                          <button
                            key={p.label}
                            onClick={() => setEautoProfil(p.label)}
                            style={{
                              padding: "10px 6px",
                              borderRadius: 10,
                              border: active ? `2px solid ${theme.color.accent}` : `1.5px solid ${theme.color.border}`,
                              background: active ? theme.color.accentSubtle : theme.color.white,
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            <div style={{ fontSize: 12, fontWeight: 600, color: active ? theme.color.accentHover : theme.color.textPrimary }}>{p.label}</div>
                            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 1 }}>{p.kwh.toLocaleString("de-DE")} kWh/Jahr</div>
                            <div style={{ fontSize: 10, color: theme.color.textMuted }}>{p.sub}</div>
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
              <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 4 }}>Wann nutzen Sie den meisten Strom?</div>
              <div style={{ fontSize: 12, color: theme.color.textMuted, marginBottom: 10 }}>Mehrfachauswahl möglich — mittags verbrauchter Strom erhöht Ihren Eigenverbrauch.</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TAGESZEITEN.map((t) => {
                  const active = tageszeit.includes(t.label);
                  return (
                    <button
                      key={t.label}
                      onClick={() => toggleTageszeit(t.label)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "9px 12px",
                        borderRadius: 999,
                        border: active ? `2px solid ${theme.color.accent}` : `1.5px solid ${theme.color.border}`,
                        background: active ? theme.color.accentSubtle : theme.color.white,
                        color: active ? theme.color.accentHover : theme.color.textSecondary,
                        fontWeight: active ? 600 : 400,
                        fontSize: 12.5,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ color: active ? theme.color.accentHover : theme.color.textSecondary, display: "flex" }}><IconClock size={14} /></span>
                      <span>{t.label}</span>
                      <span style={{ fontSize: 10, color: theme.color.textMuted }}>{t.zeiten}</span>
                    </button>
                  );
                })}
              </div>
              {eauto === "ja" && (
                <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 10 }}>
                  Ihr Haushalt verbraucht inkl. E-Auto ({eautoProfilWert.label}, +{eautoProfilWert.kwh.toLocaleString("de-DE")} kWh/Jahr) ca. {(verbrauch + (waermepumpe === "ja" ? WAERMEPUMPE_KWH : 0) + eautoProfilWert.kwh).toLocaleString("de-DE")} kWh pro Jahr.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </SubFlow>
  );
}
