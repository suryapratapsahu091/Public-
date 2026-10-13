import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { ClockScene } from "./scenes/ClockScene";
import { MenuScene } from "./scenes/MenuScene";
import { ServedScene } from "./scenes/ServedScene";

export const LunchVideo: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Clock" durationInFrames={120}>
      <ClockScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-right" })}
      timing={linearTiming({ durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence name="Menu" durationInFrames={150}>
      <MenuScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence name="Served" durationInFrames={105}>
      <ServedScene />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
