import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import { IconChart, IconContact, IconDocumentCheck, IconWrench } from "../Icons.jsx";
import { siteConfig } from "../../config.js";
import warumWirImg from "../../assets/warum-wir.jpg";

const BRAND = siteConfig.brand.name;

const PUNKTE = [
  {
    Icon: IconChart,
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
        .warum-head{ display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 36px; }
        @media (min-width: 900px){ .warum-head{ grid-template-columns: 6fr 5fr; gap: 56px; align-items: end; margin-bottom: 44px; } }
        .warum-grid{ display: grid; grid-template-columns: 1fr; gap: 32px; align-items: center; }
        @media (min-width: 900px){ .warum-grid{ grid-template-columns: 6fr 5fr; gap: 56px; } }
        /* Foto in seinem Originalformat (3:2) — nicht beschnitten, alle
           Personen vollständig im Bild. */
        .warum-img{ width: 100%; height: auto; aspect-ratio: 3 / 2; object-fit: contain; border-radius: ${theme.radius.lg}px; display: block; background: ${theme.color.border}; }
        .warum-list{ list-style: none; margin: 0; padding: 0; display: grid; gap: 26px; }
        .warum-reason{ display: flex; gap: 18px; align-items: flex-start; }
        .warum-icon{ width: 52px; height: 52px; flex-shrink: 0; border-radius: ${theme.radius.lg}px; background: ${theme.color.accent}; color: ${theme.color.onAccent}; display: flex; align-items: center; justify-content: center; }
        .warum-icon svg{ stroke-width: 2.4; }
      `}</style>
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: "72px 20px" }}>
        <Reveal className="warum-head">
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: theme.color.accentText, marginBottom: 10 }}>
              Was uns unterscheidet
            </div>
            <h2 id="warum-wir-heading" style={{ fontFamily: theme.font.display, fontSize: "clamp(28px, 3.6vw, 40px)", fontWeight: 700, color: theme.color.textPrimary, margin: 0, letterSpacing: -0.6, lineHeight: 1.1 }}>
              Warum {BRAND}?
            </h2>
          </div>
          <p style={{ fontSize: 17, color: theme.color.textSecondary, lineHeight: 1.6, margin: 0 }}>
            Von der ersten Zahl bis Jahre nach der Montage: Das erwartet Sie, wenn Sie Ihre Anlage mit uns planen.
          </p>
        </Reveal>

        <div className="warum-grid">
          <Reveal>
            <img src={warumWirImg} alt="Das Montage-Team vor einem Haus mit Photovoltaik-Anlage" className="warum-img" loading="lazy" width="1536" height="1024" />
          </Reveal>

          <ul className="warum-list">
            {PUNKTE.map((p, i) => (
              <Reveal key={p.title} delay={i * 70} as="li" className="warum-reason">
                <div className="warum-icon" aria-hidden="true">
                  <p.Icon size={26} />
                </div>
                <div>
                  <h3 style={{ fontFamily: theme.font.display, fontSize: 18, fontWeight: 600, color: theme.color.textPrimary, margin: "2px 0 6px", letterSpacing: -0.2 }}>{p.title}</h3>
                  <p style={{ fontSize: 15, color: theme.color.textSecondary, lineHeight: 1.6, margin: 0 }}>{p.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
