import { CARD_H, CARD_W } from "../components/LearningCards";
import { EASE, tween } from "./animations";

// Shared between Scene 3 (panels align into this grid) and Scene 4 (the grid becomes the cards),
// so the hand-over between the two scenes is seamless.

const GAP = 40;
const ROW_LEFT = (1920 - (4 * CARD_W + 3 * GAP)) / 2;
const TOPS = [474, 446, 486, 458];
const ORIGIN = { x: 960, y: 540 };

export const cardRect = (i: number) => ({ left: ROW_LEFT + i * (CARD_W + GAP), top: TOPS[i], width: CARD_W, height: CARD_H });

/** Scene 4 camera at a local frame: starts close on the row, travels across it, then pulls back. */
export const scene4Camera = (frame: number) => {
  const scale = frame < 50 ? tween(frame, [0, 50], [1.26, 1.18], EASE.inOut) : tween(frame, [50, 84], [1.18, 1], EASE.inOut);
  const tx = frame < 50 ? tween(frame, [0, 50], [230, -150], EASE.inOut) : tween(frame, [50, 84], [-150, 0], EASE.inOut);
  const ty = tween(frame, [0, 84], [-40, 0], EASE.inOut);
  return { scale, tx, ty };
};

export const cameraTransform = (cam: ReturnType<typeof scene4Camera>) =>
  `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.scale})`;
export const CAMERA_ORIGIN = `${ORIGIN.x}px ${ORIGIN.y}px`;

/** Where card i appears on screen through the camera at a given Scene 4 frame. */
export const screenRect = (i: number, frame: number) => {
  const r = cardRect(i);
  const c = scene4Camera(frame);
  return {
    left: ORIGIN.x + (r.left - ORIGIN.x) * c.scale + c.tx,
    top: ORIGIN.y + (r.top - ORIGIN.y) * c.scale + c.ty,
    width: r.width * c.scale,
    height: r.height * c.scale,
    scale: c.scale,
  };
};
