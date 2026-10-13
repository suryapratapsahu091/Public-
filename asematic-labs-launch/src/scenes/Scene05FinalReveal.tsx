import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LogoMark } from "../components/LogoMark";
import { Wordmark } from "../components/Wordmark";
import { COLORS, FONT, TYPE } from "../styles/brand";
import { EASE, progress, settle, tween } from "../utils/animations";
import { BluePoint } from "./Scene04Opportunities";

type Props = {
  readonly headline: string;
  readonly support: string;
  readonly launchLabel: string;
  readonly parent: string;
};

const RAYS = 16;

// All text is in place by frame 66 (13.6 s); the last ~1.4 s is a stable hold.
export const Scene05FinalReveal: React.FC<Props> = ({ headline, support, launchLabel, parent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera pulls back from the point and settles.
  const camScale = tween(frame, [0, 64], [1.16, 1], EASE.out);

  // The point blooms, then hands over to the mark.
  const pointFade = 1 - progress(frame, 12, 22, EASE.soft);
  const burst = progress(frame, 6, 36, EASE.out);
  const structure = progress(frame, 10, 46, EASE.out);

  const markSpring = settle(frame, fps, 8);
  const markDraw = progress(frame, 8, 26, EASE.inOut);
  const markFill = progress(frame, 18, 32, EASE.soft);

  const head = progress(frame, 20, 38);
  const sup = progress(frame, 34, 52);
  const label = progress(frame, 46, 60);
  const par = progress(frame, 52, 66);

  // Highlight that glides once across the wordmark after everything has landed.
  const shine = interpolate(frame, [56, 80], [-0.25, 1.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.inOut });

  return (
    <AbsoluteFill>
      {/* Very light blue radial field behind the logo */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(42% 52% at 50% 44%, rgba(219,234,254,0.95) 0%, rgba(219,234,254,0.45) 45%, rgba(255,255,255,0) 100%)",
          opacity: progress(frame, 0, 30),
        }}
      />

      <AbsoluteFill style={{ scale: String(camScale) }}>
        {/* Geometric lines expand from the point, then settle into a quiet structure. */}
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <g transform="translate(960 540)">
            {new Array(RAYS).fill(0).map((_, i) => {
              const a = (i / RAYS) * Math.PI * 2 + Math.PI / RAYS;
              const r0 = 300 * burst;
              const r1 = 300 + 900 * burst;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * r0}
                  y1={Math.sin(a) * r0}
                  x2={Math.cos(a) * r1}
                  y2={Math.sin(a) * r1}
                  stroke={COLORS.electric}
                  strokeWidth={1.2}
                  opacity={interpolate(burst, [0, 0.4, 1], [0, 0.55, 0.12])}
                />
              );
            })}
            {[260, 380, 520].map((r, i) => (
              <circle
                key={r}
                r={r * interpolate(structure, [0, 1], [0.2, 1])}
                fill="none"
                stroke={i === 1 ? COLORS.sky : COLORS.pale}
                strokeWidth={i === 1 ? 1.4 : 2}
                strokeDasharray={i === 1 ? "2 10" : undefined}
                opacity={interpolate(structure, [0, 0.3, 1], [0, 0.9, i === 1 ? 0.55 : 0.8])}
                transform={`rotate(${frame * (i === 1 ? 0.12 : -0.06)})`}
              />
            ))}
            {/* Nodes riding on the middle ring */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i / 6) * Math.PI * 2 + frame * 0.002;
              const r = 380 * interpolate(structure, [0, 1], [0.2, 1]);
              return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={4} fill={COLORS.primary} opacity={structure * 0.7} />;
            })}
            {/* Expanding ring from the point */}
            <circle r={40 + burst * 760} fill="none" stroke={COLORS.primary} strokeWidth={2} opacity={(1 - burst) * 0.7} />
          </g>
        </svg>

        {pointFade > 0 ? (
          <AbsoluteFill style={{ opacity: pointFade }}>
            <BluePoint size={28 + (1 - pointFade) * 20} glow={1} />
          </AbsoluteFill>
        ) : null}

        {/* Lockup */}
        <AbsoluteFill style={{ alignItems: "center", flexDirection: "column", paddingTop: 168 }}>
          <div
            style={{
              ...TYPE.label,
              fontSize: 18,
              letterSpacing: "0.34em",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 26px 12px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.9)",
              border: `1px solid ${COLORS.pale}`,
              boxShadow: "0 8px 24px -12px rgba(37,99,235,0.35)",
              opacity: label,
              translate: `0 ${(1 - label) * -14}px`,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 5,
                background: COLORS.primary,
                boxShadow: `0 0 ${8 + 6 * Math.sin(frame / 6)}px rgba(37,99,235,0.8)`,
              }}
            />
            {launchLabel}
          </div>

          <div style={{ marginTop: 34, scale: String(interpolate(markSpring, [0, 1], [0.3, 1])), opacity: progress(frame, 8, 14) }}>
            <LogoMark size={210} draw={markDraw} fill={markFill} />
          </div>

          <div style={{ position: "relative", marginTop: 30 }}>
            <Wordmark fontSize={104} startFrame={18} mode="chars" shine={shine} />
          </div>

          <div
            style={{
              ...TYPE.display,
              fontSize: 60,
              fontWeight: 560,
              letterSpacing: "-0.03em",
              marginTop: 44,
              opacity: head,
              translate: `0 ${(1 - head) * 22}px`,
              filter: head < 0.98 ? `blur(${(1 - head) * 6}px)` : undefined,
            }}
          >
            {headline}
          </div>
          <div style={{ ...TYPE.support, fontSize: 29, marginTop: 18, opacity: sup, translate: `0 ${(1 - sup) * 14}px` }}>{support}</div>
        </AbsoluteFill>

        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 84 }}>
          <div style={{ fontFamily: FONT, fontSize: 21, fontWeight: 450, letterSpacing: "0.02em", color: COLORS.textSecondary, opacity: par }}>
            {parent}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
