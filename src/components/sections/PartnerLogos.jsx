import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";
import TiltCard from "../TiltCard.jsx";
import bydLogo from "../../assets/partners/byd.svg";
import e3dcLogo from "../../assets/partners/e3dc.svg";
import smaLogo from "../../assets/partners/sma.svg";
import sungrowLogo from "../../assets/partners/sungrow.svg";
import sonnenLogo from "../../assets/partners/sonnen.svg";
import canadianSolarLogo from "../../assets/partners/canadian-solar.png";
import trinaSolarLogo from "../../assets/partners/trina-solar.svg";
import wallboxLogo from "../../assets/partners/wallbox.svg";

// Reale, bestätigte Partner-Marken (offizielle Logos aus Press-/Brand-Assets
// der Hersteller, unverändert in Original-Farben). Nicht ohne Freigabe neue
// Marken ergänzen — erfundene/imaginäre Logos sind ein §5-UWG-Risiko.
const PARTNER = [
  { name: "BYD", src: bydLogo },
  { name: "E3/DC", src: e3dcLogo },
  { name: "SMA", src: smaLogo },
  { name: "Sungrow", src: sungrowLogo },
  { name: "sonnen", src: sonnenLogo },
  { name: "Canadian Solar", src: canadianSolarLogo },
  { name: "Trina Solar", src: trinaSolarLogo },
  { name: "Wallbox", src: wallboxLogo },
];

const tileStyle = {
  background: theme.color.white,
  border: `1.5px solid ${theme.color.border}`,
  borderRadius: theme.radius.lg,
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 8px",
  boxSizing: "border-box",
};

export default function PartnerLogos() {
  return (
    <section aria-labelledby="partner-heading" style={{ background: theme.color.bg }}>
      <style>{`
        .partner-grid{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; align-items: stretch; }
        @media (min-width: 720px){ .partner-grid{ grid-template-columns: repeat(4, 1fr); } }
      `}</style>
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: "40px 20px" }}>
        <Reveal>
          <h2 id="partner-heading" style={{ fontFamily: theme.font.display, fontSize: 22, fontWeight: 600, color: theme.color.textPrimary, textAlign: "center", margin: "0 0 6px" }}>
            Wir bieten beste Qualitätsmodule
          </h2>
          <p style={{ fontSize: 13, color: theme.color.textSecondary, textAlign: "center", margin: "0 auto 28px", maxWidth: 520 }}>
            Module, Wechselrichter, Speicher und Ladeinfrastruktur kommen von diesen Herstellern.
          </p>
        </Reveal>
        <div className="partner-grid">
          {PARTNER.map((p, i) => (
            <Reveal key={p.name} delay={i * 60}>
              <TiltCard style={tileStyle}>
                <div
                  role="img"
                  aria-label={`Logo: ${p.name}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <img
                    src={p.src}
                    alt={p.name}
                    loading="lazy"
                    style={{
                      maxWidth: 150,
                      maxHeight: 32,
                      width: "auto",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
