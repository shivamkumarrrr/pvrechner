import { siteConfig } from "../config.js";

// Tenant-Logo (default: Photovoltaik.Marketing). Transparentes PNG, liest direkt auf der
// hellen Seitenfläche — kein dunkler Chip nötig (siehe PRODUCT_DESIGN.md).
// Logo-Asset und alt-Text kommen aus config.js, damit ein Kunde nur die
// Konfiguration tauschen muss.
export default function BrandLogo({ size = "md" }) {
  const height = size === "sm" ? 30 : 46;
  return (
    <img
      src={siteConfig.brand.logo}
      alt={siteConfig.brand.name}
      height={height}
      style={{ display: "block", height, width: "auto" }}
    />
  );
}
