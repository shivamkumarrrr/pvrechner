import { useState } from "react";
import theme from "../../theme.js";
import ResultCard from "./ui/ResultCard.jsx";
import BarCompare from "./ui/BarCompare.jsx";
import MonthlyChart from "./ui/MonthlyChart.jsx";
import MonthlyBalanceChart from "./ui/MonthlyBalanceChart.jsx";
import { IconSearch, IconCheck, IconCalendar, IconMail, IconSatellite, IconLoader, IconLock, IconClock } from "../Icons.jsx";
import { STROMPREIS, EINSPEISE, M2_PRO_KWP, M2_PRO_KWP_FLACHDACH, PVGIS_SYSTEM_LOSS, DEGRADATION_PRO_JAHR, WARTUNG_PROZENT_PRO_JAHR, wechselrichterKosten, STROMPREIS_STEIGERUNG_PRO_JAHR, formatSpan, einspeiseStaffel } from "../../lib/calculate.js";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion.js";
import { useCountUpOnView } from "../../lib/useCountUpOnView.js";

// ─── CONFIGURATION ───
// Lead-Ziel & Calendly kommen aus src/config.js (siteConfig.lead / .contact):
//   mode "web3forms" → web3formsKey, "formspree" → formspreeId,
//   "webhook" → webhookUrl (POST als JSON ins Kundensystem/CRM), "demo" → ohne Backend.
import { siteConfig } from "../../config.js";

// Kreis-Badge statt nacktem "?"-Zeichen mit Dashed-Underline — ein bloßes "?"
// direkt nach einem Satzende (z.B. "...eingespeist.?") liest sich wie kaputte
// Interpunktion statt wie ein eigenständiges Hilfe-Element, unabhängig davon,
// wie viel Abstand man einstellt. Ein umrandeter Kreis macht die Grenze
// zwischen Satz und Hilfe-Icon eindeutig sichtbar.
function HelpTip({ title }) {
  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 15,
        height: 15,
        borderRadius: "50%",
        border: `1.5px solid ${theme.color.textMuted}`,
        color: theme.color.textMuted,
        fontSize: 12,
        fontWeight: 700,
        cursor: "help",
        marginLeft: 5,
        flexShrink: 0,
        verticalAlign: "middle",
      }}
    >
      ?
    </span>
  );
}

// Dieselbe Spannen-Mathematik wie formatSpan() in calculate.js (dort
// dokumentiert), hier nur als Zahlenpaar für die Balken-Darstellung.
function spanBounds(v, pct) {
  const a = v * (1 - pct / 100);
  const b = v * (1 + pct / 100);
  let lo = Math.round(Math.min(a, b));
  const hi = Math.round(Math.max(a, b));
  if (v > 0) lo = Math.max(0, lo);
  return [lo, hi];
}
const eurSigned = (n) => `${n < 0 ? "\u2212" : ""}${Math.abs(n).toLocaleString("de-DE")}`;

// Kumulierte Nettoersparnis als Spannen-Balken um eine Null-Linie: im Minus
// (Investition noch nicht zurückverdient) hängt der Balken unter der Linie,
// im Plus steht er darüber. Die Balkenlänge zeigt die Unsicherheits-Spanne.
function CumulativeRange({ items }) {
  const rows = items.map(([jahre, v, pct]) => ({ jahre, v, bounds: spanBounds(v, pct) }));
  const maxPos = Math.max(0, ...rows.map((r) => r.bounds[1]));
  const maxNeg = Math.max(0, ...rows.map((r) => -r.bounds[0]));
  const H = 132;
  const total = maxPos + maxNeg || 1;
  const zero = (maxPos / total) * H;
  const y = (val) => zero - (val / total) * H;
  return (
    <div>
      <div style={{ position: "relative", height: H, margin: "4px 0 10px" }}>
        <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: zero, height: 1, background: "rgba(255,255,255,0.35)" }} />
        {maxNeg > 0 && (
          <div aria-hidden="true" style={{ position: "absolute", left: 0, top: zero - 16, fontSize: 11, color: theme.color.onNavyMuted }}>0 €</div>
        )}
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `repeat(${rows.length}, 1fr)` }}>
          {rows.map((r) => {
            const [lo, hi] = r.bounds;
            const topPx = y(hi);
            const h = Math.max(y(lo) - topPx, 4);
            const plus = lo >= 0;
            return (
              <div key={r.jahre} style={{ position: "relative" }}>
                <div
                  title={`Nach ${r.jahre} Jahren: ${eurSigned(lo)} bis ${eurSigned(hi)} €`}
                  style={{
                    position: "absolute", left: "50%", transform: "translateX(-50%)",
                    width: "min(44px, 42%)", top: topPx, height: h, borderRadius: 4,
                    background: plus ? theme.color.accent : "transparent",
                    border: plus ? "none" : "1.5px dashed rgba(255,255,255,0.55)",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${rows.length}, 1fr)`, gap: 6 }}>
        {rows.map((r) => {
          const [lo, hi] = r.bounds;
          const plus = lo >= 0;
          return (
            <div key={r.jahre} style={{ textAlign: "center", minWidth: 0 }}>
              <div style={{ fontSize: 12, color: theme.color.onNavyMuted }}>nach {r.jahre} Jahren</div>
              <div style={{ fontFamily: theme.font.display, fontSize: "clamp(13px, 2.3vw, 16px)", fontWeight: 700, color: plus ? theme.color.onNavy : theme.color.onNavyMuted, fontVariantNumeric: "tabular-nums", lineHeight: 1.25, marginTop: 2 }}>
                {eurSigned(lo)} bis<br />{eurSigned(hi)} €
              </div>
              <div style={{ display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: plus ? "rgba(247,158,28,0.18)" : "rgba(255,255,255,0.10)", color: plus ? theme.color.accent : theme.color.onNavyMuted }}>
                {plus ? "im Plus" : hi <= 0 ? "noch im Minus" : "um die Null"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ResultScreen({ result, displayLocation, dach, dachform, ausrichtung, neigung, speicherKwh, eauto, eautoProfil, waermepumpe, tageszeit, plz, onRestart }) {
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
      anlagengroesse: `${result.kwp.toLocaleString("de-DE")} kWp`,
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
        .res-hero { background: radial-gradient(520px 300px at 92% -20%, rgba(247,158,28,0.26), rgba(247,158,28,0) 70%), ${theme.color.navyDeep}; border-radius: ${theme.radius.lg}px; padding: 34px 30px 28px; margin-bottom: 20px; text-align: center; }
        @media (max-width: 560px) {
          .res-hero { padding: 28px 18px 22px; }
        }
        .res-autarkie { background: ${theme.color.white}; border: 1px solid ${theme.color.border}; border-radius: ${theme.radius.lg}px; margin-bottom: 16px; display: grid; grid-template-columns: 1fr; }
        @media (min-width: 620px) { .res-autarkie { grid-template-columns: 1.15fr 1fr; } }
        .res-autarkie__main { display: flex; gap: 20px; align-items: center; padding: 22px 22px; }
        .res-autarkie__side { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid ${theme.color.border}; }
        @media (min-width: 620px) { .res-autarkie__side { grid-template-columns: 1fr; border-top: none; border-left: 1px solid ${theme.color.border}; } }
        .res-stat { padding: 16px 20px; }
        .res-stat + .res-stat { border-left: 1px solid ${theme.color.border}; }
        @media (min-width: 620px) { .res-stat + .res-stat { border-left: none; border-top: 1px solid ${theme.color.border}; } }
        @keyframes ringEnter {
          from { opacity: 0.25; transform: rotate(-90deg) scale(0.92); }
          to { opacity: 1; transform: rotate(-90deg) scale(1); }
        }
      `}</style>
      {/* Result Header — dieselbe Marken-Navy + Sonnenschein wie das Prozess-
          Band der Landingpage, damit das Ergebnis zur Seite gehört. */}
      <div className="res-hero">
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.6, color: theme.color.accent, marginBottom: 10 }}>Ihr Ergebnis</div>
        <div ref={savingsRef} style={{ fontFamily: theme.font.display, fontSize: "clamp(38px, 7vw, 56px)", fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.05, fontVariantNumeric: "tabular-nums", color: theme.color.onNavy }}>
          {formatSpan(savingsCount)} €
        </div>
        <div style={{ fontSize: 15, color: theme.color.onNavyMuted, marginTop: 8 }}>
          geschätzte Ersparnis pro Jahr ±12%{displayLocation ? ` · ${displayLocation}` : ""}
        </div>

        {/* 25-Jahres-Wert: deutlich mehr kumulierte Unsicherheit als der Jahres-Ersparnis-Wert
            (Degradation + Wartung + Strompreis-Annahme + Wechselrichter-Timing kombiniert über
            25 Jahre) — bewusst breitere Spanne als die ±12% des 1-Jahres-Werts. */}
        <div style={{ marginTop: 26, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.16)" }}>
          <div style={{ fontSize: 13, color: theme.color.onNavyMuted, marginBottom: 12 }}>Kumulierte Nettoersparnis (nach Investition & Wartung)</div>
          <CumulativeRange
            items={[
              [10, result.ersparnis10, 16],
              [15, result.ersparnis15, 18],
              [20, result.ersparnis20, 20],
              [25, result.ersparnis25, 22],
            ]}
          />
        </div>
      </div>

      {/* Kompakter CTA direkt unter der Ergebnis-Zahl — der volle CTA-Block
          steht weiter unten; hier nur ein Sprunglink auf Höhe der Kaufabsicht. */}
      <div style={{ textAlign: "center", margin: "-4px 0 20px" }}>
        <a href="#ergebnis-cta" style={{ fontSize: 14, fontWeight: 600, color: theme.color.textPrimary, textUnderlineOffset: 3 }}>
          Ergebnis mit einem Berater durchgehen — Termin wählen ↓
        </a>
      </div>

      {/* Autarkiegrad Ring + zwei getrennte Kennzahlen (Autarkie ≠ Eigenverbrauchsanteil) */}
      <div className="res-autarkie">
        <div className="res-autarkie__main">
          <div style={{ position: "relative", width: 104, height: 104, flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: 104, height: 104, animation: reduced ? "none" : "ringEnter 0.7s cubic-bezier(0.22, 1, 0.36, 1)" }} role="img" aria-label={`Autarkiegrad ${result.autarkie}%`}>
              <circle cx="50" cy="50" r="42" fill="none" stroke={theme.color.bg} strokeWidth="9" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={result.autarkie >= 50 ? theme.color.success : theme.color.accent}
                strokeWidth="9"
                strokeDasharray={`${result.autarkie * 2.64} ${264 - result.autarkie * 2.64}`}
                strokeLinecap="round"
                style={{ transition: reduced ? "none" : "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 700, color: theme.color.textPrimary, lineHeight: 1 }}>{result.autarkie}%</div>
              <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 3, display: "flex", alignItems: "center", gap: 2 }}>
                Autarkie
                <HelpTip title="Modellierte Kennlinie, kein Lastgang Ihres Haushalts. Reale Werte hängen stark davon ab, wann Sie tatsächlich Strom verbrauchen — laut HTW Berlin können auch verschiedene seriöse Online-Rechner bei identischen Eingaben um 20 Prozentpunkte und mehr voneinander abweichen." />
              </div>
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: theme.font.display, fontSize: 17, fontWeight: 600, lineHeight: 1.3, color: theme.color.textPrimary, marginBottom: 6 }}>
              {result.autarkie >= 60 ? "Hohe Unabhängigkeit (Schätzung)" : result.autarkie >= 40 ? "Gute Unabhängigkeit" : "Teilweise unabhängig"}
            </div>
            <div style={{ fontSize: 14, color: theme.color.textSecondary, lineHeight: 1.55 }}>
              {result.autarkie}% Ihres <strong style={{ color: theme.color.textPrimary }}>gesamten Verbrauchs</strong> deckt die Anlage — der Rest kommt aus dem Netz.
              {!speicherKwh && result.autarkie < 50 && " Mit einem Batteriespeicher steigt Ihre Autarkie spürbar — 100% sind mit einem realistisch dimensionierten Speicher allerdings nicht erreichbar."}
            </div>
          </div>
        </div>
        <div className="res-autarkie__side">
          <div className="res-stat">
            <div style={{ fontFamily: theme.font.display, fontSize: 22, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{Math.round(result.eigenverbrauchsquote * 100)}%</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textPrimary, marginTop: 2, display: "flex", alignItems: "center", gap: 2 }}>
              Eigenverbrauchsanteil
              {result.eigenverbrauchsquote < 0.5 && (
                <HelpTip title="Der Eigenverbrauchsanteil sinkt, wenn Ihre Anlage deutlich mehr produziert als Sie verbrauchen — ein niedriger Wert bedeutet nicht, dass sich die Anlage nicht lohnt, sondern dass ein großer Teil ins Netz eingespeist wird." />
              )}
            </div>
            <div style={{ fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.45, marginTop: 2 }}>Anteil des <strong>selbst erzeugten</strong> Stroms, den Sie nutzen — der Rest wird eingespeist.</div>
          </div>
          <div className="res-stat">
            <div style={{ fontFamily: theme.font.display, fontSize: 22, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{(result.gesamtVerbrauch - result.eigenverbrauch).toLocaleString("de-DE")} <span style={{ fontSize: 14, fontWeight: 600 }}>kWh</span></div>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textPrimary, marginTop: 2 }}>Netzbezug pro Jahr</div>
            <div style={{ fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.45, marginTop: 2 }}>Anteil Ihres Verbrauchs, der trotz Anlage aus dem Netz kommt.</div>
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
        <ResultCard label="Anlagengröße" value={result.kwp.toLocaleString("de-DE")} unit="kWp" sub={`${result.module} Module · ${result.nutzbar} m²`} />
        <ResultCard label="Jahresertrag" value={formatSpan(result.jahresertrag)} unit="kWh" sub="±12% Spannbreite" />
        <ResultCard label="Amortisation" value={formatSpan(result.amortisation)} unit="Jahre" />
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
              ? `Für die Anlagengröße rechnen wir auf dem Flachdach mit ca. ${M2_PRO_KWP_FLACHDACH.toLocaleString("de-DE")} m² Dachfläche pro kWp Modulleistung — deutlich mehr als die ca. ${M2_PRO_KWP.toLocaleString("de-DE")} m²/kWp auf dem Schrägdach, weil aufgeständerte Module zur Verschattungsvermeidung Reihenabstand brauchen.`
              : `Für die Anlagengröße rechnen wir mit ca. ${M2_PRO_KWP.toLocaleString("de-DE")} m² Dachfläche pro kWp Modulleistung, abhängig von Ihrer Dachform.`} Ihre geschätzte Autarkie von {result.autarkie}% (Anteil Ihres Verbrauchs, den die Anlage selbst deckt) ergibt sich aus dem Verhältnis von Anlagengröße zu Verbrauch{speicherKwh > 0 ? ` und Ihrer Speicherkapazität von ${speicherKwh} kWh` : ""} — keine feste Pauschale: Eine im Verhältnis zum Verbrauch größere Anlage deckt tendenziell einen größeren Teil davon selbst ab. Wir orientieren uns dabei an den offiziell kommunizierten Spannen von 30–55% ohne und bis zu 85% mit Speicher. {tageszeit && tageszeit.length > 0 && `Zusätzlich fließt ein, dass Sie den Strom überwiegend ${tageszeit.join(", ").toLowerCase()} nutzen — Verbrauch in den Produktionszeiten (Mittag) erhöht den Eigenverbrauch, Abend-/Nachtverbrauch senkt ihn.`} Ihre Ersparnis: Eigenverbrauch zu Ihrem Strompreis von {(STROMPREIS * 100).toFixed(0)} Ct/kWh, der eingespeiste Rest zur aktuellen Einspeisevergütung von {(einspeiseStaffel(result.kwp) * 100).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ct/kWh (staffelt nach EEG: Anlagen bis 10 kWp erhalten {(EINSPEISE * 100).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ct/kWh, größere Anlagen einen niedrigeren Satz für den Anteil über 10 kWp).
          </p>
          <p style={{ margin: "8px 0" }}>
            Die 25-Jahres-Prognose berücksichtigt {(DEGRADATION_PRO_JAHR * 100).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% Ertragsverlust pro Jahr durch Moduldegradation, laufende Betriebskosten von ca. {(WARTUNG_PROZENT_PRO_JAHR * 100).toFixed(0)}% der Investitionssumme pro Jahr sowie einen einmaligen Wechselrichter-Austausch (ca. {Math.round(wechselrichterKosten(result.kwp)).toLocaleString("de-DE")} € nach 12–15 Jahren). Der Jahres-Ersparnis-Wert oben rechnet mit dem heutigen Strompreis; nur die 25-Jahres-Zahl unterstellt zusätzlich vorsichtig eine Strompreissteigerung von {(STROMPREIS_STEIGERUNG_PRO_JAHR * 100).toFixed(0)}%/Jahr.
          </p>
        </div>
        </details>
      )}

      {/* Nächster Schritt: sagt konkret, was im Termin passiert, statt die
          Monatsersparnis (steht schon oben) ein zweites Mal zu wiederholen. */}
      <div style={{ marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontFamily: theme.font.display, fontSize: 18, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 4 }}>
          Nächster Schritt: Ergebnis gemeinsam prüfen
        </div>
        <div style={{ fontSize: 14, color: theme.color.textSecondary, lineHeight: 1.55 }}>
          Im Termin klären wir, ob Ihr Dach so geeignet ist, wie die Rechnung annimmt, und welche Anlagengröße wirklich passt.
        </div>
      </div>

      <div id="ergebnis-cta" style={{ scrollMarginTop: 90 }} />
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
            Ihre Berechnung: {result.kwp.toLocaleString("de-DE")} kWp Anlage · {result.jahresErsparnis.toLocaleString("de-DE")} €/Jahr Ersparnis
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
            Ihre Berechnung wird mitgeteilt: {result.kwp.toLocaleString("de-DE")} kWp · {result.jahresertrag.toLocaleString("de-DE")} kWh/Jahr · {result.jahresErsparnis.toLocaleString("de-DE")} €/Jahr{displayLocation ? ` · ${displayLocation}` : ""}
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
            { key: "telefon", label: "Telefon (optional)", placeholder: "z. B. 0170 1234567", type: "tel" },
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
            Ihre Berechnung wird mitgeschickt: {result.kwp.toLocaleString("de-DE")} kWp · {result.jahresertrag.toLocaleString("de-DE")} kWh/Jahr · {result.jahresErsparnis.toLocaleString("de-DE")} €/Jahr Ersparnis{displayLocation ? ` · ${displayLocation}` : ""}
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
              color: form.name.trim() && form.email.trim() ? theme.color.onAccent : theme.color.textSecondary,
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

          <p style={{ fontSize: 12, color: theme.color.textSecondary, lineHeight: 1.55, margin: "10px 0 0", textAlign: "center" }}>
            Mit dem Absenden stimmen Sie zu, dass wir Ihre Angaben zur Bearbeitung Ihrer Anfrage verwenden. Details in der{" "}
            <a href="/datenschutz.html" target="_blank" rel="noopener noreferrer" style={{ color: theme.color.textPrimary }}>Datenschutzerklärung</a>.
          </p>

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
              color: theme.color.onAccent,
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

      <button
        onClick={onRestart}
        style={{
          display: "block",
          margin: "8px auto 0",
          minHeight: 44,
          padding: "10px 16px",
          background: "transparent",
          border: "none",
          color: theme.color.textSecondary,
          fontSize: 14,
          textDecoration: "underline",
          textUnderlineOffset: 3,
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