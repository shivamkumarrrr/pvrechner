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
    textMuted: "#6B737D", // darkened from #8A9099 for WCAG AA (4.8:1 on white)

    accent: "#F79E1C", // real Photovoltaik.Marketing brand orange — exact value from the official logo file
    accentHover: "#D6840F",
    accentSubtle: "#FEF1DD",
    // Text-safe accent: brand orange itself is only ~2:1 on white, so orange
    // TEXT uses this darker shade (4.8:1 on white, 4.9:1 on accentSubtle).
    accentText: "#9A5B08",
    // Text/icon color ON an accent-filled surface (buttons). White on
    // #F79E1C is ~2:1; dark text is ~8:1.
    onAccent: "#141B22",

    // Photovoltaik.Marketing wordmark navy — a real brand color (not a logo backdrop).
    // Usable for dark-on-light headline/text treatments if desired.
    brandNavy: "#2C358F",
    // Deep brand navy for the ONE dark band on the landing page (Prozess).
    // Darker than the wordmark navy so white text sits at ~14:1.
    navyDeep: "#1B2160",
    onNavy: "#FFFFFF",
    onNavyMuted: "#C9CDE6", // secondary text on navyDeep (~9:1)
    // Pale morning-sky wash behind the calculator — atmosphere only, fades
    // into bg. Derived from sky, not a new hue.
    skyWash: "#E6EEF5",

    // Secondary accent, sparingly, for things genuinely about data/sky
    // (e.g. the monthly yield chart) — never mixed with `accent`. #1C7FA6 (a
    // first attempt at richer than the original muted #2E6F95) came back as
    // too bright/saturated — this sits at a moderate midpoint between the two.
    sky: "#1F6E8C",
    skySubtle: "#E7EFF3", // derived light tint

    success: "#18774F", // darkened from #1E8A5F for AA on successSubtle
    successSubtle: "#E3F3EC", // derived light tint
    danger: "#C4432B",
    dangerSubtle: "#FBEAE5", // derived light tint

    // Chart series for the monthly energy balance — validated with the dataviz
    // palette checker (lightness band, chroma, CVD ΔE ≥ 13, 3:1 vs white).
    // Chart-only: not for text or UI chrome.
    chartEigen: "#D97A06",   // Eigenverbrauch (brand-orange family)
    chartEinspeisung: "#3070C4", // Einspeisung
    chartNetz: "#A0526E",    // Netzbezug

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
