import narration from "../generated/reel-narration.json";

// Vertical reel: 1080 x 1920, 30 fps. The script runs ~30 s of speech at a clear, natural pace,
// so the reel is 33.3 s (hook -> voice-over -> ending, as in the brief).
export const REEL = {
  fps: 30,
  width: 1080,
  height: 1920,
  duration: 1000,
} as const;

export const REEL_TRANSITION = 14;

// Scene start frames on the reel timeline; each scene overlaps the next by one transition.
const STARTS = {
  hook: 0,
  intro: 104,
  projects: 316,
  tracks: 434,
  ideas: 576,
  end: 752,
} as const;
const span = (from: number, next: number) => ({
  from,
  duration: next - from + REEL_TRANSITION,
});
export const REEL_SCENES = {
  hook: span(STARTS.hook, STARTS.intro),
  intro: span(STARTS.intro, STARTS.projects),
  projects: span(STARTS.projects, STARTS.tracks),
  tracks: span(STARTS.tracks, STARTS.ideas),
  ideas: span(STARTS.ideas, STARTS.end),
  end: { from: STARTS.end, duration: REEL.duration - STARTS.end },
} as const;

const total =
  Object.values(REEL_SCENES).reduce((a, s) => a + s.duration, 0) -
  5 * REEL_TRANSITION;
if (total !== REEL.duration) {
  throw new Error(
    `Reel scenes add up to ${total} frames, expected ${REEL.duration}`,
  );
}

type LineId = keyof typeof narration.lines;
const line = (id: LineId, from: number) => ({
  id,
  from,
  src: `audio/reel/narration/${id}.wav`,
  duration: Math.ceil(narration.lines[id].seconds * REEL.fps),
});

// Global start frames of each voice-over line.
export const REEL_NARRATION = [
  line("01-hook", 8), //          0.27 s  "Students ke liye ek exciting announcement hai!"
  line("02-intro", 112), //       3.73 s  "Introducing Asematic Labs —"
  line("03-initiative", 190), //  6.33 s  "ek aisi learning initiative jahan aap sirf concepts nahi,"
  line("04-projects", 326), //   10.87 s  "real-world projects ke through skills build kar sakte ho."
  line("05-explore", 444), //    14.80 s  "Explore karo Web Development, Data Science aur AI/ML."
  line("06-learn", 586), //      19.53 s  "Learn karo, build karo, aur apne ideas ko reality mein convert karna start karo."
  line("07-tagline", 766), //    25.53 s  "Asematic Labs — Learn. Build. Launch."
  line("08-follow", 858), //     28.60 s  "Follow us for learning resources, projects aur upcoming programs!"
];

/** Local frame (inside a scene) at which a given number of seconds into a voice line is spoken. */
export const cue = (lineIndex: number, seconds: number, sceneFrom: number) =>
  REEL_NARRATION[lineIndex].from - sceneFrom + Math.round(seconds * REEL.fps);
