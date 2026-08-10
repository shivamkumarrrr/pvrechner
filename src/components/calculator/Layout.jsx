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
        @media (min-width: 960px) {
          .calc-layout { grid-template-columns: minmax(0, 1fr) 320px; }
          .calc-layout__sidebar { position: sticky; top: 84px; }
        }
      `}</style>
      <div>{main}</div>
      <div className="calc-layout__sidebar">{sidebar}</div>
    </div>
  );
}
