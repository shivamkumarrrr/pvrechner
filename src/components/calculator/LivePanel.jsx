import theme from "../../theme.js";
import MonthlyChart from "./ui/MonthlyChart.jsx";
import { formatSpan } from "../../lib/calculate.js";

function MiniRing({ pct }) {
  return (
    <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: 64, height: 64 }} role="img" aria-label={`Autarkiegrad ${pct}%`}>
        <circle cx="50" cy="50" r="42" fill="none" stroke={theme.color.bg} strokeWidth="12" />
        <circle
          cx="50" cy="50" r="42" fill="none"
          stroke={theme.color.accent}
          strokeWidth="12"
          strokeDasharray={`${pct * 2.64} ${264 - pct * 2.64}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: theme.color.textPrimary, lineHeight: 1 }}>{pct}%</div>
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "7px 0", borderTop: `1px solid ${theme.color.border}` }}>
      <span style={{ color: theme.color.textSecondary }}>{label}</span>
      <span style={{ fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

// Live-Vorschau neben dem Wizard: zeigt die aktuelle Berechnung, ohne dass der
// Besucher den Ergebnis-Screen aufrufen muss. Aktualisiert sich mit jeder Eingabe,
// weil Wizard `calculate()` bei jedem Render neu aufruft.
export default function LivePanel({ result, speicherKwh }) {
  const eigenanteil = Math.round((result.eigenverbrauchsquote || 0) * 100);

  return (
    <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1px solid ${theme.color.border}`, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textPrimary }}>Live-Vorschau</div>
        <div style={{ fontSize: 10, color: theme.color.textMuted }}>ändert sich mit jeder Eingabe</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <MiniRing pct={result.autarkie} />
        <div>
          <div style={{ fontSize: 12, color: theme.color.textSecondary }}>geschätzte Ersparnis</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: theme.color.accentHover, fontVariantNumeric: "tabular-nums" }}>
            {formatSpan(result.jahresErsparnis)} €
          </div>
          <div style={{ fontSize: 10, color: theme.color.textMuted }}>pro Jahr · Autarkie {result.autarkie}%</div>
        </div>
      </div>

      <StatRow label="Anlagengröße" value={`${result.kwp} kWp · ${result.module} Module`} />
      <StatRow label="Jahresertrag" value={`${result.jahresertrag.toLocaleString("de-DE")} kWh`} />
      <StatRow label="Eigenverbrauchsanteil" value={`${eigenanteil}% des Ertrags`} />
      <StatRow label="Speicher" value={speicherKwh > 0 ? `${speicherKwh} kWh` : "keiner"} />

      {result.monthly && result.monthly.length === 12 && (
        <div style={{ marginTop: 12 }}>
          <MonthlyChart monthly={result.monthly} compact />
        </div>
      )}
    </div>
  );
}
