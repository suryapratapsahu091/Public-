import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { Background } from "../Background";
import { COLORS, fontFamily, SAFE } from "../theme";

type CtaProps = { readonly headline: string; readonly url: string };

// Scene 6 (3s): logo, call to action, pulsing URL above the bottom safe zone, fade to black.
// No social-proof counter: there are no verified numbers to show.
const CtaInner: React.FC<CtaProps> = ({ headline, url }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });

  return (
    <>
      <Background glow={1.1} />
      <Img
        name="Logo"
        src={staticFile("logo.png")}
        style={{
          position: "absolute",
          left: 90,
          top: 640,
          width: 900,
          opacity: enter,
          scale: String(0.92 + 0.08 * enter),
          filter: "drop-shadow(0 0 40px rgba(1,88,248,0.5))",
        }}
      />
      <Interactive.Div
        name="CTA headline"
        style={{
          position: "absolute",
          left: SAFE.side,
          right: SAFE.side,
          top: 960,
          fontFamily,
          fontWeight: 800,
          fontSize: 76,
          lineHeight: 1.1,
          color: COLORS.text,
          textAlign: "center",
          opacity: interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: interpolate(frame, [8, 26], ["0px 40px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {headline}
      </Interactive.Div>
      <Interactive.Div
        name="URL"
        style={{
          position: "absolute",
          left: 190,
          right: 190,
          bottom: SAFE.bottom + 140,
          padding: "26px 0",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.violet})`,
          boxShadow: "0 0 50px rgba(1,88,248,0.55)",
          fontFamily,
          fontWeight: 700,
          fontSize: 52,
          color: "white",
          textAlign: "center",
          opacity: interpolate(frame, [16, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          scale: String(1 + 0.015 * (1 - Math.cos(((frame - 16) / 30) * Math.PI * 2))),
        }}
      >
        {url}
      </Interactive.Div>
      <AbsoluteFill
        name="Fade to black"
        style={{
          backgroundColor: "black",
          opacity: interpolate(frame, [72, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />
    </>
  );
};

const ctaSchema = {
  headline: { type: "string", default: "Let’s build what’s next.", description: "Call to action" },
  url: { type: "string", default: "asematic.com", description: "Website" },
} as const satisfies InteractivitySchema;

export const Cta = Interactive.withSchema({
  Component: CtaInner,
  componentName: "Cta",
  schema: ctaSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
