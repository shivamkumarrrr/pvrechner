// Ertragsfaktoren nach Abweichung von der Südausrichtung. Quelle: mehrere unabhängige
// deutsche PV-Ratgeber (u.a. solaranlage-ratgeber.de, reduco.ai mit Bezug auf
// PVGIS/HTW-Berlin/Fraunhofer-ISE-Daten) — 45° Abweichung (SW/SO) kostet ca. 5–10%,
// reine Ost/West-Ausrichtung ca. 15–20%. Stand Aug 2026, bei Bedarf neu prüfen.
export const AUSRICHTUNG = [
  { label: "Süd", factor: 1.0 },
  { label: "Südwest", factor: 0.95 },
  { label: "Südost", factor: 0.95 },
  { label: "Ost", factor: 0.85 },
  { label: "West", factor: 0.85 },
  // Nordausrichtung: laut photovoltaik.org niedrigster Ertragsfaktor unter den
  // Standard-Ausrichtungen, ca. 28,7% des Südwerts. Trotzdem als Option aufnehmen
  // (nicht verstecken) — realistisch abbilden statt auf die nächstbeste Ausrichtung
  // ausweichen zu lassen. Quelle: photovoltaik.org, abgerufen Aug 2026.
  { label: "Nord", factor: 0.29 },
];

// Neigungsfaktoren. Optimaler Neigungswinkel in Deutschland: 30–35° Süd. Flache (10–15°)
// und steile (50–80°) Neigungen liegen laut mehreren PV-Ratgeber-Quellen weiterhin im
// oberen 80–90%-Bereich. Stand Aug 2026.
export const NEIGUNG = [
  { label: "Flach (0–15°)", factor: 0.88, angle: 10 },
  { label: "Mittel (25–35°)", factor: 1.0, angle: 30 },
  { label: "Steil (40–60°)", factor: 0.9, angle: 50 },
];

export const DACHFORM = [
  // Satteldach: Annahme — die im UI eingegebene "Dachfläche" meint die GESAMTE Fläche über
  // beide Dachseiten (siehe Hilfetext in StepDach). Ein Satteldach hat zwei gegenüberliegende
  // Flächen, von denen meist nur eine gut ausgerichtet ist → 0.5. Keine belegte Quelle, sondern
  // konzeptionelle Annahme; falls das UI je so umgestellt wird, dass nur die EINE nutzbare
  // (südseitige) Fläche eingegeben wird, wäre eher 0.75–0.85 richtig (reduco.ai: 75–85% nutzbar
  // nach Abzug von Fenstern/Kaminen auf einer rechteckigen Fläche). Stand Aug 2026.
  { label: "Satteldach", factor: 0.5, icon: "M50 70 L50 25 L10 55 L10 70 Z M50 25 L90 55 L90 70 L50 70 Z" },
  { label: "Pultdach", factor: 0.8, icon: "M10 70 L10 30 L90 50 L90 70 Z" },
  // Flachdach factor 1.0: Die geringere Flächen-Effizienz steckt bewusst NICHT hier, sondern in
  // M2_PRO_KWP_FLACHDACH (Reihenabstand aufgeständerter Systeme) — sonst würde der Effekt doppelt
  // eingerechnet (siehe computeKwp).
  { label: "Flachdach", factor: 1.0, icon: "M10 45 L90 45 L90 70 L10 70 Z" },
  // Nutzbarer Flächenanteil der dreieckigen Walm-Segmente gegenüber einer rechteckigen
  // Satteldachfläche: 45–55% laut reduco.ai (mit Bezug auf Verbraucherzentrale-Flächenkennwerte
  // und Dachform-Systematik Bauwesen). 0.45 liegt am unteren Rand dieser Spanne. Stand Aug 2026.
  { label: "Walmdach", factor: 0.45, icon: "M50 20 L90 50 L80 70 L20 70 L10 50 Z" },
];


// Jahresverbrauch pro Haushaltsgröße. Quelle: ADAC, "Photovoltaik"
// (adac.de/rund-ums-haus/energie/solar/), abgerufen Aug 2026.
export const HAUSHALT = [
  { label: "1 Person", kwh: 1700, persons: 1 },
  { label: "2 Personen", kwh: 2500, persons: 2 },
  { label: "3 Personen", kwh: 3300, persons: 3 },
  { label: "4 Personen", kwh: 4000, persons: 4 },
  { label: "5+ Personen", kwh: 5000, persons: 5 },
];

// Zusätzlicher Jahresverbrauch eines E-Autos, abhängig vom Nutzungsprofil.
// Herleitung: KBA-Ø-Jahresfahrleistung Deutschland (~12.000 km/Jahr) × typischer
// E-Auto-Verbrauch 15–20 kWh/100 km (ADAC). Zweitwagen wenig gefahren (~5.000 km),
// Pendler/Vielfahrer deutlich mehr (~20.000 km). Stand Aug 2026, bei Bedarf neu
// recherchieren statt Werte stillschweigend verschieben.
export const E_AUTO_PROFILE = [
  { label: "Zweitwagen", kwh: 800, sub: "~5.000 km/Jahr" },
  { label: "Hauptwagen", kwh: 1800, sub: "~12.000 km/Jahr" },
  { label: "Vielfahrer", kwh: 3000, sub: "~20.000 km/Jahr" },
];

// Zusätzlicher Jahresverbrauch einer elektrischen Wärmepumpe (Heizung + Warmwasser, typischer
// 4-Personen-Haushalt). Praxisquellen nennen +3.000–5.000 kWh/Jahr für Haushalte mit Wärmepumpe
// (photovoltaikanbieter.com, PV-Ertrag-Tabelle 2026); 3.000 = unteres Ende der Spanne, bewusst moderat.
// Quelle: ADAC/Energieagentur-Richtwerte, Stand Aug 2026.
export const WAERMEPUMPE_KWH = 3000;

// Korrekturfaktoren (Prozentpunkte) auf die Autarkie-Kennlinie, je nachdem wann der
// Haushalt den meisten Strom verbraucht. Idee: Eigenverbrauch hängt davon ab, ob der
// Verbrauch in die Produktionsfenster fällt (Spitze ~11–15 Uhr). Mittags-Last hebt die
// Eigenverbrauchsquote, Abend-/Nacht-Last senkt sie. Selbst geschätzte Plausibilitäts-
// annahme in den von SMA/ADAC kommunizierten Spannen (±5–10 Prozentpunkte), bewusst
// symmetrisch und moderat — kein Ersatz für eine Lastgang-Simulation. Stand Aug 2026.
export const TAGESZEITEN = [
  { label: "Morgens", zeiten: "06–11 Uhr", faktor: 0.02 },
  { label: "Mittags", zeiten: "11–15 Uhr", faktor: 0.07 },
  { label: "Abends", zeiten: "15–22 Uhr", faktor: -0.06 },
  { label: "Nachts", zeiten: "22–06 Uhr", faktor: -0.09 },
];

// Anteil des Jahresverbrauchs je Monat (Wohngebäude, Heizung/Warmwasser machen den Winter-Überhang) —
// Summe = 1,0. Saisonale Verteilung angelehnt an das BDEW-Standardlastprofil H0 (Winterlast deutlich
// höher, Sommerlast niedriger — BDEW H0: Winter ~44 %, Sommer ~29 % des Jahresverbrauchs), für die
// Monatsauflösung selbst geglättet. Quelle: BDEW, "Standardlastprofile Strom"
// (bdew.de/energie/standardlastprofile-strom), Stand Aug 2026.
const MONATS_VERBRAUCH_ANTEILE = [0.094, 0.086, 0.086, 0.08, 0.08, 0.075, 0.075, 0.08, 0.08, 0.084, 0.09, 0.09];

// Fallback-Jahresgang des PV-Ertrags (Anteile, Summe = 1,0) für Standorte ohne PVGIS-Daten —
// typischer deutscher Süd-30°-Ertragsverlauf (Winter minimal, Sommer maximal). Grobe Näherung an die
// Jahresgänge des EU-PVGIS-Ertragsrechners für Deutschland; Formvergleich mit öffentlichen deutschen
// Ertragsverteilungen (z.B. photovoltaikanbieter.com, PV-Ertrag-Tabelle 2026). Stand Aug 2026,
// bei Bedarf neu prüfen.
const MONATS_ERTRAG_ANTEILE_FALLBACK = [0.035, 0.055, 0.09, 0.11, 0.125, 0.125, 0.125, 0.115, 0.09, 0.065, 0.04, 0.025];

// ─── Konstanten: Quelle, Stand, Prüf-Rhythmus ───

// BDEW-Strompreisanalyse, Stand April 2026 (Referenz: Haushalte, 3.500 kWh/Jahr). Jährlich aktualisieren.
export let STROMPREIS = 0.37;

// Einspeisevergütung TEILEINSPEISUNG (Überschusseinspeisung bei Eigenverbrauch — nicht Volleinspeisung,
// aktuell 12,3+ ct/kWh, aber ohne Eigenverbrauchsvorteil und nicht unser Use Case), Anlagen ≤10 kWp.
// Quelle: Bundesnetzagentur / § 49 EEG 2023 — sinkt halbjährlich um 1%
// (nächste Degression: 1.8.2026 auf 7,70 ct/kWh). Gilt für eine Neuanlage 20 Jahre fest ab Inbetriebnahme.
// Gilt nur noch für Inbetriebnahme bis 31.12.2026 (EEG_MODELL "2026"). Für Neuanlagen ab 2027
// sieht der Regierungsentwurf ein anderes Modell vor — siehe Block "EEG 2027" unten.
// Nach Gesetzesänderung prüfen. Ansonsten jährlich aktualisieren.
// Einzige Quelle der Wahrheit für die Teileinspeisung — EINSPEISEVERGUETUNG_TEIL weiter unten leitet
// sich hiervon ab, damit die Info-Sektion und die Berechnung nie auseinanderlaufen können.
export let EINSPEISE = 0.077;

// Staffelung für Anlagen >10 kWp: nur der Anteil ÜBER 10 kWp bekommt den niedrigeren Satz.
// Quelle: Bundesnetzagentur, "EEG-Förderung und -Fördersätze" — Inbetriebnahme 01.08.2026–31.01.2027.
// Teileinspeisung: ≤10 kWp = 7,70 Ct/kWh, 10–40 kWp = 6,66 Ct/kWh, 40–100 kWp = 5,44 Ct/kWh.
// Stand Aug 2026; mit jeder halbjährlichen EEG-Degression (Stichtage 1. Februar/1. August) prüfen.
export const EINSPEISE_10_40 = 0.0666; // €/kWh, Teileinspeisung, 10–40 kWp
export const EINSPEISE_40_100 = 0.0544; // €/kWh, Teileinspeisung, 40–100 kWp

// ─── EEG 2027: Vergütungsmodell für Neuanlagen ab 1.1.2027 ───
// Rechtsstand: Regierungsentwurf EEG 2027, Kabinettsbeschluss 29.7.2026 — NOCH NICHT beschlossen.
// Bundesrat hat am 25.9.2026 Änderungen gefordert (u. a. Übergangszahlung für Kleinanlagen nicht
// automatisch nach 36 Monaten beenden), EU-Beihilfeprüfung läuft; geplantes Inkrafttreten 1.1.2027.
// Primärtext (Drucksache) bisher nicht geprüft — Werte aus übereinstimmenden Fachquellen.
// Quellen: DGRV "Neuregelungen im Regierungsentwurf des EEG 2027" (15.8.2026), solarhandel24
// "Einspeisevergütung 2027" (Update 25.9.2026), energie-experten "EEG 2027: Befristete
// Übergangszahlung startet bei 5,20 ct/kWh", enerix "EEG 2027: Kabinett beschließt…", abgerufen 12.10.2026. Nach Verabschiedung (und bei jeder Änderung im Verfahren) alle Werte prüfen.
// - Übergangszahlung: anzulegender Wert 6,2 Ct/kWh minus 1 Ct = 5,2 Ct/kWh, bis Ende des 36. Monats nach
//   Inbetriebnahme (§ 25 Abs. 2, § 53 Abs. 1 EEG 2027-E); ab 1.8.2027 Degression −1 %/Halbjahr (dann
//   ~5,14 Ct — hier nicht abgebildet). Zugang bei Inbetriebnahme 2027 für Anlagen unter 50 kW (2028 < 25 kW,
//   danach < 7 kW; Quellen uneinig, ob bis Ende 2029 oder 2030 — für das 2027-Modell irrelevant).
// - Danach Direktvermarktung zum Marktwert, für Anlagen unter 25 kW plus Direktvermarktungsbonus
//   1,5 Ct/kWh für bis zu 48 Monate (§ 50c EEG 2027-E). Die Bonusfrist beginnt mit dem ersten Wechsel in
//   die Direktvermarktung; ANNAHME hier: Wechsel direkt nach der Übergangszahlung (Jahr 4–7). Quellen
//   lassen offen, ob ein früherer Wechsel günstiger ist.
// - Bestandsschutz: Anlagen mit Inbetriebnahme bis 31.12.2026 behalten die feste 20-Jahres-Vergütung.
// - NICHT modelliert: die im Entwurf geplante Begrenzung der Einspeiseleistung auf 50 % der
//   installierten Leistung (§ 9 Abs. 2b EEG 2027-E), Stunden mit negativen Börsenpreisen (Übergangszahlung
//   und Bonus fallen dann auf null) und die Degression der Übergangszahlung. Beides senkt den Einspeiseerlös leicht weiter — im Disclaimer erwähnt.
export const EEG2027_UEBERGANG = 0.052; // €/kWh
export const EEG2027_UEBERGANG_JAHRE = 3; // 36 Monate
export const EEG2027_UEBERGANG_MAX_KWP = 50; // Inbetriebnahme 2027: Anlagen unter 50 kW
export const EEG2027_DV_BONUS = 0.015; // €/kWh
export const EEG2027_DV_BONUS_JAHRE = 4; // 48 Monate, im Anschluss an die Übergangszahlung
export const EEG2027_DV_BONUS_MAX_KWP = 25; // nur Anlagen unter 25 kW

// Jahresmarktwert Solar 2025: 4,508 Ct/kWh (netztransparenz.de, Marktwertübersicht; DGS-Newsletter
// "Der Jahresmarktwert Solar 2025": 2024 = 4,624 Ct/kWh). Grundlage für den Erlös in der
// Direktvermarktung (EEG-2027-Modell nach der Übergangszahlung) und nach Ablauf der 20-jährigen
// festen Vergütung. Bewusst über die Laufzeit konstant gehalten — der Trend ist eher fallend
// (mehr Solarstrom zur Mittagszeit), also keine optimistische Annahme. Jährlich (Januar) prüfen.
export const MARKTWERT_SOLAR = 0.04508; // €/kWh
// Vermarktungskosten des Direktvermarkters je verkaufter kWh. Erstes Direktvermarktungs-Angebot speziell
// für kleine Neuanlagen: Spotmyenergy "SmartFlux", 5,99 €/Monat Grundpreis (inkl. Smart Meter) + 1 Ct
// netto pro verkaufter kWh (pv magazine, 29.9.2026). Ü20-Praxiswerte lagen niedriger (0,2–0,7 Ct/kWh:
// maschinenring.de "Jahresmarktwert PV-Anlagen 2025", ennergy.de) — für kleine Neuanlagen bewusst der
// höhere, konkret angebotene Wert. Den Grundpreis rechnen wir nicht extra, weil er den ohnehin nötigen
// Smart Meter enthält. Abgerufen 12.10.2026, jährlich prüfen.
export const DIREKTVERMARKTUNG_KOSTEN = 0.01; // €/kWh
// Feste EEG-Vergütungsdauer im bisherigen Modell (§ 25 EEG 2023); danach Marktwert (Ü20).
export const EEG_FESTE_LAUFZEIT_JAHRE = 20;

// Welches Vergütungsmodell der Rechner annimmt: "2026" = Inbetriebnahme bis 31.12.2026 (feste
// Vergütung 20 Jahre), "2027" = Inbetriebnahme ab 1.1.2027 nach Regierungsentwurf (Default, weil
// Anfragen ab Herbst 2026 realistisch erst 2027 in Betrieb gehen). Per configureEconomics
// ({ eegModell }) aus src/config.js umstellbar — nach Verabschiedung des Gesetzes dort prüfen.
export let EEG_MODELL = "2027";

// Fallback-Jahresertrag ohne PVGIS-Daten (bundesweiter Durchschnitt). Fraunhofer ISE zitiert für
// deutsche PV-Dachanlagen im Schnitt ~922 Vollbenutzungsstunden (≈922 kWh/kWp — "Aktuelle Fakten zur
// Photovoltaik in Deutschland", Stand 05.05.2026, nach ÜNB-Mittelfristprognose); Praxisquellen nennen
// 850–1.150 kWh/kWp je Standort, die Faustformel "kWp × 950" ist gängig. 950 gewählt als Mitte der
// Praxis-Spanne. Quelle: Fraunhofer ISE / photovoltaik.one, abgerufen Aug 2026. Bei neuer Marktlage prüfen.
export const ERTRAG_PRO_KWP = 950;

// m²/kWp und Modul-Wattzahl müssen zueinander passen: ein aktuelles 420-Wp-Modul hat ca. 1,85 m² reine
// Panelfläche (→ 4,4 m²/kWp), der ADAC-Solarrechner rechnet mit ca. 2 m² Planungsfläche pro 420-Wp-Modul
// inkl. Abstand/Montagerahmen (→ 4,76 m²/kWp) — beide Quellen liegen im Zielbereich 4,4–4,7 m²/kWp.
// 4,7 gewählt, da die Planungsfläche (mit Abständen) realistischer ist als reine Panelmaße.
// (Vorher inkonsistent: M2_PRO_KWP=6 bei gleichzeitig unterstellten 420-Wp-Modulen — das unterschätzte
// die nutzbare kWp-Größe um ca. 25–36%.) Bei einer neuen Modul-Generation beide Werte gemeinsam aktualisieren.
// Quelle: ADAC, "Photovoltaik" (adac.de/rund-ums-haus/energie/solar/), abgerufen Aug 2026.
export const MODULE_WP = 420;
export const M2_PRO_KWP = 4.7;

// Separate Flächendichte für aufgeständerte Flachdach-Systeme statt pauschalem DACHFORM-Faktor
// auf dieselbe Schrägdach-Dichte (M2_PRO_KWP). Reihenabstand zur Verschattungsvermeidung braucht
// deutlich mehr Fläche pro kWp als eng montierte Schrägdach-Module. Quelle: mehrere unabhängige
// PV-Ratgeber (echtsolar.de, enter.de, EnBW, ewe.de, reduco.ai) — übereinstimmend ca. 10–14 m²/kWp
// für Flachdach-Aufständerung (teils "30–60% mehr Flächenbedarf als Schrägdach"); Mitte der Spanne
// gewählt. Gegenprobe: 60 m² Flachdach → 5,0 kWp = 12 m²/kWp. Stand Aug 2026, bei Bedarf neu prüfen.
export const M2_PRO_KWP_FLACHDACH = 12;

// PV-Anlagenpreis pro kWp, größenabhängig (kleine Anlagen sind je kWp deutlich teurer — fixe Kosten für
// Gerüst, Wechselrichter, Anmeldung). Quelle: Verbraucherzentrale, "Was kostet eine Photovoltaikanlage?",
// Preisindex aus 71 echten Angeboten Jan 2025–Aug 2026, Stand 28.8.2026 (Mittelwerte, gerundet, nur
// PV-Anlage ohne Speicher und ohne Elektroarbeiten am Haus — also eher untere Grenze):
// 4–6 kWp 2.090 €/kWp, >6–8 1.820, >8–9 1.520, >9–10 1.410, >10–12 1.290, >12–14 1.240, >14–16 1.220,
// >16 kWp 1.010. Die Werte gelten für die Klassenmitte; interpoliert wird zwischen den daraus folgenden
// GESAMTpreisen (nicht den €/kWp-Werten) — nur so steigt der Gesamtpreis mit jeder zusätzlichen kWp
// (Stufen- oder €/kWp-Interpolation ließe z. B. 8,4 kWp billiger erscheinen als 8,1 kWp).
// Gegenprobe ADAC "Solaranlage mit Speicher" (24.6.2026): Amortisation mit Speicher meist 9–15 Jahre,
// ohne Speicher 1–2 Jahre kürzer — das trifft der Rechner damit.
// (Vorher pauschal 1.300 €/kWp nach Fraunhofer-ISE-Marktdurchschnitt: für typische Einfamilienhaus-
// Anlagen unter 10 kWp 10–35 % zu niedrig, Amortisation dadurch zu optimistisch.)
// Bereits Brutto=Netto: PV-Anlagen bis 30 kWp auf Wohngebäuden sind seit 01.01.2023 von der
// Mehrwertsteuer befreit (§ 12 Abs. 3 UStG, "Nullsteuersatz") — hier KEINE MwSt. ergänzen. Halbjährlich prüfen.
export const PV_KOSTEN_STUETZSTELLEN = [
  { kwp: 5, euroProKwp: 2090 },
  { kwp: 7, euroProKwp: 1820 },
  { kwp: 8.5, euroProKwp: 1520 },
  { kwp: 9.5, euroProKwp: 1410 },
  { kwp: 11, euroProKwp: 1290 },
  { kwp: 13, euroProKwp: 1240 },
  { kwp: 15, euroProKwp: 1220 },
  { kwp: 20, euroProKwp: 1010 },
];
// Optionaler pauschaler Override aus src/config.js (economics.kostenProKwp); null = Preisindex.
export let KOSTEN_PRO_KWP = null;
export function pvAnlagenKosten(kwp) {
  if (kwp <= 0) return 0;
  if (KOSTEN_PRO_KWP != null) return kwp * KOSTEN_PRO_KWP;
  const t = PV_KOSTEN_STUETZSTELLEN.map((p) => ({ kwp: p.kwp, gesamt: p.kwp * p.euroProKwp }));
  const first = t[0], last = t[t.length - 1];
  if (kwp <= first.kwp) return kwp * PV_KOSTEN_STUETZSTELLEN[0].euroProKwp;
  if (kwp >= last.kwp) return last.gesamt + (kwp - last.kwp) * PV_KOSTEN_STUETZSTELLEN[t.length - 1].euroProKwp;
  const i = t.findIndex((p) => p.kwp >= kwp);
  const a = t[i - 1], b = t[i];
  return a.gesamt + (b.gesamt - a.gesamt) * (kwp - a.kwp) / (b.kwp - a.kwp);
}
export const kostenProKwp = (kwp) => Math.round(pvAnlagenKosten(kwp) / kwp);

// Umweltbundesamt, "CO₂-Emissionen pro Kilowattstunde Strom 2025" (aktuellster verfügbarer Jahreswert).
export const CO2_PER_KWH = 0.344;

// Für eine greifbarere CO2-Darstellung ("entspricht X Bäumen pro Jahr") im Ergebnis-Screen.
// Quelle: ADAC, "Photovoltaik" (adac.de/rund-ums-haus/energie/solar/), abgerufen Aug 2026.
export const CO2_KG_PRO_BAUM_JAHR = 12.5;

// Speicherkosten skalieren mit nutzbarer Kapazität, nicht pauschal mit der Anlagengröße — und der
// Preis JE kWh sinkt mit der Speichergröße (feste Kosten für Steuereinheit/Installation).
// Quelle: Verbraucherzentrale, "Was kostet eine Photovoltaikanlage?", Preisindex aus 70 echten
// Angeboten Jan 2025–Aug 2026, Stand 28.8.2026 (Mittelwerte inkl. Installation, gerundet):
// 4–6 kWh 510 €/kWh, >6–8 kWh 480, >8–10 kWh 410, >10–12 kWh 390, >12–16 kWh 360. Passt zur
// Ratgeber-Spanne der Verbraucherzentrale ("Lohnen sich Batteriespeicher…", Stand 2.7.2026):
// 300–700 €/kWh inkl. Installation ab 5 kWh, Tendenz fallend. Unter 4 kWh gilt der Wert der kleinsten
// Klasse (kleine Speicher sind je kWh eher teurer), über 16 kWh der der größten. Halbjährlich prüfen.
// (Vorher pauschal 400 €/kWh — lag für die typischen 5–8-kWh-Speicher 15–22 % unter dem Index und
// ließ den Speicher dadurch wirtschaftlich zu gut aussehen.)
export const SPEICHER_KOSTEN_STAFFEL = [
  { bisKwh: 6, euroProKwh: 510 },
  { bisKwh: 8, euroProKwh: 480 },
  { bisKwh: 10, euroProKwh: 410 },
  { bisKwh: 12, euroProKwh: 390 },
  { bisKwh: Infinity, euroProKwh: 360 },
];
// Optionaler pauschaler Override aus src/config.js (economics.speicherKostenProKwh); null = Staffel.
export let SPEICHER_KOSTEN_PRO_KWH = null;
export function speicherKostenProKwh(kwh) {
  if (SPEICHER_KOSTEN_PRO_KWH != null) return SPEICHER_KOSTEN_PRO_KWH;
  return SPEICHER_KOSTEN_STAFFEL.find((k) => kwh <= k.bisKwh).euroProKwh;
}

// Faustregel für einen Default-Vorschlag im Rechner (frei änderbar): 1–1,5 kWh Speicherkapazität pro
// 1.000 kWh Jahresverbrauch. Quelle: HTW Berlin Unabhängigkeitsrechner-FAQ.
export const SPEICHER_KWH_PRO_1000_VERBRAUCH = 1.2;

// Moduldegradation: Industriestandard, linear ab Inbetriebnahme. NREL-Feldstudie: median ~0,5 %/Jahr;
// nach dem LID-Erstjahr (1–2 %) typisch 0,4–0,5 %/Jahr, Hersteller-Leistungsgarantien sichern linear
// ~0,4 %/Jahr zu (→ ~85 % Restleistung nach 25 Jahren). 0,5 % konservativ gewählt — Fraunhofer-ISE-
// Langzeitmessungen zeigen real sogar nur ~0,15 %. Quelle: NREL/photovoltaik.info, abgerufen Aug 2026.
export const DEGRADATION_PRO_JAHR = 0.005; // 0,5 %/Jahr Ertragsverlust

// Laufende Betriebskosten (Versicherung, Reinigung, Zählermiete etc.). Praxisquellen nennen einheitlich
// 1–2 % der Investitionssumme pro Jahr (echtsolar.de: Ø 1–1,7 %; photovoltaik.info: typische 10-kWp-Anlage
// ~1 %). 1 % = unteres Ende der Spanne, bewusst moderat. Quelle: echtsolar.de / photovoltaik.info,
// abgerufen Aug 2026. Jährlich prüfen.
export const WARTUNG_PROZENT_PRO_JAHR = 0.01; // 1 %/Jahr der Investitionssumme

// Einmaliger Wechselrichter-Austausch innerhalb der 25-Jahres-Betrachtung. ADAC nennt eine
// Lebensdauer von 10–15 Jahren und Austauschkosten von 1.000–3.000 € — als fester Prozentsatz der
// Investition würde das bei großen Anlagen (>26 kWp) über die reale Spanne hinausschießen, deshalb
// größenabhängig, aber auf die ADAC-Spanne gedeckelt statt linear unbegrenzt.
// Quelle: ADAC, "Photovoltaik" (adac.de/rund-ums-haus/energie/solar/), abgerufen Aug 2026.
export const WECHSELRICHTER_AUSTAUSCH_JAHR = 13; // Mitte des Zeitraums 12–15 Jahre
export const WECHSELRICHTER_KOSTEN_MIN = 1000;
export const WECHSELRICHTER_KOSTEN_MAX = 3000;
export const WECHSELRICHTER_KOSTEN_PRO_KWP = 130;

// Nur für die 25-Jahres-Projektion verwendet, NICHT im prominent angezeigten Jahres-Ersparnis-Wert —
// bewusst vorsichtige, klar ausgewiesene Annahme.
export const STROMPREIS_STEIGERUNG_PRO_JAHR = 0.02; // 2 %/Jahr

// Obergrenze des AUTARKIEGRADS (trotz Name): HTW Berlin weist darauf hin, dass 100 % Autarkie mit
// sinnvoll dimensionierten Speichern nicht erreichbar ist; ADAC nennt "bis zu 85 % mit Speicher".
// Die HTW-Tabelle (siehe htwAutarkie) erreicht 85 % nur bei sehr großen Anlagen mit großem Speicher —
// der Deckel greift also nur in Extremfällen. Quelle: ADAC, "Photovoltaik", abgerufen Aug 2026.
export const EIGENVERBRAUCH_MAX = 0.85;

export const PVGIS_SYSTEM_LOSS = 14; // % Systemverluste, wie an PVGIS übergeben (loss=14)

// Öffentlich ausgewiesene EEG-Einspeisevergütung — nur für die Info-Sektion,
// fließt NICHT in calculate() ein. Jährlich prüfen (halbjährliche EEG-Degression).
export const EINSPEISEVERGUETUNG_STAND = "2026";
// Abgeleitet von EINSPEISE (gleiche Kennzahl: Teileinspeisung ≤10 kWp), nicht als eigenen
// Wert duplizieren — ein Update nur an EINSPEISE reicht, beide bleiben synchron.
// Achtung: Das ist eine Init-Kopie, keine Live-Bindung — configureEconomics hält sie nach
// einem Override von EINSPEISE explizit synchron (siehe unten).
// Achtung: beide Werte hier sind in €/kWh angegeben (0,077 = 7,70 Ct/kWh), nicht in Ct —
// die Anzeige (SmartEnergySystem.jsx) rechnet mit ×100 in Ct um.
export let EINSPEISEVERGUETUNG_TEIL = EINSPEISE; // €/kWh, Teileinspeisung, Anlagen bis 10 kWp
// Volleinspeisung ≤10 kWp (erhöhter Satz, kein Eigenverbrauch), €/kWh. Quelle:
// Bundesnetzagentur, "EEG-Förderung und -Fördersätze" — Fördersätze für Inbetriebnahme
// 1.8.2026 bis 31.1.2027 (§ 21 Abs. 1, § 53 Abs. 1 EEG): 12,22 Ct/kWh (vorher, bis
// 31.7.2026: 12,34 Ct/kWh). Stand Aug 2026; mit jeder halbjährlichen EEG-Degression
// (Stichtage 1. Februar/1. August) prüfen.
export let EINSPEISEVERGUETUNG_VOLL = 0.1222; // €/kWh, Volleinspeisung, Anlagen bis 10 kWp

// Gewichteter Durchschnitt der Teileinspeisungsvergütung für eine Anlage der Größe `kwp`.
// Die ersten 10 kWp bekommen den ≤10-kWp-Satz, der Rest staffelt sich nach EEG-Tabelle.
// Quelle: Bundesnetzagentur, Inbetriebnahme 01.08.2026–31.01.2027.
export function einspeiseStaffel(kwp) {
  if (kwp <= 0) return EINSPEISE;
  if (kwp <= 10) return EINSPEISE;
  if (kwp <= 40) {
    return (10 * EINSPEISE + (kwp - 10) * EINSPEISE_10_40) / kwp;
  }
  return (10 * EINSPEISE + 30 * EINSPEISE_10_40 + (kwp - 40) * EINSPEISE_40_100) / kwp;
}

// Einspeiseerlös in €/kWh für Betriebsjahr `jahr` (1 = erstes Jahr) je nach Vergütungsmodell.
// "2026": feste, nach Größe gestaffelte Vergütung für 20 Jahre, danach Marktwert abzüglich
// Vermarktungskosten (Ü20). "2027": Übergangszahlung, dann Marktwert abzüglich Vermarktungskosten
// plus ggf. Direktvermarktungsbonus — Quellen und Rechtsstand im Block "EEG 2027" oben.
export function einspeiseRateJahr(jahr, kwp, modell = EEG_MODELL) {
  const marktNetto = MARKTWERT_SOLAR - DIREKTVERMARKTUNG_KOSTEN;
  if (modell === "2026") {
    return jahr <= EEG_FESTE_LAUFZEIT_JAHRE ? einspeiseStaffel(kwp) : marktNetto;
  }
  const mitUebergang = kwp < EEG2027_UEBERGANG_MAX_KWP;
  if (mitUebergang && jahr <= EEG2027_UEBERGANG_JAHRE) return EEG2027_UEBERGANG;
  const bonusStart = mitUebergang ? EEG2027_UEBERGANG_JAHRE : 0;
  const mitBonus = kwp < EEG2027_DV_BONUS_MAX_KWP && jahr > bonusStart && jahr <= bonusStart + EEG2027_DV_BONUS_JAHRE;
  return marktNetto + (mitBonus ? EEG2027_DV_BONUS : 0);
}

// Durchschnittlicher Einspeiseerlös der ersten `jahre` Betriebsjahre (€/kWh). Grundlage für den
// angezeigten Jahres-Ersparnis-Wert: Im 2027-Modell ist der Satz der ersten drei Jahre höher als
// danach — mit dem Erstjahres-Satz würde die Jahresersparnis dauerhaft zu hoch ausgewiesen.
// 20 Jahre = Zeitraum, in dem sich die Anlage typischerweise amortisiert und der bisherigen festen
// Vergütungsdauer entspricht; im 2026-Modell ergibt sich damit exakt der heutige Satz.
export function einspeiseRateMittel(kwp, modell = EEG_MODELL, jahre = EEG_FESTE_LAUFZEIT_JAHRE) {
  let summe = 0;
  for (let j = 1; j <= jahre; j++) summe += einspeiseRateJahr(j, kwp, modell);
  return summe / jahre;
}

// Kundenspezifische Wirtschaftlichkeits-Overrides (Injection statt Import, damit
// calculate.js von der Seite losgelöst einbettbar bleibt — CLAUDE.md Architektur).
// Aufruf z. B. aus src/config.js mit siteConfig.economics. Nur gesetzte Werte
// überschreiben die Defaults — jede Override braucht dieselbe Quelle+Stand-
// Dokumentation wie die Defaults oben (CLAUDE.md Daten-Regeln). Bewusst KEIN
// Seiten-Import hier: node/bundler-unabhängig nutzbar.
export function configureEconomics(o) {
  if (!o) return;
  if (o.strompreis != null) STROMPREIS = o.strompreis;
  if (o.einspeiseTeil != null) {
    EINSPEISE = o.einspeiseTeil;
    // EINSPEISEVERGUETUNG_TEIL aus EINSPEISE ableiten statt separat setzen (kein Literal) —
    // so bleibt EINSPEISE die einzige Stelle, an der der Wert festgelegt wird.
    EINSPEISEVERGUETUNG_TEIL = EINSPEISE;
  }
  if (o.einspeiseVoll != null) EINSPEISEVERGUETUNG_VOLL = o.einspeiseVoll;
  if (o.eegModell === "2026" || o.eegModell === "2027") EEG_MODELL = o.eegModell;
  if (o.kostenProKwp != null) KOSTEN_PRO_KWP = o.kostenProKwp;
  if (o.speicherKostenProKwh != null) SPEICHER_KOSTEN_PRO_KWH = o.speicherKostenProKwh;
}

export function computeKwp(dach, dachform) {
  const dachF = DACHFORM.find((d) => d.label === dachform)?.factor || 0.7;
  const nutzbar = dach * dachF;
  const dichte = dachform === "Flachdach" ? M2_PRO_KWP_FLACHDACH : M2_PRO_KWP;
  const kwp = Math.min(Math.round((nutzbar / dichte) * 10) / 10, 30);
  return { kwp, nutzbar, module: Math.round(kwp / (MODULE_WP / 1000)) };
}

// eauto/waermepumpe sind 3-Zustands-Werte ("nein" | "ja" | "geplant"). "geplant"
// zählt bewusst NICHT in die aktuelle Berechnung — erst die Anschaffung erhöht den
// Verbrauch; die Anlage dafür zu planen ist Sache des Beratungsgesprächs.
export function computeGesamtVerbrauch(verbrauch, eauto, waermepumpe, eautoProfil) {
  // Absicherung gegen negative/fehlende Eingaben — seit dem Config-System sind mehrere
  // Aufrufer denkbar (configureEconomics), nicht mehr nur die UI, die das schon filtert.
  let gesamtVerbrauch = Math.max(0, verbrauch || 0);
  if (eauto === "ja") {
    const profil = E_AUTO_PROFILE.find((p) => p.label === eautoProfil);
    gesamtVerbrauch += profil ? profil.kwh : E_AUTO_PROFILE[1].kwh;
  }
  if (waermepumpe === "ja") gesamtVerbrauch += WAERMEPUMPE_KWH;
  return gesamtVerbrauch;
}

// Autarkiegrad aus den Simulationstabellen des HTW-Berlin-Unabhängigkeitsrechners
// (solar.htw-berlin.de/rechner/unabhaengigkeitsrechner/, Datendateien js/tabelleAutarkie.json,
// abgerufen 12.10.2026). Grundlage: Jahressimulation von PV-Speichersystemen mit gemessenen
// Haushaltslastprofilen, normiert auf 1.000 kWh Jahresverbrauch (Weniger/Quaschning/Tjaden,
// HTW Berlin; vgl. "Individuelle Autarkie", pv magazine 02/2014: bei 1 kWp/1.000 kWh ohne Speicher
// Autarkiegrad und Eigenverbrauchsanteil je ~30 %). Ausschnitt der Tabelle; dazwischen bilinear
// interpoliert wie im HTW-Rechner selbst.
//   r = PV-Leistung in kWp je 1.000 kWh Verbrauch, s = nutzbare Speicherkapazität in kWh je 1.000 kWh.
// Ersetzt (12.10.2026) die frühere selbstgebaute Kennlinie an ADAC-Spannen (30–55 % ohne Speicher):
// Sie lag ohne Speicher bis zu 15 Prozentpunkte über der HTW-Simulation, war bei kleinen Anlagen nicht
// an die Anlagengröße gebunden (r ≤ 0,5 immer 30 % Autarkie) und erzeugte dadurch unmögliche Werte
// wie 100 % Eigenverbrauch ohne Speicher. Mit den HTW-Werten bleibt der Eigenverbrauchsanteil ohne
// Speicher physikalisch plausibel (z. B. r = 0,125 → ~84 %, r = 1 → ~30 %).
// Validierung Patrick (Geschäftsführer, reale Anlage 5,2 kWp / 6,4 kWh / 4.239 kWh, SMA-Portal 48 %
// Autarkie): alte Kennlinie 70 %, HTW-Tabelle ~65 % — näher dran; der Rest ist individuelles
// Verbrauchsprofil (HTW selbst: Haushalte streuen bei gleicher Dimensionierung um ±10–15 pp).
// Daten sind die Simulation eines Referenzhaushalts, kein Lastgang des Nutzers — Hinweis im UI.
const HTW_R = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
const HTW_S = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4];
const HTW_AUTARKIE = [
  /* s=0    */ [0, 0.107, 0.166, 0.207, 0.238, 0.261, 0.279, 0.305, 0.323, 0.338, 0.349, 0.359, 0.374, 0.385, 0.4, 0.411],
  /* s=0.25 */ [0, 0.125, 0.223, 0.285, 0.323, 0.348, 0.366, 0.393, 0.412, 0.426, 0.437, 0.447, 0.461, 0.472, 0.487, 0.497],
  /* s=0.5  */ [0, 0.125, 0.237, 0.318, 0.367, 0.399, 0.421, 0.452, 0.473, 0.489, 0.502, 0.512, 0.529, 0.541, 0.558, 0.57],
  /* s=0.75 */ [0, 0.125, 0.242, 0.338, 0.401, 0.44, 0.469, 0.506, 0.53, 0.548, 0.562, 0.575, 0.593, 0.607, 0.627, 0.64],
  /* s=1    */ [0, 0.125, 0.242, 0.35, 0.425, 0.476, 0.511, 0.555, 0.584, 0.605, 0.62, 0.633, 0.653, 0.669, 0.689, 0.703],
  /* s=1.25 */ [0, 0.125, 0.242, 0.355, 0.443, 0.503, 0.546, 0.597, 0.628, 0.651, 0.667, 0.679, 0.7, 0.716, 0.738, 0.753],
  /* s=1.5  */ [0, 0.125, 0.242, 0.356, 0.454, 0.521, 0.569, 0.626, 0.661, 0.685, 0.703, 0.716, 0.738, 0.755, 0.779, 0.795],
  /* s=2    */ [0, 0.125, 0.242, 0.356, 0.463, 0.542, 0.594, 0.66, 0.699, 0.727, 0.747, 0.763, 0.787, 0.806, 0.834, 0.853],
  /* s=2.5  */ [0, 0.125, 0.242, 0.356, 0.465, 0.551, 0.606, 0.673, 0.714, 0.744, 0.768, 0.784, 0.809, 0.828, 0.858, 0.879],
  /* s=3    */ [0, 0.125, 0.242, 0.356, 0.466, 0.556, 0.613, 0.681, 0.723, 0.756, 0.78, 0.797, 0.822, 0.841, 0.871, 0.892],
  /* s=4    */ [0, 0.125, 0.242, 0.356, 0.468, 0.562, 0.623, 0.692, 0.735, 0.769, 0.794, 0.811, 0.839, 0.86, 0.889, 0.908],
];

function achsenIndex(achse, x) {
  const v = Math.min(Math.max(x, achse[0]), achse[achse.length - 1]);
  let i = 1;
  while (i < achse.length - 1 && v > achse[i]) i++;
  return { i, t: (v - achse[i - 1]) / (achse[i] - achse[i - 1]) };
}

function htwAutarkie(r, s) {
  const x = achsenIndex(HTW_R, r);
  const y = achsenIndex(HTW_S, s);
  const zeile = (j) => HTW_AUTARKIE[j][x.i - 1] + x.t * (HTW_AUTARKIE[j][x.i] - HTW_AUTARKIE[j][x.i - 1]);
  return zeile(y.i - 1) + y.t * (zeile(y.i) - zeile(y.i - 1));
}

// Exportiert, damit die UI (Speicher-Schritt) eine Live-Vorschau der Autarkie zeigen kann, ohne die
// Tabelle zu duplizieren. `tageszeit` ist ein Array gewählter TAGESZEITEN-Labels; der mittlere
// Korrekturfaktor verschiebt den HTW-Wert, bleibt aber innerhalb der Obergrenze EIGENVERBRAUCH_MAX.
export function autarkieSchaetzung(kwp, gesamtVerbrauch, speicherKwh, tageszeit = []) {
  if (!gesamtVerbrauch) return 0;
  const r = kwp / (gesamtVerbrauch / 1000);
  const s = speicherKwh / (gesamtVerbrauch / 1000);
  const basis = htwAutarkie(r, s);
  let korrektur = 0;
  if (Array.isArray(tageszeit) && tageszeit.length) {
    const gewaehlt = TAGESZEITEN.filter((t) => tageszeit.includes(t.label));
    if (gewaehlt.length) {
      korrektur = gewaehlt.reduce((sum, t) => sum + t.faktor, 0) / gewaehlt.length;
    }
  }
  // Tageszeit-Korrektur (Abschnitt TAGESZEITEN) wirkt bei sehr kleinen Anlagen (r < 1) nur anteilig —
  // sonst könnte sie mehr Eigenverbrauch erzeugen, als die kleine Anlage überhaupt liefert.
  const mitKorrektur = basis + korrektur * Math.min(1, r);
  return Math.min(Math.max(mitKorrektur, 0), EIGENVERBRAUCH_MAX);
}

// Ergebnis als Spannbreite (Standard ±12%) statt Punktwert — ehrlicher als eine einzelne
// "genaue" Zahl, wenn die Eingangsdaten Schätzungen sind. Gibt einen String mit de-DE-
// Formatierung zurück; die Einheit hängt der Aufrufer an.
export function formatSpan(v, pct = 12) {
  if (!v || isNaN(v)) return "0";
  // Bei negativem v (z.B. kumulierte Nettoersparnis in frühen Jahren, bevor
  // sich die Investition amortisiert hat) macht "v * (1 + pct/100)" den Wert
  // BETRAGSMÄSSIG größer (weiter von 0 entfernt), nicht "höher" — die Zuordnung
  // lo/hi kehrt sich also um. Vorher wurde das nicht beachtet UND lo wurde
  // immer auf 0 geklemmt, auch wenn beide Grenzen negativ waren — Ergebnis war
  // eine unsinnige Anzeige wie "0–-664". Fix: beide Kandidaten ausrechnen,
  // numerisch sortieren, und den 0-Boden nur für tatsächlich nicht-negative
  // Werte anwenden (kWh/€, die nie negativ sein können).
  const a = v * (1 - pct / 100);
  const b = v * (1 + pct / 100);
  let lo = Math.round(Math.min(a, b));
  const hi = Math.round(Math.max(a, b));
  if (v > 0) lo = Math.max(0, lo);
  return `${lo.toLocaleString("de-DE")}–${hi.toLocaleString("de-DE")}`;
}

// Monatliche Verteilung der Jahreswerte in Eigenverbrauch / Netzeinspeisung / Netzbezug.
// Der (anuale) Eigenverbrauch wird proportional zum physikalisch verfügbaren Eigenverbrauch
// (min(Monatsverbrauch, Monatsertrag)) auf die Monate verteilt — so kann ein Monat nie mehr
// selbst verbrauchen, als er erzeugt. PVGIS-Monatsdaten wenn vorhanden, sonst Fallback-
// Jahresgang. Dient der monatlichen Balance-Grafik im Ergebnis.
export function monatlicheBalance(jahresertrag, gesamtVerbrauch, eigenverbrauch, monthly) {
  const ertragArr = monthly && monthly.length === 12
    ? monthly.map((m) => m.kwh)
    : MONATS_ERTRAG_ANTEILE_FALLBACK.map((a) => jahresertrag * a);

  const verfuegbar = ertragArr.map((yieldM, i) => Math.min(gesamtVerbrauch * MONATS_VERBRAUCH_ANTEILE[i], yieldM));
  const sumVerfuegbar = verfuegbar.reduce((s, v) => s + v, 0);
  const scale = sumVerfuegbar > 0 ? eigenverbrauch / sumVerfuegbar : 0;

  return ertragArr.map((yieldM, i) => {
    const verbrauchM = gesamtVerbrauch * MONATS_VERBRAUCH_ANTEILE[i];
    const eigenM = Math.min(verfuegbar[i], verfuegbar[i] * scale);
    return {
      month: i + 1,
      eigenverbrauch: Math.round(eigenM),
      einspeisung: Math.round(Math.max(0, yieldM - eigenM)),
      netzbezug: Math.round(Math.max(0, verbrauchM - eigenM)),
      verbrauch: Math.round(verbrauchM),
    };
  });
}

// Größenabhängig, aber auf die ADAC-Spanne (1.000–3.000 €) gedeckelt statt linear unbegrenzt.
export function wechselrichterKosten(kwp) {
  return Math.min(WECHSELRICHTER_KOSTEN_MAX, Math.max(WECHSELRICHTER_KOSTEN_MIN, kwp * WECHSELRICHTER_KOSTEN_PRO_KWP));
}

// 25-Jahres-Projektion mit Moduldegradation, laufenden Betriebskosten und einem einmaligen
// Wechselrichter-Austausch. Die jährliche Strompreissteigerung fließt bewusst NUR hier ein
// (nicht in den prominent angezeigten Jahres-Ersparnis-Wert) und ist als Annahme gekennzeichnet.
// Gibt { netto25, netto10, netto15, netto20 } zurück (alle in €).
function projiziere25Jahre(jahresertrag, autarkieRate, gesamtVerbrauch, investition, kwp, eegModell) {
  let kumulierteErsparnis = 0;
  let kumulierteWartung = 0;
  let netto10 = 0, netto15 = 0, netto20 = 0;
  for (let jahr = 1; jahr <= 25; jahr++) {
    const ertragJahrN = jahresertrag * Math.pow(1 - DEGRADATION_PRO_JAHR, jahr - 1);
    const eigenverbrauchJahrN = Math.min(gesamtVerbrauch * autarkieRate, ertragJahrN);
    const einspeisungJahrN = ertragJahrN - eigenverbrauchJahrN;
    const strompreisJahrN = STROMPREIS * Math.pow(1 + STROMPREIS_STEIGERUNG_PRO_JAHR, jahr - 1);
    kumulierteErsparnis += eigenverbrauchJahrN * strompreisJahrN + einspeisungJahrN * einspeiseRateJahr(jahr, kwp, eegModell);
    kumulierteWartung += investition * WARTUNG_PROZENT_PRO_JAHR;
    const nettoBisher = kumulierteErsparnis - kumulierteWartung;
    if (jahr === 10) netto10 = Math.round(nettoBisher - investition);
    if (jahr === 15) netto15 = Math.round(nettoBisher - investition);
    if (jahr === 20) netto20 = Math.round(nettoBisher - investition);
  }
  const wechselrichterKostenWert = wechselrichterKosten(kwp);
  const netto25 = Math.round(kumulierteErsparnis - kumulierteWartung - wechselrichterKostenWert - investition);
  return { netto25, netto10, netto15, netto20 };
}

function amortisationJahre(investition, ersparnisEigen, einspeisung, kwp, eegModell) {
  let kumuliert = 0;
  for (let jahr = 1; jahr <= 60; jahr++) {
    const ersparnisJahr = ersparnisEigen + einspeisung * einspeiseRateJahr(jahr, kwp, eegModell);
    if (ersparnisJahr <= 0) break;
    if (kumuliert + ersparnisJahr >= investition) {
      return Math.round((jahr - 1 + (investition - kumuliert) / ersparnisJahr) * 10) / 10;
    }
    kumuliert += ersparnisJahr;
  }
  return 60;
}

export function calculate(dach, ausrichtung, neigung, verbrauch, speicherKwh, eauto, waermepumpe, pvgisData, dachform, eautoProfil, tageszeit, eegModell = EEG_MODELL) {
  const ausF = AUSRICHTUNG.find((a) => a.label === ausrichtung)?.factor || 1;
  const neiF = NEIGUNG.find((n) => n.label === neigung)?.factor || 1;
  const { kwp, nutzbar, module } = computeKwp(dach, dachform);

  // Use PVGIS real data if available, otherwise fallback to estimate
  let jahresertrag;
  let dataSource;
  let monthly = null;
  if (pvgisData && pvgisData.yearlyKwh) {
    // PVGIS returns for 1kWp, so scale to actual kWp
    jahresertrag = Math.round(pvgisData.yearlyKwh * kwp);
    dataSource = "PVGIS (EU Science Hub)";
    if (pvgisData.monthly) {
      monthly = pvgisData.monthly.map((m) => ({ month: m.month, kwh: Math.round(m.E_m * kwp) }));
    }
  } else {
    jahresertrag = Math.round(kwp * ERTRAG_PRO_KWP * ausF * neiF);
    dataSource = "Schätzung (Durchschnitt DE)";
  }

  const gesamtVerbrauch = computeGesamtVerbrauch(verbrauch, eauto, waermepumpe, eautoProfil);

  // Autarkie aus der HTW-Simulationstabelle (htwAutarkie oben) — Eigenverbrauch in kWh
  // ergibt sich daraus, gedeckelt durch das, was tatsächlich erzeugt wird (kann nie mehr Strom selbst
  // verbrauchen, als die Anlage produziert). `tageszeit` verschiebt die Kennlinie um den mittleren
  // Tageszeit-Korrekturfaktor (siehe autarkieSchaetzung).
  const autarkieRate = autarkieSchaetzung(kwp, gesamtVerbrauch, speicherKwh, tageszeit);
  const eigenverbrauch = Math.round(Math.min(gesamtVerbrauch * autarkieRate, jahresertrag));
  const einspeisung = jahresertrag - eigenverbrauch;

  // Der Teil des Eigenverbrauchs, den es ohne Speicher nicht gäbe — für das
  // Flussbild der Live-Vorschau (Energiefluss.jsx). Bewusst als Differenz zweier
  // autarkieSchaetzung()-Aufrufe und nicht als eigene Faustregel, damit er zum
  // Mehr-Eigenverbrauch des Speicher-Rechners passt.
  const eigenverbrauchOhneSpeicher = speicherKwh > 0
    ? Math.round(Math.min(gesamtVerbrauch * autarkieSchaetzung(kwp, gesamtVerbrauch, 0, tageszeit), jahresertrag))
    : eigenverbrauch;
  const speicherBeitrag = Math.max(0, eigenverbrauch - eigenverbrauchOhneSpeicher);

  // Einspeiseerlös nach Vergütungsmodell (eegModell, siehe einspeiseRateJahr): als Durchschnitt
  // der ersten 20 Jahre, damit die Jahresersparnis nicht mit dem höheren Satz der 2027er
  // Übergangszahlung (nur 3 Jahre) dauerhaft zu hoch ausgewiesen wird.
  const einspeiseRate = einspeiseRateMittel(kwp, eegModell);
  const ersparnisEigen = eigenverbrauch * STROMPREIS;
  const ersparnisEinspeisung = einspeisung * einspeiseRate;
  const jahresErsparnis = Math.round(ersparnisEigen + ersparnisEinspeisung);

  const investition = Math.round(pvAnlagenKosten(kwp) + (speicherKwh > 0 ? speicherKwh * speicherKostenProKwh(speicherKwh) : 0));

  // Amortisation Jahr für Jahr mit dem Einspeisesatz des jeweiligen Jahres (sonst gleiche
  // Annahmen wie bisher: heutiger Strompreis, keine Degradation). Bei konstantem Satz identisch
  // mit Investition / Jahresersparnis; im 2027-Modell zählt, dass die höhere Übergangszahlung
  // gerade in den ersten Jahren fließt. Linear interpoliert innerhalb des Jahres.
  const amortisation = amortisationJahre(investition, ersparnisEigen, einspeisung, kwp, eegModell);
  const co2 = Math.round(jahresertrag * CO2_PER_KWH);
  const co2Baeume = Math.round(co2 / CO2_KG_PRO_BAUM_JAHR);
  const { netto25: ersparnis25, netto10: ersparnis10, netto15: ersparnis15, netto20: ersparnis20 } = projiziere25Jahre(jahresertrag, autarkieRate, gesamtVerbrauch, investition, kwp, eegModell);
  const autarkie = Math.round((eigenverbrauch / gesamtVerbrauch) * 100);
  const monatlich = Math.round(jahresErsparnis / 12);
  // Abgeleiteter Anzeigewert für die Transparenzbox: Anteil des ERTRAGS, der selbst verbraucht wird
  // (andere Kennzahl als Autarkie, s.o.) — nicht eigenständig modelliert, ergibt sich aus eigenverbrauch/jahresertrag.
  const eigenverbrauchsquote = jahresertrag > 0 ? eigenverbrauch / jahresertrag : 0;

  // Monatliche Verteilung (Eigenverbrauch/Einspeisung/Netzbezug) für die Balance-Grafik.
  const balance = monatlicheBalance(jahresertrag, gesamtVerbrauch, eigenverbrauch, monthly);

  return { kwp, module, nutzbar: Math.round(nutzbar), jahresertrag, eigenverbrauch, einspeisung, jahresErsparnis, investition, amortisation, co2, co2Baeume, ersparnis25, ersparnis10, ersparnis15, ersparnis20, gesamtVerbrauch, autarkie, monatlich, dataSource, monthly, eigenverbrauchsquote, balance, speicherBeitrag, einspeiseRate, einspeiseErloes: Math.round(ersparnisEinspeisung), eegModell };
}
