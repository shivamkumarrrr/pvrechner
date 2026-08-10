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
  const [dach, setDach] = useState(60);
  const [ausrichtung, setAusrichtung] = useState("Süd");
  const [neigung, setNeigung] = useState("Mittel (25–35°)");
  const [haushalt, setHaushalt] = useState("4 Personen");
  const [verbrauch, setVerbrauch] = useState(4000);
  const [speicherKwh, setSpeicherKwh] = useState(0);
  // 3-Zustände: "nein" | "ja" | "geplant" — "geplant" zählt nicht in die Berechnung.
  const [eauto, setEauto] = useState("nein");
  const [waermepumpe, setWaermepumpe] = useState("nein");
  const [eautoProfil, setEautoProfil] = useState("Hauptwagen");
  const [tageszeit, setTageszeit] = useState([]);
  const [plz, setPlz] = useState("");
  const [address, setAddress] = useState("");
  const [dachform, setDachform] = useState("Satteldach");
  const [showResult, setShowResult] = useState(false);
  const [animDir, setAnimDir] = useState("right");
  const [animKey, setAnimKey] = useState(0);
  const [pvgisData, setPvgisData] = useState(null);
  const [pvgisLoading, setPvgisLoading] = useState(false);
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
    setPvgisLoading(false);
  }, [coords, neigung, ausrichtung]);

  useEffect(() => {
    if (plz.length === 5) loadPVGIS();
  }, [plz, loadPVGIS]);

  const goStep = (newStep) => {
    setAnimDir(newStep > step ? "right" : "left");
    setAnimKey((k) => k + 1);
    setStep(newStep);
  };

  const goResult = () => {
    setAnimDir("right");
    setAnimKey((k) => k + 1);
    setShowResult(true);
  };

  const restart = () => {
    setShowResult(false);
    setStep(0);
  };

  const resolvedCity = useMemo(() => getCity(plz), [plz]);
  const displayLocation = resolvedCity ? `${plz} ${resolvedCity}` : plz;

  const handleHaushalt = (label) => {
    setHaushalt(label);
    const h = HAUSHALT.find((x) => x.label === label);
    if (h) setVerbrauch(h.kwh);
  };

  const gesamtVerbrauch = computeGesamtVerbrauch(verbrauch, eauto, waermepumpe, eautoProfil);
  const { kwp } = computeKwp(dach, dachform);
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
    <>
      {/* Kontext-Leiste: die bisherigen Eingaben auf einen Blick. Bewusst OBERHALB
          von Layout (nicht innerhalb der Wizard-Card) gerendert: Layout stellt
          Wizard und LivePanel ab 960px als zwei Spalten nebeneinander dar, mit
          einem sticky LivePanel — innerhalb der Wizard-Card lag die Leiste dadurch
          auf breiten Bildschirmen optisch UNTER dem LivePanel (das sticky an
          top:84 schon sichtbar ist, bevor die Card-Kopfzeile+Fortschrittsbalken
          über der Leiste durchgescrollt sind). Als eigenes, volles Element vor
          Layout ist sie bei jeder Breite eindeutig die oberste Zeile. */}
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto 12px", padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {contextItems.map((c) => (
            <div key={c.label} style={{
              flexShrink: 0,
              minWidth: 92,
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
      </div>
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
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {step > 0 && (
              <button
                onClick={() => goStep(step - 1)}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: 12,
                  border: `1.5px solid ${theme.color.border}`,
                  background: theme.color.white,
                  color: theme.color.textSecondary,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                ← Zurück
              </button>
            )}
            <button
              onClick={() => {
                if (step < steps.length - 1) goStep(step + 1);
                else goResult();
              }}
              style={{
                flex: step === 0 ? 1 : 2,
                padding: "14px",
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
          </div>
        </div>
      )}
      sidebar={<LivePanel result={result} speicherKwh={speicherKwh} />}
    />
    </>
  );
}
