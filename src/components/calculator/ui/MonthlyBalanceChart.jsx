import { useState } from "react";
import theme from "../../../theme.js";

const MONTH_LABELS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const MONTH_FULL = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

const SERIES = [
  { key: "eigenverbrauch", label: "Eigenverbrauch", color: theme.color.chartEigen },
  { key: "einspeisung", label: "Einspeisung", color: theme.color.chartEinspeisung },
  { key: "netzbezug", label: "Netzbezug", color: theme.color.chartNetz },
];

// Divergierender Monats-Balken um eine Nulllinie (Muster SMA Energy App):
// OBERHALB Eigenverbrauch (an der Nulllinie) + Einspeisung = Monatsertrag der
// Anlage. UNTERHALB der Netzbezug — der Teil des Verbrauchs, den die Anlage
// nicht gedeckt hat. Jede Hälfte summiert zu einer realen Größe.
// Darstellung nach dataviz-Regeln: eine Skala (kWh), dezente Gitterlinien,
// 2px Lücke zwischen gestapelten Segmenten, gerundete Außenkanten, Hover-/
// Fokus-Tooltip pro Monat, Tabellenansicht für Screenreader & zum Nachlesen.
const PLOT_H = 200;

function niceStep(max) {
  const raw = max / 3;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}
const kwh = (v) => `${Math.round(v).toLocaleString("de-DE")} kWh`;

export default function MonthlyBalanceChart({ balance }) {
  const [active, setActive] = useState(null);
  if (!balance || balance.length !== 12) return null;

  const maxUp = Math.max(...balance.map((m) => m.eigenverbrauch + m.einspeisung), 1);
  const maxDown = Math.max(...balance.map((m) => m.netzbezug), 1);
  const step = niceStep(Math.max(maxUp, maxDown));
  const top = Math.ceil(maxUp / step) * step;
  // Unterseite nur so tief wie nötig (in halben Schritten) — sonst bleibt bei
  // kleinem Netzbezug die halbe Fläche leer.
  const bottom = Math.ceil(maxDown / (step / 2)) * (step / 2);
  const scale = PLOT_H / (top + bottom);
  const zeroY = top * scale;
  const px = (v) => v * scale;

  const ticks = [];
  for (let v = top; v >= 0; v -= step) ticks.push(v);
  for (let v = step; v <= bottom + 1e-9; v += step) ticks.push(-v);
  if (bottom % step !== 0) ticks.push(-bottom);

  const sum = (k) => balance.reduce((a, m) => a + m[k], 0);
  const a = active != null ? balance[active] : null;

  return (
    <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1px solid ${theme.color.border}`, padding: "22px 20px 18px", marginBottom: 16 }}>
      <style>{`
        .mbc-col { flex: 1; position: relative; height: 100%; cursor: default; outline: none; }
        .mbc-col:focus-visible { box-shadow: inset 0 0 0 2px ${theme.color.accent}; border-radius: 6px; }
        .mbc-hover { position: absolute; inset: 0 1px; border-radius: 6px; background: ${theme.color.bg}; opacity: 0; }
        .mbc-col.is-active .mbc-hover { opacity: 1; }
        .mbc-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; font-variant-numeric: tabular-nums; }
        .mbc-table th, .mbc-table td { padding: 6px 8px; text-align: right; border-bottom: 1px solid ${theme.color.border}; }
        .mbc-table th:first-child, .mbc-table td:first-child { text-align: left; }
        .mbc-table th { font-weight: 600; color: ${theme.color.textPrimary}; }
        .mbc-table td { color: ${theme.color.textSecondary}; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: theme.font.display, fontSize: 18, fontWeight: 600, color: theme.color.textPrimary }}>Ihr Strom über das Jahr</div>
          <div style={{ fontSize: 13, color: theme.color.textSecondary, marginTop: 2 }}>Oben: Erzeugung Ihrer Anlage · Unten: zugekaufter Netzstrom · in kWh pro Monat</div>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {SERIES.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: theme.color.textSecondary }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: "inline-block" }} />
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip-Zeile: fester Platz über dem Plot, springt nicht */}
      <div aria-live="polite" style={{ minHeight: 40, marginBottom: 8, fontSize: 13, color: theme.color.textSecondary, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {a ? (
          <>
            <strong style={{ color: theme.color.textPrimary, fontSize: 14 }}>{MONTH_FULL[a.month - 1]}</strong>
            {SERIES.map((s) => (
              <span key={s.key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 2, background: s.color, display: "inline-block" }} />
                <strong style={{ color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{kwh(a[s.key])}</strong> {s.label}
              </span>
            ))}
          </>
        ) : (
          <span style={{ color: theme.color.textMuted }}>Monat antippen oder mit der Maus darüberfahren für die Werte</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {/* y-Achse */}
        <div style={{ position: "relative", width: 44, height: PLOT_H, flexShrink: 0 }} aria-hidden="true">
          {ticks.map((t) => (
            <div key={t} style={{ position: "absolute", right: 0, top: zeroY - px(t) - 7, fontSize: 11, color: theme.color.textMuted, fontVariantNumeric: "tabular-nums" }}>
              {Math.abs(t).toLocaleString("de-DE")}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ position: "relative", height: PLOT_H }}>
            {/* Gitterlinien + Nulllinie */}
            {ticks.map((t) => (
              <div key={t} aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: zeroY - px(t), height: 1, background: t === 0 ? theme.color.textSecondary : theme.color.border, opacity: t === 0 ? 0.6 : 1 }} />
            ))}
            <div style={{ position: "absolute", inset: 0, display: "flex" }} onMouseLeave={() => setActive(null)}>
              {balance.map((m, i) => {
                const eigH = px(m.eigenverbrauch);
                const einH = px(m.einspeisung);
                const netzH = px(m.netzbezug);
                return (
                  <div
                    key={m.month}
                    className={`mbc-col${active === i ? " is-active" : ""}`}
                    tabIndex={0}
                    aria-label={`${MONTH_FULL[m.month - 1]}: Eigenverbrauch ${kwh(m.eigenverbrauch)}, Einspeisung ${kwh(m.einspeisung)}, Netzbezug ${kwh(m.netzbezug)}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    onClick={() => setActive(i)}
                  >
                    <div className="mbc-hover" />
                    {/* Oben: Eigenverbrauch an der Nulllinie, Einspeisung darüber (2px Lücke) */}
                    <div style={{ position: "absolute", bottom: PLOT_H - zeroY + 1, left: "18%", right: "18%", display: "flex", flexDirection: "column-reverse", gap: 2 }}>
                      {eigH > 0 && <div style={{ background: theme.color.chartEigen, height: eigH, borderRadius: einH > 0.5 ? "0" : "4px 4px 0 0" }} />}
                      {einH > 0.5 && <div style={{ background: theme.color.chartEinspeisung, height: einH, borderRadius: "4px 4px 0 0" }} />}
                    </div>
                    {/* Unten: Netzbezug */}
                    {netzH > 0.5 && (
                      <div style={{ position: "absolute", top: zeroY + 1, left: "18%", right: "18%", height: netzH, background: theme.color.chartNetz, borderRadius: "0 0 4px 4px" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", marginTop: 8 }} aria-hidden="true">
            {balance.map((m, i) => (
              <div key={m.month} style={{ flex: 1, fontSize: 11, textAlign: "center", color: active === i ? theme.color.textPrimary : theme.color.textMuted, fontWeight: active === i ? 600 : 400 }}>
                {MONTH_LABELS[m.month - 1]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jahressummen — dieselben Zahlen, ohne Hover erreichbar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${theme.color.border}` }}>
        {SERIES.map((s) => (
          <div key={s.key}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: theme.color.textSecondary }}>
              <span style={{ width: 12, height: 2, background: s.color, display: "inline-block" }} />{s.label}
            </div>
            <div style={{ fontFamily: theme.font.display, fontSize: 17, fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{kwh(sum(s.key))}</div>
            <div style={{ fontSize: 11, color: theme.color.textMuted }}>pro Jahr</div>
          </div>
        ))}
      </div>

      <details style={{ marginTop: 12 }}>
        <summary style={{ fontSize: 13, color: theme.color.textSecondary, cursor: "pointer", minHeight: 32, display: "flex", alignItems: "center" }}>Werte als Tabelle anzeigen</summary>
        <div style={{ overflowX: "auto" }}>
          <table className="mbc-table">
            <thead><tr><th>Monat</th>{SERIES.map((s) => <th key={s.key}>{s.label}</th>)}</tr></thead>
            <tbody>
              {balance.map((m) => (
                <tr key={m.month}><td>{MONTH_FULL[m.month - 1]}</td>{SERIES.map((s) => <td key={s.key}>{kwh(m[s.key])}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
