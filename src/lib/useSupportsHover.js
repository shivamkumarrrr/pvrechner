import { useEffect, useState } from "react";

// Echte Hover-Fähigkeit statt bloßem `hover:`-Media-Feature prüfen: Touch-
// Geräte (auch Hybrid-Tablets) haben keinen Mauszeiger, auf denen ein
// Cursor-Tracking-Tilt nie ausgelöst wird. Dort bleibt der bestehende
// Tap-Zustand — kein Tilt.
const QUERY = "(hover: hover) and (pointer: fine)";

export function useSupportsHover() {
  const [hover, setHover] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setHover(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return hover;
}
