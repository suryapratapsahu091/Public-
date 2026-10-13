import { Easing, interpolate, random, spring } from "remotion";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Named curves, used consistently across scenes.
export const EASE = {
  // Long, confident deceleration for camera moves and entrances.
  out: Easing.bezier(0.16, 1, 0.3, 1),
  // Symmetric, for moves that start and stop on screen.
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  // Accelerating exits.
  in: Easing.bezier(0.7, 0, 0.84, 0),
  // Gentle standard curve.
  soft: Easing.bezier(0.33, 1, 0.68, 1),
} as const;

/** Clamped interpolate with an easing curve. */
export const tween = (
  frame: number,
  input: [number, number] | number[],
  output: number[],
  easing: (t: number) => number = EASE.out,
) => interpolate(frame, input, output, { ...CLAMP, easing });

/** 0 -> 1 progress between two frames. */
export const progress = (frame: number, start: number, end: number, easing: (t: number) => number = EASE.out) =>
  tween(frame, [start, end], [0, 1], easing);

/** Refined spring with a small overshoot, for wordmarks and hero elements. */
export const settle = (frame: number, fps: number, delay = 0, durationInFrames?: number) =>
  spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120, mass: 0.9 }, durationInFrames });

/** Critically damped spring with no overshoot, for UI panels. */
export const glide = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 90 } });

/** Deterministic pseudo-random in a range. */
export const rand = (seed: string | number, min = 0, max = 1) => min + random(seed) * (max - min);

/** Slow, deterministic floating offset (px) for idle motion. */
export const drift = (frame: number, seed: number, amplitude = 6, period = 120) =>
  Math.sin(((frame + seed * 37) / period) * Math.PI * 2) * amplitude;

/** Point on a cubic Bézier curve. */
export const bezierPoint = (
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
): [number, number] => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
};
