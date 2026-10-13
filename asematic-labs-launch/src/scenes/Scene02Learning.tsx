import { CheckCircle2, Sparkles } from "lucide-react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Chip, FloatingInterface } from "../components/FloatingInterface";
import { CodePanel, type CodeLine } from "../components/interfaces/CodePanel";
import { LessonBrowser } from "../components/interfaces/LessonBrowser";
import { Terminal } from "../components/interfaces/Terminal";
import { COLORS, TYPE } from "../styles/brand";
import { EASE, drift, glide, progress, tween } from "../utils/animations";

type Props = {
  readonly headline: string[];
  readonly support: string;
};

const CODE: CodeLine[] = [
  [["export function ", "k"], ["ProjectCard", "f"], ["({ title, tags }) {", "p"]],
  [["  return (", "p"]],
  [["    <", "p"], ["article", "t"], [" className", "a"], ["=", "p"], ['"card"', "s"], [">", "p"]],
  [["      <", "p"], ["h3", "t"], [">{title}</", "p"], ["h3", "t"], [">", "p"]],
  [["      <", "p"], ["Tags", "t"], [" items", "a"], ["={tags} />", "p"]],
  [["    </", "p"], ["article", "t"], [">", "p"]],
  [["  );", "p"]],
  [["}", "p"]],
];

// Panel placement inside the perspective cluster (px, before camera).
const PANELS = {
  browser: { left: 910, top: 272, z: 0, delay: 4 },
  code: { left: 870, top: 652, z: 140, delay: 10 },
  terminal: { left: 1300, top: 58, z: -60, delay: 16 },
  chipDone: { left: 1490, top: 812, z: 220, delay: 26 },
  chipQuiz: { left: 880, top: 176, z: 180, delay: 32 },
} as const;

export const Scene02Learning: React.FC<Props> = ({ headline, support }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Camera: push in, travel laterally across the panels, then ease back to reveal everything.
  const camScale =
    frame < 44 ? tween(frame, [0, 44], [0.93, 1.05], EASE.out) : tween(frame, [44, 92], [1.05, 0.99], EASE.inOut);
  const camX = tween(frame, [6, 84], [70, -50], EASE.inOut);
  const camY = tween(frame, [0, 90], [16, -8], EASE.inOut);
  const tilt = tween(frame, [0, 90], [-19, -13], EASE.inOut);

  const panelStyle = (key: keyof typeof PANELS): React.CSSProperties => {
    const p = PANELS[key];
    const s = glide(frame, fps, p.delay);
    return {
      left: p.left,
      top: p.top,
      opacity: interpolate(s, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }),
      transform: `translate3d(0, ${(1 - s) * 90 + drift(frame, p.delay, 5, 110)}px, ${p.z - (1 - s) * 260}px)`,
    };
  };

  const lines = progress(frame, 30, 58, EASE.inOut);
  const flow = -frame * 1.4;

  return (
    <AbsoluteFill>
      {/* Panels live in a 3D cluster that the camera moves through. */}
      <AbsoluteFill
        style={{
          perspective: 2200,
          perspectiveOrigin: "70% 45%",
          scale: String(camScale),
          translate: `${camX}px ${camY}px`,
          transformOrigin: "68% 50%",
        }}
      >
        <AbsoluteFill style={{ transformStyle: "preserve-3d", transform: `rotateY(${tilt}deg) rotateX(5deg)`, transformOrigin: "1250px 540px" }}>
          {/* Connection lines between panels */}
          <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible", transform: "translateZ(40px)" }}>
            {[
              "M1300 170 C1220 170 1210 206 1150 206",
              "M1000 236 C1000 252 1000 258 1000 272",
              "M1470 930 C1500 930 1520 910 1540 874",
            ].map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke={COLORS.pale} strokeWidth={4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - lines} />
                <path d={d} fill="none" stroke={COLORS.electric} strokeWidth={2} strokeDasharray="6 10" strokeDashoffset={flow} opacity={lines} />
              </g>
            ))}
          </svg>

          <FloatingInterface width={900} height={560} title="Learning Path · Full Stack Development" variant="browser" style={panelStyle("browser")}>
            <LessonBrowser start={PANELS.browser.delay + 12} />
          </FloatingInterface>

          <FloatingInterface width={500} height={232} title="Terminal" variant="terminal" style={panelStyle("terminal")}>
            <Terminal start={PANELS.terminal.delay + 10} />
          </FloatingInterface>

          <FloatingInterface width={600} height={340} title="ProjectCard.tsx" style={panelStyle("code")}>
            <CodePanel lines={CODE} start={PANELS.code.delay + 8} speed={4.2} fontSize={18} activeLine={4} />
          </FloatingInterface>

          <Chip style={panelStyle("chipDone")}>
            <CheckCircle2 size={24} color={COLORS.success} strokeWidth={2.2} />
            Lesson completed
          </Chip>
          <Chip style={panelStyle("chipQuiz")}>
            <Sparkles size={22} color={COLORS.primary} strokeWidth={2.2} />
            Quiz passed · 9/10
          </Chip>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Copy stays in screen space with a light parallax, so it is always readable. */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          paddingLeft: 150,
          translate: `${camX * 0.25}px 0px`,
          background: "linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.75) 34%, rgba(255,255,255,0) 46%)",
        }}
      >
        <div style={{ ...TYPE.label, fontSize: 20, opacity: progress(frame, 4, 18), marginBottom: 28 }}>Discover · Learn</div>
        <div style={{ ...TYPE.display, fontSize: 92, lineHeight: 1.02 }}>
          {headline.map((line, i) => {
            const p = progress(frame, 8 + i * 5, 30 + i * 5);
            return (
              <div key={line} style={{ overflow: "hidden", paddingBottom: "0.06em" }}>
                <div style={{ translate: `0 ${(1 - p) * 105}%`, color: i === 1 ? COLORS.primary : COLORS.text }}>{line}</div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            ...TYPE.support,
            fontSize: 32,
            marginTop: 34,
            opacity: progress(frame, 22, 40),
            translate: `0 ${(1 - progress(frame, 22, 40)) * 16}px`,
          }}
        >
          {support}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
