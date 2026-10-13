import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FloatingInterface } from "../components/FloatingInterface";
import { ChartCard } from "../components/interfaces/ChartCard";
import { CodePanel, type CodeLine } from "../components/interfaces/CodePanel";
import { Dashboard } from "../components/interfaces/Dashboard";
import { PhonePreview } from "../components/interfaces/PhonePreview";
import { COLORS, FONT, SHADOWS, TYPE } from "../styles/brand";
import { EASE, glide, progress, tween } from "../utils/animations";
import { screenRect } from "../utils/cardLayout";

type Props = {
  readonly headline: string;
  readonly support: string;
};

const CODE: CodeLine[] = [
  [["import ", "k"], ["express ", "p"], ["from ", "k"], ['"express"', "s"], [";", "p"]],
  [["import ", "k"], ["{ db } ", "p"], ["from ", "k"], ['"./db"', "s"], [";", "p"]],
  [],
  [["const ", "k"], ["router ", "p"], ["= express.", "p"], ["Router", "f"], ["();", "p"]],
  [],
  [["router.", "p"], ["get", "f"], ["(", "p"], ['"/projects"', "s"], [", ", "p"], ["async ", "k"], ["(req, res) => {", "p"]],
  [["  const ", "k"], ["projects ", "p"], ["= ", "p"], ["await ", "k"], ["db.project.", "p"], ["findMany", "f"], ["({", "p"]],
  [["    orderBy", "a"], [": { ", "p"], ["updatedAt", "a"], [": ", "p"], ['"desc"', "s"], [" },", "p"]],
  [["  });", "p"]],
  [["  res.", "p"], ["json", "f"], ["(projects);", "p"]],
  [["});", "p"]],
];

// Composed layout (screen px at camera scale 1). `card` is the Scene 4 card each panel becomes.
const LAYOUT = {
  code: { left: 100, top: 336, width: 640, height: 480, z: 60, delay: 12, card: 0 },
  dashboard: { left: 716, top: 300, width: 810, height: 600, z: 0, delay: 6, card: 1 },
  chart: { left: 1090, top: 768, width: 470, height: 250, z: 170, delay: 22, card: 2 },
  phone: { left: 1560, top: 360, width: 260, height: 530, z: 120, delay: 17, card: 3 },
} as const;
type Key = keyof typeof LAYOUT;
const ORDER: Key[] = ["dashboard", "code", "phone", "chart"];

const MORPH_START = 62;
const MORPH_END = 82;

export const Scene03Projects: React.FC<Props> = ({ headline, support }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Forward zoom through the frame, then a timed pull-back that settles at 1 for the grid.
  const camScale = frame < 32 ? tween(frame, [0, 32], [1.32, 1.07], EASE.out) : tween(frame, [36, 62], [1.07, 1], EASE.inOut);
  const tiltX = tween(frame, [0, 46], [12, 0], EASE.out);
  const depth = 1 - progress(frame, 40, MORPH_START, EASE.inOut);
  const contentFade = 1 - progress(frame, MORPH_START - 2, MORPH_START + 8, EASE.soft);
  const morph = progress(frame, MORPH_START, MORPH_END, EASE.inOut);
  const copyFade = 1 - progress(frame, 58, 70, EASE.soft);

  const enter = (key: Key) => glide(frame, fps, LAYOUT[key].delay);
  const panelStyle = (key: Key): React.CSSProperties => {
    const l = LAYOUT[key];
    const s = enter(key);
    return {
      left: l.left,
      top: l.top,
      opacity: interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
      transform: `translate3d(0, ${(1 - s) * 70}px, ${(l.z - (1 - s) * 420) * depth}px) rotateX(${(1 - s) * 18}deg)`,
    };
  };

  // Geometric frame the camera passes through at the start.
  const pass = progress(frame, 0, 24, EASE.in);
  const flow = -frame * 1.5;
  const lines = progress(frame, 28, 50);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ perspective: 2400, perspectiveOrigin: "50% 40%", scale: String(camScale), opacity: contentFade }}>
        <AbsoluteFill style={{ transformStyle: "preserve-3d", transform: `rotateX(${tiltX}deg)`, transformOrigin: "960px 640px" }}>
          {/* Blue connection strokes between the assembled panels */}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: lines }}>
            {["M740 600 C730 600 726 600 716 600", "M1526 620 C1540 620 1546 620 1560 620", "M1690 890 C1690 950 1640 940 1560 900"].map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke={COLORS.pale} strokeWidth={5} />
                <path d={d} fill="none" stroke={COLORS.primary} strokeWidth={2.2} strokeDasharray="5 9" strokeDashoffset={flow} />
              </g>
            ))}
          </svg>

          <FloatingInterface width={LAYOUT.dashboard.width} height={LAYOUT.dashboard.height} title="Project Dashboard" variant="browser" style={panelStyle("dashboard")}>
            <Dashboard start={LAYOUT.dashboard.delay + 12} />
          </FloatingInterface>

          <FloatingInterface width={LAYOUT.code.width} height={LAYOUT.code.height} title="api/projects.ts" style={panelStyle("code")}>
            <div style={{ display: "flex", gap: 2, padding: "10px 16px 0", borderBottom: `1px solid ${COLORS.line}`, fontFamily: FONT, fontSize: 14 }}>
              {["projects.ts", "db.ts", "Dashboard.tsx"].map((tab, i) => (
                <div
                  key={tab}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px 8px 0 0",
                    color: i === 0 ? COLORS.deep : COLORS.muted,
                    fontWeight: i === 0 ? 600 : 450,
                    background: i === 0 ? COLORS.white : undefined,
                    borderBottom: i === 0 ? `2px solid ${COLORS.primary}` : undefined,
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>
            <CodePanel lines={CODE} start={LAYOUT.code.delay + 6} speed={6.5} fontSize={18} activeLine={6} />
          </FloatingInterface>

          <PhonePreview style={panelStyle("phone")} />
          <ChartCard start={LAYOUT.chart.delay + 10} style={panelStyle("chart")} />
        </AbsoluteFill>
      </AbsoluteFill>

      {/* The panels resolve into white card shells that become Scene 4's cards. */}
      {morph > 0
        ? ORDER.map((key) => {
            const l = LAYOUT[key];
            const target = screenRect(l.card, 0);
            const mix = (a: number, b: number) => a + (b - a) * morph;
            return (
              <div
                key={key}
                style={{
                  position: "absolute",
                  left: mix(l.left, target.left),
                  top: mix(l.top, target.top),
                  width: mix(l.width, target.width),
                  height: mix(l.height, target.height),
                  borderRadius: mix(key === "phone" ? 40 : 18, 24 * target.scale),
                  background: "linear-gradient(170deg, #FFFFFF 0%, #FBFDFF 100%)",
                  border: "1px solid rgba(219,234,254,0.95)",
                  boxShadow: SHADOWS.float,
                  opacity: interpolate(frame, [MORPH_START - 2, MORPH_START + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              />
            );
          })
        : null}

      {/* Geometric frame: the camera flies through it */}
      {pass < 1 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          {[0, 1].map((k) => {
            const p = Math.max(0, pass - k * 0.12);
            return (
              <svg
                key={k}
                width={1240}
                height={720}
                viewBox="0 0 1240 720"
                style={{
                  position: "absolute",
                  scale: String(interpolate(p, [0, 1], [0.62 - k * 0.1, 3.6])),
                  opacity: interpolate(p, [0, 0.7, 1], [1, 0.8, 0]),
                  overflow: "visible",
                }}
              >
                <rect x={2} y={2} width={1236} height={716} rx={36} fill="none" stroke={k === 0 ? COLORS.primary : COLORS.sky} strokeWidth={k === 0 ? 3 : 1.5} />
                {k === 0
                  ? [
                      [20, 20, 1, 1],
                      [1220, 20, -1, 1],
                      [20, 700, 1, -1],
                      [1220, 700, -1, -1],
                    ].map(([x, y, sx, sy], i) => (
                      <path key={i} d={`M${x} ${y + sy * 60} V${y} H${x + sx * 60}`} fill="none" stroke={COLORS.deep} strokeWidth={6} strokeLinecap="round" />
                    ))
                  : null}
              </svg>
            );
          })}
        </AbsoluteFill>
      ) : null}

      {/* Copy */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 70,
          opacity: copyFade,
          background: `linear-gradient(180deg, rgba(255,255,255,${0.94 * progress(frame, 8, 22)}) 0%, rgba(255,255,255,${0.7 * progress(frame, 8, 22)}) 22%, rgba(255,255,255,0) 30%)`,
        }}
      >
        <div style={{ ...TYPE.label, fontSize: 20, opacity: progress(frame, 10, 24) }}>Build</div>
        <div
          style={{
            ...TYPE.display,
            fontSize: 84,
            marginTop: 16,
            opacity: progress(frame, 14, 30),
            translate: `0 ${(1 - progress(frame, 14, 34)) * 30}px`,
            scale: String(interpolate(progress(frame, 14, 34), [0, 1], [0.96, 1])),
          }}
        >
          {headline}
        </div>
        <div style={{ ...TYPE.support, fontSize: 32, marginTop: 8, opacity: progress(frame, 24, 42) }}>{support}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
