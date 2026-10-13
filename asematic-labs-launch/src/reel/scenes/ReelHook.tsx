import { Megaphone } from "lucide-react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, SHADOWS, TYPE } from "../../styles/brand";
import { EASE, progress, settle } from "../../utils/animations";
import { REEL_SCENES, cue } from "../timing";

type Props = {
  readonly lines: { text: string; at: number; accent?: boolean }[][];
};

const F = REEL_SCENES.hook.from;

/** 0-3.5 s: announcement hook. Each word pops in as it is spoken. */
export const ReelHook: React.FC<Props> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const icon = settle(frame, fps, 0);
  const pill = progress(frame, 6, 20);
  const underline = progress(frame, cue(0, 1.4, F), cue(0, 2.5, F), EASE.inOut);

  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 470 }}>
      {/* Megaphone with pulsing rings */}
      <div
        style={{
          position: "relative",
          width: 220,
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[0, 1, 2].map((i) => {
          const p = ((frame + i * 14) % 42) / 42;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 160,
                height: 160,
                borderRadius: "50%",
                border: `3px solid ${COLORS.sky}`,
                scale: String(1 + p * 0.9),
                opacity: (1 - p) * 0.6 * icon,
              }}
            />
          );
        })}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: `linear-gradient(140deg, ${COLORS.electric}, ${COLORS.deep})`,
            boxShadow: "0 24px 60px -16px rgba(37,99,235,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: String(interpolate(icon, [0, 1], [0.2, 1])),
            rotate: `${interpolate(icon, [0, 1], [-25, 0])}deg`,
          }}
        >
          <Megaphone size={78} color={COLORS.white} strokeWidth={2} />
        </div>
      </div>

      <div
        style={{
          ...TYPE.label,
          marginTop: 56,
          fontSize: 26,
          padding: "14px 30px",
          borderRadius: 999,
          background: COLORS.white,
          border: `1px solid ${COLORS.pale}`,
          boxShadow: SHADOWS.soft,
          opacity: pill,
          translate: `0 ${(1 - pill) * 20}px`,
        }}
      >
        New announcement
      </div>

      <div
        style={{
          marginTop: 70,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        {lines.map((row, r) => (
          <div
            key={r}
            style={{ display: "flex", gap: 22, position: "relative" }}
          >
            {row.map((w) => {
              const at = cue(0, w.at, F);
              const s = settle(frame, fps, at);
              return (
                <span
                  key={w.text}
                  style={{
                    ...TYPE.display,
                    fontFamily: FONT,
                    fontSize: 104,
                    lineHeight: 1.12,
                    color: w.accent ? COLORS.primary : COLORS.text,
                    opacity: interpolate(s, [0, 0.4], [0, 1], {
                      extrapolateRight: "clamp",
                    }),
                    translate: `0 ${interpolate(s, [0, 1], [50, 0])}px`,
                    scale: String(interpolate(s, [0, 1], [0.7, 1])),
                    display: "inline-block",
                  }}
                >
                  {w.text}
                </span>
              );
            })}
            {row.some((w) => w.accent) ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 6,
                  height: 12,
                  borderRadius: 6,
                  width: `${underline * 100}%`,
                  background: `linear-gradient(90deg, ${COLORS.sky}, ${COLORS.primary})`,
                  opacity: 0.35,
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
