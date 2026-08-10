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
      <Hero />
      <div id="rechner" style={{ paddingTop: 28 }}>
        <Wizard onResult={setWizardResult} />
      </div>
      <WarumWir />
      <VorteileCards />
      {siteConfig.sections.mwstBeispiel !== false && <MwstRechenbeispiel />}
      <ProzessSchritte />
      <PartnerLogos />
      <EinspeiseverguetungInfo wizardResult={wizardResult} />
      <Faq wizardResult={wizardResult} />
      <Footer />
    </div>
  );
}
