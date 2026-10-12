import { Composition, Folder } from "remotion";
import { LaunchVideo } from "./LaunchVideo";
import { Cta } from "./scenes/Cta";
import { Demo } from "./scenes/Demo";
import { Features } from "./scenes/Features";
import { Hook } from "./scenes/Hook";
import { Intro } from "./scenes/Intro";
import { Showcase } from "./scenes/Showcase";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="AsematicLaunch" component={LaunchVideo} durationInFrames={750} fps={30} width={1080} height={1920} />
      <Folder name="Scenes">
        <Composition id="Hook" component={Hook} durationInFrames={90} fps={30} width={1080} height={1920} defaultProps={{ question: "Got an idea but no tech team?" }} />
        <Composition id="Intro" component={Intro} durationInFrames={90} fps={30} width={1080} height={1920} defaultProps={{ tagline: "Engineering What’s Next." }} />
        <Composition
          id="Demo"
          component={Demo}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ prompt: "An AI booking app for my clinic", buttonLabel: "Start my project" }}
        />
        <Composition
          id="Showcase"
          component={Showcase}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ headline1: "Websites that convert", headline2: "AI that works for you", headline3: "SaaS you can scale" }}
        />
        <Composition
          id="Features"
          component={Features}
          durationInFrames={90}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            feature1: "Custom software, built to scale",
            feature2: "AI built into your product",
            feature3: "SaaS from idea to launch",
          }}
        />
        <Composition id="CTA" component={Cta} durationInFrames={90} fps={30} width={1080} height={1920} defaultProps={{ headline: "Let’s build what’s next.", url: "asematic.com" }} />
      </Folder>
    </>
  );
};
