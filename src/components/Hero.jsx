import { useEffect, useState } from "react";
import theme from "../theme.js";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion.js";
import heroInstallationTeam from "../assets/hero/hero-installation-team.jpg";
import heroPanelsSky from "../assets/hero/hero-panels-sky.jpg";
import heroRoofFull from "../assets/hero/hero-roof-full.jpg";
import heroFreiburgHouse from "../assets/hero/hero-freiburg-house.jpg";

// Real Pexels photos (free license, commercial use, no attribution needed)
// behind the hero headline instead of the former house+sun illustration.
// All are pre-cropped to 3:2 and fill the bounded hero area via object-fit:
// cover. They rotate every 7s; fully static under prefers-reduced-motion.
// IMPORTANT (ghost-bug fix): exactly ONE <img> exists in the DOM at any time
// — the active photo swaps in with a short fade-in over the scrim. The former
// implementation stacked all four images with opacity 0/1 + CSS transition,
// which could leave two semi-transparent copies frozen on top of each other
// (visible double-exposure of the panel grid). A single element makes that
// impossible by construction.
// Composition (Option A): the text zone is a clearly bounded column on the
// LEFT half, backed by a continuous left→right scrim (rgba textPrimary → fully
// transparent) so every text element stays readable on any photo — no floating
// boxes over arbitrary image areas. The calm panel-underside photo is shown
// first. Note: a former "Referenzwerte" stat bar (950 kWh/kWp / 9–12 Jahre /
// 25+ Jahre, "Ø Deutschland") was removed — those figures had no real source
// behind them here and read as unverifiable marketing slop.
const HERO_IMAGES = [heroPanelsSky, heroRoofFull, heroInstallationTeam, heroFreiburgHouse];

// Preload the first hero photo immediately on page load so the initial view
// never sits on an empty background while a ~700KB image downloads.
if (typeof window !== "undefined") {
  const first = new Image();
  first.src = HERO_IMAGES[0];
}

function HeroBackground({ reducedMotion }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % HERO_IMAGES.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <img
        key={HERO_IMAGES[active]}
        src={HERO_IMAGES[active]}
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 1,
          // Länger + sanftere Kurve als vorher (0.4s ease) für einen ruhigeren
          // Übergang. Bleibt bewusst ein reiner Fade-in auf einem einzelnen
          // <img> (kein Crossfade zweier Bilder) — genau das GENAU-EIN-<img>-
          // Prinzip verhindert den früheren Ghost-Bug (siehe CLAUDE.md), ein
          // echter Crossfade würde das Risiko wieder einführen.
          animation: reducedMotion ? "none" : "hero-fade-in 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      {!reducedMotion && (
        <style>{`@keyframes hero-fade-in { from { opacity: 0; transform: scale(1.03); } to { opacity: 1; transform: scale(1); } }`}</style>
      )}
    </div>
  );
}

export default function Hero() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div style={{ padding: "18px 16px 0" }}>
      <style>{`
        .hero-photo {
          position: relative;
          display: flex;
          overflow: hidden;
          border-radius: ${theme.radius.lg}px;
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          min-height: min(560px, 88vh);
          color: ${theme.color.white};
          text-align: center;
        }
        @media (max-width: 959px) {
          .hero-photo { min-height: min(440px, 60vh); }
        }
      `}</style>
      <div className="hero-photo">
        <HeroBackground reducedMotion={reducedMotion} />
        {/* Readability scrim: continuous left→right darkening behind the text
            zone (Option A). Unlike a uniform wash, it leaves the right side of
            the photo bright and keeps EVERY text element on a readable base
            regardless of the image content behind it. */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, rgba(20,27,34,0.85) 0%, rgba(20,27,34,0.62) 42%, rgba(20,27,34,0.2) 72%, rgba(20,27,34,0) 100%)",
        }} />
        <div style={{
          position: "relative",
          flex: 1,
          maxWidth: 1180,
          margin: "0 auto",
          padding: "clamp(28px, 5vw, 64px) clamp(24px, 5vw, 64px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          boxSizing: "border-box",
          textAlign: "left",
        }}>
        <h1 style={{ fontFamily: theme.font.display, fontSize: "clamp(30px, 4.2vw, 46px)", fontWeight: 700, margin: "0 0 12px", lineHeight: 1.12, letterSpacing: -0.5, color: theme.color.white }}>
          Lohnt sich Photovoltaik<br />für Ihr Dach?
        </h1>
        <p style={{ fontSize: "clamp(13.5px, 1.3vw, 15px)", color: "rgba(255,255,255,0.9)", margin: "0 0 26px", lineHeight: 1.6, maxWidth: 460 }}>
          Berechnen Sie in 60 Sekunden Ertrag, Ersparnis und Amortisation — auf Basis realer Satellitendaten für Ihren Standort, nicht bundesweiter Durchschnittswerte.
        </p>
        {/* Sourced reference values — each number maps to a documented source
            (Quelle + Stand in CLAUDE.md data rules). Replaces a former bar of
            unsourced figures (950 kWh/kWp / 9–12 Jahre / 25+ Jahre). */}
        <div style={{ display: "flex", flexWrap: "wrap", columnGap: 26, rowGap: 14 }}>
          {[
            { num: "0,37 €", text: "Strompreis je kWh", sub: "BDEW 2026" },
            { num: "8–13", text: "Jahre bis Amortisation", sub: "ADAC" },
            { num: "0,344 kg", text: "CO₂ je kWh", sub: "UBA 2025" },
          ].map((s, i) => (
            <div key={s.sub} style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.25)" : "none",
              paddingRight: i < 2 ? 26 : 0,
            }}>
              <span style={{ fontFamily: theme.font.display, fontSize: 22, fontWeight: 600, color: theme.color.accent, lineHeight: 1 }}>{s.num}</span>
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.92)", lineHeight: 1.35 }}>
                {s.text}<br />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{s.sub}</span>
              </span>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
