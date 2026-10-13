import { COLORS, FONT, SHADOWS } from "../styles/brand";

type WindowProps = {
  readonly width: number;
  readonly height: number;
  readonly title?: string;
  readonly variant?: "app" | "browser" | "terminal";
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
};

/**
 * A floating, glass-like application window. Position, perspective and animation are applied by
 * the caller through `style`.
 */
export const FloatingInterface: React.FC<WindowProps> = ({ width, height, title, variant = "app", children, style }) => {
  const bar = variant === "browser" ? 52 : 44;
  return (
    <div
      style={{
        position: "absolute",
        width,
        height,
        borderRadius: 18,
        overflow: "hidden",
        background: "linear-gradient(165deg, #FFFFFF 0%, #F8FBFF 100%)",
        border: "1px solid rgba(219,234,254,0.95)",
        boxShadow: SHADOWS.float,
        fontFamily: FONT,
        color: COLORS.text,
        ...style,
      }}
    >
      {/* Specular highlight along the top edge for a glass feel. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 18%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      <div
        style={{
          height: bar,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 18px",
          borderBottom: `1px solid ${COLORS.line}`,
          background: variant === "terminal" ? "#F1F5F9" : "rgba(248,251,255,0.9)",
        }}
      >
        {["#CBD5E1", "#CBD5E1", "#CBD5E1"].map((c, i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: 6, background: c }} />
        ))}
        {variant === "browser" ? (
          <div
            style={{
              marginLeft: 18,
              flex: 1,
              height: 30,
              borderRadius: 8,
              background: COLORS.white,
              border: `1px solid ${COLORS.line}`,
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              fontSize: 15,
              color: COLORS.textSecondary,
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: 5, background: COLORS.sky, marginRight: 10 }} />
            {title}
          </div>
        ) : (
          <div style={{ marginLeft: 14, fontSize: 15, fontWeight: 500, color: COLORS.textSecondary }}>{title}</div>
        )}
      </div>
      <div style={{ position: "relative", height: height - bar }}>{children}</div>
    </div>
  );
};

type ChipProps = {
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
};

/** Small floating status pill. */
export const Chip: React.FC<ChipProps> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 22px",
      borderRadius: 16,
      background: "rgba(255,255,255,0.96)",
      border: "1px solid rgba(219,234,254,0.95)",
      boxShadow: SHADOWS.soft,
      fontFamily: FONT,
      fontSize: 19,
      fontWeight: 550,
      color: COLORS.text,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);
