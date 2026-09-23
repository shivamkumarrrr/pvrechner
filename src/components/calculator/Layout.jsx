import theme from "../../theme.js";

// Zwei-Spalten-Layout für den Rechner: links der Wizard, rechts das Live-Panel.
// Unterhalb von 960px stapelt sich das Panel unter den Wizard.
export default function Layout({ main, sidebar }) {
  return (
    <div className="calc-layout">
      <style>{`
        .calc-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 16px;
          align-items: start;
          max-width: ${theme.maxWidthWide}px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .calc-layout__main { display: flex; flex-direction: column; }
        /* Mobil: weniger Kopf über jeder Frage — Kartentitel und die zweite
           (Unter-)Fortschrittsleiste entfallen; Hauptfortschritt + "Schritt
           X von 4" + Überschrift bleiben. */
        @media (max-width: 719px) {
          .calc-card__title, .subflow-progress { display: none !important; }
        }
        .calc-card { display: flex; flex-direction: column; }
        @media (min-width: 960px) {
          .calc-layout { grid-template-columns: minmax(0, 1fr) 400px; align-items: stretch; }
          /* Wizard-Karte streckt sich auf die Höhe der rechten Spalte:
             beide Spalten schließen unten bündig ab, egal wie kurz ein
             Schritt ist. */
          .calc-layout__main > .calc-card { flex: 1; }
          .calc-layout__sidebar { position: sticky; top: 84px; align-self: start; }
        }
      `}</style>
      <div className="calc-layout__main">{main}</div>
      <div className="calc-layout__sidebar">{sidebar}</div>
    </div>
  );
}
