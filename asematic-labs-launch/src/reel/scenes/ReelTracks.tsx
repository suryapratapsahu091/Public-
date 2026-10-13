import { BrainCircuit, ChartNoAxesCombined, Code2 } from "lucide-react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AiArt, DataArt, FullStackArt } from "../../components/LearningCards";
import { COLORS, FONT, SHADOWS, TYPE } from "../../styles/brand";
import { glide, progress } from "../../utils/animations";
import { REEL_SCENES, cue } from "../timing";

type Props = { readonly tracks: string[]; readonly line: string };

const F = REEL_SCENES.tracks.from;
const ARTS = [FullStackArt, DataArt, AiArt];
const ICONS = [Code2, ChartNoAxesCombined, BrainCircuit];
const META = [
  "HTML · CSS · React · Node.js",
  "Python · Analytics · Visualisation",
  "Machine Learning · Neural Nets",
];
// Seconds into "Explore karo Web Development, Data Science aur AI/ML." where each track is named.
const AT = [1.0, 1.94, 3.12];

/** 14.5-19.2 s: the three learning tracks arrive as they are named. */
export const ReelTracks: React.FC<Props> = ({ tracks, line }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const explore = progress(frame, cue(4, 0, F) - 4, cue(4, 0.5, F));
  const footer = progress(frame, cue(4, 3.4, F), cue(4, 4.1, F));

  return (
    <AbsoluteFill style={{ alignItems: "center", fontFamily: FONT }}>
      <div
        style={{
          ...TYPE.display,
          position: "absolute",
          top: 250,
          fontSize: 88,
          opacity: explore,
          translate: `0 ${(1 - explore) * 30}px`,
        }}
      >
        Explore <span style={{ color: COLORS.primary }}>karo</span>
      </div>

      {tracks.map((title, i) => {
        const at = cue(4, AT[i], F) - 6;
        const s = glide(frame, fps, at);
        const reveal = progress(frame, at, at + 34);
        const Art = ARTS[i];
        const Icon = ICONS[i];
        const active =
          progress(frame, at, at + 10) *
          (i === 2
            ? 1
            : 1 -
              0.35 *
                progress(
                  frame,
                  cue(4, AT[i + 1] ?? 9, F) - 6,
                  cue(4, AT[i + 1] ?? 9, F) + 4,
                ));
        return (
          <div
            key={title}
            style={{
              position: "absolute",
              top: 420 + i * 330,
              left: 70,
              width: 940,
              height: 300,
              borderRadius: 32,
              background: COLORS.white,
              border: `2px solid rgba(37,99,235,${0.12 + active * 0.5})`,
              boxShadow: SHADOWS.float,
              display: "flex",
              alignItems: "center",
              gap: 30,
              padding: "0 36px",
              overflow: "hidden",
              opacity: interpolate(s, [0, 0.3], [0, 1], {
                extrapolateRight: "clamp",
              }),
              translate: `${(1 - s) * (i % 2 ? 260 : -260)}px 0`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: 6,
                width: `${reveal * 100}%`,
                background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.sky})`,
              }}
            />
            <div
              style={{
                width: 380,
                height: 230,
                borderRadius: 22,
                background: "linear-gradient(160deg, #F8FBFF, #EFF6FF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ scale: "1.05" }}>
                <Art t={reveal} frame={frame} />
              </div>
            </div>
            <div>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: COLORS.pale,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={34} color={COLORS.primary} strokeWidth={2} />
              </div>
              <div
                style={{
                  fontSize: 50,
                  fontWeight: 650,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.08,
                  marginTop: 16,
                  color: COLORS.text,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: COLORS.textSecondary,
                  marginTop: 10,
                }}
              >
                {META[i]}
              </div>
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          top: 1430,
          fontSize: 40,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: COLORS.deep,
          opacity: footer,
          translate: `0 ${(1 - footer) * 20}px`,
        }}
      >
        {line}
      </div>
    </AbsoluteFill>
  );
};
