import { useCurrentFrame } from "remotion";
import { COLORS, MONO } from "../../styles/brand";

type Line = { text: string; color?: string; at: number };

type Props = {
  readonly start: number;
  readonly lines?: Line[];
};

const DEFAULT_LINES: Line[] = [
  { text: "~/portfolio $ npm test", color: COLORS.text, at: 0 },
  { text: " PASS  src/ProjectCard.test.tsx", color: COLORS.success, at: 12 },
  { text: "  ✓ renders the project title", color: COLORS.textSecondary, at: 18 },
  { text: "  ✓ lists every tag", color: COLORS.textSecondary, at: 23 },
  { text: "Tests: 2 passed, 2 total", color: COLORS.deep, at: 30 },
];

/** Light terminal that prints a passing test run. */
export const Terminal: React.FC<Props> = ({ start, lines = DEFAULT_LINES }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  return (
    <div style={{ fontFamily: MONO, fontSize: 17, lineHeight: 1.75, padding: "16px 22px", whiteSpace: "pre" }}>
      {lines.map((l, i) => {
        if (t < l.at) return null;
        // The command line types out; output lines appear whole.
        const text = i === 0 ? l.text.slice(0, Math.floor((t - l.at) * 2.2) + 1) : l.text;
        return (
          <div key={i} style={{ color: l.color, fontWeight: i === 1 ? 600 : 400 }}>
            {text}
          </div>
        );
      })}
    </div>
  );
};
