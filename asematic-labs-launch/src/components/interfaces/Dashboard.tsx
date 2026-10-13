import { FolderKanban, Gauge, LayoutDashboard, Rocket, Settings } from "lucide-react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../../styles/brand";
import { EASE } from "../../utils/animations";

const KPIS = [
  { label: "Active projects", value: 12 },
  { label: "Tasks completed", value: 248 },
  { label: "Deployments", value: 36 },
];

const ROWS = [
  { name: "Portfolio Website", status: "Deployed", tone: COLORS.success },
  { name: "Weather Dashboard", status: "In review", tone: COLORS.primary },
  { name: "Chat API", status: "Building", tone: "#B45309" },
];

// Weekly activity, normalised 0..1.
const SERIES = [0.32, 0.4, 0.36, 0.52, 0.48, 0.63, 0.58, 0.72, 0.69, 0.84, 0.8, 0.93];

type Props = { readonly start: number };

/** A project-tracking web app: sidebar, KPI tiles, activity chart and project list. */
export const Dashboard: React.FC<Props> = ({ start }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.out });
  const w = 560;
  const h = 150;
  const pts = SERIES.map((v, i) => [(i / (SERIES.length - 1)) * w, h - v * h * 0.9] as const);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ width: 74, borderRight: `1px solid ${COLORS.line}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, paddingTop: 24 }}>
        {[LayoutDashboard, FolderKanban, Gauge, Rocket, Settings].map((Icon, i) => (
          <div
            key={i}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: i === 0 ? COLORS.pale : undefined,
            }}
          >
            <Icon size={21} color={i === 0 ? COLORS.primary : COLORS.muted} strokeWidth={1.8} />
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: "24px 30px" }}>
        <div style={{ fontSize: 24, fontWeight: 650, letterSpacing: "-0.02em" }}>Project Dashboard</div>
        <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
          {KPIS.map((k) => (
            <div key={k.label} style={{ flex: 1, padding: "14px 16px", borderRadius: 12, border: `1px solid ${COLORS.line}`, background: COLORS.white }}>
              <div style={{ fontSize: 14, color: COLORS.textSecondary }}>{k.label}</div>
              <div style={{ fontSize: 30, fontWeight: 650, letterSpacing: "-0.02em", marginTop: 4 }}>{Math.round(k.value * p)}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, padding: "16px 18px 10px", borderRadius: 12, border: `1px solid ${COLORS.line}`, background: COLORS.white }}>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 }}>Weekly activity</div>
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible", display: "block" }}>
            <defs>
              <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={COLORS.electric} stopOpacity={0.28} />
                <stop offset="1" stopColor={COLORS.electric} stopOpacity={0} />
              </linearGradient>
              <clipPath id="dashReveal">
                <rect x={0} y={-10} width={w * p} height={h + 20} />
              </clipPath>
            </defs>
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={COLORS.faint} strokeWidth={1} />
            ))}
            <g clipPath="url(#dashReveal)">
              <path d={`${d} L${w} ${h} L0 ${h} Z`} fill="url(#dashArea)" />
              <path d={d} fill="none" stroke={COLORS.primary} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          </svg>
        </div>
        <div style={{ marginTop: 14 }}>
          {ROWS.map((r) => (
            <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 4px", borderBottom: `1px solid ${COLORS.faint}`, fontSize: 16 }}>
              <span style={{ fontWeight: 500 }}>{r.name}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: r.tone }}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
