// configureEconomics() verändert Modul-Zustand (export let). Eigene Datei, weil node:test jede
// Datei in einem eigenen Prozess startet — so bleiben die Overrides ohne Einfluss auf die anderen Tests.
import test from "node:test";
import assert from "node:assert/strict";
import * as C from "../src/lib/calculate.js";

const calc = () => C.calculate(80, "Süd", "Mittel (25–35°)", 4000, 0, "nein", "nein", null, "Satteldach", null, []);

test("configureEconomics: ohne Argument / leeres Objekt ändert nichts", () => {
  const vorher = calc();
  C.configureEconomics(undefined);
  C.configureEconomics(null);
  C.configureEconomics({});
  assert.deepEqual(calc(), vorher);
});

test("configureEconomics: Overrides wirken, nicht gesetzte Werte bleiben, Reihenfolge der Tests egal", () => {
  const basis = calc();
  assert.equal(C.STROMPREIS, 0.37);

  C.configureEconomics({ strompreis: 0.5 });
  assert.equal(C.STROMPREIS, 0.5);
  assert.ok(calc().jahresErsparnis > basis.jahresErsparnis, "höherer Strompreis → höhere Ersparnis");
  assert.equal(calc().investition, basis.investition, "Strompreis ändert die Kosten nicht");

  C.configureEconomics({ kostenProKwp: 1500 });
  assert.equal(C.pvAnlagenKosten(10), 15000);
  assert.equal(calc().investition, Math.round(8.5 * 1500));
  assert.equal(C.STROMPREIS, 0.5, "frühere Overrides bleiben bestehen");

  C.configureEconomics({ speicherKostenProKwh: 700 });
  assert.equal(C.speicherKostenProKwh(2), 700);
  assert.equal(C.speicherKostenProKwh(40), 700);
});

test("configureEconomics: einspeiseTeil hält EINSPEISE und EINSPEISEVERGUETUNG_TEIL synchron", () => {
  C.configureEconomics({ einspeiseTeil: 0.08 });
  assert.equal(C.EINSPEISE, 0.08);
  assert.equal(C.EINSPEISEVERGUETUNG_TEIL, 0.08);
  assert.equal(C.einspeiseStaffel(5), 0.08);
  C.configureEconomics({ einspeiseVoll: 0.13 });
  assert.equal(C.EINSPEISEVERGUETUNG_VOLL, 0.13);
});

test("configureEconomics: eegModell nur '2026' oder '2027', sonst ignoriert", () => {
  assert.equal(C.EEG_MODELL, "2027");
  C.configureEconomics({ eegModell: "2025" });
  C.configureEconomics({ eegModell: 2026 });
  assert.equal(C.EEG_MODELL, "2027");
  C.configureEconomics({ eegModell: "2026" });
  assert.equal(C.EEG_MODELL, "2026");
  assert.equal(calc().eegModell, "2026");
});
