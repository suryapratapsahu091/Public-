import {
  AbsoluteFill,
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { Background } from "../Background";
import { ProductVisual, VISUAL } from "../ProductVisual";
import { COLORS, fontFamily, SAFE } from "../theme";

type ShowcaseProps = { readonly headline1: string; readonly headline2: string; readonly headline3: string };

export const VISUAL_CENTER_Y = 900;
const SLOT = 50; // frames per visual (~1.5s hold + crossfade)
const FADE = 10;

// Scene 4 (5s): three product visuals crossfade, each with its own feature headline.
const ShowcaseInner: React.FC<ShowcaseProps> = ({ headline1, headline2, headline3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    { kind: "web" as const, headline: headline1 },
    { kind: "ai" as const, headline: headline2 },
    { kind: "saas" as const, headline: headline3 },
  ];

  const visibility = (i: number) => {
    const start = i * SLOT;
    const fadeIn = i === 0 ? 1 : interpolate(frame, [start - FADE / 2, start + FADE / 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeOut = i === items.length - 1 ? 1 : interpolate(frame, [start + SLOT - FADE / 2, start + SLOT + FADE / 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return fadeIn * fadeOut;
  };

  return (
    <>
      <Background glow={0.9} />
      {items.map((item, i) => {
        const v = visibility(i);
        if (v <= 0) return null;
        const enter = spring({ frame: frame - i * SLOT + FADE / 2, fps, config: { damping: 200 } });
        return (
          <AbsoluteFill key={item.kind} style={{ opacity: v }}>
            <Interactive.Div
              name={`Headline ${i + 1}`}
              style={{
                position: "absolute",
                left: SAFE.side,
                right: SAFE.side,
                top: 300,
                fontFamily,
                fontWeight: 700,
                fontSize: 64,
                lineHeight: 1.1,
                color: COLORS.text,
                textAlign: "center",
                translate: `0px ${(1 - enter) * 24}px`,
              }}
            >
              {item.headline}
            </Interactive.Div>
            <div
              style={{
                position: "absolute",
                left: (1080 - VISUAL.width) / 2,
                top: VISUAL_CENTER_Y - VISUAL.height / 2,
                scale: String(i === 0 ? 0.9 + 0.1 * enter : 0.96 + 0.04 * enter),
              }}
            >
              <ProductVisual kind={item.kind} grow={i === 2 ? interpolate(frame, [2 * SLOT, 2 * SLOT + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1} />
            </div>
          </AbsoluteFill>
        );
      })}
    </>
  );
};

const showcaseSchema = {
  headline1: { type: "string", default: "Websites that convert", description: "Headline for visual 1" },
  headline2: { type: "string", default: "AI that works for you", description: "Headline for visual 2" },
  headline3: { type: "string", default: "SaaS you can scale", description: "Headline for visual 3" },
} as const satisfies InteractivitySchema;

export const Showcase = Interactive.withSchema({
  Component: ShowcaseInner,
  componentName: "Showcase",
  schema: showcaseSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
