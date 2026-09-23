import theme from "../../theme.js";
import BrandLogo from "../BrandLogo.jsx";
import { siteConfig } from "../../config.js";

const COMPANY_NAME = siteConfig.brand.name;

export default function Footer() {
  const year = new Date().getFullYear();
  const link = { color: theme.color.textSecondary, fontSize: 14, textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center" };
  return (
    <footer style={{ background: theme.color.white, borderTop: `1px solid ${theme.color.border}` }}>
      <style>{`
        .ft-top { display: grid; grid-template-columns: 1fr; gap: 20px; padding: 44px 0 28px; }
        @media (min-width: 760px) { .ft-top { grid-template-columns: 1fr auto; align-items: center; } }
        .ft-nav { display: flex; gap: 8px 24px; flex-wrap: wrap; }
        .ft-nav a:hover { color: ${theme.color.textPrimary}; }
        .ft-bottom { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 24px; padding: 18px 0 28px; border-top: 1px solid ${theme.color.border}; font-size: 13px; color: ${theme.color.textMuted}; }
      `}</style>
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: "0 20px" }}>
        <div className="ft-top">
          <div>
            <BrandLogo />
          </div>
          <nav aria-label="Rechtliches" className="ft-nav">
            <a href="#rechner" style={link} onClick={(e) => { e.preventDefault(); document.getElementById("rechner")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Zum Rechner</a>
            <a href="/impressum.html" style={link}>Impressum</a>
            <a href="/datenschutz.html" style={link}>Datenschutz</a>
          </nav>
        </div>
        <div className="ft-bottom">
          <span>
            © {year} {COMPANY_NAME} · by{" "}
            <a href="https://palz.consulting/" target="_blank" rel="noopener noreferrer" style={{ color: theme.color.textSecondary, textDecoration: "underline", textUnderlineOffset: 3 }}>PPC GmbH</a>
          </span>
          <span>Alle Berechnungen sind unverbindliche Richtwerte.</span>
        </div>
      </div>
    </footer>
  );
}
