import theme from "../../../theme.js";

export default function Toggle({ label, checked, onChange, sub }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 10,
        border: checked ? `2px solid ${theme.color.accent}` : `1.5px solid ${theme.color.border}`,
        background: checked ? theme.color.accentSubtle : theme.color.white,
        cursor: "pointer",
        marginBottom: 8,
        transition: "all 0.15s",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: theme.color.textPrimary }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: theme.color.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
      <div
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: checked ? theme.color.accent : theme.color.border,
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            background: theme.color.white,
            position: "absolute",
            top: 2,
            left: checked ? 22 : 2,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        />
      </div>
    </div>
  );
}
