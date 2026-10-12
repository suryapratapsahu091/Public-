# Asematic — Vertical Product Launch Video (Remotion)

25-second 1080×1920 / 30 fps launch video for Asematic Technologies, built with Remotion.

Rendered file: `out/asematic-launch-vertical.mp4`

## Scenes

| Time | Scene | File |
| --- | --- | --- |
| 0–3 s | Hook question slams in | `src/scenes/Hook.tsx` |
| 3–6 s | Logo scales in from 3×, particle burst, tagline | `src/scenes/Intro.tsx` |
| 6–14 s | Simulated demo: cursor types an idea, taps the button, results appear | `src/scenes/Demo.tsx` |
| 14–19 s | Three product visuals crossfade with headlines | `src/scenes/Showcase.tsx` |
| 19–22 s | Dashboard shrinks to the top, three benefits slide in | `src/scenes/Features.tsx` |
| 22–25 s | Logo, call to action, pulsing URL, fade to black | `src/scenes/Cta.tsx` |

All text stays inside the mobile safe zone (150 px top, 170 px bottom, 60 px sides) and is 28 px or larger.

## Preview and render

```bash
npm i
npx remotion studio                 # interactive preview; each scene is also its own composition
npx remotion render AsematicLaunch out/asematic-launch-vertical.mp4
```

Every scene's text (hook question, typed idea, headlines, features, URL) is an editable prop in Studio.

## Notes

- The product visuals in the showcase are illustrations built in code; swap them for real screenshots
  when available.
- No social-proof counter is shown because there are no verified numbers yet.
- `public/soundtrack.wav` is synthesized by `scripts/make_soundtrack.py` (numpy + scipy) and is cued to the scenes.
- Inter is bundled in `public/fonts/` so rendering works offline.
