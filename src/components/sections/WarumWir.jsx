import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import { IconMapPin, IconSatellite, IconContact, IconDocumentCheck, IconWrench } from "../Icons.jsx";
import { siteConfig } from "../../config.js";
import warumWirImg from "../../assets/warum-wir.jpg";

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
        .warum-reasons{ display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 28px; }
        @media (min-width: 900px){ .warum-reasons{ grid-template-columns: repeat(2, 1fr); gap: 12px; } }
        .warum-reason{ display: flex; align-items: flex-start; gap: 14px; background: ${theme.color.white}; border: 1.5px solid ${theme.color.border}; border-radius: ${theme.radius.lg}px; padding: 16px 16px; cursor: default; transition: border-color 0.2s ease, transform 0.2s ease, background-color 0.2s ease; }
        .warum-reason:hover{ border-color: ${theme.color.accent}; background-color: ${theme.color.accentSubtle}; transform: translateY(-2px); }
        .warum-img{ width: 100%; max-height: 520px; max-height: 56vw; aspect-ratio: 3 / 1.8; object-fit: cover; border-radius: ${theme.radius.lg}px; border: 1px solid ${theme.color.border}; display: block; }
      `}</style>
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: "56px 20px" }}>
        <Reveal>
          <h2 id="warum-wir-heading" style={{ fontFamily: theme.font.display, fontSize: 30, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 12px" }}>
            Warum {BRAND}?
          </h2>
          <p style={{ fontSize: 16, color: theme.color.textSecondary, lineHeight: 1.65, margin: "0 0 22px", maxWidth: 520 }}>
            Fünf Gründe, warum Kunden ihre Solaranlage mit uns planen — von der echten Berechnung
            bis zur Betreuung nach der Installation.
          </p>
        </Reveal>

        <div className="warum-reasons">
          {PUNKTE.map((p, i) => (
            <Reveal key={p.title} delay={i * 60}>
              <div className="warum-reason">
                <div style={{ color: theme.color.accent, marginTop: 2, flexShrink: 0 }}>
                  <p.Icon size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 4px", letterSpacing: -0.15 }}>{p.title}</h3>
                  <p style={{ fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.55, margin: 0 }}>{p.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={100}>
          <img src={warumWirImg} alt="Photovoltaik-Anlage auf einem Hausdach mit Solarstromerzeugung" className="warum-img" loading="lazy" />
        </Reveal>
      </div>
    </section>
  );
}