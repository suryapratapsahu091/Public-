import { ArrowDown, BookOpen, Rocket } from "lucide-react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LogoMark } from "../../components/LogoMark";
import { Wordmark } from "../../components/Wordmark";
import { COLORS, FONT, SHADOWS, TYPE } from "../../styles/brand";
import { EASE, glide, progress, settle } from "../../utils/animations";
import { REEL_SCENES, cue } from "../timing";

type Props = { readonly label: string };

const F = REEL_SCENES.intro.from;

const Card: React.FC<{
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly meta: string;
  readonly style?: React.CSSProperties;
  readonly glow?: number;
  readonly dim?: number;
  readonly strike?: number;
}> = ({ icon, title, meta, style, glow = 0, dim = 0, strike = 0 }) => (
  <div
    style={{
      position: "relative",
      width: 820,
      padding: "34px 40px",
      borderRadius: 32,
      background: COLORS.white,
      border: `2px solid ${glow > 0 ? `rgba(37,99,235,${0.25 + glow * 0.75})` : COLORS.pale}`,
      boxShadow:
        glow > 0
          ? `${SHADOWS.float}, 0 0 ${60 * glow}px rgba(59,130,246,${0.35 * glow})`
          : SHADOWS.card,
      display: "flex",
      alignItems: "center",
      gap: 30,
      fontFamily: FONT,
      opacity: 1 - dim * 0.55,
      filter: dim > 0.01 ? `grayscale(${dim})` : undefined,
      ...style,
    }}
  >
    <div
      style={{
        width: 104,
        height: 104,
        borderRadius: 26,
        background: COLORS.pale,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div
        style={{
          fontSize: 50,
          fontWeight: 650,
          letterSpacing: "-0.02em",
          color: COLORS.text,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 30, color: COLORS.textSecondary, marginTop: 6 }}>
        {meta}
      </div>
    </div>
    {/* Strike-through for "sirf concepts nahi" */}
    <div
      style={{
        position: "absolute",
        left: 30,
        top: "50%",
        height: 6,
        borderRadius: 3,
        width: `${strike * 92}%`,
        background: COLORS.textSecondary,
        opacity: 0.7,
      }}
    />
  </div>
);

/** 3.5-10.5 s: "Introducing Asematic Labs", then concepts give way to real-world projects. */
export const ReelIntro: React.FC<Props> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const markIn = settle(frame, fps, cue(1, 0, F) - 6);
  const draw = progress(frame, cue(1, 0, F) - 6, cue(1, 0.8, F), EASE.inOut);
  const fill = progress(frame, cue(1, 0.6, F), cue(1, 1.1, F));
  const labelIn = progress(frame, cue(1, 0, F), cue(1, 0.6, F));

  // Lockup rises and shrinks when the second line starts.
  const lift = progress(frame, cue(2, -0.2, F), cue(2, 0.8, F), EASE.inOut);
  const pill = glide(frame, fps, cue(2, 1.1, F));
  const concepts = glide(frame, fps, cue(2, 2.0, F));
  const projects = glide(frame, fps, cue(2, 2.5, F));
  const nahi = progress(frame, cue(2, 3.6, F), cue(2, 4.1, F), EASE.inOut);
  const glow = progress(frame, cue(2, 3.9, F), cue(2, 4.4, F));

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: interpolate(lift, [0, 1], [560, 250]),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          scale: String(interpolate(lift, [0, 1], [1, 0.74])),
          transformOrigin: "50% 0%",
        }}
      >
        <div style={{ scale: String(interpolate(markIn, [0, 1], [0.3, 1])) }}>
          <LogoMark size={230} draw={draw} fill={fill} />
        </div>
        <div
          style={{
            ...TYPE.label,
            fontSize: 30,
            letterSpacing: "0.4em",
            marginTop: 44,
            opacity: labelIn,
            translate: `0 ${(1 - labelIn) * 16}px`,
          }}
        >
          {label}
        </div>
        <Wordmark
          fontSize={86}
          startFrame={cue(1, 0.95, F)}
          mode="chars"
          style={{ marginTop: 22 }}
        />
      </div>

      <div
        style={{
          ...TYPE.label,
          position: "absolute",
          top: 760,
          fontSize: 26,
          padding: "14px 30px",
          borderRadius: 999,
          background: COLORS.pale,
          color: COLORS.deep,
          opacity: interpolate(pill, [0, 0.4], [0, 1], {
            extrapolateRight: "clamp",
          }),
          translate: `0 ${(1 - pill) * 30}px`,
        }}
      >
        A learning initiative
      </div>

      <div
        style={{
          position: "absolute",
          top: 880,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
        }}
      >
        <Card
          icon={<BookOpen size={56} color={COLORS.primary} strokeWidth={2} />}
          title="Concepts"
          meta="Theory · Notes · Slides"
          dim={nahi}
          strike={nahi}
          style={{
            opacity:
              interpolate(concepts, [0, 0.4], [0, 1], {
                extrapolateRight: "clamp",
              }) *
              (1 - nahi * 0.5),
            translate: `0 ${(1 - concepts) * 60}px`,
          }}
        />
        <ArrowDown
          size={56}
          color={COLORS.sky}
          strokeWidth={2.4}
          style={{
            opacity: projects,
            translate: `0 ${(1 - projects) * -20}px`,
          }}
        />
        <Card
          icon={<Rocket size={56} color={COLORS.primary} strokeWidth={2} />}
          title="Real-world projects"
          meta="Build skills by building"
          glow={glow}
          style={{
            opacity: interpolate(projects, [0, 0.4], [0, 1], {
              extrapolateRight: "clamp",
            }),
            translate: `0 ${(1 - projects) * 60}px`,
            scale: String(1 + glow * 0.04),
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
