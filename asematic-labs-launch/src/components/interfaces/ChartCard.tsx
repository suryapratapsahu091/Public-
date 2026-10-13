import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT, SHADOWS } from "../../styles/brand";
import { EASE } from "../../utils/animations";

const BARS = [
  { label: "Mon", v: 0.46 },
  { label: "Tue", v: 0.62 },
  { label: "Wed", v: 0.55 },
  { label: "Thu", v: 0.78 },
  { label: "Fri", v: 0.7 },
  { label: "Sat", v: 0.9 },
];

type Props = { readonly start: number; readonly style?: React.CSSProperties };

/** Data-visualisation tile: model accuracy ring plus a daily bar chart. */
export const ChartCard: React.FC<Props> = ({ start, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.out });
  const r = 46;
  const circ = 2 * Math.PI * r;
  const acc = 0.94;

  return (
    <div
      style={{
        position: "absolute",
        width: 470,
        height: 250,
        borderRadius: 18,
        padding: "22px 26px",
        background: "linear-gradient(165deg, #FFFFFF, #F8FBFF)",
        border: "1px solid rgba(219,234,254,0.95)",
        boxShadow: SHADOWS.float,
        fontFamily: FONT,
        color: COLORS.text,
        display: "flex",
        gap: 26,
        ...style,
      }}
    >
      <div style={{ width: 120 }}>
        <div style={{ fontSize: 14, color: COLORS.textSecondary }}>Model accuracy</div>
        <svg width={120} height={120} viewBox="0 0 120 120" style={{ marginTop: 14 }}>
          <circle cx={60} cy={60} r={r} fill="none" stroke={COLORS.pale} strokeWidth={10} />
          <circle
            cx={60}
            cy={60}
            r={r}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${circ * acc * p} ${circ}`}
            transform="rotate(-90 60 60)"
          />
          <text x={60} y={67} textAnchor="middle" fontSize={22} fontWeight={650} fill={COLORS.text} fontFamily={FONT}>
            {Math.round(acc * 100 * p)}%
          </text>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: COLORS.textSecondary }}>Experiments per day</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 150, marginTop: 14 }}>
          {BARS.map((b, i) => {
            const bp = interpolate(frame, [start + i * 3, start + i * 3 + 26], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: EASE.out,
            });
            return (
              <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: "100%", height: 124 * b.v * bp, borderRadius: 6, background: `linear-gradient(180deg, ${COLORS.electric}, ${COLORS.deep})` }} />
                <div style={{ fontSize: 12, color: COLORS.muted }}>{b.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
