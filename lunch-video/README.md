# Lunch Video

A 11.5-second, 1920×1080 Remotion video announcing today's lunch menu.

| Scene  | Frames | What happens                                        |
| ------ | ------ | --------------------------------------------------- |
| Clock  | 120    | Clock hands spin to 12:30, "Lunch time." slides in  |
| Menu   | 150    | Three dishes with prices slide in one after another |
| Served | 105    | "Lunch is served." with the location and hours      |

Scenes are joined with a slide and a fade (15 frames each), for 345 frames at 30 fps.

## Commands

```bash
npm i
npm run dev                          # open Remotion Studio
npx remotion render LunchVideo       # render to out/LunchVideo.mp4
```

Edit menu items in `src/scenes/MenuScene.tsx` and the location/hours in `src/scenes/ServedScene.tsx`.
Fonts (Fraunces, Inter) are bundled in `public/fonts` so rendering works offline.
