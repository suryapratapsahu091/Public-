import {
  BookOpen,
  Check,
  Hammer,
  Lightbulb,
  MousePointer2,
} from "lucide-react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, SHADOWS, TYPE } from "../../styles/brand";
import { EASE, progress, settle } from "../../utils/animations";
import { REEL_SCENES, cue } from "../timing";

type Props = { readonly idea: string; readonly reality: string };

const F = REEL_SCENES.ideas.from;
// Seconds into "Learn karo, build karo, aur apne ideas ko reality mein convert karna start karo."
const T = {
  learn: 0,
  build: 0.9,
  ideas: 2.3,
  reality: 3.07,
  convert: 4.07,
  start: 4.99,
};
const at = (s: number) => cue(5, s, F);

const Step: React.FC<{
  readonly icon: React.ReactNode;
  readonly text: string;
  readonly p: number;
}> = ({ icon, text, p }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "20px 34px 20px 24px",
      borderRadius: 999,
      background: COLORS.white,
      border: `2px solid ${COLORS.pale}`,
      boxShadow: SHADOWS.soft,
      opacity: interpolate(p, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
      scale: String(interpolate(p, [0, 1], [0.6, 1])),
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        background: COLORS.pale,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>
    <span style={{ ...TYPE.display, fontSize: 52, fontWeight: 650 }}>
      {text}
    </span>
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        background: COLORS.success,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: progress(p, 0.6, 1),
      }}
    >
      <Check size={26} color={COLORS.white} strokeWidth={3.2} />
    </div>
  </div>
);

/** A wireframe box (dashed outline) that fills in as `m` goes from 0 to 1. */
const Box: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly m: number;
  readonly fill: string;
  readonly r?: number;
}> = ({ x, y, w, h, m, fill, r = 14 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: r,
      border: `3px dashed rgba(100,116,139,${0.6 * (1 - m)})`,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: -3,
        borderRadius: r,
        background: fill,
        opacity: m,
      }}
    />
  </div>
);

/** 19.2-25.1 s: learn, build, and turn an idea into reality. */
export const ReelIdeas: React.FC<Props> = ({ idea, reality }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const learn = settle(frame, fps, at(T.learn) - 2);
  const build = settle(frame, fps, at(T.build) - 2);
  const bulb = settle(frame, fps, at(T.ideas) - 4);
  const morph = progress(
    frame,
    at(T.reality) - 4,
    at(T.convert) + 14,
    EASE.inOut,
  );
  const label = progress(frame, at(T.reality) - 2, at(T.reality) + 10);
  const tap = frame - at(T.start);
  const press = tap > 0 && tap < 10 ? Math.sin((tap / 10) * Math.PI) : 0;
  const cursorIn = progress(frame, at(T.start) - 18, at(T.start) - 2, EASE.out);

  return (
    <AbsoluteFill style={{ alignItems: "center", fontFamily: FONT }}>
      <div style={{ position: "absolute", top: 250, display: "flex", gap: 26 }}>
        <Step
          icon={<BookOpen size={34} color={COLORS.primary} strokeWidth={2.2} />}
          text="Learn"
          p={learn}
        />
        <Step
          icon={<Hammer size={34} color={COLORS.primary} strokeWidth={2.2} />}
          text="Build"
          p={build}
        />
      </div>

      {/* Idea */}
      <div
        style={{
          position: "absolute",
          top: 450,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: interpolate(bulb, [0, 0.3], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            width: 170,
            height: 170,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(250,204,21,${0.35 * bulb}) 0%, rgba(250,204,21,0) 70%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: String(interpolate(bulb, [0, 1], [0.3, 1])),
          }}
        >
          <Lightbulb
            size={110}
            color={COLORS.primary}
            strokeWidth={1.8}
            fill={`rgba(250,204,21,${0.55 * bulb})`}
          />
        </div>
        <div
          style={{
            ...TYPE.display,
            fontSize: 64,
            marginTop: 6,
            position: "relative",
            height: 80,
            width: 520,
            textAlign: "center",
          }}
        >
          <span style={{ position: "absolute", inset: 0, opacity: 1 - label }}>
            {idea}
          </span>
          <span
            style={{
              position: "absolute",
              inset: 0,
              opacity: label,
              color: COLORS.primary,
            }}
          >
            {reality}
          </span>
        </div>
      </div>

      {/* Wireframe that becomes a real app */}
      <div
        style={{
          position: "absolute",
          top: 790,
          left: 140,
          width: 800,
          height: 640,
          borderRadius: 34,
          background: COLORS.white,
          border: `3px ${morph < 0.5 ? "dashed" : "solid"} ${morph < 0.5 ? "rgba(100,116,139,0.55)" : COLORS.pale}`,
          boxShadow: morph > 0.05 ? SHADOWS.float : "none",
          opacity: interpolate(bulb, [0, 0.4], [0, 1], {
            extrapolateRight: "clamp",
          }),
          translate: `0 ${(1 - bulb) * 60}px`,
          scale: String(1 + morph * 0.02),
          overflow: "hidden",
        }}
      >
        <Box
          x={40}
          y={40}
          w={720}
          h={60}
          m={morph}
          fill={`linear-gradient(90deg, ${COLORS.primary}, ${COLORS.electric})`}
        />
        <Box
          x={40}
          y={130}
          w={440}
          h={46}
          m={morph}
          fill={COLORS.text}
          r={10}
        />
        <Box
          x={40}
          y={196}
          w={320}
          h={30}
          m={morph}
          fill={COLORS.muted}
          r={10}
        />
        <Box
          x={40}
          y={260}
          w={340}
          h={200}
          m={morph}
          fill="linear-gradient(140deg, #DBEAFE, #93C5FD)"
          r={22}
        />
        <Box
          x={420}
          y={260}
          w={340}
          h={200}
          m={morph}
          fill="linear-gradient(140deg, #E0F2FE, #60A5FA)"
          r={22}
        />
        {/* Primary button */}
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 500,
            width: 720,
            height: 96,
            borderRadius: 22,
            border: `3px dashed rgba(100,116,139,${0.6 * (1 - morph)})`,
            background: `rgba(37,99,235,${morph})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.white,
            fontSize: 40,
            fontWeight: 650,
            scale: String(1 - press * 0.05),
            boxShadow:
              press > 0
                ? `0 0 0 ${press * 24}px rgba(96,165,250,0.35)`
                : undefined,
          }}
        >
          <span style={{ opacity: morph }}>Start building →</span>
        </div>
      </div>

      {/* Cursor taps the button on "start karo" */}
      <div
        style={{
          position: "absolute",
          left: interpolate(cursorIn, [0, 1], [900, 620]),
          top: interpolate(cursorIn, [0, 1], [1500, 1330]),
          opacity: cursorIn,
          scale: String(1 - press * 0.15),
        }}
      >
        <MousePointer2
          size={72}
          color={COLORS.text}
          fill={COLORS.white}
          strokeWidth={1.8}
        />
      </div>
    </AbsoluteFill>
  );
};
