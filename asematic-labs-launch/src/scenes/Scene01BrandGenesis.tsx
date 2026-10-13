import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Wordmark } from "../components/Wordmark";
import { COLORS, FONT, TYPE } from "../styles/brand";
import { EASE, bezierPoint, progress, rand, tween } from "../utils/animations";

type Props = {
  readonly tagline: string;
};

// ---- 3D node network the camera flies through ----
const FOCAL = 900;
const NODES = new Array(26).fill(0).map((_, i) => ({
  x: rand(`n-x-${i}`, -1100, 1100),
  y: rand(`n-y-${i}`, -650, 650),
  z: rand(`n-z-${i}`, 900, 3400),
}));
// Each node links to its two nearest neighbours: a deterministic, tidy constellation.
const EDGES: [number, number][] = [];
NODES.forEach((a, i) => {
  const nearest = NODES.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y, (a.z - b.z) * 0.6) }))
    .filter((n) => n.j !== i)
    .sort((p, q) => p.d - q.d)
    .slice(0, 2);
  for (const n of nearest) {
    if (!EDGES.some(([p, q]) => (p === i && q === n.j) || (p === n.j && q === i))) EDGES.push([i, n.j]);
  }
});

// ---- Hero light paths (cubic Béziers in screen space) ----
type Curve = [[number, number], [number, number], [number, number], [number, number]];
const CURVES: { c: Curve; delay: number; width: number }[] = [
  { c: [[-120, 820], [520, 900], [980, 260], [2040, 330]], delay: 0, width: 3 },
  { c: [[-120, 700], [600, 760], [1100, 220], [2040, 240]], delay: 5, width: 1.6 },
  { c: [[-120, 930], [700, 960], [1260, 420], [2040, 470]], delay: 9, width: 1.2 },
];
const toPath = ([p0, p1, p2, p3]: Curve) => `M${p0[0]} ${p0[1]} C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`;

export const Scene01BrandGenesis: React.FC<Props> = ({ tagline }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;

  // Camera travels forward through the network, decelerating as the wordmark arrives.
  const camZ = tween(frame, [0, 62], [0, 1500], EASE.out);
  // A slight drift so the move never feels mechanical.
  const camX = tween(frame, [0, 70], [-60, 30], EASE.inOut);
  const camY = tween(frame, [0, 70], [40, -10], EASE.inOut);

  const project = (n: (typeof NODES)[number]) => {
    const depth = n.z - camZ;
    const s = FOCAL / Math.max(depth, 1);
    return { x: cx + (n.x - camX) * s, y: cy + (n.y - camY) * s, s, depth };
  };
  const projected = NODES.map(project);

  // Opening close-up: the camera tracks the head of the main light path, magnified, then pulls
  // back to the full frame. screen = P * zoom + offset; offset blends to 0 as zoom reaches 1.
  const zoom = tween(frame, [0, 36], [2.1, 1], EASE.inOut);
  const follow = 1 - progress(frame, 6, 36, EASE.inOut);
  const [headX, headY] = bezierPoint(progress(frame, -4, 30, EASE.inOut), ...CURVES[0].c);
  const anchor = [700, 600];
  const offX = (anchor[0] - zoom * headX) * follow + (1 - follow) * (cx - zoom * cx);
  const offY = (anchor[1] - zoom * headY) * follow + (1 - follow) * (cy - zoom * cy);
  const networkFade = interpolate(frame, [40, 64], [1, 0.45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const rule = progress(frame, 34, 54, EASE.out);
  const taglineWords = tagline.split(" ");
  // Push-in as the light sweep hands over to scene 2.
  const exitPush = tween(frame, [58, 80], [1, 1.06], EASE.in);

  return (
    <AbsoluteFill style={{ scale: String(exitPush) }}>
      {/* Network */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: networkFade }}>
        {EDGES.map(([a, b], i) => {
          const p = projected[a];
          const q = projected[b];
          if (p.depth < 80 || q.depth < 80) return null;
          const draw = progress(frame, 2 + (i % 9) * 2.5, 20 + (i % 9) * 2.5, EASE.soft);
          const near = Math.min(1, Math.max(p.s, q.s) * 1.2);
          return (
            <line
              key={i}
              x1={p.x}
              y1={p.y}
              x2={p.x + (q.x - p.x) * draw}
              y2={p.y + (q.y - p.y) * draw}
              stroke={COLORS.electric}
              strokeOpacity={0.12 + near * 0.4}
              strokeWidth={0.6 + near * 1.6}
            />
          );
        })}
        {projected.map((p, i) => {
          if (p.depth < 80) return null;
          const r = Math.min(14, 2 + p.s * 7);
          const appear = progress(frame, (i % 7) * 2, 14 + (i % 7) * 2);
          return (
            <g key={i} opacity={appear}>
              <circle cx={p.x} cy={p.y} r={r * 3} fill={COLORS.sky} opacity={0.12} />
              <circle cx={p.x} cy={p.y} r={r} fill={COLORS.white} stroke={COLORS.primary} strokeWidth={Math.max(1, r * 0.35)} />
            </g>
          );
        })}
      </svg>

      {/* Hero light paths with glowing heads */}
      <AbsoluteFill style={{ transform: `translate(${offX}px, ${offY}px) scale(${zoom})`, transformOrigin: "0 0" }}>
        <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id="heroStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={COLORS.sky} stopOpacity={0} />
              <stop offset="0.45" stopColor={COLORS.electric} />
              <stop offset="1" stopColor={COLORS.primary} />
            </linearGradient>
            <filter id="heroGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          {CURVES.map(({ c, delay, width: w }, i) => {
            const t = progress(frame, delay - 4, delay + 30, EASE.inOut);
            const fadeOut = interpolate(frame, [44, 70], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const [hx, hy] = bezierPoint(t, ...c);
            return (
              <g key={i} opacity={fadeOut}>
                <path d={toPath(c)} pathLength={1} fill="none" stroke={COLORS.sky} strokeWidth={w * 4} strokeDasharray="1 1" strokeDashoffset={1 - t} filter="url(#heroGlow)" opacity={0.6} />
                <path d={toPath(c)} pathLength={1} fill="none" stroke="url(#heroStroke)" strokeWidth={w} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - t} />
                {t > 0 && t < 1 ? (
                  <>
                    <circle cx={hx} cy={hy} r={w * 9} fill={COLORS.sky} opacity={0.35} filter="url(#heroGlow)" />
                    <circle cx={hx} cy={hy} r={w * 2.2} fill={COLORS.white} stroke={COLORS.primary} strokeWidth={1.5} />
                  </>
                ) : null}
              </g>
            );
          })}
          {/* Illuminated nodes left behind on the main path */}
          {[0.18, 0.36, 0.55, 0.72, 0.88].map((at, i) => {
            const t = progress(frame, -4, 30, EASE.inOut);
            const [x, y] = bezierPoint(at, ...CURVES[0].c);
            const on = interpolate(t, [at, at + 0.06], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <g key={i} opacity={on * interpolate(frame, [44, 70], [1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
                <circle cx={x} cy={y} r={14 * on} fill="none" stroke={COLORS.sky} strokeWidth={1.2} />
                <circle cx={x} cy={y} r={4} fill={COLORS.primary} />
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>

      {/* Soft white bloom behind the wordmark keeps it crisp against the lines. */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(34% 26% at 50% 50%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.75) 45%, rgba(255,255,255,0) 100%)",
          opacity: progress(frame, 18, 40),
        }}
      />

      {/* Wordmark, rule and tagline */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <Wordmark fontSize={118} startFrame={26} mode="mask" />
        <div style={{ position: "relative", width: 620, height: 2, marginTop: 30 }}>
          <div
            style={{
              position: "absolute",
              left: `${50 - rule * 50}%`,
              width: `${rule * 100}%`,
              height: 2,
              background: `linear-gradient(90deg, rgba(37,99,235,0), ${COLORS.primary} 20%, ${COLORS.sky} 50%, ${COLORS.primary} 80%, rgba(37,99,235,0))`,
            }}
          />
          {[0, 1].map((side) => (
            <div
              key={side}
              style={{
                position: "absolute",
                top: -3,
                left: side === 0 ? `${50 - rule * 50}%` : undefined,
                right: side === 1 ? `${50 - rule * 50}%` : undefined,
                width: 8,
                height: 8,
                borderRadius: 4,
                background: COLORS.primary,
                opacity: rule,
                boxShadow: "0 0 10px rgba(37,99,235,0.7)",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 30, fontFamily: FONT }}>
          {taglineWords.map((word, i) => {
            const p = progress(frame, 42 + i * 5, 58 + i * 5);
            return (
              <span
                key={word}
                style={{
                  ...TYPE.support,
                  fontSize: 40,
                  fontWeight: 450,
                  color: i === taglineWords.length - 1 ? COLORS.primary : COLORS.textSecondary,
                  opacity: p,
                  translate: `0 ${(1 - p) * 18}px`,
                  filter: p < 0.98 ? `blur(${(1 - p) * 6}px)` : undefined,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
