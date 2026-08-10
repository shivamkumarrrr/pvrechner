import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";

// Placeholder partner/module brands — replace with real logos before launch.
const PARTNER = ["Modulmarke A", "Wechselrichter B", "Speicher C", "Montagesystem D", "Zertifizierung E"];

export default function PartnerLogos() {
  return (
    <section aria-labelledby="partner-heading">
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: "40px 20px" }}>
        <Reveal>
          <h2 id="partner-heading" style={{ fontSize: 13, fontWeight: 600, color: theme.color.textMuted, textAlign: "center", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 24px" }}>
            Qualitätskomponenten unserer Partner
          </h2>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 14,
          }}>
            {PARTNER.map((p) => (
              <div
                key={p}
                role="img"
                aria-label={`Partner-Logo: ${p}`}
                style={{
                  padding: "14px 22px",
                  borderRadius: 10,
                  border: `1.5px dashed ${theme.color.border}`,
                  color: theme.color.textMuted,
                  fontSize: 13,
                  fontWeight: 600,
                  background: theme.color.bg,
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
