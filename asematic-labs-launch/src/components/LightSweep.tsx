import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE } from "../utils/animations";

type Props = {
  /** Tilt of the beam in degrees. */
  readonly angle?: number;
  /** Peak strength of the pale-blue wash that trails the beam. */
  readonly wash?: number;
};

/**
 * A bright blue line that travels across the frame with a soft volumetric glow and a pale-blue
 * wash behind it. Its duration is the duration of the enclosing Sequence.
 */
export const LightSweep: React.FC<Props> = ({ angle = 14, wash = 0.55 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });
  const x = interpolate(p, [0, 1], [-0.25 * width, 1.25 * width]);
  const presence = Math.sin(p * Math.PI);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {/* Trailing wash */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${90 + angle}deg, rgba(219,234,254,0) 0%, rgba(219,234,254,${wash * presence}) ${p * 100 - 12}%, rgba(255,255,255,${0.7 * presence}) ${p * 100}%, rgba(255,255,255,0) ${p * 100 + 6}%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: x,
          height: "140%",
          width: 0,
          rotate: `${angle}deg`,
          opacity: presence,
        }}
      >
        {/* Wide glow */}
        <div
          style={{
            position: "absolute",
            left: -220,
            width: 440,
            height: "100%",
            background: "linear-gradient(90deg, rgba(96,165,250,0) 0%, rgba(96,165,250,0.32) 50%, rgba(96,165,250,0) 100%)",
            filter: "blur(30px)",
          }}
        />
        {/* Mid glow */}
        <div
          style={{
            position: "absolute",
            left: -40,
            width: 80,
            height: "100%",
            background: "linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.55) 50%, rgba(59,130,246,0) 100%)",
            filter: "blur(10px)",
          }}
        />
        {/* Core line */}
        <div
          style={{
            position: "absolute",
            left: -2,
            width: 4,
            height: "100%",
            background: "linear-gradient(180deg, rgba(37,99,235,0) 0%, #2563EB 30%, #93C5FD 50%, #2563EB 70%, rgba(37,99,235,0) 100%)",
            boxShadow: "0 0 18px rgba(37,99,235,0.8)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
