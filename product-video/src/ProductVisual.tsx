import { COLORS, fontFamily } from "./theme";

// Illustrative, code-built product visuals (no real product screenshots exist yet).
// 960x860 cards; all text is 28px or larger.
export const VISUAL = { width: 960, height: 860 };

const Card: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => (
  <div
    style={{
      width: VISUAL.width,
      height: VISUAL.height,
      boxSizing: "border-box",
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: "#081335",
      border: `2px solid ${COLORS.cardBorder}`,
      boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 80px rgba(1,88,248,0.25)",
      fontFamily,
      color: COLORS.text,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div style={{ height: 72, display: "flex", alignItems: "center", gap: 14, padding: "0 28px", backgroundColor: "#0B1A45" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: c }} />
      ))}
      <div style={{ marginLeft: 20, fontSize: 30, color: COLORS.textDim }}>{title}</div>
    </div>
    <div style={{ flex: 1, padding: 40, display: "flex", flexDirection: "column", gap: 28 }}>{children}</div>
  </div>
);

const WebVisual = () => (
  <Card title="Website">
    <div
      style={{
        borderRadius: 16,
        padding: 44,
        background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.violet})`,
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1 }}>Book your visit in seconds</div>
      <div style={{ fontSize: 32, opacity: 0.9 }}>Fast, simple, on any device.</div>
      <div style={{ alignSelf: "flex-start", padding: "16px 34px", borderRadius: 12, backgroundColor: "white", color: COLORS.blue, fontSize: 32, fontWeight: 700 }}>
        Book now
      </div>
    </div>
    <div style={{ display: "flex", gap: 24 }}>
      {["Fast", "Secure", "Mobile"].map((label) => (
        <div key={label} style={{ flex: 1, height: 300, borderRadius: 16, backgroundColor: "#0B1A45", border: `2px solid ${COLORS.cardBorder}`, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 24, gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: COLORS.blueLight, opacity: 0.85 }} />
          <div style={{ fontSize: 32, fontWeight: 700 }}>{label}</div>
        </div>
      ))}
    </div>
  </Card>
);

const Bubble: React.FC<{ from: "user" | "ai"; children: React.ReactNode }> = ({ from, children }) => (
  <div
    style={{
      alignSelf: from === "user" ? "flex-end" : "flex-start",
      maxWidth: 660,
      padding: "24px 30px",
      borderRadius: 28,
      fontSize: 34,
      lineHeight: 1.3,
      backgroundColor: from === "user" ? COLORS.blue : "#13235A",
      border: from === "ai" ? `2px solid ${COLORS.cardBorder}` : "none",
    }}
  >
    {children}
  </div>
);

const AiVisual = () => (
  <Card title="AI Assistant">
    <Bubble from="user">Can I book Friday at 4 PM?</Bubble>
    <Bubble from="ai">Done! You&rsquo;re booked for Friday at 4:00 PM. I&rsquo;ll send a reminder.</Bubble>
    <Bubble from="user">Thanks!</Bubble>
    <div style={{ marginTop: "auto", height: 88, borderRadius: 44, backgroundColor: "#0B1A45", border: `2px solid ${COLORS.cardBorder}`, display: "flex", alignItems: "center", padding: "0 34px", fontSize: 32, color: COLORS.textDim }}>
      Ask anything&hellip;
    </div>
  </Card>
);

const BARS = [0.45, 0.62, 0.5, 0.78, 0.66, 0.9, 0.72];

const SaasVisual: React.FC<{ grow: number }> = ({ grow }) => (
  <Card title="Dashboard">
    <div style={{ fontSize: 46, fontWeight: 800 }}>Appointments</div>
    <div style={{ height: 300, display: "flex", alignItems: "flex-end", gap: 22, padding: "0 8px", borderBottom: `2px solid ${COLORS.cardBorder}` }}>
      {BARS.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h * 100 * Math.min(1, Math.max(0, grow * 1.6 - i * 0.08))}%`,
            borderRadius: "12px 12px 0 0",
            background: `linear-gradient(180deg, ${COLORS.blueLight}, ${COLORS.blue})`,
          }}
        />
      ))}
    </div>
    {[
      ["09:30", "Check-up", COLORS.blue],
      ["11:00", "Consultation", COLORS.violet],
      ["14:15", "Follow-up", COLORS.cyan],
    ].map(([time, label, color]) => (
      <div key={time} style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 34 }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: color }} />
        <div style={{ width: 120, color: COLORS.textDim }}>{time}</div>
        <div style={{ fontWeight: 700 }}>{label}</div>
      </div>
    ))}
  </Card>
);

export const ProductVisual: React.FC<{ kind: "web" | "ai" | "saas"; grow?: number }> = ({ kind, grow = 1 }) => {
  if (kind === "web") return <WebVisual />;
  if (kind === "ai") return <AiVisual />;
  return <SaasVisual grow={grow} />;
};
