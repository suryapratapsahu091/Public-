import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill, interpolate } from "remotion";
import { EASE } from "../utils/animations";

type ZoomProps = {
  /** How far the exiting scene scales up as the camera flies through it. */
  readonly exitScale: number;
  /** Scale the entering scene starts from before settling at 1. */
  readonly enterScale: number;
  /** Peak blur (px) applied while the scene is moving fastest. */
  readonly blur: number;
  /** Transform origin for the fly-through, e.g. "62% 48%" to dive into one panel. */
  readonly origin: string;
  /** Optional colour wash that fills the frame at the midpoint. */
  readonly wash: string | null;
};

const ZoomPresentation: React.FC<TransitionPresentationComponentProps<ZoomProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const p = presentationProgress;
  const exiting = presentationDirection === "exiting";
  // Blur peaks mid-transition, a light-weight stand-in for camera motion blur.
  const blur = Math.sin(p * Math.PI) * passedProps.blur;

  const scale = exiting
    ? interpolate(p, [0, 1], [1, passedProps.exitScale], { easing: EASE.in })
    : interpolate(p, [0, 1], [passedProps.enterScale, 1], { easing: EASE.out });
  const opacity = exiting
    ? interpolate(p, [0, 0.55, 1], [1, 0.85, 0], { extrapolateRight: "clamp" })
    : interpolate(p, [0, 0.45, 1], [0, 0.6, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          scale: String(scale),
          opacity,
          transformOrigin: passedProps.origin,
          filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      {exiting && passedProps.wash ? (
        <AbsoluteFill style={{ background: passedProps.wash, opacity: Math.sin(p * Math.PI) * 0.9, pointerEvents: "none" }} />
      ) : null}
    </AbsoluteFill>
  );
};

export const zoomThrough = (props: Partial<ZoomProps> = {}): TransitionPresentation<ZoomProps> => ({
  component: ZoomPresentation,
  props: {
    exitScale: props.exitScale ?? 1.8,
    enterScale: props.enterScale ?? 0.9,
    blur: props.blur ?? 6,
    origin: props.origin ?? "50% 50%",
    wash: props.wash ?? null,
  },
});
