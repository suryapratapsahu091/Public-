import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../styles/brand";

/**
 * Bright white canvas with slow-moving pale-blue light pools and a faint dot grid.
 * Rendered once under all scenes so the backdrop never cuts.
 */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const ax = 30 + Math.sin(t * 0.35) * 8;
  const ay = 28 + Math.cos(t * 0.3) * 6;
  const bx = 74 + Math.cos(t * 0.27) * 7;
  const by = 72 + Math.sin(t * 0.33) * 6;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.white }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 70% at ${ax}% ${ay}%, rgba(219,234,254,0.75) 0%, rgba(219,234,254,0) 70%),
            radial-gradient(55% 65% at ${bx}% ${by}%, rgba(191,219,254,0.55) 0%, rgba(191,219,254,0) 70%),
            linear-gradient(180deg, ${COLORS.white} 0%, ${COLORS.alt} 100%)`,
        }}
      />
      {/* Faint dot grid, masked so it fades toward the edges. */}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(37,99,235,0.16) 1.2px, transparent 1.4px)",
          backgroundSize: "36px 36px",
          backgroundPosition: `${(frame * 0.15) % 36}px ${(frame * 0.08) % 36}px`,
          maskImage: "radial-gradient(70% 70% at 50% 50%, rgba(0,0,0,0.55), rgba(0,0,0,0) 100%)",
          WebkitMaskImage: "radial-gradient(70% 70% at 50% 50%, rgba(0,0,0,0.55), rgba(0,0,0,0) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
