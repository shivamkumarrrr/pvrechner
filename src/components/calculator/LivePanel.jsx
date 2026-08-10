import { useEffect, useState } from "react";
import theme from "../../theme.js";
import MonthlyChart from "./ui/MonthlyChart.jsx";
import { formatSpan } from "../../lib/calculate.js";
import { useAnimatedNumber } from "../../lib/useAnimatedNumber.js";

function MiniRing({ pct }) {
  const animatedPct = useAnimatedNumber(pct);
  const shown = Math.round(animatedPct);
  return (
    <div style={{ position: "relative", width: 76, height: 76, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: 76, height: 76 }} role="img" aria-label={`Autarkiegrad ${shown}%`}>
        <circle cx="50" cy="50" r="42" fill="none" stroke={theme.color.bg} strokeWidth="12" />
        <circle
          cx="50" cy="50" r="42" fill="none"
          stroke={theme.color.accent}
          strokeWidth="12"
          strokeDasharray={`${animatedPct * 2.64} ${264 - animatedPct * 2.64}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: theme.color.textPrimary, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{shown}%</div>
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderTop: `1px solid ${theme.color.border}` }}>
      <span style={{ color: theme.color.textSecondary }}>{label}</span>
      <span style={{ fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

// Live-Vorschau neben dem Wizard: zeigt die aktuelle Berechnung, ohne dass der
// Besucher den Ergebnis-Screen aufrufen muss. Aktualisiert sich mit jeder Eingabe,
// weil Wizard `calculate()` bei jedem Render neu aufruft.
//
// `flashKey` wechselt, wenn eine NEUE Standort-Berechnung (z.B. neue PLZ) fertig
// geladen wurde — dann pulsiert der Ersparnis-Block kurz, als visuelles "Rechnen
// fertig". Alle Zahlen laufen zusätzlich per Count-up auf ihren neuen Wert.
export default function LivePanel({ result, speicherKwh, flashKey }) {
  const eigenanteil = Math.round((result.eigenverbrauchsquote || 0) * 100);
  const [flash, setFlash] = useState(0);
  useEffect(() => { if (flashKey) setFlash((f) => f + 1); }, [flashKey]);

  const animatedErsparnis = useAnimatedNumber(result.jahresErsparnis);
  const animatedErtrag = useAnimatedNumber(result.jahresertrag);

  return (
    <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1px solid ${theme.color.border}`, padding: 20 }}>
      <style>{`
        @keyframes valueFlash {
          0% { background: ${theme.color.accentSubtle}; transform: scale(1.02); }
          100% { background: transparent; transform: scale(1); }
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: theme.color.textPrimary }}>Live-Vorschau</div>
        <div style={{ fontSize: 11, color: theme.color.textMuted }}>ändert sich mit jeder Eingabe</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        <MiniRing pct={result.autarkie} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: theme.color.textSecondary }}>geschätzte Ersparnis</div>
          <div
            key={`flash-${flash}`}
            style={{
              fontSize: 27,
              fontWeight: 700,
              color: theme.color.accentHover,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.15,
              whiteSpace: "nowrap",
              borderRadius: 8,
              padding: "2px 4px",
              margin: "0 -4px",
              animation: flash > 0 ? "valueFlash 0.8s ease" : "none",
            }}
          >
            {formatSpan(Math.round(animatedErsparnis))} €
          </div>
          <div style={{ fontSize: 11, color: theme.color.textMuted }}>pro Jahr · Autarkie {Math.round(result.autarkie)}%</div>
        </div>
      </div>

      <StatRow label="Anlagengröße" value={`${result.kwp} kWp · ${result.module} Module`} />
      <StatRow label="Jahresertrag" value={`${Math.round(animatedErtrag).toLocaleString("de-DE")} kWh`} />
      <StatRow label="Eigenverbrauchsanteil" value={`${eigenanteil}% des Ertrags`} />
      <StatRow label="Speicher" value={speicherKwh > 0 ? `${speicherKwh} kWh` : "keiner"} />

      {result.monthly && result.monthly.length === 12 && (
        <div style={{ marginTop: 14 }}>
          <MonthlyChart monthly={result.monthly} compact />
        </div>
      )}
    </div>
  );
}
