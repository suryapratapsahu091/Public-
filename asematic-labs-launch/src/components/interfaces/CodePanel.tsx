import { useCurrentFrame } from "remotion";
import { COLORS, MONO } from "../../styles/brand";

// Token colours: a light, blue-led syntax theme.
const C = {
  k: COLORS.deep, // keyword
  f: "#0369A1", // function / identifier
  s: "#0F766E", // string
  t: COLORS.primary, // JSX tag
  a: "#0284C7", // attribute / property
  c: COLORS.muted, // comment
  p: COLORS.text, // plain
  n: "#B45309", // number
} as const;

export type Token = [string, keyof typeof C];
export type CodeLine = Token[];

type Props = {
  readonly lines: CodeLine[];
  /** Local frame at which typing starts. */
  readonly start: number;
  /** Characters revealed per frame. */
  readonly speed?: number;
  readonly fontSize?: number;
  readonly activeLine?: number;
};

/** Syntax-highlighted code that types itself in, with a blinking caret. */
export const CodePanel: React.FC<Props> = ({ lines, start, speed = 3.2, fontSize = 19, activeLine }) => {
  const frame = useCurrentFrame();
  let budget = Math.max(0, (frame - start) * speed);
  let caretPlaced = false;

  return (
    <div style={{ fontFamily: MONO, fontSize, lineHeight: 1.62, padding: "18px 0", whiteSpace: "pre" }}>
      {lines.map((line, i) => {
        const len = line.reduce((acc, [text]) => acc + text.length, 0);
        const shown = Math.min(len, budget);
        budget -= len + 2; // a small pause at each line break
        const typing = !caretPlaced && shown < len;
        if (typing) caretPlaced = true;
        let remaining = shown;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              paddingRight: 24,
              background: activeLine === i ? "rgba(219,234,254,0.55)" : undefined,
            }}
          >
            <span style={{ width: 52, textAlign: "right", paddingRight: 18, color: "#CBD5E1", flexShrink: 0 }}>{i + 1}</span>
            <span>
              {line.map(([text, type], j) => {
                const part = text.slice(0, Math.max(0, Math.floor(remaining)));
                remaining -= text.length;
                return (
                  <span key={j} style={{ color: C[type] }}>
                    {part}
                  </span>
                );
              })}
              {typing && shown > 0 ? (
                <span
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: "1.1em",
                    marginLeft: 1,
                    verticalAlign: "text-bottom",
                    background: COLORS.primary,
                    opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0.2,
                  }}
                />
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
};
