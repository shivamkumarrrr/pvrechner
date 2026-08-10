import { useEffect } from "react";
import LandingPage from "./components/LandingPage.jsx";
import { siteConfig } from "./config.js";

export default function App() {
  // White-Label-Metadaten aus config.js auf das Dokument anwenden (Titel,
  // Meta-Description, theme-color). OG-Tags bleiben statisch in index.html.
  useEffect(() => {
    document.title = siteConfig.meta.title;
    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("description", siteConfig.meta.description);
    setMeta("theme-color", siteConfig.meta.themeColor);
  }, []);

  return <LandingPage />;
}
