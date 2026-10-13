import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are bundled in public/ so rendering works without network access.
// Both files are variable fonts covering every weight used in the video.
export const display = "Fraunces";
export const body = "Inter";

loadFont({
  family: display,
  url: staticFile("fonts/Fraunces.woff2"),
  weight: "100 900",
});

loadFont({
  family: body,
  url: staticFile("fonts/Inter.woff2"),
  weight: "100 900",
});
