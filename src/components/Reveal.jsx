import { useInView } from "../lib/useInView.js";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion.js";

// Wraps a section in a gentle fade/rise-in that plays once when it first
// scrolls into the viewport. Fully inert under prefers-reduced-motion —
// content is shown immediately, not just with a shorter transition.
export default function Reveal({ children, delay = 0, as: Tag = "div", style, ...rest }) {
  const [ref, inView] = useInView();
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <Tag style={style} {...rest}>{children}</Tag>;
  }

  return (
    <Tag
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
