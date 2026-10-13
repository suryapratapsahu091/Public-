import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "./components/Background";
import { LightSweep } from "./components/LightSweep";
import { ParticleField } from "./components/ParticleField";
import { zoomThrough } from "./components/ZoomTransition";
import { Scene01BrandGenesis } from "./scenes/Scene01BrandGenesis";
import { Scene02Learning } from "./scenes/Scene02Learning";
import { Scene03Projects } from "./scenes/Scene03Projects";
import { Scene04Opportunities } from "./scenes/Scene04Opportunities";
import { Scene05FinalReveal } from "./scenes/Scene05FinalReveal";
import "./styles/brand";
import { NARRATION, SCENES, TRANSITION } from "./utils/timing";

// Mix. Stems are loudness-normalised by the scripts (voice and music -16 LUFS, effects -18 LUFS),
// so these gains map to: voice about -16 LUFS (mono lines play on both channels, hence 0.7), music -20 LUFS in the clear and about 14 dB under the
// voice while it speaks, ambience around -38 LUFS, effects 6-12 dB below the voice.

/** Music level: ducked under every narration line with short ramps. */
const musicVolume = (frame: number) => {
  const RAMP = 6;
  let duck = 0;
  for (const line of NARRATION) {
    const d = interpolate(frame, [line.from - RAMP, line.from, line.from + line.duration, line.from + line.duration + RAMP], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    duck = Math.max(duck, d);
  }
  return interpolate(duck, [0, 1], [0.63, 0.2]);
};

export const AsematicLabsLaunch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      <Background />
      <ParticleField
        count={46}
        seed="global"
        opacity={interpolate(frame, [0, 20, 80, 340, 380, 450], [0, 0.9, 0.45, 0.45, 0.8, 0.7], { extrapolateRight: "clamp" })}
      />

      <TransitionSeries name="Scenes">
        <TransitionSeries.Sequence name="1 · Brand genesis" durationInFrames={SCENES.genesis.duration} premountFor={fps}>
          <Scene01BrandGenesis tagline="Learn. Build. Innovate." />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={zoomThrough({ exitScale: 1.5, enterScale: 0.92, blur: 5, wash: "rgba(239,246,255,1)" })}
          timing={linearTiming({ durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence name="2 · Learning" durationInFrames={SCENES.learning.duration} premountFor={fps}>
          <Scene02Learning headline={["Learn", "Industry-Ready", "Skills"]} support="Practical learning. Real-world skills." />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={zoomThrough({ exitScale: 3.2, enterScale: 0.9, blur: 8, origin: "66% 46%", wash: "rgba(219,234,254,1)" })}
          timing={linearTiming({ durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence name="3 · Projects" durationInFrames={SCENES.projects.duration} premountFor={fps}>
          <Scene03Projects headline="Build Real-World Projects" support="Turn knowledge into experience." />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION })} />
        <TransitionSeries.Sequence name="4 · Opportunities" durationInFrames={SCENES.opportunities.duration} premountFor={fps}>
          <Scene04Opportunities headline="Learn. Create. Grow." support="Skills that move you forward." />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION })} />
        <TransitionSeries.Sequence name="5 · Final reveal" durationInFrames={SCENES.reveal.duration} premountFor={fps}>
          <Scene05FinalReveal
            headline="Your Future Starts Here."
            support="Learn Skills. Build Projects. Shape Tomorrow."
            launchLabel="Now Launching"
            parent="by Asematic Technologies Private Limited"
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* The blue line that carries scene 1 into scene 2 */}
      <Sequence name="Light sweep" from={56} durationInFrames={30} premountFor={fps}>
        <LightSweep angle={14} wash={0.6} />
      </Sequence>

      {/* ---------- Audio ---------- */}
      <Audio name="Music" src={staticFile("audio/music.wav")} volume={musicVolume(frame)} premountFor={fps} />
      <Audio name="Ambience" src={staticFile("audio/sfx/ambience.wav")} volume={0.1} premountFor={fps} />

      {NARRATION.map((line) => (
        <Audio key={line.id} name={`Voice ${line.id}`} from={line.from} src={staticFile(line.src)} volume={0.7} premountFor={fps} />
      ))}

      {/* Scene 1 */}
      <Audio name="Rise" from={0} src={staticFile("audio/sfx/rise.wav")} volume={0.45} premountFor={fps} />
      <Audio name="Particles" from={8} src={staticFile("audio/sfx/particles.wav")} volume={0.4} premountFor={fps} />
      <Audio name="Logo hit" from={27} src={staticFile("audio/sfx/logo-hit.wav")} volume={0.3} premountFor={fps} />
      <Audio name="Sweep" from={55} src={staticFile("audio/sfx/sweep.wav")} volume={0.5} premountFor={fps} />
      {/* Scene 2 */}
      <Audio name="Click 1" from={76} src={staticFile("audio/sfx/click.wav")} volume={0.36} premountFor={fps} />
      <Audio name="Click 2" from={84} src={staticFile("audio/sfx/click.wav")} volume={0.3} premountFor={fps} />
      <Audio name="Click 3" from={98} src={staticFile("audio/sfx/click.wav")} volume={0.34} premountFor={fps} />
      <Audio name="Click 4" from={104} src={staticFile("audio/sfx/click.wav")} volume={0.28} premountFor={fps} />
      <Audio name="Whoosh into projects" from={143} src={staticFile("audio/sfx/whoosh.wav")} volume={0.5} premountFor={fps} />
      {/* Scene 3 */}
      <Audio name="Keyboard" from={170} src={staticFile("audio/sfx/keys.wav")} volume={0.26} premountFor={fps} />
      <Audio name="Confirm" from={204} src={staticFile("audio/sfx/confirm.wav")} volume={0.4} premountFor={fps} />
      <Audio name="Grid rise" from={208} src={staticFile("audio/sfx/short-rise.wav")} volume={0.34} premountFor={fps} />
      {/* Scene 4 */}
      <Audio name="Card 1" from={241} src={staticFile("audio/sfx/card.wav")} volume={0.36} premountFor={fps} />
      <Audio name="Card 2" from={248} src={staticFile("audio/sfx/card.wav")} volume={0.32} premountFor={fps} />
      <Audio name="Card 3" from={255} src={staticFile("audio/sfx/card.wav")} volume={0.34} premountFor={fps} />
      <Audio name="Card 4" from={262} src={staticFile("audio/sfx/card.wav")} volume={0.3} premountFor={fps} />
      <Audio name="Convergence sweep" from={318} src={staticFile("audio/sfx/sweep.wav")} volume={0.45} premountFor={fps} />
      {/* Scene 5 */}
      <Audio name="Reveal shimmer" from={341} src={staticFile("audio/sfx/particles.wav")} volume={0.4} premountFor={fps} />
      <Audio name="Reveal hit" from={344} src={staticFile("audio/sfx/logo-hit.wav")} volume={0.45} premountFor={fps} />
    </AbsoluteFill>
  );
};
