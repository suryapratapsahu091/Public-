# Asematic Technologies — Launch Video

10-second 16:9 brand launch video, 24 fps.

| File | Use |
| --- | --- |
| `asematic-launch-4k.mp4` | 3840×2160 master (website, YouTube) |
| `asematic-launch-1080p.mp4` | 1920×1080 (LinkedIn, Instagram, quick sharing) |

## Storyboard

| Time | Scene |
| --- | --- |
| 0–2 s | Particles light up and connect into a network — "The Future Is Being Built." |
| 2–4 s | Fly-through of light trails and geometric frames — "Ideas Into Innovation." |
| 4–7 s | Trails converge, flash, the logo mark appears and the wordmark wipes in |
| 7–10 s | End card: logo, "Engineering What's Next.", asematic.com |

## Rebuilding

Everything is generated from code; no stock footage or licensed music.

```bash
npm i -g playwright            # needs a Chromium binary
pip install numpy scipy pillow
NODE_PATH=$(npm root -g) node render.js   # frames/0000-0239.png at 3840x2160
python3 audio.py                          # audio.wav (synthesized soundtrack)
ffmpeg -framerate 24 -i frames/%04d.png -i audio.wav -c:v libx264 -preset slow -crf 17 \
  -pix_fmt yuv420p -tune grain -c:a aac -b:a 256k -movflags +faststart -t 10 asematic-launch-4k.mp4
```

Open `video.html` in a browser for a live looping preview. Logo assets in `assets/`
were extracted from the official logo; the navy parts are switched to white so they
read on the dark background.
