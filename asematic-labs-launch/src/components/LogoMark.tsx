import { COLORS } from "../styles/brand";

type Props = {
  readonly size: number;
  /** 0 -> 1: outline drawing progress. */
  readonly draw?: number;
  /** 0 -> 1: solid fill opacity. */
  readonly fill?: number;
  readonly style?: React.CSSProperties;
};

// Geometry traced from the official Asematic Technologies mark (the parent company's "A"),
// in a 400 x 364 coordinate space. Rounded joins reproduce the soft corners of the original.
export const MARK_BLUE = "M206 11 L247 80 L95 353 L12 353 Z";
export const MARK_DARK = "M193 262 L256 149 L282 153 L390 353 L308 353 L262 270 Z";

/**
 * Temporary Asematic Labs mark: a vector re-drawing of the parent company's "A" mark.
 * Replace with the official Labs logo when one exists (see README).
 */
export const LogoMark: React.FC<Props> = ({ size, draw = 1, fill = 1, style }) => {
  const height = (size * 384) / 420;
  return (
    <svg width={size} height={height} viewBox="-10 -10 420 384" style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id="markBlue" x1="0" y1="1" x2="0.6" y2="0">
          <stop offset="0" stopColor={COLORS.deep} />
          <stop offset="0.55" stopColor={COLORS.primary} />
          <stop offset="1" stopColor={COLORS.electric} />
        </linearGradient>
      </defs>
      {/* Solid shapes (stroked in the same colour to round the corners). */}
      <g opacity={fill}>
        <path d={MARK_BLUE} fill="url(#markBlue)" stroke="url(#markBlue)" strokeWidth={14} strokeLinejoin="round" />
        <path d={MARK_DARK} fill={COLORS.text} stroke={COLORS.text} strokeWidth={14} strokeLinejoin="round" />
      </g>
      {/* Outline that draws on before the fill arrives. */}
      <g opacity={1 - fill * 0.85} fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d={MARK_BLUE} pathLength={1} stroke={COLORS.primary} strokeWidth={5} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
        <path d={MARK_DARK} pathLength={1} stroke={COLORS.text} strokeWidth={5} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
      </g>
    </svg>
  );
};
