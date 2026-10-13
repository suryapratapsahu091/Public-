import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { LightSweep } from "../components/LightSweep";
import { ParticleField } from "../components/ParticleField";
import { zoomThrough } from "../components/ZoomTransition";
import "../styles/brand";
import { ReelEnd } from "./scenes/ReelEnd";
import { ReelHook } from "./scenes/ReelHook";
import { ReelIdeas } from "./scenes/ReelIdeas";
import { ReelIntro } from "./scenes/ReelIntro";
import { ReelProjects } from "./scenes/ReelProjects";
import { ReelTracks } from "./scenes/ReelTracks";
import { REEL_NARRATION, REEL_SCENES, REEL_TRANSITION } from "./timing";

// Mix: voice ~-16 LUFS (mono lines on both channels, hence 0.7); music -20 LUFS in the clear and
// ~14 dB under the voice; effects 6-12 dB below the voice.
const musicVolume = (frame: number) => {
  const RAMP = 6;
  let duck = 0;
  for (const l of REEL_NARRATION) {
    const d = interpolate(
      frame,
      [l.from - RAMP, l.from, l.from + l.duration, l.from + l.duration + RAMP],
      [0, 1, 1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
    duck = Math.max(duck, d);
  }
  return interpolate(duck, [0, 1], [0.63, 0.2]);
};

/** 33 s vertical announcement reel (Instagram / Shorts): 1080 x 1920, 30 fps. */
export const ReelLaunch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      <Background />
      <ParticleField count={40} seed="reel" opacity={0.6} />

      {/* Scenes sit slightly low so the content is centred in the Reels safe area (UI overlays the bottom). */}
      <AbsoluteFill style={{ translate: "0 70px" }}>
        <TransitionSeries name="Reel scenes">
          <TransitionSeries.Sequence
            name="Hook"
            durationInFrames={REEL_SCENES.hook.duration}
            premountFor={fps}
          >
            <ReelHook
              lines={[
                [
                  { text: "Students", at: 0 },
                  { text: "ke", at: 0.62 },
                  { text: "liye", at: 0.8 },
                ],
                [
                  { text: "ek", at: 1.0 },
                  { text: "exciting", at: 1.22, accent: true },
                ],
                [
                  { text: "announcement", at: 1.56, accent: true },
                  { text: "hai!", at: 2.46 },
                ],
              ]}
            />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={zoomThrough({
              exitScale: 1.6,
              enterScale: 0.9,
              blur: 6,
              wash: "rgba(239,246,255,1)",
            })}
            timing={linearTiming({ durationInFrames: REEL_TRANSITION })}
          />
          <TransitionSeries.Sequence
            name="Intro"
            durationInFrames={REEL_SCENES.intro.duration}
            premountFor={fps}
          >
            <ReelIntro label="Introducing" />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={zoomThrough({
              exitScale: 2.6,
              enterScale: 0.9,
              blur: 8,
              origin: "50% 72%",
              wash: "rgba(219,234,254,1)",
            })}
            timing={linearTiming({ durationInFrames: REEL_TRANSITION })}
          />
          <TransitionSeries.Sequence
            name="Projects"
            durationInFrames={REEL_SCENES.projects.duration}
            premountFor={fps}
          >
            <ReelProjects
              title="Real-world projects"
              skills={["React", "Node.js", "Python", "Git", "APIs"]}
            />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={zoomThrough({
              exitScale: 1.5,
              enterScale: 0.92,
              blur: 6,
            })}
            timing={linearTiming({ durationInFrames: REEL_TRANSITION })}
          />
          <TransitionSeries.Sequence
            name="Tracks"
            durationInFrames={REEL_SCENES.tracks.duration}
            premountFor={fps}
          >
            <ReelTracks
              tracks={["Web Development", "Data Science", "AI/ML"]}
              line="Web Development · Data Science · AI/ML"
            />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({ durationInFrames: REEL_TRANSITION })}
          />
          <TransitionSeries.Sequence
            name="Ideas"
            durationInFrames={REEL_SCENES.ideas.duration}
            premountFor={fps}
          >
            <ReelIdeas idea="Your idea" reality="Reality" />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={zoomThrough({
              exitScale: 1.8,
              enterScale: 0.9,
              blur: 6,
              wash: "rgba(239,246,255,1)",
            })}
            timing={linearTiming({ durationInFrames: REEL_TRANSITION })}
          />
          <TransitionSeries.Sequence
            name="End"
            durationInFrames={REEL_SCENES.end.duration}
            premountFor={fps}
          >
            <ReelEnd
              tagline={["Learn.", "Build.", "Launch."]}
              handle="@asematic.tech"
              offers={["Learning resources", "Projects", "Upcoming programs"]}
              parent="by Asematic Technologies Private Limited"
            />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </AbsoluteFill>

      <Sequence
        name="Light sweep into intro"
        from={REEL_SCENES.intro.from - 14}
        durationInFrames={28}
        premountFor={fps}
      >
        <LightSweep angle={12} wash={0.5} />
      </Sequence>
      <Sequence
        name="Light sweep into ending"
        from={REEL_SCENES.end.from - 14}
        durationInFrames={28}
        premountFor={fps}
      >
        <LightSweep angle={-12} wash={0.5} />
      </Sequence>

      {/* ---------- Audio ---------- */}
      <Audio
        name="Music"
        src={staticFile("audio/reel/music.wav")}
        volume={musicVolume(frame)}
        premountFor={fps}
      />
      <Audio
        name="Ambience"
        src={staticFile("audio/sfx/ambience.wav")}
        volume={0.08}
        premountFor={fps}
      />
      {REEL_NARRATION.map((l) => (
        <Audio
          key={l.id}
          name={`Voice ${l.id}`}
          from={l.from}
          src={staticFile(l.src)}
          volume={0.7}
          premountFor={fps}
        />
      ))}

      <Audio
        name="Hook pop"
        from={0}
        src={staticFile("audio/sfx/logo-hit.wav")}
        volume={0.35}
        premountFor={fps}
      />
      <Audio
        name="Sweep into intro"
        from={REEL_SCENES.intro.from - 14}
        src={staticFile("audio/sfx/sweep.wav")}
        volume={0.45}
        premountFor={fps}
      />
      <Audio
        name="Logo reveal"
        from={REEL_SCENES.intro.from + 6}
        src={staticFile("audio/sfx/particles.wav")}
        volume={0.35}
        premountFor={fps}
      />
      <Audio
        name="Whoosh into projects"
        from={REEL_SCENES.projects.from - 12}
        src={staticFile("audio/sfx/whoosh.wav")}
        volume={0.45}
        premountFor={fps}
      />
      <Audio
        name="Keys"
        from={REEL_SCENES.projects.from + 30}
        src={staticFile("audio/sfx/keys.wav")}
        volume={0.2}
        premountFor={fps}
      />
      <Audio
        name="Track 1"
        from={REEL_NARRATION[4].from + 29}
        src={staticFile("audio/sfx/card.wav")}
        volume={0.32}
        premountFor={fps}
      />
      <Audio
        name="Track 2"
        from={REEL_NARRATION[4].from + 53}
        src={staticFile("audio/sfx/card.wav")}
        volume={0.3}
        premountFor={fps}
      />
      <Audio
        name="Track 3"
        from={REEL_NARRATION[4].from + 89}
        src={staticFile("audio/sfx/card.wav")}
        volume={0.32}
        premountFor={fps}
      />
      <Audio
        name="Idea"
        from={REEL_NARRATION[5].from + 61}
        src={staticFile("audio/sfx/confirm.wav")}
        volume={0.3}
        premountFor={fps}
      />
      <Audio
        name="Start tap"
        from={REEL_NARRATION[5].from + 148}
        src={staticFile("audio/sfx/click.wav")}
        volume={0.4}
        premountFor={fps}
      />
      <Audio
        name="Sweep into ending"
        from={REEL_SCENES.end.from - 14}
        src={staticFile("audio/sfx/sweep.wav")}
        volume={0.4}
        premountFor={fps}
      />
      <Audio
        name="Follow tap"
        from={REEL_NARRATION[7].from + 16}
        src={staticFile("audio/sfx/click.wav")}
        volume={0.4}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
};
