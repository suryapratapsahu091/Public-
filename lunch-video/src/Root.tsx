import { Composition, Folder } from "remotion";
import { LunchVideo } from "./LunchVideo";
import { ClockScene } from "./scenes/ClockScene";
import { MenuScene } from "./scenes/MenuScene";
import { ServedScene } from "./scenes/ServedScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="LunchVideo-Scenes">
        <Composition
          id="Clock"
          component={ClockScene}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Menu"
          component={MenuScene}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Served"
          component={ServedScene}
          durationInFrames={105}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
      {/* 120 + 150 + 105 - 2 × 15 transition overlap = 345 frames */}
      <Composition
        id="LunchVideo"
        component={LunchVideo}
        durationInFrames={345}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
