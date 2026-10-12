import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { Background } from "../Background";
import { COLORS, fontFamily } from "../theme";

type IntroProps = { readonly tagline: string };

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  angle: random(`angle-${i}`) * Math.PI * 2,
  distance: 260 + random(`dist-${i}`) * 420,
  size: 10 + random(`size-${i}`) * 22,
  delay: Math.floor(random(`delay-${i}`) * 6),
  color: i % 3 === 0 ? COLORS.violet : i % 3 === 1 ? COLORS.blue : COLORS.cyan,
}));

// Scene 2 (3s): logo scales in from 3x, particle burst behind it, tagline slides up.
const IntroInner: React.FC<IntroProps> = ({ tagline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoIn = spring({ frame, fps, config: { damping: 14 } });

  return (
    <>
      <Background glow={1.2} />
      <AbsoluteFill name="Particle burst" style={{ justifyContent: "center", alignItems: "center" }}>
        {PARTICLES.map((p, i) => {
          const t = spring({ frame: frame - 4 - p.delay, fps, config: { damping: 30, stiffness: 60 } });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 540 - p.size / 2,
                top: 860 - p.size / 2,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 1.5}px ${p.color}`,
                translate: `${Math.cos(p.angle) * p.distance * t}px ${Math.sin(p.angle) * p.distance * t}px`,
                opacity: interpolate(frame, [4 + p.delay, 10 + p.delay, 45, 65], [0, 1, 0.8, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            />
          );
        })}
      </AbsoluteFill>
      <Img
        name="Logo"
        src={staticFile("logo.png")}
        style={{
          position: "absolute",
          left: 90,
          top: 860 - 109,
          width: 900,
          scale: String(interpolate(logoIn, [0, 1], [3, 1])),
          opacity: interpolate(frame, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          filter: "drop-shadow(0 0 40px rgba(1,88,248,0.55))",
        }}
      />
      <Interactive.Div
        name="Tagline"
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1060,
          fontFamily,
          fontWeight: 700,
          fontSize: 64,
          color: COLORS.text,
          textAlign: "center",
          translate: interpolate(frame, [22, 42], ["0px 60px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          opacity: interpolate(frame, [22, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {tagline}
      </Interactive.Div>
    </>
  );
};

const introSchema = {
  tagline: { type: "string", default: "Engineering What’s Next.", description: "Tagline" },
} as const satisfies InteractivitySchema;

export const Intro = Interactive.withSchema({
  Component: IntroInner,
  componentName: "Intro",
  schema: introSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
