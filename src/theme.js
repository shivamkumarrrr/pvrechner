// Design tokens — matches PRODUCT_DESIGN.md exactly. See that file for the
// rationale behind each value; don't change a value here without updating
// the doc (and vice versa).
// Tenant-Overrides (Kunden-Markenfarben/-fonts) kommen aus config.js und
// werden über die Basis-Palette gemerged — theme.js selbst bleibt unverändert,
// wenn ein Kunde eine andere Markenfarbe braucht.
import { siteConfig } from "./config.js";

const theme = {
  color: {
    bg: "#F6F8F7", // cool off-white page background — NOT cream
    surface: "#FFFFFF",
    textPrimary: "#141B22",
    textSecondary: "#5A6570",
    // Derived (not in the spec doc verbatim): one lightness step below
    // textSecondary, for fine print / placeholder-level text only.
    textMuted: "#8A9099",

    accent: "#F79E1C", // real Photovoltaik.Marketing brand orange — exact value from the official logo file
    accentHover: "#D6840F",
    accentSubtle: "#FEF1DD",

    // Photovoltaik.Marketing wordmark navy — a real brand color (not a logo backdrop).
    // Usable for dark-on-light headline/text treatments if desired.
    brandNavy: "#2C358F",

    // Secondary accent, sparingly, for things genuinely about data/sky
    // (e.g. the monthly yield chart) — never mixed with `accent`.
    sky: "#2E6F95",
    skySubtle: "#E7EFF3", // derived light tint

    success: "#1E8A5F",
    successSubtle: "#E3F3EC", // derived light tint
    danger: "#C4432B",
    dangerSubtle: "#FBEAE5", // derived light tint

    border: "#E1E5E4", // deliberately not Tailwind's #e2e8f0

    white: "#FFFFFF",
  },

  radius: { sm: 6, md: 10, lg: 12, pill: 999 },

  shadow: {
    // Reserved for genuinely floating/overlay controls (e.g. the satellite
    // toggle button floating on top of the map) — never for ordinary cards
    // or CTA buttons. Those use a 1px border instead.
    floating: "0 2px 8px rgba(20,27,34,0.18)",
  },

  font: {
    family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "'Space Grotesk', -apple-system, sans-serif",
  },

  maxWidth: 680,
  maxWidthWide: 1080,
};

// Tenant-Overrides anwenden (nur gesetzte Token überschreiben).
if (siteConfig.theme) {
  if (siteConfig.theme.color) theme.color = { ...theme.color, ...siteConfig.theme.color };
  if (siteConfig.theme.font) theme.font = { ...theme.font, ...siteConfig.theme.font };
}

export default theme;
