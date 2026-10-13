import narration from "../generated/narration.json";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION = 450; // exactly 15 s

// Every scene overlaps the next by one transition. The midpoint of each transition lands on the
// brief's scene boundary (frames 75, 158, 240, 345).
export const TRANSITION = 12;

export const SCENES = {
  genesis: { from: 0, duration: 81 }, //       0 - 80   (boundary 75)
  learning: { from: 69, duration: 95 }, //    69 - 163  (boundary 158)
  projects: { from: 152, duration: 94 }, //  152 - 245  (boundary 240)
  opportunities: { from: 234, duration: 117 }, // 234 - 350 (boundary 345)
  reveal: { from: 339, duration: 111 }, //    339 - 449
} as const;

// Sum of durations minus four overlaps must equal the composition length.
const total =
  SCENES.genesis.duration +
  SCENES.learning.duration +
  SCENES.projects.duration +
  SCENES.opportunities.duration +
  SCENES.reveal.duration -
  4 * TRANSITION;
if (total !== DURATION) {
  throw new Error(`Scene timing adds up to ${total} frames, expected ${DURATION}`);
}

// Narration placement (global frames). Lengths come from scripts/make_narration.py.
type LineId = keyof typeof narration.lines;
const line = (id: LineId, from: number) => ({
  id,
  from,
  src: `audio/narration/${id}.wav`,
  duration: Math.ceil(narration.lines[id].seconds * FPS),
});

export const NARRATION = [
  line("01-welcome", 10), //  0.33 s  "Welcome to Asematic Labs."
  line("02-learn", 84), //    2.80 s  "Learn industry-ready skills,"
  line("03-build", 160), //   5.33 s  "build real-world projects,"
  line("04-turn", 226), //    7.53 s  "and turn your potential into opportunity."
  line("05-future", 318), // 10.60 s  "Your future starts here."
  line("06-launch", 372), // 12.40 s  "Asematic Labs, now launching."  (ends ~14.67 s)
];
