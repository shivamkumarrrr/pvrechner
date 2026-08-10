import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import { IconPlug, IconLeaf, IconTrendingUp } from "../Icons.jsx";

const VORTEILE = [
  {
    Icon: IconPlug,
    title: "Unabhängigkeit vom Netz",
    text: "Mit eigener Erzeugung und Speicher entscheiden Sie selbst, wie viel Strom Sie zukaufen — statt vollständig auf den Netzbetreiber angewiesen zu sein.",
  },
  {
    Icon: IconLeaf,
    title: "100 % erneuerbar",
    text: "Jede selbst erzeugte Kilowattstunde ersetzt Strom aus fossilen Quellen — messbar in der CO₂-Einsparung, die Ihnen der Rechner oben ausgibt.",
  },
  {
    Icon: IconTrendingUp,
    title: "Schutz vor steigenden Preisen",
    text: "Ihr Strompreis pro kWh aus der eigenen Anlage bleibt über die gesamte Lebensdauer fix — unabhängig davon, wie sich der Marktpreis entwickelt.",
  },
];

export default function VorteileCards() {
  return (
    <section style={{ background: theme.color.white }} aria-labelledby="vorteile-heading">
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: "56px 20px" }}>
        <Reveal>
          <h2 id="vorteile-heading" style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 600, color: theme.color.textPrimary, textAlign: "center", margin: "0 0 8px" }}>
            Vorteile einer eigenen PV-Anlage
          </h2>
          <p style={{ fontSize: 14, color: theme.color.textSecondary, textAlign: "center", margin: "0 auto 36px", maxWidth: 480 }}>
            Strompreise steigen, Solarmodule werden günstiger — eine durchschnittliche Anlage amortisiert sich heute in 9 bis 12 Jahren.
          </p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {VORTEILE.map((v, i) => (
            <Reveal key={v.title} delay={i * 90}>
              <div style={{
                background: theme.color.white,
                border: `1px solid ${theme.color.border}`,
                borderRadius: theme.radius.lg,
                padding: "26px 22px",
                textAlign: "center",
                height: "100%",
                boxSizing: "border-box",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 26,
                  background: theme.color.accentSubtle, color: theme.color.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <v.Icon size={24} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 8px" }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: theme.color.textSecondary, lineHeight: 1.6, margin: 0 }}>{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
