import { Check, PlayCircle } from "lucide-react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../../styles/brand";
import { EASE } from "../../utils/animations";

const MODULES = [
  { title: "HTML & CSS Foundations", done: true },
  { title: "JavaScript Essentials", done: true },
  { title: "React Fundamentals", done: false, active: true },
  { title: "APIs with Node.js", done: false },
  { title: "Capstone Project", done: false },
];

type Props = { readonly start: number };

/** A learning-path page: module list, current lesson and progress. */
export const LessonBrowser: React.FC<Props> = ({ start }) => {
  const frame = useCurrentFrame();
  const pct = interpolate(frame, [start, start + 40], [24, 68], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ width: 270, borderRight: `1px solid ${COLORS.line}`, padding: "26px 20px", background: "rgba(248,251,255,0.8)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.16em", color: COLORS.muted, marginBottom: 18 }}>FULL STACK PATH</div>
        {MODULES.map((m, i) => (
          <div
            key={m.title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 12px",
              marginBottom: 6,
              borderRadius: 10,
              fontSize: 16,
              fontWeight: m.active ? 600 : 450,
              color: m.active ? COLORS.deep : m.done ? COLORS.text : COLORS.textSecondary,
              background: m.active ? COLORS.pale : undefined,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                background: m.done ? COLORS.primary : COLORS.white,
                border: m.done ? undefined : `1.5px solid ${m.active ? COLORS.primary : COLORS.line}`,
                color: m.done ? COLORS.white : m.active ? COLORS.primary : COLORS.muted,
              }}
            >
              {m.done ? <Check size={14} strokeWidth={3} /> : i + 1}
            </div>
            {m.title}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: "30px 34px" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.primary, letterSpacing: "0.04em" }}>MODULE 3 · REACT FUNDAMENTALS</div>
        <div style={{ fontSize: 30, fontWeight: 650, letterSpacing: "-0.02em", marginTop: 10 }}>Build reusable components</div>
        <div
          style={{
            marginTop: 22,
            height: 190,
            borderRadius: 14,
            background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 55%, #BFDBFE 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 400 190" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, opacity: 0.6 }}>
            <path d="M0 140 C80 100 140 160 220 110 S340 60 400 90" fill="none" stroke="#93C5FD" strokeWidth={2} />
            <path d="M0 160 C90 130 160 175 240 135 S350 95 400 120" fill="none" stroke="#BFDBFE" strokeWidth={2} />
          </svg>
          <PlayCircle size={64} color={COLORS.primary} strokeWidth={1.4} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, fontSize: 16, color: COLORS.textSecondary }}>
          <span>Course progress</span>
          <span style={{ fontWeight: 650, color: COLORS.text }}>{Math.round(pct)}%</span>
        </div>
        <div style={{ marginTop: 10, height: 10, borderRadius: 5, background: COLORS.faint }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 5, background: `linear-gradient(90deg, ${COLORS.sky}, ${COLORS.primary})` }} />
        </div>
      </div>
    </div>
  );
};
