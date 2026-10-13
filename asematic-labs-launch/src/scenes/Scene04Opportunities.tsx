import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { LearningCard } from "../components/LearningCards";
import { COLORS, TYPE } from "../styles/brand";
import { EASE, drift, progress } from "../utils/animations";
import { CAMERA_ORIGIN, cameraTransform, cardRect, scene4Camera } from "../utils/cardLayout";

type Props = {
  readonly headline: string;
  readonly support: string;
};

// Convergence into the central point that opens Scene 5.
const CONVERGE_START = 82;
const CONVERGE_END = 104;

/** Central glowing point: the seed of the final reveal (shared look with Scene 5). */
export const BluePoint: React.FC<{ readonly size: number; readonly glow: number }> = ({ size, glow }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        width: size * 9,
        height: size * 9,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(96,165,250,0.45) 0%, rgba(96,165,250,0) 70%)",
        opacity: glow,
      }}
    />
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${COLORS.sky}, ${COLORS.primary} 60%, ${COLORS.deep})`,
        boxShadow: `0 0 ${size}px rgba(37,99,235,${0.6 * glow}), 0 0 ${size * 3}px rgba(96,165,250,${0.45 * glow})`,
      }}
    />
  </AbsoluteFill>
);

export const Scene04Opportunities: React.FC<Props> = ({ headline, support }) => {
  const frame = useCurrentFrame();
  const cam = scene4Camera(frame);
  const converge = progress(frame, CONVERGE_START, CONVERGE_END, EASE.inOut);
  const copy = progress(frame, 18, 38) * (1 - progress(frame, CONVERGE_START - 4, CONVERGE_START + 8, EASE.soft));
  const point = progress(frame, CONVERGE_START + 10, CONVERGE_END, EASE.out);
  const idle = progress(frame, 0, 30, EASE.soft); // floating motion eases in so the hand-over is exact

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: cameraTransform(cam), transformOrigin: CAMERA_ORIGIN }}>
        {[0, 1, 2, 3].map((i) => {
          const r = cardRect(i);
          const reveal = progress(frame, 6 + i * 7, 40 + i * 7, EASE.out);
          // Each card slides toward the centre point, shrinking and tilting slightly.
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const k = progress(frame, CONVERGE_START + (i === 0 || i === 3 ? 0 : 3), CONVERGE_END, EASE.inOut);
          return (
            <LearningCard
              key={i}
              index={i}
              reveal={reveal}
              frame={frame}
              style={{
                left: r.left + (960 - cx) * k,
                top: r.top + (540 - cy) * k + drift(frame, i * 3, 7, 100) * idle,
                scale: String(interpolate(k, [0, 1], [1, 0.06])),
                rotate: `${(i - 1.5) * 6 * k}deg`,
                opacity: interpolate(k, [0, 0.8, 1], [1, 1, 0]),
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* Converging light trails */}
      {converge > 0 && converge < 1 ? (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {[-1, 1].flatMap((side) =>
            [0, 1, 2].map((j) => {
              const y = 540 + (j - 1) * 120 * (1 - converge);
              const x0 = 960 + side * 960 * (1 - converge);
              return (
                <line
                  key={`${side}-${j}`}
                  x1={x0}
                  y1={y}
                  x2={960 + side * 60 * (1 - converge)}
                  y2={540}
                  stroke={COLORS.electric}
                  strokeWidth={2 - j * 0.4}
                  strokeLinecap="round"
                  opacity={Math.sin(converge * Math.PI) * 0.6}
                />
              );
            }),
          )}
        </svg>
      ) : null}

      {point > 0 ? <BluePoint size={10 + point * 18} glow={point} /> : null}

      {/* Copy in screen space */}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 104, opacity: copy }}>
        <div style={{ ...TYPE.display, fontSize: 88, display: "flex", gap: 28 }}>
          {headline.split(" ").map((w, i) => {
            const p = progress(frame, 18 + i * 6, 38 + i * 6);
            return (
              <span key={w} style={{ opacity: p, translate: `0 ${(1 - p) * 26}px`, color: i === 2 ? COLORS.primary : COLORS.text }}>
                {w}
              </span>
            );
          })}
        </div>
        <div style={{ ...TYPE.support, fontSize: 32, marginTop: 16, opacity: progress(frame, 32, 50) }}>{support}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
