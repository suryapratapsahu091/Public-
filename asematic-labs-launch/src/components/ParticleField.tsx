import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { rand } from "../utils/animations";

type Props = {
  readonly count?: number;
  readonly seed?: string;
  readonly opacity?: number;
  /** Multiplies drift speed; larger values feel like faster camera travel. */
  readonly speed?: number;
};

/**
 * Sparse, deterministic particles on three depth layers. Near particles are larger, softer and
 * move faster, which reads as parallax.
 */
export const ParticleField: React.FC<Props> = ({ count = 44, seed = "p", opacity = 1, speed = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {new Array(count).fill(0).map((_, i) => {
        const depth = rand(`${seed}-d-${i}`, 0.25, 1);
        const x0 = rand(`${seed}-x-${i}`) * width;
        const y0 = rand(`${seed}-y-${i}`) * height;
        const vy = (6 + depth * 22) * speed;
        const vx = rand(`${seed}-vx-${i}`, -6, 6) * speed;
        const y = (((y0 - (frame / 30) * vy) % height) + height) % height;
        const x = (((x0 + (frame / 30) * vx) % width) + width) % width;
        const size = 2 + depth * 5;
        const twinkle = 0.55 + 0.45 * Math.sin(frame / (14 + depth * 10) + i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: depth > 0.7 ? "rgba(96,165,250,0.9)" : "rgba(37,99,235,0.85)",
              boxShadow: `0 0 ${6 + depth * 10}px rgba(59,130,246,0.6)`,
              opacity: (0.15 + depth * 0.45) * twinkle,
              filter: depth > 0.85 ? "blur(1.5px)" : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
