import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";

const SCHRITTE = [
  { n: "1", title: "Anfrage & Berechnung", text: "Sie nutzen unseren Rechner oder fordern direkt ein Angebot an — mit Ihrer Berechnung als Ausgangspunkt." },
  { n: "2", title: "Vor-Ort-Prüfung", text: "Ein Fachberater prüft Dach, Statik und Netzanschluss und erstellt ein verbindliches Angebot." },
  { n: "3", title: "Planung & Bestellung", text: "Module, Wechselrichter und ggf. Speicher werden auf Ihren Bedarf abgestimmt und die Montage terminiert." },
  { n: "4", title: "Montage & Inbetriebnahme", text: "Installation durch zertifizierte Fachbetriebe, Anmeldung beim Netzbetreiber, Übergabe an Sie." },
];

// Rendered as a connected timeline, not as isolated cards: it's a process
// with a real fixed order, so a line linking the numbered steps reinforces
// that sequence (the numbered-circle rule in PRODUCT_DESIGN.md allows this
// for exactly this case). Horizontal rail on desktop, vertical on mobile.
export default function ProzessSchritte() {
  return (
    <section style={{ background: theme.color.bg }} aria-labelledby="prozess-heading">
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: "56px 20px" }}>
        <Reveal>
          <h2 id="prozess-heading" style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 600, color: theme.color.textPrimary, textAlign: "center", margin: "0 0 8px" }}>
            Von der Anfrage bis zur Montage
          </h2>
          <p style={{ fontSize: 14, color: theme.color.textSecondary, textAlign: "center", margin: "0 auto 36px", maxWidth: 480 }}>
            Vier Schritte, ein fester Ansprechpartner.
          </p>
        </Reveal>
        <ol className="prozess-timeline">
          {SCHRITTE.map((s, i) => (
            <Reveal key={s.n} delay={i * 90} as="li" className="prozess-step">
              <div className="prozess-step__marker" aria-hidden="true">{s.n}</div>
              <div className="prozess-step__card">
                <h3 style={{ fontSize: 14.5, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 6px" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: theme.color.textSecondary, lineHeight: 1.6, margin: 0 }}>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <style>{`
          .prozess-timeline {
            list-style: none;
            margin: 0;
            padding: 0;
            position: relative;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            column-gap: 16px;
          }
          .prozess-timeline::before {
            content: "";
            position: absolute;
            top: 23px;
            left: 12.5%;
            right: 12.5%;
            height: 2px;
            background: ${theme.color.border};
          }
          .prozess-step {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .prozess-step__marker {
            width: 46px;
            height: 46px;
            border-radius: 50%;
            background: ${theme.color.accentSubtle};
            border: 2px solid ${theme.color.accent};
            color: ${theme.color.accentHover};
            font-family: ${theme.font.display};
            font-size: 16px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 1;
            flex-shrink: 0;
          }
          .prozess-step__card {
            width: 100%;
            background: ${theme.color.white};
            border: 1.5px solid ${theme.color.border};
            border-radius: ${theme.radius.lg}px;
            padding: 18px 16px;
            margin-top: 14px;
            text-align: center;
            box-sizing: border-box;
          }
          @media (max-width: 720px) {
            .prozess-timeline { display: block; }
            .prozess-timeline::before {
              top: 0;
              bottom: 0;
              left: 23px;
              right: auto;
              width: 2px;
              height: auto;
            }
            .prozess-step {
              flex-direction: row;
              align-items: flex-start;
              margin-bottom: 14px;
            }
            .prozess-step__card {
              margin-top: 0;
              margin-left: 14px;
              text-align: left;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
