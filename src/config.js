// ─────────────────────────────────────────────────────────────────────────────
// src/config.js — Einzige Tenant-Konfiguration.
//
// Jeder Kunde = EINE Konfiguration, keine Code-Änderungen in Komponenten.
// Für ein White-Label: Logo-Import tauschen, Markennamen/Farben/Kontakt/
// Lead-Endpunkt hier setzen. Die Rechner-Logik (calculate.js, PVGIS, PLZ)
// bleibt davon unberührt und weiterhin eigenständig einbettbar.
//
// ACHTUNG Datenschutz: Formular-Leads gehen über den hier konfigurierten
// Endpunkt. Bei Web3Forms/Formspree gelten deren Verarbeitungsbedingungen —
// für Kundensysteme bevorzugt "webhook" in deren eigenes CRM/Backend nutzen.
// ─────────────────────────────────────────────────────────────────────────────
import photovoltaikMarketingLogo from "./assets/photovoltaik-marketing-logo.png";
import { configureEconomics } from "./lib/calculate.js";

export const siteConfig = {
  // Metadaten für <title>, Meta-Description und theme-color (siehe App.jsx).
  // OG-Tags bleiben pro Build statisch (index.html) — pro Tenant-Build anpassen.
  meta: {
    title: "Photovoltaik-Rechner | Lohnt sich Solar für Ihr Dach?",
    description:
      "Berechnen Sie in 60 Sekunden Anlagengröße, Jahresertrag, Ersparnis und Amortisation Ihrer Solaranlage — auf Basis realer PVGIS-Satellitendaten für Ihren Standort, bundesweit.",
    themeColor: "#141B22",
    canonicalUrl: "https://solarrechner.example/",
  },

  // Marke/Absender der Seite. `logo` = transparentes PNG, das direkt auf der
  // hellen Seitenfläche liest (kein dunkler Chip, kein Logo-Verlauf — siehe
  // PRODUCT_DESIGN.md). Für einen Kunden: Import oben tauschen.
  // Hauptmarke ist Photovoltaik.Marketing; PPC GmbH bleibt nur noch als
  // Betreiber-Angabe im Footer/Impressum ("Ein Produkt der PPC GmbH").
  brand: {
    name: "Photovoltaik.Marketing",
    logo: photovoltaikMarketingLogo,
  },

  // Design-Token-Overrides, gemerged über die Basis-Palette in theme.js.
  // Werte hier gewinnen; Begründung der Defaults in PRODUCT_DESIGN.md.
  theme: {
    color: {
      // accent: "#F79E1C",      // z. B. Kunden-Markenfarbe
      // accentHover: "#D6840F",
      // accentSubtle: "#FEF1DD",
      // brandNavy: "#2C358F",
    },
    font: {},
  },

  contact: {
    phone: "",
    email: "",
    // Calendly-Booking ist die Kern-Konversion des Lead-Systems.
    calendlyUrl: "https://calendly.com/ppc-beratung/solaranlage",
  },

  // Lead-Formular: wohin gehen die Leads? Genau einer der Modi:
  //   "web3forms" – web3formsKey setzen (https://web3forms.com)
  //   "formspree" – formspreeId setzen (https://formspree.io)
  //   "webhook"   – webhookUrl = POST-Endpunkt im Kundensystem/CRM (JSON)
  //   "demo"      – kein Backend, simuliert Erfolg (Default für Entwicklung)
  lead: {
    mode: "demo",
    web3formsKey: "",
    formspreeId: "",
    webhookUrl: "",
  },

  // Optional: kundenspezifische Wirtschaftlichkeits-Konstanten. Jeder Wert
  // braucht dieselbe Quelle+Stand-Dokumentation wie die Defaults in
  // calculate.js — ohne belastbare Quelle NICHT füllen.
  economics: {
    // strompreis: 0.37,            // €/kWh
    // einspeiseTeil: 0.077,        // €/kWh Teileinspeisung ≤10 kWp
    // einspeiseVoll: 0.123,        // €/kWh Volleinspeisung ≤10 kWp
    // kostenProKwp: 1300,          // €/kWp schlüsselfertig
    // speicherKostenProKwh: 400,   // €/kWh nutzbare Speicherkapazität
  },

  // Landingpage-Sektionen ein-/ausblenden (White-Label pro Kunde).
  sections: {
    mwstBeispiel: true,
  },
};

// Kundenspezifische Wirtschaftlichkeits-Konstanten in calculate.js übernehmen
// (Injection, damit calculate.js selbst seiten-/asset-frei bleibt).
configureEconomics(siteConfig.economics);
