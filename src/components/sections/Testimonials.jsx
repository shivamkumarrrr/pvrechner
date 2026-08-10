import theme from "../../theme.js";
import Reveal from "../Reveal.jsx";

// No real customer reviews exist yet. Fabricated names/quotes here would be
// a §5 UWG violation in Germany (fake reviews), not just bad practice — so
// this is an explicit, unmissable "not yet available" state, not a
// plausible-looking placeholder review. Replace with real testimonials as
// they come in; don't put invented names/quotes back in the meantime.
export default function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading">
      <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", padding: "48px 20px", textAlign: "center" }}>
        <Reveal>
          <h2 id="testimonials-heading" style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 8px" }}>
            Was Kunden sagen
          </h2>
          <div style={{
            border: `1.5px dashed ${theme.color.border}`,
            borderRadius: theme.radius.lg,
            padding: "28px 20px",
            color: theme.color.textSecondary,
            fontSize: 14,
          }}>
            Kundenstimmen folgen in Kürze — sobald erste Projekte abgeschlossen sind, veröffentlichen wir sie hier.
          </div>
        </Reveal>
      </div>
    </section>
  );
}
