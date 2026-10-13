import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { body, display } from "../fonts";

export const ClockScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Clock scene"
      style={{
        backgroundColor: "#FFF4E3",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 120,
      }}
    >
      <Interactive.Svg
        name="Clock"
        width={460}
        height={460}
        viewBox="0 0 200 200"
        style={{
          scale: interpolate(frame, [0, 0.8 * fps], [0.6, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 14 }),
            output: "perceptual-scale",
          }),
          opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <circle
          cx={100}
          cy={100}
          r={92}
          fill="#FFFFFF"
          stroke="#2B1D14"
          strokeWidth={8}
        />
        {new Array(12).fill(true).map((_, i) => (
          <line
            key={i}
            x1={100}
            y1={18}
            x2={100}
            y2={i % 3 === 0 ? 34 : 28}
            stroke="#2B1D14"
            strokeWidth={i % 3 === 0 ? 6 : 3}
            strokeLinecap="round"
            transform={`rotate(${i * 30} 100 100)`}
          />
        ))}
        {/* Hour hand: sweeps to just past 12 */}
        <line
          x1={100}
          y1={100}
          x2={100}
          y2={52}
          stroke="#2B1D14"
          strokeWidth={9}
          strokeLinecap="round"
          transform={`rotate(${interpolate(frame, [0, 1.6 * fps], [-75, 15], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.65, 0, 0.35, 1),
          })} 100 100)`}
        />
        {/* Minute hand: spins to the half hour */}
        <line
          x1={100}
          y1={100}
          x2={100}
          y2={30}
          stroke="#E4572E"
          strokeWidth={6}
          strokeLinecap="round"
          transform={`rotate(${interpolate(frame, [0, 1.6 * fps], [-900, 180], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.65, 0, 0.35, 1),
          })} 100 100)`}
        />
        <circle cx={100} cy={100} r={8} fill="#E4572E" />
      </Interactive.Svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Interactive.Div
          name="Time"
          style={{
            fontFamily: body,
            fontWeight: 600,
            fontSize: 56,
            color: "#E4572E",
            letterSpacing: 4,
            opacity: interpolate(frame, [1.4 * fps, 1.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          12:30 PM
        </Interactive.Div>
        <Interactive.Div
          name="Headline"
          style={{
            fontFamily: display,
            fontWeight: 800,
            fontSize: 190,
            lineHeight: 0.95,
            color: "#2B1D14",
            opacity: interpolate(frame, [1.7 * fps, 2.3 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [1.7 * fps, 2.5 * fps],
              ["0px 60px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          Lunch
          <br />
          time.
        </Interactive.Div>
      </div>
    </AbsoluteFill>
  );
};
