import { useEffect, useRef, useState } from "react";

// Fires once when the element first scrolls into view. Used for the
// scroll-triggered fade-ins and the stats counter animation.
//
// Robustness rules (sections must never stay permanently hidden):
// - A fixed 20% threshold would never fire for elements taller than the
//   viewport (long timeline/list sections), so elements that are taller than
//   the viewport reveal as soon as any part enters instead.
// - If IntersectionObserver is unavailable, content reveals immediately.
export function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const tallerThanViewport = el.getBoundingClientRect().height >= viewportHeight;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: tallerThanViewport ? 0 : 0.2, ...options });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, inView];
}
