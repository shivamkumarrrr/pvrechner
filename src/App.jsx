import { useState, useMemo, useEffect, useCallback } from "react";

const PLZ_MAP = {
  // Saarland (PPC's home region)
  "66111": "Saarbrücken", "66113": "Saarbrücken", "66115": "Saarbrücken", "66117": "Saarbrücken",
  "66119": "Saarbrücken", "66121": "Saarbrücken", "66123": "Saarbrücken", "66125": "Saarbrücken-Dudweiler",
  "66126": "Saarbrücken-Altenkessel", "66127": "Saarbrücken-Klarenthal", "66128": "Saarbrücken-Gersweiler",
  "66129": "Saarbrücken-Bübingen", "66130": "Saarbrücken-Brebach", "66131": "Saarbrücken-Scheidt",
  "66132": "Saarbrücken-Bischmisheim", "66133": "Saarbrücken-Eschringen",
  "66265": "Heusweiler", "66271": "Kleinblittersdorf", "66280": "Sulzbach", "66287": "Quierschied",
  "66292": "Riegelsberg", "66299": "Friedrichsthal",
  "66333": "Völklingen", "66346": "Püttlingen", "66352": "Großrosseln",
  "66386": "St. Ingbert", "66399": "Mandelbachtal",
  "66424": "Homburg", "66440": "Blieskastel", "66450": "Bexbach", "66459": "Kirkel",
  "66482": "Zweibrücken", "66484": "Zweibrücken",
  "66538": "Neunkirchen", "66539": "Neunkirchen", "66540": "Neunkirchen",
  "66557": "Illingen", "66564": "Ottweiler", "66571": "Eppelborn", "66578": "Schiffweiler",
  "66583": "Spiesen-Elversberg", "66589": "Merchweiler",
  "66606": "St. Wendel", "66620": "Nonnweiler", "66625": "Nohfelden", "66629": "Freisen",
  "66636": "Tholey", "66640": "Namborn", "66646": "Marpingen", "66649": "Oberthal",
  "66663": "Merzig", "66679": "Losheim am See", "66687": "Wadern",
  "66693": "Mettlach", "66701": "Beckingen", "66706": "Perl", "66709": "Weiskirchen",
  "66740": "Saarlouis", "66763": "Dillingen", "66773": "Schwalbach", "66780": "Rehlingen-Siersburg",
  "66787": "Wadgassen", "66793": "Saarwellingen", "66798": "Wallerfangen", "66802": "Überherrn",
  "66806": "Ensdorf", "66809": "Nalbach",
  "66822": "Lebach", "66839": "Schmelz", "66849": "Landstuhl",
  // Major German cities
  "10115": "Berlin", "10117": "Berlin", "10119": "Berlin", "10178": "Berlin", "10179": "Berlin",
  "10243": "Berlin", "10247": "Berlin", "10315": "Berlin", "10317": "Berlin", "10318": "Berlin",
  "20095": "Hamburg", "20097": "Hamburg", "20099": "Hamburg", "20144": "Hamburg", "20146": "Hamburg",
  "20148": "Hamburg", "20149": "Hamburg", "20249": "Hamburg", "20251": "Hamburg", "20253": "Hamburg",
  "80331": "München", "80333": "München", "80335": "München", "80336": "München", "80339": "München",
  "80469": "München", "80538": "München", "80539": "München", "80634": "München", "80636": "München",
  "50667": "Köln", "50668": "Köln", "50670": "Köln", "50672": "Köln", "50674": "Köln",
  "50676": "Köln", "50677": "Köln", "50678": "Köln", "50679": "Köln", "50733": "Köln",
  "60306": "Frankfurt am Main", "60308": "Frankfurt am Main", "60310": "Frankfurt am Main",
  "60311": "Frankfurt am Main", "60313": "Frankfurt am Main", "60314": "Frankfurt am Main",
  "60316": "Frankfurt am Main", "60318": "Frankfurt am Main", "60322": "Frankfurt am Main",
  "70173": "Stuttgart", "70174": "Stuttgart", "70176": "Stuttgart", "70178": "Stuttgart",
  "70180": "Stuttgart", "70182": "Stuttgart", "70184": "Stuttgart", "70186": "Stuttgart",
  "40210": "Düsseldorf", "40211": "Düsseldorf", "40212": "Düsseldorf", "40213": "Düsseldorf",
  "40215": "Düsseldorf", "40217": "Düsseldorf", "40219": "Düsseldorf", "40221": "Düsseldorf",
  "44135": "Dortmund", "44137": "Dortmund", "44139": "Dortmund", "44141": "Dortmund",
  "45127": "Essen", "45128": "Essen", "45130": "Essen", "45131": "Essen",
  "28195": "Bremen", "28197": "Bremen", "28199": "Bremen", "28201": "Bremen", "28203": "Bremen",
  "01067": "Dresden", "01069": "Dresden", "01097": "Dresden", "01099": "Dresden",
  "04103": "Leipzig", "04105": "Leipzig", "04107": "Leipzig", "04109": "Leipzig",
  "30159": "Hannover", "30161": "Hannover", "30163": "Hannover", "30165": "Hannover",
  "90402": "Nürnberg", "90403": "Nürnberg", "90408": "Nürnberg", "90409": "Nürnberg",
  "47051": "Duisburg", "47053": "Duisburg", "47055": "Duisburg", "47057": "Duisburg",
  "44787": "Bochum", "44789": "Bochum", "44791": "Bochum", "44793": "Bochum",
  "42103": "Wuppertal", "42105": "Wuppertal", "42107": "Wuppertal",
  "33602": "Bielefeld", "33604": "Bielefeld", "33607": "Bielefeld",
  "53111": "Bonn", "53113": "Bonn", "53115": "Bonn", "53117": "Bonn",
  "48143": "Münster", "48145": "Münster", "48147": "Münster", "48149": "Münster",
  "76131": "Karlsruhe", "76133": "Karlsruhe", "76135": "Karlsruhe", "76137": "Karlsruhe",
  "68159": "Mannheim", "68161": "Mannheim", "68163": "Mannheim", "68165": "Mannheim",
  "86150": "Augsburg", "86152": "Augsburg", "86153": "Augsburg", "86154": "Augsburg",
  "65183": "Wiesbaden", "65185": "Wiesbaden", "65187": "Wiesbaden", "65189": "Wiesbaden",
  "55116": "Mainz", "55118": "Mainz", "55120": "Mainz", "55122": "Mainz",
  "54290": "Trier", "54292": "Trier", "54293": "Trier", "54294": "Trier", "54295": "Trier",
  "67059": "Ludwigshafen", "67061": "Ludwigshafen", "67063": "Ludwigshafen",
  "67655": "Kaiserslautern", "67657": "Kaiserslautern", "67659": "Kaiserslautern",
  "79098": "Freiburg", "79100": "Freiburg", "79102": "Freiburg", "79104": "Freiburg",
};

function getCity(plzInput) {
  const clean = plzInput.trim().replace(/\D.*$/, "").trim();
  if (clean.length === 5 && PLZ_MAP[clean]) return PLZ_MAP[clean];
  return null;
}

// PLZ → approximate lat/lon for PVGIS (region-level, not exact)
const PLZ_COORDS = {
  "10": { lat: 52.52, lon: 13.40, name: "Berlin" },
  "20": { lat: 53.55, lon: 9.99, name: "Hamburg" },
  "28": { lat: 53.08, lon: 8.80, name: "Bremen" },
  "30": { lat: 52.37, lon: 9.74, name: "Hannover" },
  "33": { lat: 52.03, lon: 8.53, name: "Bielefeld" },
  "40": { lat: 51.23, lon: 6.78, name: "Düsseldorf" },
  "42": { lat: 51.26, lon: 7.17, name: "Wuppertal" },
  "44": { lat: 51.51, lon: 7.46, name: "Dortmund" },
  "45": { lat: 51.46, lon: 7.01, name: "Essen" },
  "47": { lat: 51.43, lon: 6.76, name: "Duisburg" },
  "48": { lat: 51.96, lon: 7.63, name: "Münster" },
  "50": { lat: 50.94, lon: 6.96, name: "Köln" },
  "53": { lat: 50.74, lon: 7.10, name: "Bonn" },
  "54": { lat: 49.75, lon: 6.64, name: "Trier" },
  "55": { lat: 50.00, lon: 8.27, name: "Mainz" },
  "60": { lat: 50.11, lon: 8.68, name: "Frankfurt" },
  "65": { lat: 50.08, lon: 8.24, name: "Wiesbaden" },
  "66": { lat: 49.23, lon: 7.00, name: "Saarbrücken" },
  "67": { lat: 49.44, lon: 8.43, name: "Ludwigshafen" },
  "68": { lat: 49.49, lon: 8.47, name: "Mannheim" },
  "70": { lat: 48.78, lon: 9.18, name: "Stuttgart" },
  "76": { lat: 49.01, lon: 8.40, name: "Karlsruhe" },
  "79": { lat: 47.99, lon: 7.85, name: "Freiburg" },
  "80": { lat: 48.14, lon: 11.58, name: "München" },
  "86": { lat: 48.37, lon: 10.90, name: "Augsburg" },
  "90": { lat: 49.45, lon: 11.08, name: "Nürnberg" },
  "01": { lat: 51.05, lon: 13.74, name: "Dresden" },
  "04": { lat: 51.34, lon: 12.37, name: "Leipzig" },
};

function getCoords(plz) {
  const clean = plz.trim().replace(/\D/g, "").slice(0, 5);
  if (clean.length < 2) return null;
  const prefix = clean.slice(0, 2);
  return PLZ_COORDS[prefix] || null;
}

// PVGIS aspect: 0=south, -90=east, 90=west
const PVGIS_ASPECT = {
  "Süd": 0, "Südwest": 45, "Südost": -45, "Ost": -90, "West": 90,
};
const PVGIS_ANGLE = {
  "Flach (0–15°)": 10, "Mittel (25–35°)": 30, "Steil (40–60°)": 50,
};

async function fetchPVGIS(lat, lon, peakpower, angle, aspect) {
  try {
    const url = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=${peakpower}&loss=14&angle=${angle}&aspect=${aspect}&outputformat=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const monthly = data?.outputs?.monthly?.fixed || [];
    const yearlyKwh = monthly.reduce((sum, m) => sum + m.E_m, 0);
    return { yearlyKwh: Math.round(yearlyKwh), monthly, source: "PVGIS" };
  } catch {
    return null;
  }
}

const AUSRICHTUNG = [
  { label: "Süd", factor: 1.0 },
  { label: "Südwest", factor: 0.95 },
  { label: "Südost", factor: 0.95 },
  { label: "Ost", factor: 0.85 },
  { label: "West", factor: 0.85 },
];

const NEIGUNG = [
  { label: "Flach (0–15°)", factor: 0.88, angle: 10 },
  { label: "Mittel (25–35°)", factor: 1.0, angle: 30 },
  { label: "Steil (40–60°)", factor: 0.9, angle: 50 },
];

const DACHFORM = [
  { label: "Satteldach", factor: 0.5, icon: "M50 70 L50 25 L10 55 L10 70 Z M50 25 L90 55 L90 70 L50 70 Z" },
  { label: "Pultdach", factor: 0.8, icon: "M10 70 L10 30 L90 50 L90 70 Z" },
  { label: "Flachdach", factor: 0.9, icon: "M10 45 L90 45 L90 70 L10 70 Z" },
  { label: "Walmdach", factor: 0.45, icon: "M50 20 L90 50 L80 70 L20 70 L10 50 Z" },
];

const HAUSHALT = [
  { label: "1–2 Personen", kwh: 2500 },
  { label: "3–4 Personen", kwh: 4000 },
  { label: "5+ Personen", kwh: 6000 },
];

const STROMPREIS = 0.35;
const EINSPEISE = 0.081;
const ERTRAG_PRO_KWP = 950;
const M2_PRO_KWP = 6;
const KOSTEN_PRO_KWP = 1400;
const CO2_PER_KWH = 0.42;

function calculate(dach, ausrichtung, neigung, verbrauch, speicher, eauto, waermepumpe, pvgisData, dachform) {
  const ausF = AUSRICHTUNG.find((a) => a.label === ausrichtung)?.factor || 1;
  const neiF = NEIGUNG.find((n) => n.label === neigung)?.factor || 1;
  const dachF = DACHFORM.find((d) => d.label === dachform)?.factor || 0.7;
  const nutzbar = dach * dachF;
  const kwp = Math.min(Math.round((nutzbar / M2_PRO_KWP) * 10) / 10, 30);
  const module = Math.round(kwp / 0.42);

  // Use PVGIS real data if available, otherwise fallback to estimate
  let jahresertrag;
  let dataSource;
  if (pvgisData && pvgisData.yearlyKwh) {
    // PVGIS returns for 1kWp, so scale to actual kWp
    jahresertrag = Math.round(pvgisData.yearlyKwh * kwp);
    dataSource = "PVGIS (EU Science Hub)";
  } else {
    jahresertrag = Math.round(kwp * ERTRAG_PRO_KWP * ausF * neiF);
    dataSource = "Schätzung (Durchschnitt DE)";
  }

  let gesamtVerbrauch = verbrauch;
  if (eauto) gesamtVerbrauch += 2500;
  if (waermepumpe) gesamtVerbrauch += 3000;

  const eigenRate = speicher ? 0.7 : 0.3;
  const eigenverbrauch = Math.round(Math.min(jahresertrag * eigenRate, gesamtVerbrauch));
  const einspeisung = jahresertrag - eigenverbrauch;

  const ersparnisEigen = eigenverbrauch * STROMPREIS;
  const ersparnisEinspeisung = einspeisung * EINSPEISE;
  const jahresErsparnis = Math.round(ersparnisEigen + ersparnisEinspeisung);

  let investition = Math.round(kwp * KOSTEN_PRO_KWP);
  if (speicher) investition += 5000;

  const amortisation = Math.round((investition / jahresErsparnis) * 10) / 10;
  const co2 = Math.round(jahresertrag * CO2_PER_KWH);
  const ersparnis25 = Math.round(jahresErsparnis * 25 - investition);
  const autarkie = Math.round((eigenverbrauch / gesamtVerbrauch) * 100);
  const monatlich = Math.round(jahresErsparnis / 12);

  return { kwp, module, nutzbar: Math.round(nutzbar), jahresertrag, eigenverbrauch, einspeisung, jahresErsparnis, investition, amortisation, co2, ersparnis25, gesamtVerbrauch, autarkie, monatlich, dataSource };
}

function Slider({ value, onChange, min, max, step, unit, label }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(String(value));

  const commit = () => {
    let n = parseFloat(temp.replace(/\./g, "").replace(",", "."));
    if (isNaN(n)) n = min;
    n = Math.max(min, Math.min(max, n));
    n = Math.round(n / step) * step;
    onChange(n);
    setTemp(String(n));
    setEditing(false);
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>{label}</span>
        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              autoFocus
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              style={{
                width: 72,
                fontSize: 16,
                fontWeight: 700,
                color: "#0f172a",
                border: "1.5px solid #f59e0b",
                borderRadius: 8,
                padding: "4px 8px",
                textAlign: "right",
                outline: "none",
                fontVariantNumeric: "tabular-nums",
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#64748b" }}>{unit}</span>
          </div>
        ) : (
          <span
            onClick={() => { setTemp(String(value)); setEditing(true); }}
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#0f172a",
              fontVariantNumeric: "tabular-nums",
              cursor: "text",
              padding: "2px 8px",
              borderRadius: 6,
              border: "1.5px dashed transparent",
              transition: "border 0.15s",
            }}
            onMouseEnter={(e) => e.target.style.borderColor = "#cbd5e1"}
            onMouseLeave={(e) => e.target.style.borderColor = "transparent"}
            title="Klicken zum Bearbeiten"
          >
            {value.toLocaleString("de-DE")} {unit}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#f59e0b", height: 6, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
        <span>{min.toLocaleString("de-DE")} {unit}</span>
        <span>{max.toLocaleString("de-DE")} {unit}</span>
      </div>
    </div>
  );
}

function OptionGroup({ options, selected, onSelect, columns = 3 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
      {options.map((opt) => {
        const label = typeof opt === "string" ? opt : opt.label;
        const active = selected === label;
        return (
          <button
            key={label}
            onClick={() => onSelect(label)}
            style={{
              padding: "10px 8px",
              borderRadius: 10,
              border: active ? "2px solid #f59e0b" : "1.5px solid #e2e8f0",
              background: active ? "#fffbeb" : "#fff",
              color: active ? "#92400e" : "#475569",
              fontWeight: active ? 600 : 400,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ label, checked, onChange, sub }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 10,
        border: checked ? "2px solid #f59e0b" : "1.5px solid #e2e8f0",
        background: checked ? "#fffbeb" : "#fff",
        cursor: "pointer",
        marginBottom: 8,
        transition: "all 0.15s",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
      </div>
      <div
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: checked ? "#f59e0b" : "#cbd5e1",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            background: "#fff",
            position: "absolute",
            top: 2,
            left: checked ? 22 : 2,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        />
      </div>
    </div>
  );
}

function ResultCard({ label, value, unit, highlight, sub }) {
  return (
    <div
      style={{
        background: highlight ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#fff",
        borderRadius: 14,
        padding: "18px 16px",
        border: highlight ? "none" : "1.5px solid #e2e8f0",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 12, color: highlight ? "rgba(255,255,255,0.85)" : "#94a3b8", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: highlight ? "#fff" : "#0f172a", fontVariantNumeric: "tabular-nums" }}>
        {value} <span style={{ fontSize: 14, fontWeight: 500 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 11, color: highlight ? "rgba(255,255,255,0.7)" : "#94a3b8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function BarCompare({ label1, val1, label2, val2, unit, color1, color2 }) {
  const max = Math.max(val1, val2);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 100, fontSize: 12, color: "#64748b", textAlign: "right" }}>{label1}</div>
        <div style={{ flex: 1, height: 28, background: "#f1f5f9", borderRadius: 6, overflow: "hidden" }}>
          <div
            style={{
              width: `${(val1 / max) * 100}%`,
              height: "100%",
              background: color1,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
              transition: "width 0.6s ease",
            }}
          >
            {val1.toLocaleString("de-DE")} {unit}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 100, fontSize: 12, color: "#64748b", textAlign: "right" }}>{label2}</div>
        <div style={{ flex: 1, height: 28, background: "#f1f5f9", borderRadius: 6, overflow: "hidden" }}>
          <div
            style={{
              width: `${(val2 / max) * 100}%`,
              height: "100%",
              background: color2,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
              transition: "width 0.6s ease",
            }}
          >
            {val2.toLocaleString("de-DE")} {unit}
          </div>
        </div>
      </div>
    </div>
  );
}

function DachformCard({ item, selected, onSelect }) {
  const active = selected === item.label;
  return (
    <button
      onClick={() => onSelect(item.label)}
      style={{
        padding: "14px 6px 10px",
        borderRadius: 14,
        border: active ? "2px solid #f59e0b" : "1.5px solid #e2e8f0",
        background: active ? "linear-gradient(180deg, #fffbeb, #fff)" : "#fff",
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.2s",
        boxShadow: active ? "0 4px 12px rgba(245,158,11,0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <svg viewBox="0 0 100 80" style={{ width: 60, height: 44, display: "block", margin: "0 auto 6px" }}>
        {/* Ground line */}
        <line x1="5" y1="68" x2="95" y2="68" stroke={active ? "#d97706" : "#94a3b8"} strokeWidth="1.5" />
        {/* House body */}
        <rect x="15" y="45" width="70" height="23" fill={active ? "#fef3c7" : "#f1f5f9"} stroke={active ? "#d97706" : "#94a3b8"} strokeWidth="1.5" rx="1" />
        {/* Window */}
        <rect x="25" y="51" width="10" height="8" rx="1" fill={active ? "#fbbf24" : "#cbd5e1"} opacity="0.6" />
        <rect x="55" y="51" width="10" height="8" rx="1" fill={active ? "#fbbf24" : "#cbd5e1"} opacity="0.6" />
        {/* Door */}
        <rect x="40" y="55" width="8" height="13" rx="1" fill={active ? "#92400e" : "#94a3b8"} opacity="0.5" />
        {/* Roof shape */}
        <path d={item.icon} fill={active ? "#f59e0b" : "#cbd5e1"} stroke={active ? "#d97706" : "#94a3b8"} strokeWidth="1.5" strokeLinejoin="round" opacity="0.85" />
        {/* Solar panel lines on roof */}
        {item.label === "Satteldach" && <>
          <rect x="22" y="30" width="8" height="5" fill={active ? "#1e40af" : "#64748b"} opacity="0.6" transform="rotate(-30 26 32)" rx="0.5" />
          <rect x="33" y="26" width="8" height="5" fill={active ? "#1e40af" : "#64748b"} opacity="0.6" transform="rotate(-30 37 28)" rx="0.5" />
        </>}
        {item.label === "Pultdach" && <>
          <rect x="20" y="30" width="10" height="5" fill={active ? "#1e40af" : "#64748b"} opacity="0.6" transform="rotate(-12 25 32)" rx="0.5" />
          <rect x="40" y="33" width="10" height="5" fill={active ? "#1e40af" : "#64748b"} opacity="0.6" transform="rotate(-12 45 35)" rx="0.5" />
          <rect x="60" y="36" width="10" height="5" fill={active ? "#1e40af" : "#64748b"} opacity="0.6" transform="rotate(-12 65 38)" rx="0.5" />
        </>}
        {item.label === "Flachdach" && <>
          <rect x="25" y="36" width="10" height="4" fill={active ? "#1e40af" : "#64748b"} opacity="0.6" rx="0.5" />
          <rect x="40" y="36" width="10" height="4" fill={active ? "#1e40af" : "#64748b"} opacity="0.6" rx="0.5" />
          <rect x="55" y="36" width="10" height="4" fill={active ? "#1e40af" : "#64748b"} opacity="0.6" rx="0.5" />
        </>}
        {item.label === "Walmdach" && <>
          <rect x="35" y="28" width="8" height="5" fill={active ? "#1e40af" : "#64748b"} opacity="0.6" rx="0.5" />
          <rect x="50" y="32" width="8" height="5" fill={active ? "#1e40af" : "#64748b"} opacity="0.6" rx="0.5" />
        </>}
      </svg>
      <div style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? "#92400e" : "#475569" }}>
        {item.label}
      </div>
      <div style={{ fontSize: 9, color: active ? "#d97706" : "#94a3b8", marginTop: 1 }}>
        ~{Math.round(item.factor * 100)}% nutzbar
      </div>
    </button>
  );
}

function GoogleMapEmbed({ lat, lon, address, plz }) {
  const [mapReady, setMapReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const mapInstanceRef = useState({ current: null })[0];
  const containerId = "leaflet-map";

  useEffect(() => {
    if (!lat || !lon) return;
    setMapReady(false);
    setTimedOut(false);

    const timer = setTimeout(() => setTimedOut(true), 4000);

    const initMap = () => {
      const container = document.getElementById(containerId);
      if (!container || !window.L) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = window.L.map(containerId, {
        center: [lat, lon],
        zoom: 18,
        zoomControl: true,
        attributionControl: false,
      });

      window.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 20 }
      ).addTo(map);

      window.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 20, opacity: 0.7 }
      ).addTo(map);

      window.L.marker([lat, lon]).addTo(map).bindPopup(address ? `${address}, ${plz}` : plz);

      mapInstanceRef.current = map;
      setMapReady(true);
      clearTimeout(timer);

      if (address && address.length > 3) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", " + plz + " Germany")}&limit=1`)
          .then(r => r.json())
          .then(data => {
            if (data?.[0]) {
              map.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 19);
              window.L.marker([parseFloat(data[0].lat), parseFloat(data[0].lon)]).addTo(map).bindPopup(`${address}, ${plz}`).openPopup();
            }
          })
          .catch(() => {});
      }
    };

    if (window.L) {
      initMap();
    } else {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => setTimeout(initMap, 100);
        script.onerror = () => setTimedOut(true);
        document.head.appendChild(script);
      }
    }

    return () => clearTimeout(timer);
  }, [lat, lon, address, plz]);

  // Fallback: static map preview when Leaflet can't load
  if (timedOut && !mapReady) {
    const q = address ? `${address}, ${plz} Germany` : `${plz} Germany`;
    return (
      <div style={{ marginBottom: 12 }}>
        <a
          href={`https://www.google.com/maps?q=${encodeURIComponent(q)}&t=k`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "block", textDecoration: "none" }}
        >
          <div style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1.5px solid #e2e8f0",
            height: 200,
            background: "linear-gradient(135deg, #1a365d 0%, #2d5a87 50%, #1a365d 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            transition: "transform 0.15s",
          }}>
            <div style={{ fontSize: 40 }}>📍</div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>{plz} {address || ""}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Klicken für Satellitenansicht auf Google Maps →</div>
          </div>
        </a>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, textAlign: "center" }}>
          Im Vollbild mit interaktiver Karte und Satellitenansicht
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        id={containerId}
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: "1.5px solid #e2e8f0",
          height: 220,
          background: "#f1f5f9",
          display: mapReady ? "block" : "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!mapReady && (
          <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>🗺️</div>
            Karte wird geladen...
          </div>
        )}
      </div>
      {mapReady && (
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, textAlign: "center" }}>
          🛰️ Satellitenansicht — scrollen zum Zoomen
        </div>
      )}
    </div>
  );
}

export default function SolarRechner() {
  const [step, setStep] = useState(0);
  const [dach, setDach] = useState(60);
  const [ausrichtung, setAusrichtung] = useState("Süd");
  const [neigung, setNeigung] = useState("Mittel (25–35°)");
  const [haushalt, setHaushalt] = useState("3–4 Personen");
  const [verbrauch, setVerbrauch] = useState(4000);
  const [speicher, setSpeicher] = useState(false);
  const [eauto, setEauto] = useState(false);
  const [waermepumpe, setWaermepumpe] = useState(false);
  const [plz, setPlz] = useState("");
  const [address, setAddress] = useState("");
  const [dachform, setDachform] = useState("Satteldach");
  const [customKwh, setCustomKwh] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", telefon: "", nachricht: "" });
  const updateForm = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  // ─── CONFIGURATION ───
  // Replace with your Web3Forms access key (get one free at https://web3forms.com)
  // Or set to null to use Formspree, or "" to disable real submission
  const FORM_API_KEY = ""; // e.g. "your-web3forms-access-key"
  // Alternative: Formspree endpoint
  const FORMSPREE_ID = ""; // e.g. "xyzabc12" from https://formspree.io
  // Calendly URL - replace with your real Calendly link
  const CALENDLY_URL = "https://calendly.com/ppc-beratung/solaranlage"; // placeholder

  const submitForm = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setFormSending(true);
    setFormError(null);

    const leadData = {
      name: form.name,
      email: form.email,
      telefon: form.telefon || "nicht angegeben",
      nachricht: form.nachricht || "keine",
      // Attach the calculation
      plz: displayLocation || plz,
      anlagengroesse: `${result.kwp} kWp`,
      jahresertrag: `${result.jahresertrag.toLocaleString("de-DE")} kWh`,
      jahresersparnis: `${result.jahresErsparnis.toLocaleString("de-DE")} €`,
      amortisation: `${result.amortisation} Jahre`,
      dachflaeche: `${dach} m²`,
      dachform,
      ausrichtung,
      neigung,
      speicher: speicher ? "Ja" : "Nein",
      eauto: eauto ? "Ja" : "Nein",
      waermepumpe: waermepumpe ? "Ja" : "Nein",
      datenquelle: result.dataSource || "Schätzung",
    };

    try {
      let success = false;

      if (FORM_API_KEY) {
        // Web3Forms
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_key: FORM_API_KEY, subject: `Neuer PV-Lead: ${form.name} (${displayLocation || "unbekannt"})`, ...leadData }),
        });
        const data = await res.json();
        success = data.success;
      } else if (FORMSPREE_ID) {
        // Formspree
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadData),
        });
        success = res.ok;
      } else {
        // Demo mode – no backend configured, just simulate success
        await new Promise((r) => setTimeout(r, 800));
        success = true;
      }

      if (success) {
        setFormSent(true);
      } else {
        setFormError("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.");
      }
    } catch {
      setFormError("Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung.");
    }
    setFormSending(false);
  };
  const [animDir, setAnimDir] = useState("right");
  const [animKey, setAnimKey] = useState(0);
  const [pvgisData, setPvgisData] = useState(null);
  const [pvgisLoading, setPvgisLoading] = useState(false);

  // Auto-fetch PVGIS when PLZ is complete
  const coords = useMemo(() => getCoords(plz), [plz]);

  const loadPVGIS = useCallback(async () => {
    if (!coords) { setPvgisData(null); return; }
    const angle = PVGIS_ANGLE[neigung] || 30;
    const aspect = PVGIS_ASPECT[ausrichtung] ?? 0;
    setPvgisLoading(true);
    const data = await fetchPVGIS(coords.lat, coords.lon, 1, angle, aspect);
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

  const resolvedCity = useMemo(() => getCity(plz), [plz]);
  const displayLocation = resolvedCity ? `${plz} ${resolvedCity}` : plz;

  const handleHaushalt = (label) => {
    setHaushalt(label);
    const h = HAUSHALT.find((x) => x.label === label);
    if (h) setVerbrauch(h.kwh);
  };

  const result = calculate(dach, ausrichtung, neigung, verbrauch, speicher, eauto, waermepumpe, pvgisData, dachform);

  const steps = [
    {
      title: "Ihr Standort",
      sub: "Wo soll die Anlage installiert werden?",
      content: (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500, marginBottom: 8 }}>Postleitzahl *</div>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="z.B. 66111"
                maxLength={5}
                value={plz}
                onChange={(e) => setPlz(e.target.value.replace(/\D/g, "").slice(0, 5))}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: resolvedCity ? "2px solid #22c55e" : "1.5px solid #e2e8f0",
                  fontSize: 14,
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                  background: resolvedCity ? "#f0fdf4" : "#fff",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => { if (!resolvedCity) e.target.style.borderColor = "#f59e0b"; }}
                onBlur={(e) => { if (!resolvedCity) e.target.style.borderColor = "#e2e8f0"; }}
              />
              {resolvedCity && (
                <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
                  <span style={{ fontSize: 14, color: "#16a34a", fontWeight: 600 }}>📍 {resolvedCity}</span>
                </div>
              )}
            </div>
            <div style={{ fontSize: 11, color: pvgisLoading ? "#f59e0b" : pvgisData ? "#16a34a" : "#94a3b8", marginTop: 4 }}>
              {pvgisLoading
                ? "⏳ Lade Solardaten vom EU Science Hub..."
                : pvgisData
                ? `✅ Reale Solardaten geladen (PVGIS)`
                : resolvedCity
                ? `Standort erkannt: ${resolvedCity}`
                : plz.length > 0 && plz.length < 5
                ? `Noch ${5 - plz.length} Ziffern...`
                : "Für standortgenaue Sonneneinstrahlung"
              }
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500, marginBottom: 8 }}>Straße & Hausnummer (optional)</div>
            <input
              type="text"
              placeholder="z.B. Viktoriastr. 19"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: 14,
                color: "#0f172a",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Für eine genauere Lokalisierung auf der Karte</div>
          </div>
          {(plz.length === 5) && (
            <GoogleMapEmbed lat={coords?.lat} lon={coords?.lon} address={address} plz={plz} />
          )}
          {/* Trust badges */}
          <div style={{
            display: "flex",
            gap: 10,
            marginTop: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
            {[
              { icon: "🛰️", text: "PVGIS Satellitendaten" },
              { icon: "🇪🇺", text: "EU Science Hub" },
              { icon: "🔒", text: "Datenschutzkonform" },
            ].map((b) => (
              <div key={b.text} style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "#64748b",
                background: "#f8fafc",
                padding: "4px 10px",
                borderRadius: 6,
              }}>
                <span>{b.icon}</span> {b.text}
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      title: "Ihr Dach",
      sub: "Dachform, Fläche, Ausrichtung und Neigung",
      content: (
        <>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500, marginBottom: 10 }}>Dachform</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {DACHFORM.map((d) => (
                <DachformCard key={d.label} item={d} selected={dachform} onSelect={setDachform} />
              ))}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6, fontStyle: "italic" }}>Tipp: Klicken Sie auf die Zahl, um einen genauen Wert einzugeben</div>
          <Slider label="Verfügbare Dachfläche" value={dach} onChange={setDach} min={20} max={200} step={5} unit="m²" />
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500, marginBottom: 10 }}>Dachausrichtung</div>
            <OptionGroup options={AUSRICHTUNG} selected={ausrichtung} onSelect={setAusrichtung} columns={5} />
          </div>
          <div>
            <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500, marginBottom: 10 }}>Dachneigung</div>
            <OptionGroup options={NEIGUNG} selected={neigung} onSelect={setNeigung} columns={3} />
          </div>
        </>
      ),
    },
    {
      title: "Ihr Stromverbrauch",
      sub: "Haushaltsgröße und zusätzliche Verbraucher",
      content: (
        <>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500, marginBottom: 10 }}>Haushaltsgröße</div>
            <OptionGroup options={HAUSHALT} selected={haushalt} onSelect={handleHaushalt} columns={3} />
          </div>
          <Slider label="Jährlicher Stromverbrauch" value={verbrauch} onChange={(v) => { setVerbrauch(v); setHaushalt(""); }} min={1000} max={15000} step={250} unit="kWh" />
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Oder genauen Wert eingeben:</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                placeholder="z.B. 3800"
                value={customKwh}
                onChange={(e) => setCustomKwh(e.target.value.replace(/[^0-9]/g, ""))}
                onBlur={() => {
                  const v = parseInt(customKwh);
                  if (!isNaN(v) && v >= 500 && v <= 20000) { setVerbrauch(v); setHaushalt(""); }
                  setCustomKwh("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = parseInt(customKwh);
                    if (!isNaN(v) && v >= 500 && v <= 20000) { setVerbrauch(v); setHaushalt(""); }
                    setCustomKwh("");
                  }
                }}
                style={{
                  width: 120, padding: "10px 12px", borderRadius: 8,
                  border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a",
                  outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
              />
              <span style={{ fontSize: 14, color: "#64748b" }}>kWh/Jahr</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>Steht auf Ihrer Stromrechnung</span>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500, marginBottom: 10 }}>Zusätzliche Verbraucher</div>
            <Toggle label="Elektroauto / Wallbox" sub="+2.500 kWh/Jahr" checked={eauto} onChange={setEauto} />
            <Toggle label="Wärmepumpe" sub="+3.000 kWh/Jahr" checked={waermepumpe} onChange={setWaermepumpe} />
          </div>
        </>
      ),
    },
    {
      title: "Stromspeicher",
      sub: "Mehr Eigenverbrauch durch Batteriespeicher",
      content: (
        <>
          <div style={{ textAlign: "center", padding: "20px 0 10px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{speicher ? "🔋" : "⚡"}</div>
            <div style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, maxWidth: 400, margin: "0 auto 24px" }}>
              {speicher
                ? "Mit einem Speicher nutzen Sie bis zu 70% Ihres Solarstroms selbst — statt ihn günstig einzuspeisen."
                : "Ohne Speicher nutzen Sie ca. 30% selbst. Der Rest wird ins Netz eingespeist."}
            </div>
          </div>
          <Toggle label="Batteriespeicher hinzufügen" sub="ca. +5.000 € Investition · bis zu 70% Eigenverbrauch" checked={speicher} onChange={setSpeicher} />
          <div style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}>
            <div style={{
              textAlign: "center", padding: 16, borderRadius: 12,
              background: !speicher ? "#fffbeb" : "#f8fafc",
              border: !speicher ? "1.5px solid #fde68a" : "1.5px solid #e2e8f0",
            }}>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Ohne Speicher</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>30%</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Eigenverbrauch</div>
            </div>
            <div style={{
              textAlign: "center", padding: 16, borderRadius: 12,
              background: speicher ? "#fffbeb" : "#f8fafc",
              border: speicher ? "1.5px solid #fde68a" : "1.5px solid #e2e8f0",
            }}>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Mit Speicher</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>70%</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Eigenverbrauch</div>
            </div>
          </div>
        </>
      ),
    },
  ];

  if (showResult) {
    return (
      <div style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", maxWidth: 680, margin: "0 auto", padding: "24px 16px", animation: "fadeScaleIn 0.4s ease" }}>
        <style>{`
          @keyframes fadeScaleIn {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
        {/* Result Header */}
        <div style={{
          background: "linear-gradient(160deg, #0c1220 0%, #162544 40%, #1a3a5c 70%, #1e4d6e 100%)",
          borderRadius: 20,
          padding: "32px 28px",
          color: "#fff",
          marginBottom: 20,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -30, right: -20, opacity: 0.06 }}>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="30" fill="#f59e0b" />
              {[0,45,90,135,180,225,270,315].map(a => (
                <line key={a} x1="75" y1="75" x2={75 + 70*Math.cos(a*Math.PI/180)} y2={75 + 70*Math.sin(a*Math.PI/180)} stroke="#f59e0b" strokeWidth="3" />
              ))}
            </svg>
          </div>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>Ihr Ergebnis</div>
          <div style={{ fontSize: 40, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {result.jahresErsparnis.toLocaleString("de-DE")} €
          </div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 2 }}>geschätzte Ersparnis pro Jahr{displayLocation ? ` · ${displayLocation}` : ""}</div>
          <div style={{
            marginTop: 16,
            padding: "10px 16px",
            background: "rgba(245,158,11,0.2)",
            borderRadius: 10,
            fontSize: 13,
            color: "#fde68a",
          }}>
            In 25 Jahren sparen Sie ca. <strong>{result.ersparnis25.toLocaleString("de-DE")} €</strong> (nach Investition)
          </div>
        </div>

        {/* Autarkiegrad Ring */}
        <div style={{
          background: "#fff",
          borderRadius: 14,
          border: "1.5px solid #e2e8f0",
          padding: "20px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}>
          <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: 100, height: 100 }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={result.autarkie >= 50 ? "#22c55e" : "#f59e0b"}
                strokeWidth="10"
                strokeDasharray={`${result.autarkie * 2.64} ${264 - result.autarkie * 2.64}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{result.autarkie}%</div>
              <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>Autarkie</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>
              {result.autarkie >= 60 ? "Sehr gute Unabhängigkeit!" : result.autarkie >= 40 ? "Gute Unabhängigkeit" : "Teilweise unabhängig"}
            </div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
              {result.autarkie}% Ihres Stroms erzeugen Sie selbst.
              {!speicher && result.autarkie < 50 && " Mit einem Batteriespeicher steigt Ihre Autarkie auf bis zu 70%."}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <ResultCard label="Anlagengröße" value={result.kwp} unit="kWp" sub={`${result.module} Module · ${result.nutzbar} m²`} />
          <ResultCard label="Jahresertrag" value={result.jahresertrag.toLocaleString("de-DE")} unit="kWh" />
          <ResultCard label="Amortisation" value={result.amortisation} unit="Jahre" highlight />
          <ResultCard label="CO₂-Einsparung" value={result.co2.toLocaleString("de-DE")} unit="kg/Jahr" />
        </div>

        {/* Monthly savings highlight */}
        <div style={{
          background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
          borderRadius: 14,
          padding: "16px 18px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 12, color: "#166534", fontWeight: 500 }}>Monatliche Ersparnis</div>
            <div style={{ fontSize: 11, color: "#15803d" }}>Durchschnitt über das Jahr</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#166534" }}>
            {result.monatlich} €<span style={{ fontSize: 13, fontWeight: 500 }}>/Monat</span>
          </div>
        </div>

        {/* Comparison */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "18px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 14 }}>Stromkosten im Vergleich</div>
          <BarCompare
            label1="Ohne Solar"
            val1={Math.round(result.gesamtVerbrauch * STROMPREIS)}
            label2="Mit Solar"
            val2={Math.round(result.gesamtVerbrauch * STROMPREIS) - result.jahresErsparnis}
            unit="€/Jahr"
            color1="#ef4444"
            color2="#22c55e"
          />
        </div>

        {/* Details */}
        <div style={{ background: "#f8fafc", borderRadius: 14, padding: "16px", marginBottom: 20, fontSize: 13, color: "#475569", lineHeight: 1.8 }}>
          <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>Details Ihrer Berechnung</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Eigenverbrauch</span><span style={{ fontWeight: 600, color: "#0f172a" }}>{result.eigenverbrauch.toLocaleString("de-DE")} kWh</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Netzeinspeisung</span><span style={{ fontWeight: 600, color: "#0f172a" }}>{result.einspeisung.toLocaleString("de-DE")} kWh</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Ersparnis Eigenverbrauch</span><span style={{ fontWeight: 600, color: "#0f172a" }}>{Math.round(result.eigenverbrauch * STROMPREIS).toLocaleString("de-DE")} €</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Einspeisevergütung</span><span style={{ fontWeight: 600, color: "#0f172a" }}>{Math.round(result.einspeisung * EINSPEISE).toLocaleString("de-DE")} €</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: 8, marginTop: 8 }}>
            <span>Geschätzte Investition</span><span style={{ fontWeight: 600, color: "#0f172a" }}>{result.investition.toLocaleString("de-DE")} €</span>
          </div>
        </div>

        {/* Urgency + Monthly savings */}
        <div style={{
          background: "#fffbeb",
          border: "1.5px solid #fde68a",
          borderRadius: 14,
          padding: "16px 18px",
          marginBottom: 20,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#92400e", marginBottom: 4 }}>
            Sie könnten jeden Monat ca. {Math.round(result.jahresErsparnis / 12).toLocaleString("de-DE")} € sparen
          </div>
          <div style={{ fontSize: 13, color: "#a16207" }}>
            Je früher Sie starten, desto mehr sparen Sie. Lassen Sie sich jetzt unverbindlich beraten.
          </div>
        </div>

        {/* Lead Form or CTA */}
        {formSent ? (
          <div style={{
            background: "#f0fdf4",
            border: "2px solid #22c55e",
            borderRadius: 14,
            padding: "28px 20px",
            textAlign: "center",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#166534", marginBottom: 6 }}>Vielen Dank, {form.name.split(" ")[0]}!</div>
            <div style={{ fontSize: 14, color: "#15803d", lineHeight: 1.6 }}>
              Ihre Anfrage wurde erfolgreich übermittelt. Ein Fachberater aus Ihrer Region wird sich innerhalb von 24 Stunden bei Ihnen melden.
            </div>
            <div style={{
              marginTop: 16,
              padding: "10px 16px",
              background: "#dcfce7",
              borderRadius: 8,
              fontSize: 12,
              color: "#166534",
              display: "inline-block",
            }}>
              Ihre Berechnung: {result.kwp} kWp Anlage · {result.jahresErsparnis.toLocaleString("de-DE")} €/Jahr Ersparnis
            </div>
          </div>
        ) : showCalendly ? (
          <div style={{
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 14,
            padding: "20px 18px",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>
              Beratungstermin buchen
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              Wählen Sie einen Termin — ein Fachberater bespricht Ihre Berechnung persönlich mit Ihnen.
            </div>
            <div style={{
              background: "#f8fafc",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 14,
              fontSize: 12,
              color: "#64748b",
              lineHeight: 1.6,
            }}>
              Ihre Berechnung wird mitgeteilt: {result.kwp} kWp · {result.jahresertrag.toLocaleString("de-DE")} kWh/Jahr · {result.jahresErsparnis.toLocaleString("de-DE")} €/Jahr{displayLocation ? ` · ${displayLocation}` : ""}
            </div>
            {/* Calendly Embed */}
            <div style={{
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              height: 500,
              marginBottom: 14,
            }}>
              <iframe
                src={`${CALENDLY_URL}?hide_gdpr_banner=1&primary_color=f59e0b`}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 500 }}
                title="Beratungstermin buchen"
              />
            </div>
            <button
              onClick={() => setShowCalendly(false)}
              style={{
                width: "100%",
                padding: "10px",
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              ← Zurück zum Ergebnis
            </button>
          </div>
        ) : showForm ? (
          <div style={{
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 14,
            padding: "20px 18px",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>
              Kostenloses Angebot erhalten
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              Ein regionaler Fachbetrieb erstellt Ihnen ein unverbindliches Angebot basierend auf Ihrer Berechnung.
            </div>

            {[
              { key: "name", label: "Name *", placeholder: "Max Mustermann", type: "text" },
              { key: "email", label: "E-Mail *", placeholder: "max@beispiel.de", type: "email" },
              { key: "telefon", label: "Telefon (optional)", placeholder: "0681 123 456", type: "tel" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 4 }}>{f.label}</div>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => updateForm(f.key, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 13px",
                    borderRadius: 8,
                    border: "1.5px solid #e2e8f0",
                    fontSize: 14,
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border 0.15s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
            ))}

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 4 }}>Nachricht (optional)</div>
              <textarea
                placeholder="z.B. Ich möchte auch eine Wallbox installieren..."
                value={form.nachricht}
                onChange={(e) => updateForm("nachricht", e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  borderRadius: 8,
                  border: "1.5px solid #e2e8f0",
                  fontSize: 14,
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            {/* Summary of their calculation */}
            <div style={{
              background: "#f8fafc",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 14,
              fontSize: 12,
              color: "#64748b",
              lineHeight: 1.6,
            }}>
              Ihre Berechnung wird mitgeschickt: {result.kwp} kWp · {result.jahresertrag.toLocaleString("de-DE")} kWh/Jahr · {result.jahresErsparnis.toLocaleString("de-DE")} €/Jahr Ersparnis{displayLocation ? ` · ${displayLocation}` : ""}
            </div>

            <button
              onClick={submitForm}
              disabled={!form.name.trim() || !form.email.trim() || formSending}
              style={{
                width: "100%",
                padding: "16px",
                background: formSending
                  ? "#94a3b8"
                  : form.name.trim() && form.email.trim()
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "#e2e8f0",
                border: "none",
                borderRadius: 10,
                color: form.name.trim() && form.email.trim() ? "#fff" : "#94a3b8",
                fontSize: 15,
                fontWeight: 600,
                cursor: form.name.trim() && form.email.trim() && !formSending ? "pointer" : "default",
                boxShadow: form.name.trim() && form.email.trim() && !formSending ? "0 4px 14px rgba(245,158,11,0.3)" : "none",
                transition: "all 0.2s",
              }}
            >
              {formSending ? "⏳ Wird gesendet..." : "Angebot anfordern — kostenlos & unverbindlich"}
            </button>

            {formError && (
              <div style={{ textAlign: "center", fontSize: 13, color: "#dc2626", marginTop: 8, padding: "8px 12px", background: "#fef2f2", borderRadius: 8 }}>
                {formError}
              </div>
            )}

            <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 8, lineHeight: 1.5 }}>
              🔒 Ihre Daten werden nur für die Angebotserstellung verwendet und nicht an Dritte weitergegeben.
            </div>

            <button
              onClick={() => setShowForm(false)}
              style={{
                width: "100%",
                padding: "10px",
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: 13,
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              ← Zurück zum Ergebnis
            </button>
          </div>
        ) : (
          <div>
            {/* Primary CTA: Book appointment */}
            <button
              onClick={() => setShowCalendly(true)}
              style={{
                width: "100%",
                padding: "18px",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 10,
                boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
                transition: "transform 0.1s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              📅 Beratungstermin buchen
            </button>
            {/* Secondary CTA: Contact form */}
            <button
              onClick={() => setShowForm(true)}
              style={{
                width: "100%",
                padding: "14px",
                background: "#fff",
                border: "1.5px solid #e2e8f0",
                borderRadius: 12,
                color: "#475569",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                marginBottom: 10,
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              ✉️ Angebot per E-Mail anfragen
            </button>
            <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
              Unverbindlich · Kostenlos · Regionaler Fachbetrieb
            </div>
          </div>
        )}

        {/* Regional badge */}
        {!formSent && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 16px",
            background: "#f8fafc",
            borderRadius: 10,
            marginBottom: 10,
          }}>
            <span style={{ fontSize: 16 }}>🏠</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              {resolvedCity
                ? `Regionaler Fachbetrieb in ${resolvedCity} und Umgebung`
                : "Regionaler Fachbetrieb in Ihrer Nähe"
              }
            </span>
          </div>
        )}

        <button
          onClick={() => { setShowResult(false); setShowForm(false); setShowCalendly(false); setFormSent(false); setStep(0); }}
          style={{
            width: "100%",
            padding: "12px",
            background: "transparent",
            border: "1.5px solid #e2e8f0",
            borderRadius: 12,
            color: "#64748b",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Neu berechnen
        </button>

        <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 16, lineHeight: 1.5 }}>
          * Alle Angaben sind Richtwerte. Die tatsächlichen Ergebnisse können je nach individuellen Gegebenheiten abweichen.
        </div>
        <div style={{
          textAlign: "center",
          marginTop: 8,
          padding: "6px 12px",
          background: result.dataSource?.includes("PVGIS") ? "#ecfdf5" : "#f8fafc",
          borderRadius: 6,
          fontSize: 11,
          color: result.dataSource?.includes("PVGIS") ? "#166534" : "#94a3b8",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          width: "100%",
          justifyContent: "center",
        }}>
          {result.dataSource?.includes("PVGIS") ? "🛰️" : "📊"} Datenquelle: {result.dataSource || "Schätzung"}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(160deg, #0c1220 0%, #162544 40%, #1a3a5c 70%, #1e4d6e 100%)",
        borderRadius: "0 0 24px 24px",
        padding: "40px 28px 32px",
        textAlign: "center",
        color: "#fff",
        marginBottom: 32,
        marginLeft: -16,
        marginRight: -16,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative sun rays */}
        <div style={{ position: "absolute", top: -60, right: -40, opacity: 0.08 }}>
          <svg width="250" height="250" viewBox="0 0 250 250">
            <circle cx="125" cy="125" r="40" fill="#f59e0b" />
            {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
              <line key={a} x1="125" y1="125" x2={125 + 120*Math.cos(a*Math.PI/180)} y2={125 + 120*Math.sin(a*Math.PI/180)} stroke="#f59e0b" strokeWidth="3" />
            ))}
          </svg>
        </div>
        {/* House with panels illustration */}
        <div style={{ marginBottom: 16 }}>
          <svg width="80" height="60" viewBox="0 0 100 75" style={{ display: "block", margin: "0 auto" }}>
            {/* Roof */}
            <path d="M10 40 L50 10 L90 40" fill="none" stroke="#475569" strokeWidth="3" strokeLinejoin="round" />
            {/* Panels on roof */}
            <rect x="25" y="22" width="12" height="8" rx="1" fill="#f59e0b" transform="rotate(-33 31 26)" opacity="0.9" />
            <rect x="40" y="16" width="12" height="8" rx="1" fill="#f59e0b" transform="rotate(-33 46 20)" opacity="0.9" />
            <rect x="55" y="22" width="12" height="8" rx="1" fill="#fbbf24" transform="rotate(33 61 26)" opacity="0.9" />
            <rect x="70" y="16" width="12" height="8" rx="1" fill="#fbbf24" transform="rotate(33 76 20)" opacity="0.7" />
            {/* House body */}
            <rect x="20" y="40" width="60" height="30" fill="#1e293b" stroke="#334155" strokeWidth="1.5" rx="2" />
            {/* Window */}
            <rect x="35" y="47" width="14" height="10" rx="1.5" fill="#fbbf24" opacity="0.4" />
            <rect x="55" y="47" width="14" height="10" rx="1.5" fill="#fbbf24" opacity="0.3" />
            {/* Door */}
            <rect x="43" y="58" width="10" height="12" rx="1" fill="#334155" stroke="#475569" strokeWidth="1" />
            {/* Sun */}
            <circle cx="85" cy="8" r="6" fill="#f59e0b" opacity="0.8" />
            {[0,45,90,135,180,225,270,315].map(a => (
              <line key={`ray${a}`} x1={85 + 8*Math.cos(a*Math.PI/180)} y1={8 + 8*Math.sin(a*Math.PI/180)} x2={85 + 12*Math.cos(a*Math.PI/180)} y2={8 + 12*Math.sin(a*Math.PI/180)} stroke="#f59e0b" strokeWidth="1.5" opacity="0.5" />
            ))}
          </svg>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.3, letterSpacing: -0.5 }}>
          Lohnt sich Photovoltaik<br />für Ihr Dach?
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "0 auto 20px", lineHeight: 1.6, maxWidth: 420 }}>
          Berechnen Sie in 60 Sekunden Ertrag, Ersparnis und Amortisation — basierend auf realen EU-Satellitendaten für Ihren Standort.
        </p>
        <div style={{
          display: "flex",
          gap: 0,
          justifyContent: "center",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 14,
          padding: "14px 8px",
          maxWidth: 380,
          margin: "0 auto",
        }}>
          {[
            { num: "950+", text: "kWh/kWp", sub: "im Saarland" },
            { num: "9–12", text: "Jahre", sub: "Amortisation" },
            { num: "25+", text: "Jahre", sub: "Lebensdauer" },
          ].map((s, i) => (
            <div key={s.sub} style={{
              flex: 1,
              textAlign: "center",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
              padding: "0 8px",
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f59e0b", lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{s.text}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Card */}
      <div style={{
        background: "#fff",
        borderRadius: 20,
        padding: "24px 22px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        marginBottom: 8,
      }}>
      {/* Wizard Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>
          Ihr persönlicher Photovoltaik-Rechner
        </h2>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          4 kurze Schritte — kostenlos und unverbindlich
        </p>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                background: i <= step ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "#e2e8f0",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {["Standort", "Dach", "Verbrauch", "Speicher"].map((label, i) => (
            <div key={label} style={{
              fontSize: 10,
              color: i <= step ? "#d97706" : "#cbd5e1",
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
        <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
          Schritt {step + 1} von {steps.length}
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a" }}>{steps[step].title}</div>
        <div style={{ fontSize: 13, color: "#94a3b8" }}>{steps[step].sub}</div>
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
          @keyframes fadeScaleIn {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
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
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              color: "#64748b",
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
            background: step === steps.length - 1 ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#0f172a",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: step === steps.length - 1 ? "0 4px 14px rgba(245,158,11,0.3)" : "none",
            transition: "transform 0.1s",
          }}
          onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
          onMouseUp={(e) => e.target.style.transform = "scale(1)"}
        >
          {step === steps.length - 1 ? "Ergebnis berechnen ☀️" : "Weiter →"}
        </button>
      </div>
      </div> {/* end wizard card */}

      {/* Info Section below wizard */}
      {step === 0 && (
        <div style={{ marginTop: 32 }}>
          {/* Why Solar */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 10 }}>
              Warum sich Photovoltaik 2026 besonders lohnt
            </h3>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: 0 }}>
              Strompreise steigen, Solarmodule werden günstiger. Eine durchschnittliche Anlage amortisiert sich heute in 9 bis 12 Jahren — danach produzieren Sie über 15 Jahre lang kostenlosen Strom. Dazu kommt: Mit einem Batteriespeicher nutzen Sie bis zu 70% Ihres Solarstroms selbst, statt ihn günstig ins Netz einzuspeisen.
            </p>
          </div>

          {/* How it works */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>
              So funktioniert unser Rechner
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { n: "1", title: "Standort eingeben", text: "Ihr PLZ genügt. Wir laden reale Sonneneinstrahlung-Daten vom EU Science Hub (PVGIS) für Ihren Standort." },
                { n: "2", title: "Dach beschreiben", text: "Dachform, Fläche, Ausrichtung und Neigung — daraus berechnen wir, wie viel Solarfläche verfügbar ist." },
                { n: "3", title: "Verbrauch angeben", text: "Ihr jährlicher Stromverbrauch bestimmt, wie viel Sie durch Eigenverbrauch sparen." },
                { n: "4", title: "Ergebnis erhalten", text: "Anlagengröße, Jahresertrag, Ersparnis, CO₂-Einsparung und Amortisation — alles auf einen Blick." },
              ].map((s) => (
                <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 14,
                    background: "#fffbeb", color: "#d97706",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 600, flexShrink: 0, marginTop: 2,
                  }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{s.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>
              Häufig gestellte Fragen
            </h3>
            {[
              { q: "Was kostet eine Photovoltaikanlage?", a: "Eine typische Anlage für ein Einfamilienhaus (5–10 kWp) kostet zwischen 7.000 und 14.000 € ohne Speicher. Mit Batteriespeicher kommen ca. 5.000–8.000 € dazu. Die Investition rechnet sich in der Regel nach 9–12 Jahren." },
              { q: "Wie viel Strom erzeugt eine Solaranlage im Saarland?", a: "Im Saarland produziert 1 kWp Solarleistung ca. 950–1.000 kWh Strom pro Jahr. Eine typische 8-kWp-Anlage erzeugt also rund 7.600–8.000 kWh — genug für einen 4-Personen-Haushalt." },
              { q: "Lohnt sich ein Batteriespeicher?", a: "Ohne Speicher nutzen Sie nur ca. 30% Ihres Solarstroms selbst — der Rest geht ins Netz (Einspeisevergütung ca. 8 Cent). Mit Speicher steigt der Eigenverbrauch auf 60–70%, und Sie sparen mehr, weil Sie weniger teuren Netzstrom kaufen." },
              { q: "Wie genau ist dieser Rechner?", a: "Wir verwenden reale Sonneneinstrahlung-Daten vom EU PVGIS (Photovoltaic Geographical Information System), das auf Satellitenmessungen basiert. Die Ergebnisse sind Richtwerte — ein Fachbetrieb erstellt Ihnen ein genaues Angebot basierend auf einer Vor-Ort-Prüfung." },
            ].map((faq, i) => (
              <details key={i} style={{
                marginBottom: 8,
                border: "1.5px solid #e2e8f0",
                borderRadius: 10,
                overflow: "hidden",
              }}>
                <summary style={{
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#0f172a",
                  cursor: "pointer",
                  background: "#fafafa",
                  listStyle: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  {faq.q}
                </summary>
                <div style={{ padding: "8px 16px 14px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          {/* Trust Footer */}
          <div style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: 20,
            textAlign: "center",
          }}>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
              {[
                { icon: "🛰️", text: "EU PVGIS Daten" },
                { icon: "🔒", text: "DSGVO-konform" },
                { icon: "🇩🇪", text: "Regionaler Service" },
                { icon: "✅", text: "100% kostenlos" },
              ].map((b) => (
                <div key={b.text} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 12, color: "#64748b",
                }}>
                  <span>{b.icon}</span> {b.text}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
              Dieser Rechner dient zur unverbindlichen Ersteinschätzung. Alle Angaben ohne Gewähr. Für ein verbindliches Angebot kontaktieren Sie einen regionalen Fachbetrieb.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
