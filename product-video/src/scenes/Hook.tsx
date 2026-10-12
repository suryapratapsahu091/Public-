import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  type InteractivitySchema,
} from "remotion";
import { Background } from "../Background";
import { COLORS, fontFamily, SAFE } from "../theme";

type HookProps = { readonly question: string };

// Scene 1 (3s): pain-point question slams in from 2x, holds, fades out.
const HookInner: React.FC<HookProps> = ({ question }) => {
  const frame = useCurrentFrame();

  return (
    <>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: `${SAFE.top}px ${SAFE.side}px ${SAFE.bottom}px`,
        }}
      >
        <Interactive.Div
          name="Question"
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 104,
            lineHeight: 1.08,
            letterSpacing: -2,
            color: COLORS.text,
            textAlign: "center",
            textShadow: "0 0 60px rgba(1,88,248,0.6)",
            scale: interpolate(frame, [0, 18], [2, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 12 }),
              output: "perceptual-scale",
            }),
            opacity:
              interpolate(frame, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
              interpolate(frame, [72, 88], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {question}
        </Interactive.Div>
      </AbsoluteFill>
    </>
  );
};

const hookSchema = {
  question: { type: "string", default: "Got an idea but no tech team?", description: "Hook question" },
} as const satisfies InteractivitySchema;

export const Hook = Interactive.withSchema({
  Component: HookInner,
  componentName: "Hook",
  schema: hookSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
