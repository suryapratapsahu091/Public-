import { Check } from "lucide-react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LogoMark } from "../../components/LogoMark";
import { Wordmark } from "../../components/Wordmark";
import { COLORS, FONT, SHADOWS, TYPE } from "../../styles/brand";
import { EASE, progress, settle } from "../../utils/animations";
import { REEL_SCENES, cue } from "../timing";

type Props = {
  readonly tagline: string[];
  readonly handle: string;
  readonly offers: string[];
  readonly parent: string;
};

const F = REEL_SCENES.end.from;
// Seconds into "Asematic Labs — Learn. Build. Launch." for each tagline word.
const TAG_AT = [1.27, 1.8, 2.25];
// Seconds into "Follow us for learning resources, projects aur upcoming programs!" for each offer.
const OFFER_AT = [0.65, 2.07, 2.92];

/** 25.1-33.3 s: logo, "Learn. Build. Launch.", and the follow call to action. All text is in by ~32 s. */
export const ReelEnd: React.FC<Props> = ({
  tagline,
  handle,
  offers,
  parent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mark = settle(frame, fps, 0);
  const draw = progress(frame, 0, 18, EASE.inOut);
  const fill = progress(frame, 10, 24);
  const card = settle(frame, fps, cue(7, -0.3, F));
  const tapAt = cue(7, 0.55, F);
  const tap = frame - tapAt;
  const press = tap > 0 && tap < 10 ? Math.sin((tap / 10) * Math.PI) : 0;
  const followed = frame >= tapAt + 5;
  const cursor =
    progress(frame, tapAt - 16, tapAt - 1, EASE.out) *
    (1 - progress(frame, tapAt + 16, tapAt + 26));
  const footer = progress(frame, cue(7, 3.4, F), cue(7, 3.9, F));

  return (
    <AbsoluteFill style={{ alignItems: "center", fontFamily: FONT }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 40% at 50% 30%, rgba(219,234,254,0.9) 0%, rgba(255,255,255,0) 100%)",
          opacity: progress(frame, 0, 20),
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 250,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ scale: String(interpolate(mark, [0, 1], [0.3, 1])) }}>
          <LogoMark size={210} draw={draw} fill={fill} />
        </div>
        <Wordmark
          fontSize={86}
          startFrame={4}
          mode="chars"
          style={{ marginTop: 36 }}
        />
        <div style={{ display: "flex", gap: 26, marginTop: 44 }}>
          {tagline.map((w, i) => {
            const s = settle(frame, fps, cue(6, TAG_AT[i], F) - 3);
            return (
              <span
                key={w}
                style={{
                  ...TYPE.display,
                  fontSize: 80,
                  color:
                    i === tagline.length - 1 ? COLORS.primary : COLORS.text,
                  opacity: interpolate(s, [0, 0.3], [0, 1], {
                    extrapolateRight: "clamp",
                  }),
                  translate: `0 ${interpolate(s, [0, 1], [40, 0])}px`,
                  scale: String(interpolate(s, [0, 1], [0.7, 1])),
                  display: "inline-block",
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>

      {/* Follow card */}
      <div
        style={{
          position: "absolute",
          top: 1000,
          width: 880,
          padding: "34px 38px",
          borderRadius: 36,
          background: COLORS.white,
          border: `2px solid ${COLORS.pale}`,
          boxShadow: SHADOWS.float,
          opacity: interpolate(card, [0, 0.3], [0, 1], {
            extrapolateRight: "clamp",
          }),
          translate: `0 ${interpolate(card, [0, 1], [80, 0])}px`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div
            style={{
              width: 112,
              height: 112,
              borderRadius: 56,
              background: "linear-gradient(140deg, #EFF6FF, #DBEAFE)",
              border: `3px solid ${COLORS.primary}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogoMark size={62} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 50,
                fontWeight: 650,
                letterSpacing: "-0.02em",
                color: COLORS.text,
              }}
            >
              Follow <span style={{ color: COLORS.primary }}>{handle}</span>
            </div>
            <div
              style={{
                fontSize: 26,
                color: COLORS.textSecondary,
                marginTop: 6,
              }}
            >
              Asematic Labs · Asematic Technologies
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 28,
            height: 92,
            borderRadius: 22,
            background: followed
              ? COLORS.pale
              : `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.electric})`,
            color: followed ? COLORS.deep : COLORS.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            fontSize: 40,
            fontWeight: 650,
            scale: String(1 - press * 0.05),
            boxShadow:
              press > 0
                ? `0 0 0 ${press * 22}px rgba(96,165,250,0.3)`
                : undefined,
          }}
        >
          {followed ? <Check size={40} strokeWidth={3} /> : null}
          {followed ? "Following" : "Follow"}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 14,
            marginTop: 26,
            flexWrap: "wrap",
          }}
        >
          {offers.map((o, i) => {
            const p = progress(
              frame,
              cue(7, OFFER_AT[i], F) - 3,
              cue(7, OFFER_AT[i], F) + 9,
            );
            return (
              <div
                key={o}
                style={{
                  padding: "12px 22px",
                  borderRadius: 999,
                  background: "#F1F5F9",
                  fontSize: 28,
                  fontWeight: 550,
                  color: COLORS.text,
                  opacity: p,
                  translate: `0 ${(1 - p) * 14}px`,
                }}
              >
                {o}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cursor taps "Follow" */}
      <div
        style={{
          position: "absolute",
          left: interpolate(cursor, [0, 1], [880, 600]),
          top: interpolate(cursor, [0, 1], [1420, 1235]),
          opacity: cursor,
          scale: String(1 - press * 0.15),
        }}
      >
        <svg
          width={64}
          height={64}
          viewBox="0 0 24 24"
          fill={COLORS.white}
          stroke={COLORS.text}
          strokeWidth={1.6}
          strokeLinejoin="round"
        >
          <path d="M4 3l16 7-7 2-2 7z" />
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          top: 1470,
          fontSize: 26,
          color: COLORS.textSecondary,
          opacity: footer,
        }}
      >
        {parent}
      </div>
    </AbsoluteFill>
  );
};
