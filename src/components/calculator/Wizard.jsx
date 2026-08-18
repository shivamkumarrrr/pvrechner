import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import theme from "../../theme.js";
import { getCity, getCoords } from "../../lib/plz.js";
import { fetchPVGIS, PVGIS_ASPECT, PVGIS_ANGLE } from "../../lib/pvgis.js";
import { calculate, computeKwp, computeGesamtVerbrauch, HAUSHALT, SPEICHER_KWH_PRO_1000_VERBRAUCH } from "../../lib/calculate.js";
import StepStandort from "./steps/StepStandort.jsx";
import StepDach from "./steps/StepDach.jsx";
import StepVerbrauch from "./steps/StepVerbrauch.jsx";
import StepSpeicher from "./steps/StepSpeicher.jsx";
import ResultScreen from "./ResultScreen.jsx";
import Layout from "./Layout.jsx";
import LivePanel from "./LivePanel.jsx";
import { IconMapPin, IconRuler, IconSun, IconBolt, IconBattery } from "../Icons.jsx";

export default function Wizard() {
  const [step, setStep] = useState(0);
  const [dach, setDach] = useState(80);
  const [ausrichtung, setAusrichtung] = useState("Süd");
  const [neigung, setNeigung] = useState("Mittel (25–35°)");
  const [haushalt, setHaushalt] = useState("4 Personen");
  const [verbrauch, setVerbrauch] = useState(5000);
  const [speicherKwh, setSpeicherKwh] = useState(7);
  // 3-Zustände: "nein" | "ja" | "geplant" — "geplant" zählt nicht in die Berechnung.
  const [eauto, setEauto] = useState("nein");
  const [waermepumpe, setWaermepumpe] = useState("nein");
  const [eautoProfil, setEautoProfil] = useState("Hauptwagen");
  const [tageszeit, setTageszeit] = useState([]);
  const [plz, setPlz] = useState("");
  const [address, setAddress] = useState("");
  const [dachform, setDachform] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [animDir, setAnimDir] = useState("right");
  const [animKey, setAnimKey] = useState(0);
  // Schritte mit Sub-Screens (Dach, Verbrauch): der übergeordnete "Weiter →"
  // ist erst freigeschaltet, wenn der Sub-Flow den letzten Screen erreicht
  // hat (one decision per screen) — die Steps melden das über onReadyChange.
  const [stepReady, setStepReady] = useState(false);
  const SUB_FLOW_STEPS = [1, 2];
  // Current sub-screen index within a SubFlow step — used to make the main
  // "← Zurück" button go back within the sub-flow first, instead of jumping
  // to the previous main step and losing progress.
  const [subIndex, setSubIndex] = useState(0);
  const subBackRef = useRef(null);

  // Dachform muss gewählt sein, bevor der User den Dach-Schritt verlassen kann.
  // Der SubFlow setzt stepReady erst beim letzten Sub-Screen (Neigung),
  // aber wir müssen es auch beim Dachform-Screen (index 0) prüfen.
  useEffect(() => {
    if (step === 1 && subIndex === 0) {
      setStepReady(!!dachform);
    }
  }, [step, subIndex, dachform]);
  const [pvgisData, setPvgisData] = useState(null);
  const [pvgisLoading, setPvgisLoading] = useState(false);
  // Incremented on every successfully loaded PVGIS result — LivePanel uses it
  // as flashKey to pulse when a NEW location's data has finished calculating.
  const [pvgisVersion, setPvgisVersion] = useState(0);
  // Precise coordinates from clicking/dragging the marker on the map,
  // overriding the coarse PLZ-prefix center used by default. Stored together
  // with the PLZ it was captured for, so a changed PLZ immediately invalidates
  // it during render — no separate reset-effect needed.
  const [manualCoords, setManualCoords] = useState(null); // { lat, lon, plz }

  const plzCoords = useMemo(() => getCoords(plz), [plz]);
  const coords = manualCoords && manualCoords.plz === plz ? manualCoords : plzCoords;

  // Requests can race (PLZ or marker changed while a PVGIS call is in flight).
  // Each call takes a fresh sequence number; a slower older response must not
  // overwrite the result of the newest request.
  const pvgisReqSeq = useRef(0);

  const loadPVGIS = useCallback(async () => {
    const seq = ++pvgisReqSeq.current;
    if (!coords) { setPvgisData(null); setPvgisLoading(false); return; }
    const angle = PVGIS_ANGLE[neigung] || 30;
    const aspect = PVGIS_ASPECT[ausrichtung] ?? 0;
    setPvgisLoading(true);
    const data = await fetchPVGIS(coords.lat, coords.lon, 1, angle, aspect);
    if (seq !== pvgisReqSeq.current) return;
    setPvgisData(data);
    setPvgisVersion((v) => v + 1);
    setPvgisLoading(false);
  }, [coords, neigung, ausrichtung]);

  useEffect(() => {
    if (plz.length === 5) loadPVGIS();
  }, [plz, loadPVGIS]);

  const goStep = (newStep) => {
    setAnimDir(newStep > step ? "right" : "left");
    setAnimKey((k) => k + 1);
    setStep(newStep);
    setStepReady(!SUB_FLOW_STEPS.includes(newStep));
  };

  const goResult = () => {
    setAnimDir("right");
    setAnimKey((k) => k + 1);
    setShowResult(true);
  };

  const restart = () => {
    setShowResult(false);
    setStep(0);
    setPvgisData(null);
    setPvgisLoading(false);
    setManualCoords(null);
  };

  const resolvedCity = useMemo(() => getCity(plz), [plz]);
  const displayLocation = resolvedCity ? `${plz} ${resolvedCity}` : plz;

  const handleHaushalt = (label) => {
    setHaushalt(label);
    const h = HAUSHALT.find((x) => x.label === label);
    if (h) setVerbrauch(h.kwh);
  };

  const gesamtVerbrauch = computeGesamtVerbrauch(verbrauch, eauto, waermepumpe, eautoProfil);
  const { kwp } = computeKwp(dach, dachform || "Satteldach");
  const speicherVorschlagKwh = Math.round(gesamtVerbrauch / 1000 * SPEICHER_KWH_PRO_1000_VERBRAUCH * 2) / 2;

  const result = calculate(dach, ausrichtung, neigung, verbrauch, speicherKwh, eauto, waermepumpe, pvgisData, dachform, eautoProfil, tageszeit);

  const steps = [
    {
      title: "Ihr Standort",
      sub: "Wo soll die Anlage installiert werden?",
      content: (
        <StepStandort
          plz={plz} setPlz={setPlz}
          address={address} setAddress={setAddress}
          resolvedCity={resolvedCity}
          pvgisLoading={pvgisLoading} pvgisData={pvgisData}
          coords={coords}
          onLocationChange={(lat, lon) => setManualCoords({ lat, lon, plz })}
        />
      ),
    },
    {
      title: "Ihr Dach",
      sub: "Dachform, Fläche, Ausrichtung und Neigung",
      content: (
        <StepDach
          dachform={dachform} setDachform={setDachform}
          dach={dach} setDach={setDach}
          ausrichtung={ausrichtung} setAusrichtung={setAusrichtung}
          neigung={neigung} setNeigung={setNeigung}
          onReadyChange={setStepReady}
          onIndexChange={setSubIndex}
          backRef={subBackRef}
        />
      ),
    },
    {
      title: "Ihr Stromverbrauch",
      sub: "Haushaltsgröße, Verbraucher und wann Sie Strom nutzen",
      content: (
        <StepVerbrauch
          haushalt={haushalt} onHaushaltChange={handleHaushalt}
          verbrauch={verbrauch} setVerbrauch={setVerbrauch} setHaushalt={setHaushalt}
          eauto={eauto} setEauto={setEauto}
          eautoProfil={eautoProfil} setEautoProfil={setEautoProfil}
          waermepumpe={waermepumpe} setWaermepumpe={setWaermepumpe}
          tageszeit={tageszeit} setTageszeit={setTageszeit}
          onReadyChange={setStepReady}
          onIndexChange={setSubIndex}
          backRef={subBackRef}
        />
      ),
    },
    {
      title: "Stromspeicher",
      sub: "Mehr Eigenverbrauch durch Batteriespeicher",
      content: (
        <StepSpeicher
          speicherKwh={speicherKwh} setSpeicherKwh={setSpeicherKwh}
          kwp={kwp} gesamtVerbrauch={gesamtVerbrauch}
          vorschlagKwh={speicherVorschlagKwh}
          tageszeit={tageszeit}
        />
      ),
    },
  ];

  const contextItems = [
    { icon: <IconMapPin size={13} />, label: "Standort", value: displayLocation || "–" },
    { icon: <IconRuler size={13} />, label: "Dachfläche", value: `${dach} m²` },
    { icon: <IconSun size={13} />, label: "Anlage", value: `${kwp} kWp` },
    { icon: <IconBolt size={13} />, label: "Verbrauch", value: `${gesamtVerbrauch.toLocaleString("de-DE")} kWh` },
    { icon: <IconBattery size={13} />, label: "Speicher", value: speicherKwh > 0 ? `${speicherKwh} kWh` : "–" },
  ];

  if (showResult) {
    return (
      <ResultScreen
        result={result}
        displayLocation={displayLocation}
        resolvedCity={resolvedCity}
        dach={dach}
        dachform={dachform}
        ausrichtung={ausrichtung}
        neigung={neigung}
        speicherKwh={speicherKwh}
        eauto={eauto}
        eautoProfil={eautoProfil}
        waermepumpe={waermepumpe}
        tageszeit={tageszeit}
        plz={plz}
        onRestart={restart}
      />
    );
  }

  return (
    <Layout
      main={(
        <div style={{
          background: theme.color.white,
          borderRadius: theme.radius.lg,
          border: `1px solid ${theme.color.border}`,
          padding: "24px 22px",
        }}>
          {/* Wizard Header */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: theme.font.display, fontSize: 19, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 4px" }}>
              Ihr persönlicher Photovoltaik-Rechner
            </h2>
            <p style={{ fontSize: 13, color: theme.color.textMuted, margin: 0 }}>
              4 kurze Schritte — kostenlos und unverbindlich
            </p>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {steps.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 3,
                    background: i <= step ? theme.color.accent : theme.color.border,
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {["Standort", "Dach", "Verbrauch", "Speicher"].map((label, i) => (
                <div key={label} style={{
                  fontSize: 10,
                  color: i <= step ? theme.color.accentHover : theme.color.border,
                  fontWeight: i === step ? 600 : 400,
                  textAlign: "center",
                  flex: 1,
                  transition: "color 0.3s",
                }}>{label}</div>
              ))}
            </div>
          </div>

          {/* Step Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: theme.color.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              Schritt {step + 1} von {steps.length}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.textPrimary }}>{steps[step].title}</div>
            <div style={{ fontSize: 13, color: theme.color.textMuted }}>{steps[step].sub}</div>
          </div>

          {/* Step Content */}
          <div
            key={animKey}
            style={{
              minHeight: 280,
              animation: "slideIn 0.3s ease",
            }}
          >
            <style>{`
              @keyframes slideIn {
                from { opacity: 0; transform: translateX(${animDir === "right" ? "30px" : "-30px"}); }
                to { opacity: 1; transform: translateX(0); }
              }
            `}</style>
            {steps[step].content}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", alignItems: "center", marginTop: 24 }}>
            {/* Zurück: Textlink, links, dezenter Fokus. "Weiter" bleibt der visuelle Hauptfokus. */}
            {(step > 0 || (SUB_FLOW_STEPS.includes(step) && subIndex > 0)) && (
              <button
                onClick={() => {
                  if (SUB_FLOW_STEPS.includes(step) && subIndex > 0 && subBackRef.current) {
                    subBackRef.current();
                  } else {
                    goStep(step - 1);
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px 4px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: theme.color.textMuted,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = theme.color.textPrimary; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = theme.color.textMuted; }}
              >
                ← Zurück
              </button>
            )}
            <div style={{ flex: 1 }} />
            {/* Bei Sub-Flow-Schritten (Dach, Verbrauch) übernimmt der jeweilige
                Sub-Screen die Navigation (Auto-Advance ODER eigener "Weiter"-
                Button) — der übergeordnete Button hier wird erst sichtbar,
                sobald der Sub-Flow den letzten Screen erreicht hat (stepReady).
                Für Dach-Schritt: stepReady wird erst gesetzt wenn dachform gewählt. */}
            {(!SUB_FLOW_STEPS.includes(step) || stepReady) && (
              <button
                onClick={() => {
                  if (step < steps.length - 1) goStep(step + 1);
                  else goResult();
                }}
                style={{
                  padding: "14px 28px",
                  borderRadius: 12,
                  border: "none",
                  background: step === steps.length - 1 ? theme.color.accent : theme.color.textPrimary,
                  color: theme.color.white,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.15s, transform 0.1s",
                }}
                onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
                onMouseUp={(e) => e.target.style.transform = "scale(1)"}
              >
                {step === steps.length - 1 ? "Ergebnis berechnen" : "Weiter →"}
              </button>
            )}
          </div>
        </div>
      )}
      sidebar={(
        <>
          {/* Kontext-Leiste: die bisherigen Eingaben auf einen Blick. Steht
              bewusst IN der rechten Spalte, direkt über der Live-Vorschau —
              nicht mehr über die volle Seitenbreite. Auf Mobile (<960px)
              stapelt sie sich zwischen Wizard-Card und Live-Vorschau. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {contextItems.map((c) => (
                <div key={c.label} style={{
                  flexShrink: 0,
                  minWidth: 92,
                  flex: "1 1 auto",
                  padding: "7px 10px",
                  background: theme.color.white,
                  border: `1px solid ${theme.color.border}`,
                  borderRadius: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: theme.color.textMuted, marginBottom: 2 }}>
                    <span style={{ color: theme.color.textSecondary, display: "flex" }}>{c.icon}</span>
                    {c.label}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{c.value}</div>
                </div>
              ))}
            </div>
            <LivePanel result={result} speicherKwh={speicherKwh} flashKey={pvgisVersion} />
          </div>
        </>
      )}
    />
  );
}
