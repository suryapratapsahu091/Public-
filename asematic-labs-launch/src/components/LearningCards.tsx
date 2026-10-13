import { BrainCircuit, BriefcaseBusiness, ChartNoAxesCombined, Layers } from "lucide-react";
import { interpolate } from "remotion";
import { COLORS, FONT, SHADOWS } from "../styles/brand";

export const CARD_W = 396;
export const CARD_H = 480;

const IW = 336;
const IH = 176;

type IllProps = { readonly t: number; readonly frame: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Browser in front of a three-tier server stack, joined by an API line. */
const FullStackArt: React.FC<IllProps> = ({ t, frame }) => {
  const flow = (frame * 1.2) % 40;
  return (
    <svg width={IW} height={IH} viewBox={`0 0 ${IW} ${IH}`}>
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={clamp01(t * 3 - i * 0.4)} transform={`translate(214 ${34 + i * 42})`}>
          <rect width={96} height={32} rx={8} fill={COLORS.white} stroke={COLORS.sky} strokeWidth={1.5} />
          <circle cx={16} cy={16} r={4} fill={i === 0 ? COLORS.primary : COLORS.sky} />
          <rect x={28} y={13} width={50} height={6} rx={3} fill={COLORS.pale} />
        </g>
      ))}
      <path d="M150 88 C180 88 186 50 214 50" fill="none" stroke={COLORS.electric} strokeWidth={2} strokeDasharray="6 6" strokeDashoffset={-flow} opacity={t} />
      <path d="M150 100 C186 100 190 134 214 134" fill="none" stroke={COLORS.sky} strokeWidth={2} strokeDasharray="6 6" strokeDashoffset={-flow} opacity={t} />
      <g transform={`translate(22 ${30 + (1 - t) * 14})`} opacity={clamp01(t * 2)}>
        <rect width={128} height={118} rx={12} fill={COLORS.white} stroke={COLORS.primary} strokeWidth={2} />
        <path d="M0 26 H128" stroke={COLORS.pale} strokeWidth={2} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={14 + i * 12} cy={13} r={3.5} fill={COLORS.sky} />
        ))}
        <rect x={14} y={40} width={60} height={9} rx={4} fill={COLORS.primary} />
        <rect x={14} y={58} width={98} height={6} rx={3} fill={COLORS.pale} />
        <rect x={14} y={71} width={80} height={6} rx={3} fill={COLORS.pale} />
        <rect x={14} y={88} width={44} height={16} rx={5} fill={COLORS.electric} />
      </g>
    </svg>
  );
};

/** Scatter plot with a fitted trend line drawing across it. */
const DataArt: React.FC<IllProps> = ({ t }) => {
  const pts = [
    [40, 140], [62, 128], [78, 132], [96, 112], [118, 116], [134, 96], [152, 100], [170, 82],
    [188, 86], [206, 66], [226, 70], [244, 52], [262, 58], [284, 40], [300, 44],
  ];
  return (
    <svg width={IW} height={IH} viewBox={`0 0 ${IW} ${IH}`}>
      <path d="M28 18 V156 H316" fill="none" stroke={COLORS.line} strokeWidth={2} />
      {[60, 100, 140, 180, 220, 260, 300].map((x, i) => (
        <rect key={x} x={x - 9} y={156 - (20 + i * 9) * clamp01(t * 1.4 - i * 0.06)} width={18} height={(20 + i * 9) * clamp01(t * 1.4 - i * 0.06)} rx={4} fill={COLORS.pale} />
      ))}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5.5} fill={i % 3 === 0 ? COLORS.primary : COLORS.sky} opacity={clamp01(t * 2.2 - i * 0.07)} />
      ))}
      <path d="M36 146 L304 36" fill="none" stroke={COLORS.deep} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(t * 1.3 - 0.2)} />
    </svg>
  );
};

/** A small neural network whose connections light up layer by layer. */
const AiArt: React.FC<IllProps> = ({ t, frame }) => {
  const layers = [
    [40, [44, 88, 132]],
    [130, [26, 66, 110, 150]],
    [220, [44, 88, 132]],
    [300, [66, 110]],
  ] as const;
  const edges: [number, number, number, number, number][] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    for (const y1 of layers[l][1]) {
      for (const y2 of layers[l + 1][1]) {
        edges.push([layers[l][0], y1, layers[l + 1][0], y2, l]);
      }
    }
  }
  const pulse = (frame % 45) / 45;
  return (
    <svg width={IW} height={IH} viewBox={`0 0 ${IW} ${IH}`}>
      {edges.map(([x1, y1, x2, y2, l], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.sky} strokeWidth={1.3} opacity={0.55 * clamp01(t * 2.4 - l * 0.45)} />
      ))}
      {layers.map(([x, ys], l) =>
        ys.map((y, j) => {
          const lit = Math.abs(pulse * 3 - l) < 0.5;
          return (
            <circle
              key={`${l}-${j}`}
              cx={x}
              cy={y}
              r={l === 3 ? 11 : 9}
              fill={lit ? COLORS.primary : COLORS.white}
              stroke={COLORS.primary}
              strokeWidth={2.5}
              opacity={clamp01(t * 2.4 - l * 0.4)}
            />
          );
        }),
      )}
    </svg>
  );
};

/** A project road-map that ends in an internship milestone. */
const InternshipArt: React.FC<IllProps> = ({ t }) => {
  const steps = [
    { x: 46, label: "Learn" },
    { x: 136, label: "Build" },
    { x: 226, label: "Review" },
    { x: 300, label: "Intern" },
  ];
  const line = clamp01(t * 1.2);
  return (
    <svg width={IW} height={IH} viewBox={`0 0 ${IW} ${IH}`}>
      <path d="M46 96 H300" stroke={COLORS.pale} strokeWidth={6} strokeLinecap="round" />
      <path d="M46 96 H300" stroke={COLORS.primary} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - line} />
      {steps.map((s, i) => {
        const on = line >= (s.x - 46) / 254 - 0.001;
        const last = i === steps.length - 1;
        return (
          <g key={s.label}>
            <circle cx={s.x} cy={96} r={last ? 16 : 11} fill={on ? COLORS.primary : COLORS.white} stroke={COLORS.primary} strokeWidth={3} />
            {last ? <path d="M293 96 l5 5 l9 -10" fill="none" stroke={on ? COLORS.white : COLORS.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /> : null}
            <text x={s.x} y={140} textAnchor="middle" fontFamily={FONT} fontSize={15} fontWeight={600} fill={on ? COLORS.text : COLORS.muted}>
              {s.label}
            </text>
          </g>
        );
      })}
      <g opacity={interpolate(t, [0.7, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        <rect x={244} y={30} width={88} height={32} rx={9} fill={COLORS.pale} />
        <text x={288} y={51} textAnchor="middle" fontFamily={FONT} fontSize={14} fontWeight={650} fill={COLORS.deep}>
          Offer
        </text>
        <path d="M288 62 L288 76" stroke={COLORS.sky} strokeWidth={2} />
      </g>
    </svg>
  );
};

export const LEARNING_TRACKS = [
  { title: ["Full Stack", "Development"], meta: "Frontend · Backend · APIs", Icon: Layers, Art: FullStackArt },
  { title: ["Data Science"], meta: "Python · Analytics · Visualisation", Icon: ChartNoAxesCombined, Art: DataArt },
  { title: ["Artificial Intelligence", "& Machine Learning"], meta: "Models · Deep Learning · NLP", Icon: BrainCircuit, Art: AiArt },
  { title: ["Internship &", "Project-Based Learning"], meta: "Real projects · Mentorship", Icon: BriefcaseBusiness, Art: InternshipArt },
] as const;

type CardProps = {
  readonly index: number;
  /** 0 -> 1: content reveal (illustration draw, text fade). */
  readonly reveal: number;
  readonly frame: number;
  readonly style?: React.CSSProperties;
};

/** One learning-track card: illustration, icon, title and topics, with a blue accent line. */
export const LearningCard: React.FC<CardProps> = ({ index, reveal, frame, style }) => {
  const track = LEARNING_TRACKS[index];
  const { Icon, Art } = track;
  const text = clamp01(reveal * 1.6 - 0.4);
  return (
    <div
      style={{
        position: "absolute",
        width: CARD_W,
        height: CARD_H,
        borderRadius: 24,
        background: "linear-gradient(170deg, #FFFFFF 0%, #FBFDFF 100%)",
        border: "1px solid rgba(219,234,254,0.95)",
        boxShadow: SHADOWS.float,
        overflow: "hidden",
        fontFamily: FONT,
        ...style,
      }}
    >
      {/* Accent line that draws across the top edge. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 4,
          width: `${clamp01(reveal * 1.4) * 100}%`,
          background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.sky})`,
        }}
      />
      <div
        style={{
          margin: "30px 30px 0",
          height: IH + 12,
          borderRadius: 16,
          background: "linear-gradient(160deg, #F8FBFF 0%, #EFF6FF 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Art t={reveal} frame={frame} />
      </div>
      <div style={{ padding: "24px 30px 0", opacity: text, translate: `0 ${(1 - text) * 14}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: COLORS.pale, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={21} color={COLORS.primary} strokeWidth={2} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.2em", color: COLORS.primary }}>0{index + 1}</div>
        </div>
        <div style={{ marginTop: 16, fontSize: 27, fontWeight: 650, lineHeight: 1.18, letterSpacing: "-0.02em", color: COLORS.text }}>
          {track.title.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 17, color: COLORS.textSecondary }}>{track.meta}</div>
      </div>
    </div>
  );
};
