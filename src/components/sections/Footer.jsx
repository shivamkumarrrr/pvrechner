import theme from "../../theme.js";
import BrandLogo from "../BrandLogo.jsx";
import { siteConfig } from "../../config.js";

const COMPANY_NAME = siteConfig.brand.name;

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: theme.color.bg, borderTop: `1px solid ${theme.color.border}` }}>
      <div style={{ maxWidth: theme.maxWidthWide, margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <BrandLogo size="sm" />
        </div>
        <nav aria-label="Rechtliches" style={{ display: "flex", gap: 18, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
          <a href="/impressum" style={{ color: theme.color.textSecondary, fontSize: 12.5, textDecoration: "none" }}>Impressum</a>
          <a href="/datenschutz" style={{ color: theme.color.textSecondary, fontSize: 12.5, textDecoration: "none" }}>Datenschutz</a>
        </nav>
        <div style={{ fontSize: 13, color: theme.color.textSecondary, marginBottom: 16 }}>
          Ein Produkt der{" "}
          <a href="https://palz.consulting/" target="_blank" rel="noopener noreferrer" style={{ color: theme.color.textSecondary, textDecoration: "underline" }}>PPC GmbH</a>
        </div>
        <div style={{ fontSize: 11.5, color: theme.color.textMuted }}>
          © {year} {COMPANY_NAME}. Alle Berechnungen sind unverbindliche Richtwerte.
        </div>
      </div>
    </footer>
  );
}
