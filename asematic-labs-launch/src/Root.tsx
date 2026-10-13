import { Composition, Folder } from "remotion";
import { AsematicLabsLaunch } from "./AsematicLabsLaunch";
import { Scene01BrandGenesis } from "./scenes/Scene01BrandGenesis";
import { Scene02Learning } from "./scenes/Scene02Learning";
import { Scene03Projects } from "./scenes/Scene03Projects";
import { Scene04Opportunities } from "./scenes/Scene04Opportunities";
import { Scene05FinalReveal } from "./scenes/Scene05FinalReveal";
import { ReelLaunch } from "./reel/ReelLaunch";
import "./styles/brand";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="AsematicLabsLaunch" component={AsematicLabsLaunch} durationInFrames={450} fps={30} width={1920} height={1080} />
      {/* Vertical Hinglish announcement reel (Instagram Reels / YouTube Shorts). */}
      <Composition id="AsematicLabsReel" component={ReelLaunch} durationInFrames={1000} fps={30} width={1080} height={1920} />
      {/* Individual scenes, for previewing and editing in isolation (no background or audio). */}
      <Folder name="Scenes">
        <Composition
          id="Scene01-BrandGenesis"
          component={Scene01BrandGenesis}
          durationInFrames={81}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ tagline: "Learn. Build. Innovate." }}
        />
        <Composition
          id="Scene02-Learning"
          component={Scene02Learning}
          durationInFrames={95}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ headline: ["Learn", "Industry-Ready", "Skills"], support: "Practical learning. Real-world skills." }}
        />
        <Composition
          id="Scene03-Projects"
          component={Scene03Projects}
          durationInFrames={94}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ headline: "Build Real-World Projects", support: "Turn knowledge into experience." }}
        />
        <Composition
          id="Scene04-Opportunities"
          component={Scene04Opportunities}
          durationInFrames={117}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ headline: "Learn. Create. Grow.", support: "Skills that move you forward." }}
        />
        <Composition
          id="Scene05-FinalReveal"
          component={Scene05FinalReveal}
          durationInFrames={111}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            headline: "Your Future Starts Here.",
            support: "Learn Skills. Build Projects. Shape Tomorrow.",
            launchLabel: "Now Launching",
            parent: "by Asematic Technologies Private Limited",
          }}
        />
      </Folder>
    </>
  );
};
