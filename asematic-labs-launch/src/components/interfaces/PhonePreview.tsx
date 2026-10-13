import { COLORS, FONT, SHADOWS } from "../../styles/brand";

type Props = { readonly style?: React.CSSProperties };

/** Mobile view of a student's portfolio site, showing the responsive build. */
export const PhonePreview: React.FC<Props> = ({ style }) => (
  <div
    style={{
      position: "absolute",
      width: 260,
      height: 530,
      borderRadius: 40,
      padding: 10,
      background: "linear-gradient(160deg, #FFFFFF, #EEF4FF)",
      border: "1px solid rgba(219,234,254,0.95)",
      boxShadow: SHADOWS.float,
      fontFamily: FONT,
      ...style,
    }}
  >
    <div style={{ width: "100%", height: "100%", borderRadius: 31, overflow: "hidden", background: COLORS.white, border: `1px solid ${COLORS.line}` }}>
      <div style={{ height: 30, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: 70, height: 8, borderRadius: 4, background: COLORS.line }} />
      </div>
      <div style={{ padding: "8px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary, letterSpacing: "0.1em" }}>PORTFOLIO</div>
        <div style={{ fontSize: 25, fontWeight: 680, lineHeight: 1.15, letterSpacing: "-0.03em", marginTop: 10, color: COLORS.text }}>
          I build fast, accessible web apps.
        </div>
        <div style={{ marginTop: 14, display: "inline-block", padding: "9px 16px", borderRadius: 10, background: COLORS.primary, color: COLORS.white, fontSize: 14, fontWeight: 600 }}>
          View projects
        </div>
        {[
          ["Weather Dashboard", "React · API"],
          ["Chat API", "Node.js · WebSockets"],
          ["Sales Insights", "Python · Pandas"],
        ].map(([t, s], i) => (
          <div key={t} style={{ marginTop: i === 0 ? 20 : 10, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: ["#DBEAFE", "#BFDBFE", "#E0F2FE"][i] }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{t}</div>
              <div style={{ fontSize: 12.5, color: COLORS.textSecondary }}>{s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
