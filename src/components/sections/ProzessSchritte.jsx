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
    <section
      aria-labelledby="prozess-heading"
      style={{
        // Das EINE dunkle Band der Seite, in der echten Marken-Navy des Logos.
        // Ein weicher Sonnen-Schein oben rechts (Markenorange, sehr niedrige
        // Deckkraft) ist das Signature-Element — keine weiteren Dekorationen.
        background: `radial-gradient(640px 360px at 88% -10%, rgba(247,158,28,0.22), rgba(247,158,28,0) 70%), ${theme.color.navyDeep}`,
      }}
    >
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: "72px 20px" }}>
        <Reveal>
          <h2 id="prozess-heading" style={{ fontFamily: theme.font.display, fontSize: "clamp(26px, 3.2vw, 34px)", fontWeight: 700, letterSpacing: -0.4, color: theme.color.onNavy, textAlign: "center", margin: "0 0 10px" }}>
            Von der Anfrage bis zur Montage
          </h2>
          <p style={{ fontSize: 16, color: theme.color.onNavyMuted, textAlign: "center", margin: "0 auto 44px", maxWidth: 480 }}>
            Vier Schritte, ein fester Ansprechpartner.
          </p>
        </Reveal>
        <ol className="prozess-timeline">
          {SCHRITTE.map((s, i) => (
            <Reveal key={s.n} delay={i * 90} as="li" className="prozess-step">
              <div className="prozess-step__marker" aria-hidden="true">{s.n}</div>
              <div className="prozess-step__card">
                <h3 style={{ fontFamily: theme.font.display, fontSize: 17, fontWeight: 600, color: theme.color.onNavy, margin: "0 0 6px" }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: theme.color.onNavyMuted, lineHeight: 1.6, margin: 0 }}>{s.text}</p>
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
            top: 26px;
            left: 12.5%;
            right: 12.5%;
            height: 2px;
            background: rgba(255,255,255,0.18);
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
            background: ${theme.color.accent};
            border: 4px solid ${theme.color.navyDeep};
            box-sizing: content-box;
            color: ${theme.color.onAccent};
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
            padding: 0 6px;
            margin-top: 16px;
            text-align: center;
            box-sizing: border-box;
          }
          @media (max-width: 720px) {
            .prozess-timeline { display: block; }
            .prozess-timeline::before {
              top: 0;
              bottom: 0;
              left: 26px;
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
              margin-top: 2px;
              margin-left: 16px;
              padding: 0;
              text-align: left;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
