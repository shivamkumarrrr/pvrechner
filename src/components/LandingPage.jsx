import theme from "../theme.js";
import Header from "./Header.jsx";
import Hero from "./Hero.jsx";
import Wizard from "./calculator/Wizard.jsx";
import WarumWir from "./sections/WarumWir.jsx";
import VorteileCards from "./sections/VorteileCards.jsx";
import MwstRechenbeispiel from "./sections/MwstRechenbeispiel.jsx";
import ProzessSchritte from "./sections/ProzessSchritte.jsx";
import EinspeiseverguetungInfo from "./sections/EinspeiseverguetungInfo.jsx";
import Faq from "./sections/Faq.jsx";
import Footer from "./sections/Footer.jsx";
import { siteConfig } from "../config.js";

// Testimonials and PartnerLogos are intentionally NOT rendered: neither
// real customer quotes nor real partner/module logos exist yet, and a
// placeholder that looks like real content is a §5 UWG risk (fake
// reviews). The components still exist (src/components/sections/) as a
// ready starting point — wire them back in once real, approved content
// exists. Don't replace this comment with new invented content instead.
export default function LandingPage() {
  return (
    <div style={{ fontFamily: theme.font.family, background: theme.color.bg }}>
      <Header />
      <Hero />
      <div id="rechner" style={{ paddingTop: 28 }}>
        <Wizard />
      </div>
      <WarumWir />
      <VorteileCards />
      {siteConfig.sections.mwstBeispiel !== false && <MwstRechenbeispiel />}
      <ProzessSchritte />
      <EinspeiseverguetungInfo />
      <Faq />
      <Footer />
    </div>
  );
}
