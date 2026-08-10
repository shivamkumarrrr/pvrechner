# PRODUCT_DESIGN.md — Design Tokens (AS IMPLEMENTED)

Migrated into `src/theme.js` and applied across all components. Implementation notes (not deviations from intent):

- The real official logo asset is in place: `src/assets/ppc-logo.png` (transparent PNG, 640×360 derived from `PPC_Logo_01_full.png` 3118×1754). It reads directly on the light page background — **no dark chip / gradient backdrop anywhere**. `brandDarkStart`/`brandDarkEnd` and `theme.gradient.logo` were REMOVED from `theme.js`; the deprecated `brandDark` chip concept no longer exists in the codebase. Logo lives in the navbar (`Header.jsx` via `PpcLogo.jsx`) and the footer, both on the light `bg` background.
- The "Absolute design rules" line about a mustard accent was stale template copy from another project's spec — the authoritative value is the brand orange `#FF5200` read from the actual logo file (see Colors). Not `#D98E04`.
- `brandNavy` (`#382E4A`, exact "pp" wordmark color) was added as a real brand token — available for dark-on-light headline/text treatments, but currently not forced into any design.
- No `backdrop-filter`/glassmorphism anywhere (navbar is solid `bg`, hero stat bar is a solid translucent `#141B22` panel without blur).
- Hero uses a photo crossfade (5 Pexels photos in `src/assets/hero/`, all pre-cropped to 3:2, European/German-market motifs — installers, Budapest array underside, tiled roofs, alpine family, solar house in Freiburg) shown in a centered 3:2 panel (max-width 1180px, `width:100%`, `min-height:min(560px,82vh)`) so photos fill the frame without heavy cropping on wide screens. Text lives in one left-aligned column backed by a continuous left→right scrim (`rgba(20,27,34,…)`) — every element readable on any photo, the right half of the image stays bright.
- Scroll reveals: `opacity 0→1` + `translateY 24px→0`, 500ms ease, fires once. `useInView` reveals taller-than-viewport sections at `threshold: 0` so long sections never stay hidden.
- Token *names* in `theme.js` don't match this doc 1:1 in every case — `success`/`danger` each collapsed old shade-tiers into one flat color plus one derived `*Subtle` tint (`successSubtle`, `dangerSubtle`, `skySubtle`), and there's one extra derived tier, `textMuted`, one step lighter than `textSecondary`, for fine-print/placeholder-level text. Same hue families, slightly finer steps for legibility.
- `sky` (`#2E6F95`) is used for the monthly-yield chart bars and solar-panel glyphs in the roof-shape icons — the doc's own example use case (data/solar visual elements), not a decorative accent.

## Brand Assets

```js
// PPC GmbH logo — official vector-quality PNG asset in hand
// (file: src/assets/ppc-logo.png, transparent background, 640×360,
//  derived from PPC_Logo_01_full.png at 3118×1754).
// Colors below sampled directly from the actual file — exact, not estimated.
const PPC_LOGO_NAVY   = "#382E4A";  // the "pp" wordmark
const PPC_LOGO_ORANGE = "#FF5200";  // the "C" — this IS the brand accent
```

### Logo placement rule (simplified — real asset changes this)

The real logo file has a transparent background and its own solid navy/orange coloring, so it reads perfectly directly on the light page background (`bg: #F6F8F7` / `surface: #FFFFFF`) — **no dark chip needed anywhere**. The logo sits directly in the navbar and footer on the normal light background. The `brandDark`/gradient chip concept is DEPRECATED and has been removed from the codebase.

## Colors

```js
const COLORS = {
  bg:            "#F6F8F7",  // cool, slightly green-grey off-white — NOT cream/#F4F1EA
  surface:       "#FFFFFF",
  textPrimary:   "#141B22",  // near-black navy, not pure #000 or slate-900
  textSecondary: "#5A6570",
  accent:        "#FF5200",  // PPC brand orange — exact value from the real logo file
  accentHover:   "#D64700",  // darkened for hover/pressed states
  accentSubtle:  "#FFE9DD",
  brandNavy:     "#382E4A",  // exact "pp" wordmark color — usable as a text/heading
                              // accent now that it's a real brand color, not just a
                              // logo backdrop (e.g. could replace textPrimary in a
                              // dark-on-light headline treatment if desired)
  sky:           "#2E6F95",  // secondary accent — muted sky-blue, used sparingly
                              // (data highlights, secondary buttons only —
                              // never mixed with `accent` in the same gradient)
  success:       "#1E8A5F",
  danger:        "#C4432B",
  border:        "#E1E5E4",  // deliberately NOT #e2e8f0 (Tailwind slate-200 exactly)
};
```

### Why these values, not the obvious ones

- `accent` is the REAL PPC brand orange (`#FF5200`), read directly off the official logo file — not estimated, not invented. It happens to also not collide with Tailwind's amber-500/orange-600, so both goals (on-brand AND not-generic) are satisfied at once.
- `bg`/`textPrimary`/`border` stay neutral — the brand mark provides the accent color; the rest of the page doesn't need to become purple to feel on-brand. Turning the whole page into the logo's colors would itself become the "dark-bg + neon accent" AI tell — the fix is using brand colors deliberately (accent for CTAs, navy optionally for headline treatments), not as the site's base palette.
- Not cream (`#F4F1EA`) + terracotta — that combo (paired with serif type) is a recognizable "AI tell" elsewhere. Avoid it here too, for the same reason.
- `sky` exists as a genuine second color tied to the subject matter (solar = sun + sky), not just decoration — use it for things that are actually about data/sky (e.g. the monthly yield chart), not as a second CTA color.

## Absolute design rules

- Accent (`#FF5200`) is for primary CTAs and the ONE most important highlight per screen (e.g. the headline savings number). Not repeated as a gradient across every card, button, and progress bar.
- NO gradients used decoratively. If a gradient is used at all, it's a single subtle wash behind the hero, never on buttons/badges/cards.
- NO emoji as icons, anywhere. Hand-drawn inline SVG only, consistent with the existing Dachform-icon style already in the codebase.
- NO glassmorphism / backdrop-blur.
- NO border-radius over 12px, except pill shapes (badges, primary buttons) and true circles (autarky ring, etc.).
- NO numbered-circle step markers as decoration (01/02/03 in big colored circles) UNLESS the numbers represent a real fixed sequence the user must follow in order (the 4-step wizard qualifies; a "why choose us" list of 3 unordered benefits does NOT — use non-numbered cards there).
- NO repeated icon+text "pill" trust badges scattered across multiple sections — one consolidated trust section only.
- Cards use a **1px border**, not a drop shadow, for definition. Shadows are reserved for genuinely floating/overlay elements (open modal, map popup).

## Typography

```css
/* Body */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Display (headlines, the big savings number) — pick ONE, load as needed */
font-family: 'Space Grotesk', -apple-system, sans-serif;
```

Rationale: a geometric sans for display type gives the "big number" a technical/data-forward character fitting a calculator, without reaching for the serif-plus-warm-palette combination already flagged as a tell elsewhere. Body stays on the plain system stack — no webfont load needed for 90% of the page, keeps performance good.

Target scale (adapt during implementation, doesn't need to be exact):

| Role | Size | Weight |
|---|---|---|
| Hero H1 | 42–46px (32px mobile) | 700 |
| Section heading | 28–30px (22–24px mobile) | 600 |
| Result number (kWp/€) | 40–48px, display font | 700 |
| Body | 16–17px | 400 |
| Card title | 16–17px | 600 |
| Fine print | 12.5–13px | 400 |

## Motion

- Scroll reveals: IntersectionObserver, opacity 0→1 + translateY 24px→0, ~500ms ease, fires once.
- Wizard step transitions: translateX slide (forward/back), not a fade — reinforces the sense of moving through a sequence.
- Hover: translateY(-1px) + border/background color change on cards — never combined with a shadow change.
- Respect `prefers-reduced-motion`: short-circuit to instant/no transition, don't just shorten durations.

## What NOT to replicate

- Amber-gradient-everywhere (CTA, progress bar, result card, autarky ring all sharing an identical gradient)
- Emoji icon set (☀️🔋⚡✅📍🛰️🇪🇺🔒🏠✉️📅⏳📊🗺️) — already replaced with hand-drawn SVGs, keep it that way
- Repeated trust-badge pills at 5+ separate points on the page
- Generic house+sun hero illustration — replaced with real Pexels photo crossfade
- Glassmorphism / backdrop-blur on the sticky navbar or any panel
- The dark logo backdrop chip (`#3D324C→#7D4E57`) — removed, the asset is transparent
