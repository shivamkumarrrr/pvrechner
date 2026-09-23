import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import { IconPlug, IconLeaf, IconTrendingUp } from "../Icons.jsx";

const VORTEILE = [
  {
    Icon: IconPlug,
    title: "Weniger Strom zukaufen",
    text: "Mit eigener Erzeugung und Speicher entscheiden Sie selbst, wie viel Strom Sie zukaufen — statt vollständig auf den Netzbetreiber angewiesen zu sein.",
  },
  {
    Icon: IconLeaf,
    title: "Sauberer Strom vom eigenen Dach",
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
          <h2 id="vorteile-heading" style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 8px" }}>
            Vorteile einer eigenen PV-Anlage
          </h2>
          <p style={{ fontSize: 14, color: theme.color.textSecondary, margin: "0 0 32px", maxWidth: 560, lineHeight: 1.6 }}>
            Strompreise steigen, Solarmodule werden günstiger — eine durchschnittliche Anlage amortisiert sich heute in 9 bis 12 Jahren.
          </p>
        </Reveal>
        {/* Bewusst KEINE Karten: drei offene Spalten mit Trennlinie, damit die
            Seite nicht Sektion für Sektion dieselbe weiße Box wiederholt. */}
        <style>{`
          .vorteile-row { display: grid; grid-template-columns: 1fr; }
          .vorteile-item { padding: 20px 0; border-top: 1px solid ${theme.color.border}; }
          @media (min-width: 820px) {
            .vorteile-row { grid-template-columns: repeat(3, 1fr); }
            .vorteile-item { padding: 4px 28px 4px 0; border-top: none; }
            .vorteile-item + .vorteile-item { padding-left: 28px; border-left: 1px solid ${theme.color.border}; }
          }
        `}</style>
        <div className="vorteile-row">
          {VORTEILE.map((v, i) => (
            <Reveal key={v.title} delay={i * 90} className="vorteile-item">
              <div>
                <div style={{ color: theme.color.accentText, marginBottom: 12 }}>
                  <v.Icon size={26} />
                </div>
                <h3 style={{ fontFamily: theme.font.display, fontSize: 18, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 8px" }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: theme.color.textSecondary, lineHeight: 1.65, margin: 0 }}>{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
