import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Cta } from "./scenes/Cta";
import { Demo } from "./scenes/Demo";
import { Features } from "./scenes/Features";
import { Hook } from "./scenes/Hook";
import { Intro } from "./scenes/Intro";
import { Showcase } from "./scenes/Showcase";

// 25s vertical launch video: hook 3s, intro 3s, demo 8s, showcase 5s, features 3s, CTA 3s.
export const LaunchVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Hook name="Hook" durationInFrames={3 * fps} premountFor={fps} question="Got an idea but no tech team?" />
      <Intro name="Intro" from={3 * fps} durationInFrames={3 * fps} premountFor={fps} tagline={"Engineering What’s Next."} />
      <Demo name="Demo" from={6 * fps} durationInFrames={8 * fps} premountFor={fps} prompt="An AI booking app for my clinic" buttonLabel="Start my project" />
      <Showcase
        name="Showcase"
        from={14 * fps}
        durationInFrames={5 * fps}
        premountFor={fps}
        headline1="Websites that convert"
        headline2="AI that works for you"
        headline3="SaaS you can scale"
      />
      <Features
        name="Features"
        from={19 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
        feature1="Custom software, built to scale"
        feature2="AI built into your product"
        feature3="SaaS from idea to launch"
      />
      <Cta name="CTA" from={22 * fps} durationInFrames={3 * fps} premountFor={fps} headline={"Let’s build what’s next."} url="asematic.com" />
      <Audio name="Soundtrack" src={staticFile("soundtrack.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
