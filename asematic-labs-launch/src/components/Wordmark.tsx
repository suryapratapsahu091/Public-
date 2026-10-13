import { interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../styles/brand";
import { EASE, settle } from "../utils/animations";

type Props = {
  readonly fontSize: number;
  /** Frame (local to the enclosing sequence) at which the reveal starts. */
  readonly startFrame: number;
  /** "mask": each word rises out of a clipping mask. "chars": letters arrive one by one. */
  readonly mode?: "mask" | "chars";
  /** chars mode: position (0 = first letter, 1 = last) of a highlight that glides across. */
  readonly shine?: number;
  readonly style?: React.CSSProperties;
};

const WORDS = [
  { text: "ASEMATIC", weight: 700, color: COLORS.text, highlight: COLORS.primary },
  { text: "LABS", weight: 380, color: COLORS.primary, highlight: COLORS.sky },
];
const TOTAL_CHARS = WORDS.reduce((n, w) => n + w.text.length, 0);

/** The "ASEMATIC LABS" typographic lockup. */
export const Wordmark: React.FC<Props> = ({ fontSize, startFrame, mode = "mask", shine, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let charIndex = 0;

  return (
    <div
      style={{
        display: "flex",
        gap: fontSize * 0.38,
        fontFamily: FONT,
        fontSize,
        lineHeight: 1,
        letterSpacing: "0.14em",
        whiteSpace: "nowrap",
        // Compensate trailing letter-spacing so the lockup is optically centred.
        marginRight: "-0.14em",
        ...style,
      }}
    >
      {WORDS.map((word, w) => {
        if (mode === "mask") {
          const s = settle(frame, fps, startFrame + w * 5);
          return (
            <div key={word.text} style={{ overflow: "hidden", padding: "0.08em 0 0.12em" }}>
              <div
                style={{
                  fontWeight: word.weight,
                  color: word.color,
                  translate: `0 ${interpolate(s, [0, 1], [110, 0])}%`,
                  opacity: interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                {word.text}
              </div>
            </div>
          );
        }
        return (
          <div key={word.text} style={{ display: "flex", fontWeight: word.weight, color: word.color }}>
            {word.text.split("").map((ch) => {
              const pos = charIndex / (TOTAL_CHARS - 1);
              const delay = startFrame + charIndex++ * 1.6 + w * 3;
              const glow = shine === undefined ? 0 : Math.exp(-(((pos - shine) / 0.09) ** 2));
              const s = settle(frame, fps, delay);
              const o = interpolate(frame, [delay, delay + 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE.soft,
              });
              return (
                <span
                  key={`${ch}-${charIndex}`}
                  style={{
                    display: "inline-block",
                    opacity: o,
                    color: glow > 0.01 ? interpolateColors(glow, [0, 1], [word.color, word.highlight]) : undefined,
                    translate: `0 ${interpolate(s, [0, 1], [0.45, 0])}em`,
                    filter: o < 0.99 ? `blur(${(1 - o) * 8}px)` : undefined,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
