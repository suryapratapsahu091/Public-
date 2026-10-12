import {
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
import { VISUAL_CENTER_Y } from "./Showcase";

type FeaturesProps = { readonly feature1: string; readonly feature2: string; readonly feature3: string };

const ICONS = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  star: <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" />,
};

const TOP_CENTER_Y = SAFE.top + (VISUAL.height * 0.4) / 2 + 30;

// Scene 5 (3s): the dashboard shrinks to the top, three benefit lines slide in from the right.
const FeaturesInner: React.FC<FeaturesProps> = ({ feature1, feature2, feature3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shrink = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });
  const lines = [
    { text: feature1, icon: ICONS.check, color: COLORS.blue },
    { text: feature2, icon: ICONS.bolt, color: COLORS.violet },
    { text: feature3, icon: ICONS.star, color: COLORS.cyan },
  ];

  const fadeOut = interpolate(frame, [76, 90], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <>
      <Background glow={0.9} />
      <div
        style={{
          opacity: fadeOut,
          position: "absolute",
          left: (1080 - VISUAL.width) / 2,
          top: VISUAL_CENTER_Y - VISUAL.height / 2,
          translate: `0px ${interpolate(shrink, [0, 1], [0, TOP_CENTER_Y - VISUAL_CENTER_Y])}px`,
          scale: String(interpolate(shrink, [0, 1], [1, 0.4])),
        }}
      >
        <ProductVisual kind="saas" />
      </div>
      {lines.map((line, i) => {
        const s = spring({ frame: frame - 14 - i * 10, fps, config: { damping: 16 } });
        return (
          <Interactive.Div
            key={i}
            name={`Feature ${i + 1}`}
            style={{
              position: "absolute",
              left: SAFE.side + 20,
              right: SAFE.side,
              top: 760 + i * 230,
              display: "flex",
              alignItems: "center",
              gap: 32,
              fontFamily,
              fontWeight: 700,
              fontSize: 54,
              lineHeight: 1.15,
              color: COLORS.text,
              translate: `${(1 - s) * 900}px 0px`,
              opacity: Math.min(1, s * 2) * fadeOut,
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                flexShrink: 0,
                borderRadius: 28,
                backgroundColor: line.color,
                boxShadow: `0 0 36px ${line.color}99`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                {line.icon}
              </svg>
            </div>
            {line.text}
          </Interactive.Div>
        );
      })}
    </>
  );
};

const featuresSchema = {
  feature1: { type: "string", default: "Custom software, built to scale", description: "Feature 1" },
  feature2: { type: "string", default: "AI built into your product", description: "Feature 2" },
  feature3: { type: "string", default: "SaaS from idea to launch", description: "Feature 3" },
} as const satisfies InteractivitySchema;

export const Features = Interactive.withSchema({
  Component: FeaturesInner,
  componentName: "Features",
  schema: featuresSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
