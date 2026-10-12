import {
  Easing,
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { Background } from "../Background";
import { COLORS, fontFamily, SAFE } from "../theme";

type DemoProps = { readonly prompt: string; readonly buttonLabel: string };

// Layout (1080x1920, all inside the safe zone)
const INPUT = { top: 610, height: 96 };
const BUTTON = { top: 740, height: 96 };
const RESULTS_TOP = 900;

// Timeline (frames, 30fps)
const T = {
  uiIn: 0,
  toInput: 10,
  clickInput: 40,
  typeStart: 48,
  framesPerChar: 2,
  toButton: 122,
  clickButton: 150,
  spinnerEnd: 168, // 0.5s spinner after the press settles
  resultStagger: 8,
};

type Point = { x: number; y: number };
const START: Point = { x: 900, y: 1560 };
const INPUT_TARGET: Point = { x: 330, y: INPUT.top + INPUT.height / 2 };
const BUTTON_TARGET: Point = { x: 560, y: BUTTON.top + BUTTON.height / 2 };

// Quadratic bezier between two points, bowed sideways for a natural hand path.
const bezier = (a: Point, b: Point, t: number, bow: number): Point => {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const c = { x: mx - (dy / len) * bow, y: my + (dx / len) * bow };
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
};

const cursorAt = (frame: number, fps: number): Point => {
  const leg1 = spring({ frame: frame - T.toInput, fps, config: { damping: 15 } });
  const leg2 = spring({ frame: frame - T.toButton, fps, config: { damping: 15 } });
  if (frame < T.toButton) return bezier(START, INPUT_TARGET, leg1, 140);
  return bezier(INPUT_TARGET, BUTTON_TARGET, leg2, -90);
};

const Ripple: React.FC<{ x: number; y: number; start: number }> = ({ x, y, start }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < start || p >= 1) return null;
  const r = 20 + 90 * Easing.out(Easing.cubic)(p);
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        border: "4px solid rgba(255,255,255,0.9)",
        backgroundColor: "rgba(91,140,255,0.25)",
        opacity: 1 - p,
      }}
    />
  );
};

const RESULTS = [
  { title: "Web & Mobile App", body: "A booking flow patients can use on any device", icon: "web", color: COLORS.blue },
  { title: "AI Assistant", body: "Answers questions and fills open slots for you", icon: "ai", color: COLORS.violet },
  { title: "SaaS Dashboard", body: "Every appointment managed in one place", icon: "chart", color: COLORS.cyan },
] as const;

const Icon: React.FC<{ kind: string; color: string }> = ({ kind, color }) => (
  <div
    style={{
      width: 96,
      height: 96,
      flexShrink: 0,
      borderRadius: 24,
      backgroundColor: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 0 30px ${color}88`,
    }}
  >
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {kind === "web" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
        </>
      )}
      {kind === "ai" && <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />}
      {kind === "chart" && <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />}
    </svg>
  </div>
);

// Scene 3 (8s): cursor fills in the idea, taps the button, the project plan springs in.
const DemoInner: React.FC<DemoProps> = ({ prompt, buttonLabel }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typed = Math.max(0, Math.min(prompt.length, Math.floor((frame - T.typeStart) / T.framesPerChar)));
  const focused = frame >= T.clickInput;
  const pressed = frame >= T.clickButton;
  const loading = pressed && frame < T.spinnerEnd;
  const cursor = cursorAt(frame, fps);
  const trail = [2, 4, 6, 8].map((d) => cursorAt(Math.max(0, frame - d), fps));
  const uiIn = (delay: number) => spring({ frame: frame - T.uiIn - delay, fps, config: { damping: 200 } });

  return (
    <>
      <Background glow={0.8} />
      <Interactive.Div
        name="Heading"
        style={{
          position: "absolute",
          left: SAFE.side,
          right: SAFE.side,
          top: 440,
          fontFamily,
          fontWeight: 800,
          fontSize: 72,
          color: COLORS.text,
          textAlign: "center",
          opacity: uiIn(0),
          translate: `0px ${(1 - uiIn(0)) * 30}px`,
        }}
      >
        Tell us your idea
      </Interactive.Div>

      {/* Input field */}
      <div
        style={{
          position: "absolute",
          left: SAFE.side,
          width: SAFE.width,
          top: INPUT.top,
          height: INPUT.height,
          boxSizing: "border-box",
          borderRadius: 20,
          backgroundColor: COLORS.card,
          border: `3px solid ${focused ? COLORS.blueLight : COLORS.cardBorder}`,
          boxShadow: focused ? "0 0 0 6px rgba(91,140,255,0.2)" : "none",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          fontFamily,
          fontSize: 38,
          color: typed ? COLORS.text : COLORS.textDim,
          opacity: uiIn(4),
          translate: `0px ${(1 - uiIn(4)) * 30}px`,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {typed ? prompt.slice(0, typed) : "Describe your project…"}
        {focused && frame < T.clickButton && (
          <span
            style={{
              display: "inline-block",
              width: 3,
              height: 44,
              marginLeft: 4,
              backgroundColor: COLORS.blueLight,
              opacity: typed < prompt.length || Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
            }}
          />
        )}
      </div>

      {/* Submit button */}
      <div
        style={{
          position: "absolute",
          left: SAFE.side,
          width: SAFE.width,
          top: BUTTON.top,
          height: BUTTON.height,
          borderRadius: 20,
          background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.violet})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily,
          fontWeight: 700,
          fontSize: 40,
          color: "white",
          boxShadow: "0 12px 40px rgba(1,88,248,0.45)",
          opacity: uiIn(8),
          scale: String(
            interpolate(frame, [T.clickButton, T.clickButton + 4, T.clickButton + 12], [1, 0.95, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }) * (0.94 + 0.06 * uiIn(8)),
          ),
        }}
      >
        {loading ? (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "6px solid rgba(255,255,255,0.3)",
              borderTopColor: "white",
              rotate: `${(frame - T.clickButton) * 24}deg`,
            }}
          />
        ) : (
          buttonLabel
        )}
      </div>

      {/* Results */}
      <div
        style={{
          position: "absolute",
          left: SAFE.side,
          width: SAFE.width,
          top: RESULTS_TOP,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {RESULTS.map((r, i) => {
          const s = spring({ frame: frame - T.spinnerEnd - i * T.resultStagger, fps, config: { damping: 14 } });
          return (
            <div
              key={r.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 32,
                padding: "32px 36px",
                borderRadius: 24,
                backgroundColor: "rgba(11,26,69,0.85)",
                border: `2px solid ${COLORS.cardBorder}`,
                boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
                opacity: Math.min(1, s * 1.5),
                translate: `0px ${(1 - s) * 80}px`,
                scale: String(0.9 + 0.1 * s),
              }}
            >
              <Icon kind={r.icon} color={r.color} />
              <div style={{ fontFamily, color: COLORS.text }}>
                <div style={{ fontSize: 46, fontWeight: 700 }}>{r.title}</div>
                <div style={{ fontSize: 36, color: COLORS.textDim, marginTop: 6, lineHeight: 1.3 }}>{r.body}</div>
              </div>
            </div>
          );
        })}
      </div>

      <Ripple x={INPUT_TARGET.x} y={INPUT_TARGET.y} start={T.clickInput} />
      <Ripple x={BUTTON_TARGET.x} y={BUTTON_TARGET.y} start={T.clickButton} />

      {/* Cursor with trailing shadow */}
      {[...trail].reverse().map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x - 6,
            top: p.y - 6,
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "white",
            opacity: 0.5 * ((i + 1) / trail.length) * interpolate(frame, [176, 190], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: cursor.x - 6,
          top: cursor.y - 6,
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "white",
          boxShadow: "0 0 0 10px rgba(255,255,255,0.18), 0 0 24px rgba(91,140,255,0.9)",
          scale: String(interpolate(frame, [T.clickInput, T.clickInput + 3, T.clickInput + 8, T.clickButton, T.clickButton + 3, T.clickButton + 8], [1, 0.7, 1, 1, 0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
          opacity:
            interpolate(frame, [6, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
            interpolate(frame, [176, 190], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />
    </>
  );
};

const demoSchema = {
  prompt: { type: "string", default: "An AI booking app for my clinic", description: "Typed idea" },
  buttonLabel: { type: "string", default: "Start my project", description: "Button label" },
} as const satisfies InteractivitySchema;

export const Demo = Interactive.withSchema({
  Component: DemoInner,
  componentName: "Demo",
  schema: demoSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
