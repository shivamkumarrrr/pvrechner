import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import { IconMapPin, IconSatellite, IconContact, IconDocumentCheck, IconWrench } from "../Icons.jsx";
import { siteConfig } from "../../config.js";

const BRAND = siteConfig.brand.name;

const PUNKTE = [
  {
    Icon: IconMapPin,
    title: "Fachbetrieb in Ihrer Nähe",
    text: `${BRAND} vermittelt Sie bundesweit an geprüfte Fachbetriebe, die Ihre Dachsituation und die örtlichen Bauämter/Netzbetreiber kennen — kurze Wege statt anonymer Callcenter.`,
  },
  {
    Icon: IconSatellite,
    title: "Echte Berechnung statt Bauchgefühl",
    text: "Unser Rechner nutzt reale Satellitendaten des EU Science Hub (PVGIS) für Ihren Standort — keine pauschalen Schätzwerte, die bei jedem Anbieter anders ausfallen.",
  },
  {
    Icon: IconContact,
    title: "Ein fester Ansprechpartner",
    text: "Von der ersten Beratung bis zur Inbetriebnahme begleitet Sie dieselbe Person — keine wechselnden Zuständigkeiten.",
  },
  {
    Icon: IconDocumentCheck,
    title: "Individuelles Angebot",
    text: "Ihre Berechnung ist der Ausgangspunkt, kein Endergebnis: Ein Fachbetrieb prüft Ihr Dach vor Ort und erstellt ein passgenaues Angebot.",
  },
  {
    Icon: IconWrench,
    title: "Betreuung nach der Installation",
    text: "Wartung, Monitoring und Ansprechpartner bei Fragen — auch Jahre nach der Montage sind wir erreichbar.",
  },
];

export default function WarumWir() {
  return (
    <section style={{ background: theme.color.bg }} aria-labelledby="warum-wir-heading">
      <style>{`
        .warum-grid{ display: grid; grid-template-columns: 1fr; gap: 20px; align-items: stretch; }
        @media (min-width: 900px){ .warum-grid{ grid-template-columns: repeat(2, 1fr); } }
      `}</style>
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: "56px 20px" }}>
        <Reveal>
          <h2 id="warum-wir-heading" style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 600, color: theme.color.textPrimary, textAlign: "center", margin: "0 0 8px" }}>
            Warum {BRAND}?
          </h2>
          <p style={{ fontSize: 14, color: theme.color.textSecondary, textAlign: "center", margin: "0 auto 36px", maxWidth: 480 }}>
            Fünf Gründe, warum Kunden ihre Solaranlage mit uns planen.
          </p>
        </Reveal>
        <div className="warum-grid">
          {PUNKTE.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div style={{
                background: theme.color.white,
                border: `1.5px solid ${theme.color.border}`,
                borderRadius: theme.radius.lg,
                padding: "22px 20px",
                height: "100%",
                boxSizing: "border-box",
              }}>
                <div style={{ color: theme.color.accent, marginBottom: 12 }}><p.Icon size={24} /></div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 6px" }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: theme.color.textSecondary, lineHeight: 1.6, margin: 0 }}>{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
