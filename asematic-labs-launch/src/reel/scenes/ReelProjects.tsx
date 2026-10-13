import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FloatingInterface } from "../../components/FloatingInterface";
import {
  CodePanel,
  type CodeLine,
} from "../../components/interfaces/CodePanel";
import { Dashboard } from "../../components/interfaces/Dashboard";
import { PhonePreview } from "../../components/interfaces/PhonePreview";
import { COLORS, SHADOWS, TYPE } from "../../styles/brand";
import { EASE, drift, glide, progress, tween } from "../../utils/animations";
import { REEL_SCENES, cue } from "../timing";

type Props = { readonly title: string; readonly skills: string[] };

const F = REEL_SCENES.projects.from;

const CODE: CodeLine[] = [
  [
    ["export async function ", "k"],
    ["getProjects", "f"],
    ["() {", "p"],
  ],
  [
    ["  const ", "k"],
    ["res ", "p"],
    ["= ", "p"],
    ["await ", "k"],
    ["fetch", "f"],
    ["(", "p"],
    ['"/api/projects"', "s"],
    [");", "p"],
  ],
  [
    ["  return ", "k"],
    ["res.", "p"],
    ["json", "f"],
    ["();", "p"],
  ],
  [["}", "p"]],
];

// Where each skill chip floats (px) and when it pops (seconds into the line).
const CHIP_POS = [
  { x: 90, y: 1392, at: 1.3 },
  { x: 380, y: 1410, at: 1.5 },
  { x: 660, y: 1392, at: 1.7 },
  { x: 210, y: 1480, at: 1.9 },
  { x: 540, y: 1488, at: 2.1 },
];

/** 10.5-14.5 s: real-world projects assemble; skill chips pop on "skills build". */
export const ReelProjects: React.FC<Props> = ({ title, skills }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = tween(frame, [0, 60], [1.12, 1], EASE.out);
  const head = progress(frame, 2, 18);

  const panel = (delay: number, z: number): React.CSSProperties => {
    const s = glide(frame, fps, delay);
    return {
      opacity: interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
      transform: `translate3d(0, ${(1 - s) * 120 + drift(frame, delay, 6, 110)}px, ${z - (1 - s) * 400}px) rotateX(${(1 - s) * 16}deg)`,
    };
  };

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
        <div
          style={{
            ...TYPE.label,
            fontSize: 28,
            padding: "16px 34px",
            borderRadius: 999,
            background: COLORS.white,
            border: `1px solid ${COLORS.pale}`,
            boxShadow: SHADOWS.soft,
            opacity: head,
            translate: `0 ${(1 - head) * 20}px`,
          }}
        >
          {title}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          perspective: 2400,
          perspectiveOrigin: "50% 40%",
          scale: String(cam),
        }}
      >
        <AbsoluteFill
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateY(-6deg) rotateX(4deg)",
            transformOrigin: "540px 900px",
          }}
        >
          <FloatingInterface
            width={900}
            height={600}
            title="Project Dashboard"
            variant="browser"
            style={{ left: 90, top: 380, ...panel(4, 0) }}
          >
            <Dashboard start={16} />
          </FloatingInterface>
          <PhonePreview style={{ left: 60, top: 840, ...panel(14, 160) }} />
          <FloatingInterface
            width={640}
            height={300}
            title="api/projects.ts"
            style={{ left: 380, top: 1030, ...panel(22, 120) }}
          >
            <CodePanel
              lines={CODE}
              start={30}
              speed={5}
              fontSize={20}
              activeLine={1}
            />
          </FloatingInterface>
        </AbsoluteFill>
      </AbsoluteFill>

      {skills.map((skill, i) => {
        const c = CHIP_POS[i % CHIP_POS.length];
        const s = glide(frame, fps, cue(3, c.at, F));
        return (
          <div
            key={skill}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y + drift(frame, i, 5, 90),
              padding: "16px 28px",
              borderRadius: 999,
              background:
                i % 2
                  ? COLORS.white
                  : `linear-gradient(135deg, ${COLORS.electric}, ${COLORS.deep})`,
              border: i % 2 ? `2px solid ${COLORS.pale}` : undefined,
              boxShadow: SHADOWS.soft,
              ...TYPE.display,
              color: i % 2 ? COLORS.deep : COLORS.white,
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              opacity: interpolate(s, [0, 0.3], [0, 1], {
                extrapolateRight: "clamp",
              }),
              scale: String(interpolate(s, [0, 1], [0.4, 1])),
            }}
          >
            {skill}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
