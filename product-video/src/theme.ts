import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Inter is bundled in public/fonts so the video renders offline.
export const fontFamily = "Inter";
for (const weight of ["400", "700", "800"]) {
  loadFont({ family: fontFamily, url: staticFile(`fonts/Inter-${weight}.woff2`), weight });
}

// Sampled from the official Asematic logo.
export const COLORS = {
  blue: "#0158F8",
  blueLight: "#5B8CFF",
  violet: "#8B5CF6",
  cyan: "#38BDF8",
  navy: "#040F2D",
  bg: "#020617",
  card: "#0B1A45",
  cardBorder: "rgba(91,140,255,0.35)",
  text: "#FFFFFF",
  textDim: "#B9C6EE",
};

// 1080x1920 safe zone: 150px top, 170px bottom, 60px sides.
export const SAFE = { top: 150, bottom: 170, side: 60, width: 960 };
