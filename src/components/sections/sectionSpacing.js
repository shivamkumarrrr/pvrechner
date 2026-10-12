// Einheitlicher vertikaler Abstand aller Landingpage-Sektionen: 72px ab
// Tablet-Breite, mobil schrumpft er bis 48px. Eine Quelle, damit der Rhythmus
// nicht wieder pro Sektion auseinanderläuft. Schmale Streifen (Partner-Logos)
// nutzen bewusst den kleineren STRIP-Wert.
export const SECTION_PAD = "clamp(48px, 8vw, 72px)";
export const STRIP_PAD = "clamp(32px, 6vw, 48px)";
