// Tests für src/lib/calculate.js (Rechenlogik). Zwei Arten:
//   • Invarianten: gelten bei JEDER Konstantenänderung (Physik, Monotonie, Grenzen)
//   • Referenzwerte ("golden"): fixieren das heutige Ergebnis eines Beispiels. Schlagen sie an,
//     hat sich eine Konstante/Formel verschoben — bewusst prüfen, erst dann den Wert nachziehen
//     (CLAUDE.md: Geldkonstanten nie ohne Quelle ändern, Ergebnisse gegen Branchenwerte prüfen).
// Tests mit { todo } sind bekannte Abweichungen: sie laufen, brechen die Pipeline aber nicht.
import test from "node:test";
import assert from "node:assert/strict";
import * as C from "../src/lib/calculate.js";

const near = (actual, expected, eps = 1e-9, msg) => assert.ok(Math.abs(actual - expected) <= eps, msg ?? `${actual} ≠ ${expected} (±${eps})`);
const MITTEL = "Mittel (25–35°)";
const calc = (o = {}) => {
  const a = { dach: 80, ausr: "Süd", neig: MITTEL, verbrauch: 4000, speicher: 0, eauto: "nein", wp: "nein", pvgis: null, form: "Satteldach", profil: null, tageszeit: [], modell: undefined, ...o };
  return C.calculate(a.dach, a.ausr, a.neig, a.verbrauch, a.speicher, a.eauto, a.wp, a.pvgis, a.form, a.profil, a.tageszeit, a.modell);
};
const PVGIS = { yearlyKwh: 1000, monthly: [30, 50, 80, 110, 130, 135, 140, 125, 95, 60, 30, 15].map((E_m, i) => ({ month: i + 1, E_m })) };

// ── Konstanten mit Quelle ────────────────────────────────────────────────────
// Diese Werte stammen aus belegten Quellen (Kommentare in calculate.js). Ändert sich einer, soll das
// bewusst passieren: Quelle + Stand im Kommentar aktualisieren, dann den Wert hier nachziehen.
test("Konstanten: Werte mit Quelle sind unverändert (Stand 14.10.2026)", () => {
  assert.deepEqual({
    STROMPREIS: C.STROMPREIS, EINSPEISE: C.EINSPEISE, EINSPEISE_10_40: C.EINSPEISE_10_40, EINSPEISE_40_100: C.EINSPEISE_40_100,
    EEG2027_UEBERGANG: C.EEG2027_UEBERGANG, EEG2027_DV_BONUS: C.EEG2027_DV_BONUS, MARKTWERT_SOLAR: C.MARKTWERT_SOLAR,
    DIREKTVERMARKTUNG_KOSTEN: C.DIREKTVERMARKTUNG_KOSTEN, EEG_MODELL: C.EEG_MODELL,
    CO2_PER_KWH: C.CO2_PER_KWH, CO2_KG_PRO_BAUM_JAHR: C.CO2_KG_PRO_BAUM_JAHR,
    ERTRAG_PRO_KWP: C.ERTRAG_PRO_KWP, MODULE_WP: C.MODULE_WP, M2_PRO_KWP: C.M2_PRO_KWP, M2_PRO_KWP_FLACHDACH: C.M2_PRO_KWP_FLACHDACH,
    DEGRADATION_PRO_JAHR: C.DEGRADATION_PRO_JAHR, WARTUNG_PROZENT_PRO_JAHR: C.WARTUNG_PROZENT_PRO_JAHR,
    STROMPREIS_STEIGERUNG_PRO_JAHR: C.STROMPREIS_STEIGERUNG_PRO_JAHR, WAERMEPUMPE_KWH: C.WAERMEPUMPE_KWH,
    EIGENVERBRAUCH_MAX: C.EIGENVERBRAUCH_MAX, PVGIS_SYSTEM_LOSS: C.PVGIS_SYSTEM_LOSS, EINSPEISEVERGUETUNG_VOLL: C.EINSPEISEVERGUETUNG_VOLL,
  }, {
    STROMPREIS: 0.37, EINSPEISE: 0.077, EINSPEISE_10_40: 0.0666, EINSPEISE_40_100: 0.0544,
    EEG2027_UEBERGANG: 0.052, EEG2027_DV_BONUS: 0.015, MARKTWERT_SOLAR: 0.04508,
    DIREKTVERMARKTUNG_KOSTEN: 0.01, EEG_MODELL: "2027",
    CO2_PER_KWH: 0.344, CO2_KG_PRO_BAUM_JAHR: 12.5,
    ERTRAG_PRO_KWP: 950, MODULE_WP: 420, M2_PRO_KWP: 4.7, M2_PRO_KWP_FLACHDACH: 12,
    DEGRADATION_PRO_JAHR: 0.005, WARTUNG_PROZENT_PRO_JAHR: 0.01,
    STROMPREIS_STEIGERUNG_PRO_JAHR: 0.02, WAERMEPUMPE_KWH: 3000,
    EIGENVERBRAUCH_MAX: 0.85, PVGIS_SYSTEM_LOSS: 14, EINSPEISEVERGUETUNG_VOLL: 0.1222,
  }, "Eine Konstante mit Geldbezug/Quelle hat sich geändert: Quelle+Stand im Kommentar prüfen, dann hier nachziehen.");
});

// ── Anlagengröße ─────────────────────────────────────────────────────────────
test("computeKwp: Satteldach 80 m² → 8,5 kWp (Patricks Erwartung ~8 kWp)", () => {
  const r = C.computeKwp(80, "Satteldach");
  assert.equal(r.kwp, 8.5);
  assert.equal(r.nutzbar, 40);
  assert.equal(r.module, 20);
});

test("computeKwp: Dachform-Faktoren und Flachdach-Dichte", () => {
  assert.equal(C.computeKwp(100, "Pultdach").kwp, 17.0);
  assert.equal(C.computeKwp(100, "Walmdach").kwp, 9.6);
  assert.equal(C.computeKwp(60, "Flachdach").kwp, 5.0); // 12 m²/kWp, nicht 4,7
  assert.equal(C.computeKwp(100, null).kwp, 14.9); // unbekannte Form: Faktor 0,7
});

test("computeKwp: auf 30 kWp gedeckelt, nie negativ bei 0 m²", () => {
  assert.equal(C.computeKwp(5000, "Flachdach").kwp, 30);
  assert.equal(C.computeKwp(0, "Satteldach").kwp, 0);
});

// ── Verbrauch ────────────────────────────────────────────────────────────────
test("computeGesamtVerbrauch: E-Auto, Wärmepumpe, 'geplant' zählt nicht", () => {
  assert.equal(C.computeGesamtVerbrauch(4000, "nein", "nein"), 4000);
  assert.equal(C.computeGesamtVerbrauch(4000, "geplant", "geplant"), 4000);
  assert.equal(C.computeGesamtVerbrauch(4000, "ja", "nein", "Zweitwagen"), 4800);
  assert.equal(C.computeGesamtVerbrauch(4000, "ja", "nein", "Vielfahrer"), 7000);
  assert.equal(C.computeGesamtVerbrauch(4000, "ja", "nein", "gibt-es-nicht"), 5800); // Fallback Hauptwagen
  assert.equal(C.computeGesamtVerbrauch(4000, "nein", "ja"), 7000);
  assert.equal(C.computeGesamtVerbrauch(4000, "ja", "ja", "Hauptwagen"), 8800);
});

test("computeGesamtVerbrauch: negative/fehlende Eingaben → 0", () => {
  assert.equal(C.computeGesamtVerbrauch(-500, "nein", "nein"), 0);
  assert.equal(C.computeGesamtVerbrauch(undefined, "nein", "nein"), 0);
  assert.equal(C.computeGesamtVerbrauch(null, "nein", "ja"), 3000);
});

// ── Kosten ───────────────────────────────────────────────────────────────────
test("pvAnlagenKosten: Stützstellen exakt, 0 bei ≤ 0, Extrapolation mit letztem Satz", () => {
  for (const p of C.PV_KOSTEN_STUETZSTELLEN) near(C.pvAnlagenKosten(p.kwp), p.kwp * p.euroProKwp, 1e-6, `Stützstelle ${p.kwp}`);
  assert.equal(C.pvAnlagenKosten(0), 0);
  assert.equal(C.pvAnlagenKosten(-3), 0);
  near(C.pvAnlagenKosten(3), 3 * 2090, 1e-6); // unter 5 kWp: Satz der kleinsten Klasse
  near(C.pvAnlagenKosten(30), 20 * 1010 + 10 * 1010, 1e-6); // über 20 kWp: Satz der größten Klasse
  assert.equal(C.kostenProKwp(5), 2090);
});

test("pvAnlagenKosten: Gesamtpreis steigt mit JEDER zusätzlichen kWp (keine Preissprünge nach unten)", () => {
  let prev = 0;
  for (let k = 0.1; k <= 40.001; k += 0.1) {
    const c = C.pvAnlagenKosten(k);
    assert.ok(c > prev, `Preis bei ${k.toFixed(1)} kWp (${c}) nicht größer als davor (${prev})`);
    prev = c;
  }
});

test("pvAnlagenKosten: Interpolation zwischen Stützstellen liegt zwischen den Nachbarn", () => {
  const mitte = C.pvAnlagenKosten(6); // zwischen 5 kWp (10.450 €) und 7 kWp (12.740 €)
  assert.ok(mitte > 5 * 2090 && mitte < 7 * 1820);
  near(mitte, (5 * 2090 + 7 * 1820) / 2, 1e-6);
});

test("speicherKostenProKwh: Staffel inkl. Grenzen", () => {
  const erwartet = [[1, 510], [6, 510], [6.1, 480], [8, 480], [9, 410], [10, 410], [11, 390], [12, 390], [13, 360], [100, 360]];
  for (const [kwh, preis] of erwartet) assert.equal(C.speicherKostenProKwh(kwh), preis, `${kwh} kWh`);
});

test("wechselrichterKosten: auf 1.000–3.000 € (ADAC-Spanne) gedeckelt", () => {
  assert.equal(C.wechselrichterKosten(1), 1000);
  assert.equal(C.wechselrichterKosten(5), 1000); // 650 → Untergrenze
  assert.equal(C.wechselrichterKosten(10), 1300);
  assert.equal(C.wechselrichterKosten(30), 3000);
  assert.equal(C.wechselrichterKosten(500), 3000);
});

// ── Einspeisevergütung ───────────────────────────────────────────────────────
test("einspeiseStaffel: ≤ 10 kWp voller Satz, darüber gewichtet und nie steigend", () => {
  for (const k of [0, 3, 10]) assert.equal(C.einspeiseStaffel(k), C.EINSPEISE);
  near(C.einspeiseStaffel(40), (10 * C.EINSPEISE + 30 * C.EINSPEISE_10_40) / 40);
  near(C.einspeiseStaffel(100), (10 * C.EINSPEISE + 30 * C.EINSPEISE_10_40 + 60 * C.EINSPEISE_40_100) / 100);
  let prev = Infinity;
  for (let k = 0.5; k <= 100; k += 0.5) {
    const s = C.einspeiseStaffel(k);
    assert.ok(s <= prev + 1e-12 && s >= C.EINSPEISE_40_100 - 1e-12, `kWp ${k}`);
    prev = s;
  }
});

test("einspeiseRateJahr: Modell 2026 — 20 Jahre fest, danach Marktwert abzgl. Vermarktung", () => {
  const markt = C.MARKTWERT_SOLAR - C.DIREKTVERMARKTUNG_KOSTEN;
  for (const j of [1, 10, 20]) assert.equal(C.einspeiseRateJahr(j, 8, "2026"), C.EINSPEISE);
  near(C.einspeiseRateJahr(21, 8, "2026"), markt);
  near(C.einspeiseRateJahr(1, 20, "2026"), C.einspeiseStaffel(20));
});

test("einspeiseRateJahr: Modell 2027 — Übergangszahlung, Bonus nur < 25 kWp, ab 50 kWp keine Übergangszahlung", () => {
  const markt = C.MARKTWERT_SOLAR - C.DIREKTVERMARKTUNG_KOSTEN;
  // 8 kWp: Jahre 1–3 Übergang, 4–7 Markt+Bonus, danach Markt
  for (const j of [1, 2, 3]) assert.equal(C.einspeiseRateJahr(j, 8, "2027"), C.EEG2027_UEBERGANG);
  for (const j of [4, 5, 6, 7]) near(C.einspeiseRateJahr(j, 8, "2027"), markt + C.EEG2027_DV_BONUS);
  for (const j of [8, 20, 25]) near(C.einspeiseRateJahr(j, 8, "2027"), markt);
  // 30 kWp: Übergang ja, aber kein Bonus (≥ 25 kWp)
  assert.equal(C.einspeiseRateJahr(2, 30, "2027"), C.EEG2027_UEBERGANG);
  near(C.einspeiseRateJahr(5, 30, "2027"), markt);
  // 60 kWp: gar keine Übergangszahlung
  near(C.einspeiseRateJahr(1, 60, "2027"), markt);
});

test("einspeiseRateMittel: 2026 = heutiger Satz, 2027 = Mittel über 20 Jahre", () => {
  near(C.einspeiseRateMittel(8, "2026"), C.EINSPEISE);
  const markt = C.MARKTWERT_SOLAR - C.DIREKTVERMARKTUNG_KOSTEN;
  near(C.einspeiseRateMittel(8, "2027"), (3 * C.EEG2027_UEBERGANG + 4 * (markt + C.EEG2027_DV_BONUS) + 13 * markt) / 20);
  assert.ok(C.einspeiseRateMittel(8, "2027") < C.einspeiseRateJahr(1, 8, "2027"), "Mittel muss unter dem Erstjahres-Satz liegen");
});

// ── Autarkie ─────────────────────────────────────────────────────────────────
test("autarkieSchaetzung: HTW-Tabellenwerte an Stützstellen exakt", () => {
  near(C.autarkieSchaetzung(4, 4000, 0), 0.305); // r = 1, s = 0
  near(C.autarkieSchaetzung(4, 4000, 4), 0.555); // r = 1, s = 1
  near(C.autarkieSchaetzung(2, 4000, 0), 0.238); // r = 0,5
  near(C.autarkieSchaetzung(0, 4000, 5), 0); // keine Anlage → 0
  assert.equal(C.autarkieSchaetzung(5, 0, 5), 0); // kein Verbrauch → 0 (kein NaN)
});

test("autarkieSchaetzung: wächst nie mit kleinerer Anlage oder kleinerem Speicher (dichte Stichprobe)", () => {
  for (let v = 1000; v <= 12000; v += 1000) {
    for (let s = 0; s <= 20; s += 0.5) {
      let prev = -1;
      for (let k = 0; k <= 30; k += 0.1) { const a = C.autarkieSchaetzung(k, v, s); assert.ok(a + 1e-9 >= prev, `kWp ${k.toFixed(1)}, ${v} kWh, ${s} kWh Speicher`); prev = a; }
    }
    for (let k = 1; k <= 30; k += 1) {
      let prev = -1;
      for (let s = 0; s <= 30; s += 0.25) { const a = C.autarkieSchaetzung(k, v, s); assert.ok(a + 1e-9 >= prev, `Speicher ${s}, ${k} kWp, ${v} kWh`); prev = a; }
    }
  }
});

test("autarkieSchaetzung: immer 0…EIGENVERBRAUCH_MAX, auch extrem überdimensioniert", () => {
  assert.equal(C.autarkieSchaetzung(30, 1000, 30), C.EIGENVERBRAUCH_MAX); // Tabelle ergäbe 0,908 → Deckel
  for (const [k, v, s] of [[0.1, 20000, 0], [30, 1000, 0], [10, 3000, 50], [100, 100, 100]]) {
    const a = C.autarkieSchaetzung(k, v, s);
    assert.ok(a >= 0 && a <= C.EIGENVERBRAUCH_MAX, `${k}/${v}/${s} → ${a}`);
  }
});

test("autarkieSchaetzung: Tageszeit-Korrektur (Mittags +, Nachts −, Mittel, unbekannt ignoriert, bei r < 1 anteilig)", () => {
  const basis = C.autarkieSchaetzung(4, 4000, 0);
  near(C.autarkieSchaetzung(4, 4000, 0, ["Mittags"]), basis + 0.07);
  near(C.autarkieSchaetzung(4, 4000, 0, ["Nachts"]), basis - 0.09);
  near(C.autarkieSchaetzung(4, 4000, 0, ["Mittags", "Nachts"]), basis + (0.07 - 0.09) / 2);
  assert.equal(C.autarkieSchaetzung(4, 4000, 0, ["Mitternacht"]), basis);
  const mi = C.autarkieSchaetzung(4, 4000, 0, ["Mittags"]), ab = C.autarkieSchaetzung(4, 4000, 0, ["Abends"]), na = C.autarkieSchaetzung(4, 4000, 0, ["Nachts"]);
  assert.ok(mi > basis && basis > ab && ab > na);
  // r = 0,5 → Korrektur nur zur Hälfte
  near(C.autarkieSchaetzung(2, 4000, 0, ["Mittags"]), 0.238 + 0.07 * 0.5);
  // nie unter 0
  assert.equal(C.autarkieSchaetzung(0.2, 4000, 0, ["Nachts"]) >= 0, true);
});

// ── Anzeige-Hilfen ───────────────────────────────────────────────────────────
test("formatSpan: ±12 % (de-DE), Sonderfälle", () => {
  assert.equal(C.formatSpan(1000), "880–1.120");
  assert.equal(C.formatSpan(1000, 22), "780–1.220");
  assert.equal(C.formatSpan(0), "0");
  assert.equal(C.formatSpan(NaN), "0");
  assert.equal(C.formatSpan(undefined), "0");
});

test("formatSpan: negative Werte bleiben sortiert (kein '0–-664')", () => {
  assert.equal(C.formatSpan(-664), "-744–-584");
  const [lo, hi] = C.formatSpan(-5000).split("–").map((s) => Number(s.replace(/\./g, "").replace("−", "-")));
  assert.ok(lo <= hi);
});

// ── calculate(): Referenzwerte ───────────────────────────────────────────────
test("calculate: Referenzszenario (8,5 kWp, 4.000 kWh, ohne Speicher, ohne PVGIS) — Stand 14.10.2026", () => {
  const r = calc();
  const ist = { kwp: r.kwp, jahresertrag: r.jahresertrag, eigenverbrauch: r.eigenverbrauch, autarkie: r.autarkie, jahresErsparnis: r.jahresErsparnis, investition: r.investition, amortisation: r.amortisation, ersparnis10: r.ersparnis10, ersparnis20: r.ersparnis20, ersparnis25: r.ersparnis25, eegModell: r.eegModell };
  assert.deepEqual(ist, { kwp: 8.5, jahresertrag: 8075, eigenverbrauch: 1451, autarkie: 36, jahresErsparnis: 806, investition: 12920, amortisation: 15.8, ersparnis10: -5352, ersparnis20: 2648, ersparnis25: 6062, eegModell: "2027" },
    "Ein Referenzwert hat sich verschoben: Konstante/Formel geändert? Quelle prüfen, dann Wert hier bewusst aktualisieren.");
});

test("calculate: Referenzszenario mit 6 kWh Speicher — Stand 14.10.2026", () => {
  const r = calc({ speicher: 6 });
  assert.deepEqual({ eigenverbrauch: r.eigenverbrauch, autarkie: r.autarkie, investition: r.investition, amortisation: r.amortisation, jahresErsparnis: r.jahresErsparnis },
    { eigenverbrauch: 2886, autarkie: 72, investition: 15980, amortisation: 12.3, jahresErsparnis: 1279 });
  assert.equal(r.investition, Math.round(C.pvAnlagenKosten(8.5) + 6 * 510)); // 6 kWh → 510 €/kWh
});

// ── calculate(): Datenquelle ─────────────────────────────────────────────────
test("calculate: PVGIS-Werte werden mit der Anlagengröße skaliert, Monatswerte ebenso", () => {
  const r = calc({ pvgis: { ...PVGIS } });
  assert.equal(r.jahresertrag, Math.round(1000 * 8.5));
  assert.match(r.dataSource, /PVGIS/);
  assert.equal(r.monthly.length, 12);
  assert.equal(r.monthly[0].kwh, Math.round(30 * 8.5));
  assert.equal(r.monthly[6].kwh, Math.round(140 * 8.5));
});

test("calculate: Fallback-Schätzung nutzt Ausrichtung und Neigung; PVGIS ignoriert sie (steckt schon drin)", () => {
  const erwartet = (kwp, f) => Math.round(kwp * C.ERTRAG_PRO_KWP * f);
  assert.equal(calc().jahresertrag, erwartet(8.5, 1));
  assert.equal(calc({ ausr: "Ost" }).jahresertrag, erwartet(8.5, 0.85));
  assert.equal(calc({ ausr: "Nord" }).jahresertrag, erwartet(8.5, 0.29));
  assert.equal(calc({ neig: "Flach (0–15°)" }).jahresertrag, erwartet(8.5, 0.88));
  assert.equal(calc({ ausr: "Südwest", neig: "Steil (40–60°)" }).jahresertrag, erwartet(8.5, 0.95 * 0.9));
  assert.equal(calc({ ausr: "Nord", pvgis: { ...PVGIS } }).jahresertrag, 8500);
  assert.match(calc().dataSource, /Schätzung/);
  const f = Object.fromEntries(C.AUSRICHTUNG.map((a) => [a.label, a.factor]));
  assert.ok(f["Süd"] > f["Südwest"] && f["Südwest"] === f["Südost"] && f["Südost"] > f["Ost"] && f["Ost"] === f["West"] && f["West"] > f["Nord"]);
});

test("calculate: E-Auto/Wärmepumpe erhöhen den Verbrauch, 'geplant' nicht", () => {
  assert.equal(calc({ eauto: "ja", profil: "Hauptwagen" }).gesamtVerbrauch, 5800);
  assert.equal(calc({ wp: "ja" }).gesamtVerbrauch, 7000);
  assert.equal(calc({ eauto: "geplant", wp: "geplant" }).gesamtVerbrauch, 4000);
});

test("calculate: Modell 2026 vs. 2027 (Standard) ändert den Einspeise-Erlös", () => {
  const a = calc({ modell: "2026" }), b = calc({ modell: "2027" });
  assert.equal(a.eegModell, "2026");
  near(a.einspeiseRate, C.EINSPEISE);
  assert.ok(b.einspeiseRate < a.einspeiseRate);
  assert.equal(calc().eegModell, C.EEG_MODELL);
});

// ── calculate(): Invarianten über ein Raster von Eingaben ────────────────────
const RASTER = [];
for (const dach of [15, 40, 80, 150, 300]) for (const form of ["Satteldach", "Pultdach", "Flachdach", "Walmdach"])
  for (const verbrauch of [1000, 2500, 4000, 7000, 15000]) for (const speicher of [0, 3, 8, 15]) for (const eauto of ["nein", "ja"])
    for (const modell of ["2026", "2027"]) RASTER.push({ dach, form, verbrauch, speicher, eauto, modell });

test(`calculate: Physik und Grenzen in ${RASTER.length} Kombinationen`, () => {
  for (const o of RASTER) {
    const r = calc(o), id = JSON.stringify(o);
    assert.ok(r.eigenverbrauch <= r.jahresertrag, `Eigenverbrauch > Ertrag ${id}`);
    assert.ok(r.eigenverbrauch <= r.gesamtVerbrauch + 1, `Eigenverbrauch > Verbrauch ${id}`);
    assert.equal(r.einspeisung, r.jahresertrag - r.eigenverbrauch, id);
    assert.ok(r.einspeisung >= 0 && r.eigenverbrauch >= 0, id);
    assert.ok(r.autarkie >= 0 && r.autarkie <= 100, `Autarkie ${r.autarkie} ${id}`);
    assert.ok(r.eigenverbrauchsquote >= 0 && r.eigenverbrauchsquote <= 1, id);
    assert.ok(r.kwp >= 0 && r.kwp <= 30, id);
    assert.ok(r.amortisation > 0 && r.amortisation <= 60, `Amortisation ${r.amortisation} ${id}`);
    assert.equal(r.investition, Math.round(C.pvAnlagenKosten(r.kwp) + (o.speicher > 0 ? o.speicher * C.speicherKostenProKwh(o.speicher) : 0)), id);
    assert.equal(r.co2, Math.round(r.jahresertrag * C.CO2_PER_KWH), id);
    assert.equal(r.co2Baeume, Math.round(r.co2 / C.CO2_KG_PRO_BAUM_JAHR), id);
    assert.equal(r.autarkie, Math.round((r.eigenverbrauch / r.gesamtVerbrauch) * 100), id);
    for (const k of ["jahresertrag", "jahresErsparnis", "investition", "amortisation", "ersparnis10", "ersparnis15", "ersparnis20", "ersparnis25", "monatlich"]) assert.ok(Number.isFinite(r[k]), `${k} nicht endlich ${id}`);
  }
});

test("calculate: größerer Speicher bringt nie weniger Eigenverbrauch, kostet immer mehr", () => {
  for (const o of RASTER.filter((x) => x.speicher === 0)) {
    let prevEigen = calc(o).eigenverbrauch, prevInv = calc(o).investition;
    for (const speicher of [2, 5, 8, 12, 20]) {
      const r = calc({ ...o, speicher });
      assert.ok(r.eigenverbrauch >= prevEigen, `Eigenverbrauch sinkt ${JSON.stringify({ ...o, speicher })}`);
      assert.ok(r.investition > prevInv, `Investition steigt nicht ${JSON.stringify({ ...o, speicher })}`);
      prevEigen = r.eigenverbrauch; prevInv = r.investition;
    }
  }
});

test("calculate: Ersparnis nach 10/15/20 Jahren steigt im Referenzszenario; 25 Jahre liegen über 20", () => {
  for (const o of [{}, { speicher: 6 }, { dach: 150, verbrauch: 7000 }]) {
    const r = calc(o);
    assert.ok(r.ersparnis10 < r.ersparnis15 && r.ersparnis15 < r.ersparnis20 && r.ersparnis20 < r.ersparnis25, JSON.stringify(o));
  }
});

test("calculate: Monatsbalance — 12 Monate, Summen passen zu den Jahreswerten (Rundung ±12)", () => {
  for (const o of [{}, { speicher: 6 }, { pvgis: { ...PVGIS } }, { dach: 150, verbrauch: 7000, pvgis: { ...PVGIS } }]) {
    const r = calc(o);
    assert.equal(r.balance.length, 12);
    const sum = (k) => r.balance.reduce((s, m) => s + m[k], 0);
    near(sum("eigenverbrauch"), r.eigenverbrauch, 12, `Eigenverbrauch-Summe ${JSON.stringify(o)}`);
    near(sum("verbrauch"), r.gesamtVerbrauch, 12);
    for (const m of r.balance) {
      assert.ok(m.eigenverbrauch >= 0 && m.einspeisung >= 0 && m.netzbezug >= 0);
      near(m.eigenverbrauch + m.netzbezug, m.verbrauch, 1, `Monat ${m.month}: Eigen + Netz ≠ Verbrauch`);
      assert.ok(m.eigenverbrauch <= m.verbrauch + 1, `Monat ${m.month}: mehr selbst verbraucht als verbraucht`);
    }
  }
});

test("calculate: Monatsverteilungen summieren zu 1", () => {
  // Über die öffentliche Balance prüfbar: Jahresverbrauch verteilt sich vollständig auf die 12 Monate.
  const r = calc({ verbrauch: 10000 });
  near(r.balance.reduce((s, m) => s + m.verbrauch, 0), 10000, 12);
});

test("calculate: Abweichende Eingaben liefern keine NaN (0 m², unbekannte Labels)", () => {
  const r = calc({ dach: 0 });
  assert.equal(r.kwp, 0);
  assert.equal(r.jahresertrag, 0);
  assert.equal(r.investition, 0);
  const u = calc({ ausr: "Himmelsrichtung", neig: "schräg", form: "Zeltdach" });
  assert.ok(Number.isFinite(u.jahresertrag) && u.jahresertrag > 0);
});

// ── Bekannte Abweichungen (laufen mit, blockieren die Pipeline nicht) ────────
test("calculate: Verbrauch 0 darf keine NaN-Autarkie liefern", { todo: "Verbrauch 0/negativ → autarkie = NaN (0/0 in calculate()). Im UI nur über das manuelle kWh-Feld erreichbar; Guard 'gesamtVerbrauch > 0' fehlt." }, () => {
  for (const verbrauch of [0, -500, undefined]) {
    const r = calc({ verbrauch });
    assert.ok(Number.isFinite(r.autarkie), `Verbrauch ${verbrauch} → autarkie ${r.autarkie}`);
  }
});

test("calculate: Speicher verkürzt die Amortisation nie (CLAUDE.md-Regel)", { todo: "Seit der HTW-Tabelle (12.10.2026) verkürzt ein Speicher die Amortisation in den meisten Fällen (Stichprobe 14.10.2026: 1.888 von 2.400 Szenarien; z. B. 8,5 kWp/4.000 kWh: 15,8 → 12,3 Jahre mit 6 kWh). Entscheidung nötig: Regel in CLAUDE.md streichen oder Speicher-Wirtschaftlichkeit prüfen." }, () => {
  for (const o of RASTER.filter((x) => x.speicher === 0)) {
    const ohne = calc(o);
    for (const speicher of [2, 5, 8, 12, 20]) {
      const mit = calc({ ...o, speicher });
      assert.ok(mit.amortisation >= ohne.amortisation, `${JSON.stringify({ ...o, speicher })}: ${ohne.amortisation} → ${mit.amortisation}`);
    }
  }
});
