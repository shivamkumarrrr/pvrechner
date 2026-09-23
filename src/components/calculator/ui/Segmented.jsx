import theme from "../../../theme.js";

// Segmented control für 2–3 gegenseitig exklusive Zustände (z.B. "Nein/Ja/Geplant").
// options: [{ value, label, icon? }]; onChange liefert den gewählten value.
export default function Segmented({ options, value, onChange }) {
  return (
    <div
      role="radiogroup"
      style={{
        display: "flex",
        background: theme.color.bg,
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.pill,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              minHeight: 40,
              padding: "8px 10px",
              borderRadius: theme.radius.pill,
              border: "none",
              background: active ? theme.color.textPrimary : "transparent",
              color: active ? theme.color.white : theme.color.textSecondary,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
