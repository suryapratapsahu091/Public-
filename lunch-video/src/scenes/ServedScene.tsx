import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { body, display } from "../fonts";

export const ServedScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Served scene"
      style={{
        backgroundColor: "#E4572E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      <Interactive.Div
        name="Headline"
        style={{
          fontFamily: display,
          fontWeight: 800,
          fontSize: 200,
          color: "#FFF4E3",
          scale: interpolate(frame, [0, 0.8 * fps], [0.85, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
          opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Lunch is served.
      </Interactive.Div>
      <Interactive.Div
        name="Details"
        style={{
          fontFamily: body,
          fontWeight: 600,
          fontSize: 56,
          color: "#2B1D14",
          backgroundColor: "#FFF4E3",
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 48,
          paddingRight: 48,
          borderRadius: 999,
          opacity: interpolate(frame, [0.7 * fps, 1.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.7 * fps, 1.4 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Cafeteria, Level 2 · 12:00 – 2:00 PM
      </Interactive.Div>
    </AbsoluteFill>
  );
};
