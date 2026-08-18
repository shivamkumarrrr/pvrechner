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
// EEG-Reform 2027 in Vorbereitung: Regierungsentwurf (Stand Juli 2026) sieht vor, die feste 20-Jahres-
// Vergütung ab 2027 schrittweise durch eine befristete Übergangszahlung zu ersetzen — noch nicht
// beschlossen. Nach Gesetzesänderung prüfen. Ansonsten jährlich aktualisieren.
// Einzige Quelle der Wahrheit für die Teileinspeisung — EINSPEISEVERGUETUNG_TEIL weiter unten leitet
// sich hiervon ab, damit die Info-Sektion und die Berechnung nie auseinanderlaufen können.
export let EINSPEISE = 0.077;

// Staffelung für Anlagen >10 kWp: nur der Anteil ÜBER 10 kWp bekommt den niedrigeren Satz.
// Quelle: Bundesnetzagentur, "EEG-Förderung und -Fördersätze" — Inbetriebnahme 01.08.2026–31.01.2027.
// Teileinspeisung: ≤10 kWp = 7,70 Ct/kWh, 10–40 kWp = 6,66 Ct/kWh, 40–100 kWp = 5,44 Ct/kWh.
// Stand Aug 2026; mit jeder halbjährlichen EEG-Degression (Stichtage 1. Februar/1. August) prüfen.
export const EINSPEISE_10_40 = 0.0666; // €/kWh, Teileinspeisung, 10–40 kWp
export const EINSPEISE_40_100 = 0.0544; // €/kWh, Teileinspeisung, 40–100 kWp

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

// Fraunhofer ISE / Marktpreisübersichten 2026 (Fraunhofer-Durchschnitt März 2026: 1.015 €/kWp,
// historisches Tief; Anbieterpreise inkl. Marge eher 1.100–1.500 €/kWp). 1.300 €/kWp gewählt
// (Mitte der realen Anbieter-Spanne, oberes Ende der Fraunhofer-Spanne 1.000–1.300 €/kWp):
// Mit 1.150 €/kWp am unteren Spannenrand lagen die Amortisationszeiten bei nur 6–7 Jahren und
// unterschritten damit die eigene Seiten-Copy ("9–12 Jahre") sowie die Branchen-Validierung
// (8–13 Jahre, ADAC-Beispiel 13 Jahre). Bereits Brutto=Netto: PV-Anlagen bis 30 kWp auf
// Wohngebäuden sind seit 01.01.2023 von der Mehrwertsteuer befreit (§ 12 Abs. 3 UStG,
// "Nullsteuersatz") — hier KEINE zusätzliche MwSt.-Berechnung ergänzen.
export let KOSTEN_PRO_KWP = 1300;

// Umweltbundesamt, "CO₂-Emissionen pro Kilowattstunde Strom 2025" (aktuellster verfügbarer Jahreswert).
export const CO2_PER_KWH = 0.344;

// Für eine greifbarere CO2-Darstellung ("entspricht X Bäumen pro Jahr") im Ergebnis-Screen.
// Quelle: ADAC, "Photovoltaik" (adac.de/rund-ums-haus/energie/solar/), abgerufen Aug 2026.
export const CO2_KG_PRO_BAUM_JAHR = 12.5;

// Speicherkosten skalieren mit nutzbarer Kapazität, nicht pauschal mit der Anlagengröße.
// LiFePO₄, Marktpreisübersichten 2026: ca. 300–470 €/kWh nutzbare Kapazität; Mitte der Spanne gewählt.
export let SPEICHER_KOSTEN_PRO_KWH = 400;

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

// Realistische Obergrenze der Eigenverbrauchsquote: HTW Berlin weist explizit darauf hin, dass 100%
// Autarkie mit sinnvoll dimensionierten Speichern nicht erreichbar ist. ADAC kommuniziert offiziell
// 30–55% ohne Speicher und bis zu 85% mit Speicher — diese Spannen werden unten direkt als Ober-/
// Untergrenzen der Kennlinie verwendet statt eigener geschätzter Werte.
// Quelle: ADAC, "Photovoltaik" (adac.de/rund-ums-haus/energie/solar/), abgerufen Aug 2026.
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
// die Anzeige (EinspeiseverguetungInfo.jsx) rechnet mit ×100 in Ct um.
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

// Autarkiegrad-Kennlinie (NICHT Eigenverbrauchsquote — die beiden sind unterschiedliche Kennzahlen und
// bewegen sich mit der Anlagengröße in entgegengesetzte Richtungen!). Eine Anlage, die im Verhältnis zum
// Verbrauch groß dimensioniert ist, deckt einen GRÖSSEREN Anteil des Verbrauchs (Autarkie steigt mit r),
// auch wenn der Anteil des selbst genutzten ERTRAGS dabei sinkt (Eigenverbrauchsquote — eine separate,
// hier nur noch als abgeleiteter Anzeigewert berechnete Größe, siehe calculate()).
// Keine physikalische Lastgang-Simulation (das wäre ein eigenes Projekt), sondern eine grobe Kennlinie
// mit wenigen Stützpunkten, bezogen auf 1.000 kWh Jahresverbrauch. Ober-/Untergrenze (30%/55% ohne
// Speicher, bis 85% mit Speicher) sind ADACs offiziell kommunizierte Autarkiegrad-Spannen, nicht selbst
// geschätzt. Quelle: ADAC, "Photovoltaik" (adac.de/rund-ums-haus/energie/solar/), abgerufen Aug 2026.
const AUTARKIE_OHNE_SPEICHER = [
  { r: 0.5, autarkie: 0.30 },
  { r: 1.0, autarkie: 0.42 },
  { r: 1.5, autarkie: 0.50 },
  { r: 2.5, autarkie: 0.55 },
];

const SPEICHER_BONUS = [
  { s: 0, bonus: 0 },
  { s: 0.75, bonus: 0.15 },
  { s: 1.25, bonus: 0.22 },
  { s: 2.0, bonus: 0.28 },
  // Tail beyond typischer Dimensionierung (HTW-Faustregel liegt bei s≈1.2): macht die ADAC-Obergrenze
  // von 85% für großzügig dimensionierte Speicher erreichbar, ohne die Kennlinie im typischen Bereich
  // (s bis 2.0) zu verändern.
  { s: 3.5, bonus: 0.30 },
];

function interpolate(table, x, keyX, keyY) {
  if (x <= table[0][keyX]) return table[0][keyY];
  for (let i = 1; i < table.length; i++) {
    if (x <= table[i][keyX]) {
      const a = table[i - 1];
      const b = table[i];
      const t = (x - a[keyX]) / (b[keyX] - a[keyX]);
      return a[keyY] + t * (b[keyY] - a[keyY]);
    }
  }
  return table[table.length - 1][keyY];
}

// Exportiert, damit die UI (Speicher-Schritt) eine Live-Vorschau der Autarkie zeigen kann, ohne die
// Kennlinie zu duplizieren. `tageszeit` ist ein Array gewählter TAGESZEITEN-Labels; der mittlere
// Korrekturfaktor verschiebt die Kennlinie, bleibt aber innerhalb der ADAC-Obergrenze von 85%.
export function autarkieSchaetzung(kwp, gesamtVerbrauch, speicherKwh, tageszeit = []) {
  if (!gesamtVerbrauch) return 0;
  const r = kwp / (gesamtVerbrauch / 1000);
  const s = speicherKwh / (gesamtVerbrauch / 1000);
  const basis = interpolate(AUTARKIE_OHNE_SPEICHER, r, "r", "autarkie");
  const bonus = interpolate(SPEICHER_BONUS, s, "s", "bonus");
  let korrektur = 0;
  if (Array.isArray(tageszeit) && tageszeit.length) {
    const gewaehlt = TAGESZEITEN.filter((t) => tageszeit.includes(t.label));
    if (gewaehlt.length) {
      korrektur = gewaehlt.reduce((sum, t) => sum + t.faktor, 0) / gewaehlt.length;
    }
  }
  return Math.min(Math.max(basis + bonus + korrektur, 0.05), EIGENVERBRAUCH_MAX);
}

// Ergebnis als Spannbreite (Standard ±12%) statt Punktwert — ehrlicher als eine einzelne
// "genaue" Zahl, wenn die Eingangsdaten Schätzungen sind. Gibt einen String mit de-DE-
// Formatierung zurück; die Einheit hängt der Aufrufer an.
export function formatSpan(v, pct = 12) {
  if (!v || isNaN(v)) return "0";
  const lo = Math.max(0, Math.round(v * (1 - pct / 100)));
  const hi = Math.round(v * (1 + pct / 100));
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
function projiziere25Jahre(jahresertrag, autarkieRate, gesamtVerbrauch, investition, kwp) {
  const einspeiseRate = einspeiseStaffel(kwp);
  let kumulierteErsparnis = 0;
  let kumulierteWartung = 0;
  let netto10 = 0, netto15 = 0, netto20 = 0;
  for (let jahr = 1; jahr <= 25; jahr++) {
    const ertragJahrN = jahresertrag * Math.pow(1 - DEGRADATION_PRO_JAHR, jahr - 1);
    const eigenverbrauchJahrN = Math.min(gesamtVerbrauch * autarkieRate, ertragJahrN);
    const einspeisungJahrN = ertragJahrN - eigenverbrauchJahrN;
    const strompreisJahrN = STROMPREIS * Math.pow(1 + STROMPREIS_STEIGERUNG_PRO_JAHR, jahr - 1);
    kumulierteErsparnis += eigenverbrauchJahrN * strompreisJahrN + einspeisungJahrN * einspeiseRate;
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

export function calculate(dach, ausrichtung, neigung, verbrauch, speicherKwh, eauto, waermepumpe, pvgisData, dachform, eautoProfil, tageszeit) {
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

  // Autarkie wird direkt modelliert (Kennlinie oben, ADAC-Spannen 30–55%/85%) — Eigenverbrauch in kWh
  // ergibt sich daraus, gedeckelt durch das, was tatsächlich erzeugt wird (kann nie mehr Strom selbst
  // verbrauchen, als die Anlage produziert). `tageszeit` verschiebt die Kennlinie um den mittleren
  // Tageszeit-Korrekturfaktor (siehe autarkieSchaetzung).
  const autarkieRate = autarkieSchaetzung(kwp, gesamtVerbrauch, speicherKwh, tageszeit);
  const eigenverbrauch = Math.round(Math.min(gesamtVerbrauch * autarkieRate, jahresertrag));
  const einspeisung = jahresertrag - eigenverbrauch;

  // Staffelte Einspeisevergütung: erste 10 kWp zum ≤10-kWp-Satz, Rest nach EEG-Tabelle.
  // Quelle: Bundesnetzagentur, Inbetriebnahme 01.08.2026–31.01.2027.
  const einspeiseRate = einspeiseStaffel(kwp);
  const ersparnisEigen = eigenverbrauch * STROMPREIS;
  const ersparnisEinspeisung = einspeisung * einspeiseRate;
  const jahresErsparnis = Math.round(ersparnisEigen + ersparnisEinspeisung);

  const investition = Math.round(kwp * KOSTEN_PRO_KWP + speicherKwh * SPEICHER_KOSTEN_PRO_KWH);

  const amortisation = Math.round((investition / jahresErsparnis) * 10) / 10;
  const co2 = Math.round(jahresertrag * CO2_PER_KWH);
  const co2Baeume = Math.round(co2 / CO2_KG_PRO_BAUM_JAHR);
  const { netto25: ersparnis25, netto10: ersparnis10, netto15: ersparnis15, netto20: ersparnis20 } = projiziere25Jahre(jahresertrag, autarkieRate, gesamtVerbrauch, investition, kwp);
  const autarkie = Math.round((eigenverbrauch / gesamtVerbrauch) * 100);
  const monatlich = Math.round(jahresErsparnis / 12);
  // Abgeleiteter Anzeigewert für die Transparenzbox: Anteil des ERTRAGS, der selbst verbraucht wird
  // (andere Kennzahl als Autarkie, s.o.) — nicht eigenständig modelliert, ergibt sich aus eigenverbrauch/jahresertrag.
  const eigenverbrauchsquote = jahresertrag > 0 ? eigenverbrauch / jahresertrag : 0;

  // Monatliche Verteilung (Eigenverbrauch/Einspeisung/Netzbezug) für die Balance-Grafik.
  const balance = monatlicheBalance(jahresertrag, gesamtVerbrauch, eigenverbrauch, monthly);

  return { kwp, module, nutzbar: Math.round(nutzbar), jahresertrag, eigenverbrauch, einspeisung, jahresErsparnis, investition, amortisation, co2, co2Baeume, ersparnis25, ersparnis10, ersparnis15, ersparnis20, gesamtVerbrauch, autarkie, monatlich, dataSource, monthly, eigenverbrauchsquote, balance };
}
