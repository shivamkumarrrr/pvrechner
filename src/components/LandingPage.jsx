import { useState } from "react";
import theme from "../theme.js";
import Header from "./Header.jsx";
import Hero from "./Hero.jsx";
import Wizard from "./calculator/Wizard.jsx";
import WarumWir from "./sections/WarumWir.jsx";
import VorteileCards from "./sections/VorteileCards.jsx";
import MwstRechenbeispiel from "./sections/MwstRechenbeispiel.jsx";
import ProzessSchritte from "./sections/ProzessSchritte.jsx";
import PartnerLogos from "./sections/PartnerLogos.jsx";
import EinspeiseverguetungInfo from "./sections/EinspeiseverguetungInfo.jsx";
import Faq from "./sections/Faq.jsx";
import Footer from "./sections/Footer.jsx";
import { siteConfig } from "../config.js";

// Testimonials are intentionally NOT rendered: no real, approved customer
// quotes exist yet, and a plausible-looking placeholder is a §5 UWG risk
// (fake reviews). The component still exists (src/components/sections/) as
// a starting point — wire it back in once real, approved quotes exist.
// PartnerLogos IS rendered: the 8 partner brands are real and confirmed,
// and their official logos are stored in src/assets/partners/.
export default function LandingPage() {
  // Nach abgeschlossenem Wizard-Durchlauf: { result, speicherKwh, plz, kwp },
  // sonst null. Wird vom Wizard über onResult gemeldet und an die Sektionen
  // gereicht, die sich personalisieren (Einspeisevergütung, FAQ).
  const [wizardResult, setWizardResult] = useState(null);

  return (
    <div style={{ fontFamily: theme.font.family, background: theme.color.bg }}>
      <Header />
      {/* Sobald ein Ergebnis vorliegt, verschwinden Hero und die Marketing-
          Sektionen rund um den Rechner: der Nutzer ist im Moment der höchsten
          Kaufabsicht, ein zweiter Landingpage-Scroll darunter lenkt vom CTA
          ab statt ihn zu unterstützen. FAQ bleibt (beantwortet Einwände direkt
          nach dem Ergebnis), Footer bleibt (Impressum/Datenschutz). */}
      {!wizardResult && <Hero />}
      {/* scrollMarginTop kompensiert den position:sticky-Header (Header.jsx) beim
          Anker-Scroll ("Jetzt berechnen") — ohne das richtete scrollIntoView die
          Oberkante von #rechner exakt am Viewport-Rand aus, der Header lag dann
          genau darüber und schnitt den Wizard-Kopf ab. */}
      <div id="rechner" style={{ paddingTop: 28, scrollMarginTop: 80 }}>
        <Wizard onResult={setWizardResult} />
      </div>
      {!wizardResult && (
        <>
          <WarumWir />
          <VorteileCards />
          {siteConfig.sections.mwstBeispiel !== false && <MwstRechenbeispiel />}
          <ProzessSchritte />
          <PartnerLogos />
          <EinspeiseverguetungInfo wizardResult={wizardResult} />
        </>
      )}
      <Faq wizardResult={wizardResult} />
      <Footer />
    </div>
  );
}
