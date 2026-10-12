import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "./theme";

// Dark navy backdrop with a slowly drifting brand-colour radial glow.
export const Background: React.FC<{ readonly glow?: number }> = ({ glow = 1 }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 40) * 60;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        backgroundImage: [
          `radial-gradient(circle at ${540 + drift}px ${820 - drift}px, rgba(1,88,248,${0.42 * glow}) 0px, rgba(1,88,248,0) 620px)`,
          `radial-gradient(circle at ${300 - drift}px 1450px, rgba(139,92,246,${0.25 * glow}) 0px, rgba(139,92,246,0) 560px)`,
          `radial-gradient(circle at 540px 960px, ${COLORS.navy} 0px, ${COLORS.bg} 1100px)`,
        ].join(","),
      }}
    />
  );
};
