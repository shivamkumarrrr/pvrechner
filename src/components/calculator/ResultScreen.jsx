import { useState } from "react";
import theme from "../../theme.js";
import ResultCard from "./ui/ResultCard.jsx";
import BarCompare from "./ui/BarCompare.jsx";
import MonthlyChart from "./ui/MonthlyChart.jsx";
import MonthlyBalanceChart from "./ui/MonthlyBalanceChart.jsx";
import SunArc from "../SunArc.jsx";
import { IconSearch, IconCheck, IconCalendar, IconMail, IconHouse, IconSatellite, IconLoader, IconLock, IconClock } from "../Icons.jsx";
import { STROMPREIS, EINSPEISE, M2_PRO_KWP, M2_PRO_KWP_FLACHDACH, PVGIS_SYSTEM_LOSS, DEGRADATION_PRO_JAHR, WARTUNG_PROZENT_PRO_JAHR, wechselrichterKosten, STROMPREIS_STEIGERUNG_PRO_JAHR, formatSpan, einspeiseStaffel } from "../../lib/calculate.js";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion.js";
import { useCountUpOnView } from "../../lib/useCountUpOnView.js";

// ─── CONFIGURATION ───
// Lead-Ziel & Calendly kommen aus src/config.js (siteConfig.lead / .contact):
//   mode "web3forms" → web3formsKey, "formspree" → formspreeId,
//   "webhook" → webhookUrl (POST als JSON ins Kundensystem/CRM), "demo" → ohne Backend.
import { siteConfig } from "../../config.js";

export default function ResultScreen({ result, displayLocation, resolvedCity, dach, dachform, ausrichtung, neigung, speicherKwh, eauto, eautoProfil, waermepumpe, tageszeit, plz, onRestart }) {
  const reduced = usePrefersReducedMotion();
  // Haupt-Ergebniszahl: zählt beim ersten Erscheinen von 0 auf den Wert hoch.
  // Angezeigt als ±12%-Spanne (formatSpan), deren Mitte hochzählt.
  const [savingsRef, savingsCount] = useCountUpOnView(result.jahresErsparnis);
  const [showForm, setShowForm] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", telefon: "", nachricht: "" });
  const updateForm = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const beschreibeEauto = () => {
    if (eauto === "ja") return `Ja (${eautoProfil})`;
    if (eauto === "geplant") return "Geplant";
    return "Nein";
  };
  const beschreibeWaermepumpe = () => {
    if (waermepumpe === "ja") return "Ja";
    if (waermepumpe === "geplant") return "Geplant";
    return "Nein";
  };
  const beschreibeTageszeiten = () =>
    tageszeit && tageszeit.length ? tageszeit.join(", ") : "Nicht angegeben";

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
      speicher: speicherKwh > 0 ? `Ja, ${speicherKwh} kWh` : "Nein",
      eauto: beschreibeEauto(),
      waermepumpe: beschreibeWaermepumpe(),
      tageszeiten: beschreibeTageszeiten(),
      datenquelle: result.dataSource || "Schätzung",
    };

    try {
      let success = false;
      const { lead } = siteConfig;

      if (lead.mode === "web3forms" && lead.web3formsKey) {
        // Web3Forms
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_key: lead.web3formsKey, subject: `Neuer PV-Lead: ${form.name} (${displayLocation || "unbekannt"})`, ...leadData }),
        });
        const data = await res.json();
        success = data.success;
      } else if (lead.mode === "formspree" && lead.formspreeId) {
        // Formspree
        const res = await fetch(`https://formspree.io/f/${lead.formspreeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadData),
        });
        success = res.ok;
      } else if (lead.mode === "webhook" && lead.webhookUrl) {
        // Direkt ins Kundensystem/CRM: POST des vollen leadData-Objekts als JSON.
        const res = await fetch(lead.webhookUrl, {
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

  return (
    <div style={{ fontFamily: theme.font.family, maxWidth: theme.maxWidth, margin: "0 auto", padding: "24px 16px", animation: "fadeScaleIn 0.4s ease" }}>
      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ringEnter {
          from { opacity: 0.25; transform: perspective(500px) translateZ(-46px) scale(0.92); }
          to { opacity: 1; transform: perspective(500px) translateZ(0) scale(1); }
        }
      `}</style>
      {/* Result Header */}
      <div style={{
        background: theme.color.textPrimary,
        borderRadius: theme.radius.lg,
        padding: "32px 28px",
        color: theme.color.white,
        marginBottom: 20,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", bottom: -10, right: -10, opacity: 0.5 }}>
          <SunArc variant="compact" />
        </div>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>Ihr Ergebnis</div>
        <div ref={savingsRef} style={{ fontFamily: theme.font.display, fontSize: 42, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {formatSpan(savingsCount)} €
        </div>
        <div style={{ fontSize: 14, opacity: 0.75, marginTop: 2 }}>geschätzte Ersparnis pro Jahr ±12%{displayLocation ? ` · ${displayLocation}` : ""}</div>
        <div style={{
          marginTop: 16,
          padding: "10px 16px",
          background: "rgba(255,84,0,0.18)",
          borderRadius: theme.radius.md,
          fontSize: 13,
          color: theme.color.accent,
        }}>
        {/* 25-Jahres-Wert: deutlich mehr kumulierte Unsicherheit als der Jahres-Ersparnis-Wert
            (Degradation + Wartung + Strompreis-Annahme + Wechselrichter-Timing kombiniert über
            25 Jahre) — bewusst breitere Spanne als die ±12% des 1-Jahres-Werts. */}
          Kumulierte Nettoersparnis (nach Investition & Wartung):
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 6, fontFamily: theme.font.display }}>
            <div>Nach 10 Jahren: <strong>{formatSpan(result.ersparnis10, 16)} €</strong></div>
            <div>Nach 15 Jahren: <strong>{formatSpan(result.ersparnis15, 18)} €</strong></div>
            <div>Nach 20 Jahren: <strong>{formatSpan(result.ersparnis20, 20)} €</strong></div>
            <div>Nach 25 Jahren: <strong>{formatSpan(result.ersparnis25, 22)} €</strong></div>
          </div>
        </div>
      </div>

      {/* Autarkiegrad Ring */}
      <div style={{
        background: theme.color.white,
        borderRadius: theme.radius.lg,
        border: `1.5px solid ${theme.color.border}`,
        padding: "20px 16px",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
      }}>
        <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0, perspective: 500 }}>
          {/* Mehrschichtiger Tiefen-Schatten: weiche, radial abfallende Basis-
              fläche hinter dem Ring — statisch, bewegt sich nicht mit. */}
          <div style={{
            position: "absolute",
            inset: 4,
            borderRadius: "50%",
            background: "radial-gradient(circle at 50% 58%, rgba(20,27,34,0.12), rgba(20,27,34,0.04) 55%, transparent 72%)",
            filter: "blur(1.5px)",
            transform: "translateY(5px) scale(1.04)",
            pointerEvents: "none",
          }} />
          {/* Beim Erscheinen leicht aus der Tiefe herauskommen (translateZ),
              dazu ein scharfer Drop-Shadow auf dem Ring selbst. */}
          <div style={{
            position: "relative",
            width: 100,
            height: 100,
            transformStyle: "preserve-3d",
            animation: reduced ? "none" : "ringEnter 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
          }}>
            <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: 100, height: 100, filter: "drop-shadow(0 2px 3px rgba(20,27,34,0.18))" }} role="img" aria-label={`Autarkiegrad ${result.autarkie}%`}>
              <circle cx="50" cy="50" r="42" fill="none" stroke={theme.color.bg} strokeWidth="10" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={result.autarkie >= 50 ? theme.color.success : theme.color.accent}
                strokeWidth="10"
                strokeDasharray={`${result.autarkie * 2.64} ${264 - result.autarkie * 2.64}`}
                strokeLinecap="round"
                style={{ transition: reduced ? "none" : "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: theme.color.textPrimary, lineHeight: 1 }}>{result.autarkie}%</div>
              <div style={{ fontSize: 9, color: theme.color.textMuted, marginTop: 2 }}>Autarkie</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 4 }}>
            {result.autarkie >= 60 ? "Sehr gute Unabhängigkeit!" : result.autarkie >= 40 ? "Gute Unabhängigkeit" : "Teilweise unabhängig"}
          </div>
          <div style={{ fontSize: 13, color: theme.color.textSecondary, lineHeight: 1.5 }}>
            {result.autarkie}% Ihres <strong>gesamten Verbrauchs</strong> deckt die Anlage — der Rest kommt aus dem Netz.
            {!speicherKwh && result.autarkie < 50 && " Mit einem Batteriespeicher steigt Ihre Autarkie spürbar — 100% sind mit einem realistisch dimensionierten Speicher allerdings nicht erreichbar."}
          </div>
        </div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", minWidth: 200 }}>
          <div style={{ minWidth: 150 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{Math.round(result.eigenverbrauchsquote * 100)}%</div>
            <div style={{ fontSize: 10.5, color: theme.color.textMuted }}>Eigenverbrauchsanteil</div>
            <div style={{ fontSize: 10.5, color: theme.color.textMuted, lineHeight: 1.4, marginTop: 2 }}>Anteil des <strong>selbst erzeugten</strong> Stroms, den Sie nutzen — der Rest wird eingespeist.
              {result.eigenverbrauchsquote < 0.5 && (
                <span title="Der Eigenverbrauchsanteil sinkt, wenn Ihre Anlage deutlich mehr produziert als Sie verbrauchen — ein niedriger Wert bedeutet nicht, dass sich die Anlage nicht lohnt, sondern dass ein großer Teil ins Netz eingespeist wird." style={{ cursor: "help", borderBottom: `1px dashed ${theme.color.textMuted}`, marginLeft: 4 }}>?</span>
              )}
            </div>
          </div>
          <div style={{ minWidth: 150 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{(result.gesamtVerbrauch - result.eigenverbrauch).toLocaleString("de-DE")}</div>
            <div style={{ fontSize: 10.5, color: theme.color.textMuted }}>kWh Netzbezug</div>
            <div style={{ fontSize: 10.5, color: theme.color.textMuted, lineHeight: 1.4, marginTop: 2 }}>Anteil Ihres Verbrauchs, der trotz Anlage aus dem Netz kommt.</div>
          </div>
        </div>
      </div>

      {/* Geplante Verbraucher: Hinweis, dass sie noch nicht eingerechnet sind */}
      {(eauto === "geplant" || waermepumpe === "geplant") && (
        <div style={{
          background: theme.color.bg,
          borderRadius: theme.radius.lg,
          padding: "14px 16px",
          marginBottom: 16,
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}>
          <span style={{ color: theme.color.textSecondary, marginTop: 2, display: "flex", flexShrink: 0 }}><IconClock size={16} /></span>
          <div style={{ fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.6 }}>
            <strong style={{ color: theme.color.textPrimary }}>Geplant, aber noch nicht eingerechnet:</strong>{" "}
            {[eauto === "geplant" && "E-Auto", waermepumpe === "geplant" && "Wärmepumpe"].filter(Boolean).join(" und ")} ist in Ihrer Berechnung noch nicht enthalten, da der Verbrauch erst mit der Installation entsteht. Planen Sie die Anlage im Zweifel etwas größer — das besprechen Sie am besten im Beratungsgespräch.
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <ResultCard label="Anlagengröße" value={result.kwp} unit="kWp" sub={`${result.module} Module · ${result.nutzbar} m²`} />
        <ResultCard label="Jahresertrag" value={formatSpan(result.jahresertrag)} unit="kWh" sub="±12% Spannbreite" />
        <ResultCard label="Amortisation" value={formatSpan(result.amortisation)} unit="Jahre" highlight />
        <ResultCard label="CO₂-Einsparung" value={result.co2.toLocaleString("de-DE")} unit="kg/Jahr" sub={`≈ ${result.co2Baeume.toLocaleString("de-DE")} Bäume/Jahr`} />
      </div>

      {/* Monthly yield chart (real PVGIS data, when available) */}
      <MonthlyChart monthly={result.monthly} />

      {/* Monthly balance: Eigenverbrauch / Einspeisung / Netzbezug */}
      <MonthlyBalanceChart balance={result.balance} />

      {/* Monthly savings highlight */}
      <div style={{
        background: theme.color.successSubtle,
        borderRadius: theme.radius.lg,
        padding: "16px 18px",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 12, color: theme.color.success, fontWeight: 500 }}>Monatliche Ersparnis</div>
          <div style={{ fontSize: 11, color: theme.color.success }}>Durchschnitt über das Jahr</div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: theme.color.success }}>
          {result.monatlich} €<span style={{ fontSize: 13, fontWeight: 500 }}>/Monat</span>
        </div>
      </div>

      {/* Comparison */}
      <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, padding: "18px 16px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 14 }}>Stromkosten im Vergleich</div>
        <BarCompare
          label1="Ohne Solar"
          val1={Math.round(result.gesamtVerbrauch * STROMPREIS)}
          label2="Mit Solar"
          val2={Math.round(result.gesamtVerbrauch * STROMPREIS) - result.jahresErsparnis}
          unit="€/Jahr"
          color1={theme.color.danger}
          color2={theme.color.success}
        />
      </div>

      {/* Details */}
      <div style={{ background: theme.color.bg, borderRadius: theme.radius.lg, padding: "16px", marginBottom: 12, fontSize: 13, color: theme.color.textSecondary, lineHeight: 1.8 }}>
        <div style={{ fontWeight: 600, color: theme.color.textPrimary, marginBottom: 8 }}>Details Ihrer Berechnung</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Eigenverbrauch</span><span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{result.eigenverbrauch.toLocaleString("de-DE")} kWh</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Netzeinspeisung</span><span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{result.einspeisung.toLocaleString("de-DE")} kWh</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Eigenverbrauchsanteil</span><span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{Math.round(result.eigenverbrauchsquote * 100)}% des Ertrags</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Ersparnis Eigenverbrauch</span><span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{Math.round(result.eigenverbrauch * STROMPREIS).toLocaleString("de-DE")} €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Einspeisevergütung</span><span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{Math.round(result.einspeisung * einspeiseStaffel(result.kwp)).toLocaleString("de-DE")} € <span style={{ fontSize: 11, fontWeight: 400, color: theme.color.textMuted }}>(staffelt nach EEG)</span></span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${theme.color.border}`, paddingTop: 8, marginTop: 8 }}>
          <span>Geschätzte Investition</span><span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{result.investition.toLocaleString("de-DE")} €</span>
        </div>
      </div>

      {/* Transparency: how the numbers came to be — nur gezeigt, solange noch
          KEINE PLZ eingegeben wurde (dann erklären die Texte den Schätzwert).
          Nach Eingabe einer PLZ ist die Stelle redundant und wird ausgeblendet. */}
      {plz?.length !== 5 && (
        <details style={{ marginBottom: 20, border: `1.5px solid ${theme.color.border}`, borderRadius: 12, overflow: "hidden" }}>
          <summary style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: theme.color.textPrimary, cursor: "pointer", background: theme.color.bg, display: "flex", alignItems: "center", gap: 7 }}>
          <IconSearch size={15} /> So haben wir das berechnet
        </summary>
        <div style={{ padding: "4px 16px 16px", fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.7 }}>
          <p style={{ margin: "8px 0" }}>
            {result.dataSource?.includes("PVGIS")
              ? `Der Jahresertrag basiert auf echten Satellitendaten des EU-Programms PVGIS (Photovoltaic Geographical Information System, EU Science Hub) für Ihren genauen Standort — nicht auf einem deutschlandweiten Pauschalwert. PVGIS rechnet dabei mit ${PVGIS_SYSTEM_LOSS}% Systemverlusten (Kabel, Wechselrichter, Verschmutzung, Temperatur).`
              : `Ohne erkannte PLZ verwenden wir einen Schätzwert von ~950 kWh Jahresertrag pro kWp — der bundesweite Durchschnitt. Geben Sie Ihre PLZ ein, um stattdessen echte PVGIS-Satellitendaten für Ihren Standort zu nutzen.`}
          </p>
          <p style={{ margin: "8px 0" }}>
            {dachform === "Flachdach"
              ? `Für die Anlagengröße rechnen wir auf dem Flachdach mit ca. ${M2_PRO_KWP_FLACHDACH} m² Dachfläche pro kWp Modulleistung — deutlich mehr als die ca. ${M2_PRO_KWP} m²/kWp auf dem Schrägdach, weil aufgeständerte Module zur Verschattungsvermeidung Reihenabstand brauchen.`
              : `Für die Anlagengröße rechnen wir mit ca. ${M2_PRO_KWP} m² Dachfläche pro kWp Modulleistung, abhängig von Ihrer Dachform.`} Ihre geschätzte Autarkie von {result.autarkie}% (Anteil Ihres Verbrauchs, den die Anlage selbst deckt) ergibt sich aus dem Verhältnis von Anlagengröße zu Verbrauch{speicherKwh > 0 ? ` und Ihrer Speicherkapazität von ${speicherKwh} kWh` : ""} — keine feste Pauschale: Eine im Verhältnis zum Verbrauch größere Anlage deckt tendenziell einen größeren Teil davon selbst ab. Wir orientieren uns dabei an den offiziell kommunizierten Spannen von 30–55% ohne und bis zu 85% mit Speicher. {tageszeit && tageszeit.length > 0 && `Zusätzlich fließt ein, dass Sie den Strom überwiegend ${tageszeit.join(", ").toLowerCase()} nutzen — Verbrauch in den Produktionszeiten (Mittag) erhöht den Eigenverbrauch, Abend-/Nachtverbrauch senkt ihn.`} Ihre Ersparnis: Eigenverbrauch zu Ihrem Strompreis von {(STROMPREIS * 100).toFixed(0)} Ct/kWh, der eingespeiste Rest zur aktuellen Einspeisevergütung von {(einspeiseStaffel(result.kwp) * 100).toFixed(1)} Ct/kWh (staffelt nach EEG: Anlagen bis 10 kWp erhalten {(EINSPEISE * 100).toFixed(1)} Ct/kWh, größere Anlagen einen niedrigeren Satz für den Anteil über 10 kWp).
          </p>
          <p style={{ margin: "8px 0" }}>
            Die 25-Jahres-Prognose berücksichtigt {(DEGRADATION_PRO_JAHR * 100).toFixed(1)}% Ertragsverlust pro Jahr durch Moduldegradation, laufende Betriebskosten von ca. {(WARTUNG_PROZENT_PRO_JAHR * 100).toFixed(0)}% der Investitionssumme pro Jahr sowie einen einmaligen Wechselrichter-Austausch (ca. {Math.round(wechselrichterKosten(result.kwp)).toLocaleString("de-DE")} € nach 12–15 Jahren). Der Jahres-Ersparnis-Wert oben rechnet mit dem heutigen Strompreis; nur die 25-Jahres-Zahl unterstellt zusätzlich vorsichtig eine Strompreissteigerung von {(STROMPREIS_STEIGERUNG_PRO_JAHR * 100).toFixed(0)}%/Jahr.
          </p>
        </div>
        </details>
      )}

      {/* Urgency + Monthly savings */}
      <div style={{
        background: theme.color.accentSubtle,
        border: `1.5px solid ${theme.color.accent}`,
        borderRadius: theme.radius.lg,
        padding: "16px 18px",
        marginBottom: 20,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: theme.color.accentHover, marginBottom: 4 }}>
          Sie könnten jeden Monat ca. {Math.round(result.jahresErsparnis / 12).toLocaleString("de-DE")} € sparen
        </div>
        <div style={{ fontSize: 13, color: theme.color.accentHover }}>
          Je früher Sie starten, desto mehr sparen Sie. Lassen Sie sich jetzt unverbindlich beraten.
        </div>
      </div>

      {/* Lead Form or CTA */}
      {formSent ? (
        <div style={{
          background: theme.color.successSubtle,
          border: `2px solid ${theme.color.success}`,
          borderRadius: theme.radius.lg,
          padding: "28px 20px",
          textAlign: "center",
          marginBottom: 20,
        }}>
          <div style={{ color: theme.color.success, marginBottom: 10, display: "flex", justifyContent: "center" }}><IconCheck size={34} /></div>
          <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.success, marginBottom: 6 }}>Vielen Dank, {form.name.split(" ")[0]}!</div>
          <div style={{ fontSize: 14, color: theme.color.success, lineHeight: 1.6 }}>
            Ihre Anfrage wurde erfolgreich übermittelt. Ein Fachberater aus unserem Partnernetzwerk wird sich innerhalb von 24 Stunden bei Ihnen melden.
          </div>
          <div style={{
            marginTop: 16,
            padding: "10px 16px",
            background: theme.color.successSubtle,
            borderRadius: 8,
            fontSize: 12,
            color: theme.color.success,
            display: "inline-block",
          }}>
            Ihre Berechnung: {result.kwp} kWp Anlage · {result.jahresErsparnis.toLocaleString("de-DE")} €/Jahr Ersparnis
          </div>
        </div>
      ) : showCalendly ? (
        <div style={{
          background: theme.color.white,
          border: `1.5px solid ${theme.color.border}`,
          borderRadius: theme.radius.lg,
          padding: "20px 18px",
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 4 }}>
            Beratungstermin buchen
          </div>
          <div style={{ fontSize: 13, color: theme.color.textSecondary, marginBottom: 16 }}>
            Wählen Sie einen Termin — ein Fachberater bespricht Ihre Berechnung persönlich mit Ihnen.
          </div>
          <div style={{
            background: theme.color.bg,
            borderRadius: 8,
            padding: "10px 12px",
            marginBottom: 14,
            fontSize: 12,
            color: theme.color.textSecondary,
            lineHeight: 1.6,
          }}>
            Ihre Berechnung wird mitgeteilt: {result.kwp} kWp · {result.jahresertrag.toLocaleString("de-DE")} kWh/Jahr · {result.jahresErsparnis.toLocaleString("de-DE")} €/Jahr{displayLocation ? ` · ${displayLocation}` : ""}
          </div>
          {/* Calendly Embed */}
          <div style={{
            borderRadius: 10,
            overflow: "hidden",
            border: `1px solid ${theme.color.border}`,
            height: 500,
            marginBottom: 14,
          }}>
            <iframe
              src={`${siteConfig.contact.calendlyUrl}?hide_gdpr_banner=1&primary_color=${theme.color.accent.slice(1)}`}
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
              color: theme.color.textMuted,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ← Zurück zum Ergebnis
          </button>
        </div>
      ) : showForm ? (
        <div style={{
          background: theme.color.white,
          border: `1.5px solid ${theme.color.border}`,
          borderRadius: theme.radius.lg,
          padding: "20px 18px",
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 4 }}>
            Kostenloses Angebot erhalten
          </div>
          <div style={{ fontSize: 13, color: theme.color.textSecondary, marginBottom: 16 }}>
            Ein Fachbetrieb aus unserem bundesweiten Partnernetzwerk erstellt Ihnen ein unverbindliches Angebot basierend auf Ihrer Berechnung.
          </div>

          {[
            { key: "name", label: "Name *", placeholder: "Max Mustermann", type: "text" },
            { key: "email", label: "E-Mail *", placeholder: "max@beispiel.de", type: "email" },
            { key: "telefon", label: "Telefon (optional)", placeholder: "0681 123 456", type: "tel" },
          ].map((f) => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label htmlFor={`lead-${f.key}`} style={{ display: "block", fontSize: 12, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 4 }}>{f.label}</label>
              <input
                id={`lead-${f.key}`}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => updateForm(f.key, e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  borderRadius: 8,
                  border: `1.5px solid ${theme.color.border}`,
                  fontSize: 14,
                  color: theme.color.textPrimary,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border 0.15s",
                }}
                onFocus={(e) => e.target.style.borderColor = theme.color.accent}
                onBlur={(e) => e.target.style.borderColor = theme.color.border}
              />
            </div>
          ))}

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="lead-nachricht" style={{ display: "block", fontSize: 12, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 4 }}>Nachricht (optional)</label>
            <textarea
              id="lead-nachricht"
              placeholder="z.B. Ich möchte auch eine Wallbox installieren..."
              value={form.nachricht}
              onChange={(e) => updateForm("nachricht", e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: 8,
                border: `1.5px solid ${theme.color.border}`,
                fontSize: 14,
                color: theme.color.textPrimary,
                outline: "none",
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "inherit",
              }}
              onFocus={(e) => e.target.style.borderColor = theme.color.accent}
              onBlur={(e) => e.target.style.borderColor = theme.color.border}
            />
          </div>

          {/* Summary of their calculation */}
          <div style={{
            background: theme.color.bg,
            borderRadius: 8,
            padding: "10px 12px",
            marginBottom: 14,
            fontSize: 12,
            color: theme.color.textSecondary,
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
                ? theme.color.textMuted
                : form.name.trim() && form.email.trim()
                ? theme.color.accent
                : theme.color.border,
              border: "none",
              borderRadius: theme.radius.md,
              color: form.name.trim() && form.email.trim() ? theme.color.white : theme.color.textMuted,
              fontSize: 15,
              fontWeight: 600,
              cursor: form.name.trim() && form.email.trim() && !formSending ? "pointer" : "default",
              transition: "background-color 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {formSending && <IconLoader size={16} />}
            {formSending ? "Wird gesendet..." : "Angebot anfordern — kostenlos & unverbindlich"}
          </button>

          {formError && (
            <div style={{ textAlign: "center", fontSize: 13, color: theme.color.danger, marginTop: 8, padding: "8px 12px", background: theme.color.dangerSubtle, borderRadius: 8 }}>
              {formError}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", fontSize: 11, color: theme.color.textMuted, marginTop: 8, lineHeight: 1.5 }}>
            <IconLock size={13} /> Ihre Angaben gehen ausschließlich an den Fachbetrieb, der Ihr Angebot erstellt — kein Weiterverkauf an Dritte.
          </div>

          <button
            onClick={() => setShowForm(false)}
            style={{
              width: "100%",
              padding: "10px",
              background: "transparent",
              border: "none",
              color: theme.color.textMuted,
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
              background: theme.color.accent,
              border: "none",
              borderRadius: theme.radius.lg,
              color: theme.color.white,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: 10,
              transition: "background-color 0.15s, transform 0.1s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme.color.accentHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = theme.color.accent; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <IconCalendar size={17} /> Beratungstermin buchen
          </button>
          {/* Secondary CTA: Contact form */}
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: "100%",
              padding: "14px",
              background: theme.color.white,
              border: `1.5px solid ${theme.color.border}`,
              borderRadius: theme.radius.lg,
              color: theme.color.textSecondary,
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
            <IconMail size={16} /> Angebot per E-Mail anfragen
          </button>
          <div style={{ textAlign: "center", fontSize: 12, color: theme.color.textMuted }}>
            Antwort von einem Fachbetrieb aus unserem Partnernetzwerk, meist innerhalb eines Werktags
          </div>
        </div>
      )}

      {/* Partner network badge */}
      {!formSent && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "12px 16px",
          background: theme.color.bg,
          borderRadius: 10,
          marginBottom: 10,
        }}>
          <span style={{ color: theme.color.textSecondary, display: "flex" }}><IconHouse size={16} /></span>
          <span style={{ fontSize: 12, color: theme.color.textSecondary }}>
            {resolvedCity
              ? `Fachbetrieb aus unserem Partnernetzwerk in ${resolvedCity} und Umgebung`
              : "Fachbetrieb aus unserem bundesweiten Partnernetzwerk"
            }
          </span>
        </div>
      )}

      <button
        onClick={onRestart}
        style={{
          width: "100%",
          padding: "12px",
          background: "transparent",
          border: `1.5px solid ${theme.color.border}`,
          borderRadius: 12,
          color: theme.color.textSecondary,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Neu berechnen
      </button>

      {/* Datenquelle-Badge: nur wenn echte PVGIS-Daten vorliegen. Beim Fallback
          ("Schätzung (Durchschnitt DE)") wird die Angabe ausgeblendet — kein
          negativer Hinweis, der das Ergebnis unnötig untergräbt. */}
      {result.dataSource?.includes("PVGIS") && (
        <div style={{
          textAlign: "center",
          marginTop: 12,
          padding: "6px 12px",
          background: theme.color.successSubtle,
          borderRadius: 6,
          fontSize: 11,
          color: theme.color.success,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          width: "100%",
          justifyContent: "center",
        }}>
          <IconSatellite size={13} /> Datenquelle: {result.dataSource}
        </div>
      )}
    </div>
  );
}
// 