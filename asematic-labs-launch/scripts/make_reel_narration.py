"""Generates the Hinglish voice-over for the 25 s vertical reel (AsematicLabsReel) into
public/audio/reel/narration/, with Kokoro-82M running locally (no API key or paid service).

Hinglish is built from segments: Hindi words are written in Devanagari and phonemised as Hindi,
English words are phonemised as English, and the joined phonemes are spoken by one voice. Feeding the
romanised script straight in makes the model read "ke liye" as English ("kee lie").

Run from the project root (needs the Kokoro files, see scripts/make_narration.py):
    KOKORO_DIR=/path/to/kokoro/files python3 scripts/make_reel_narration.py

Options (environment variables):
    REEL_VOICE   Kokoro voice (default hf_alpha: female, Indian accent)
    REEL_PACE    multiplies every line's speed (default 1.0)
"""
import json
import os
import sys
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_narration import SR_OUT, TARGET_LUFS, compress, limit, presence, resample, trim  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio" / "reel" / "narration"
MODEL_DIR = Path(os.environ.get("KOKORO_DIR", "."))
VOICE = os.environ.get("REEL_VOICE", "hf_alpha")
PACE = float(os.environ.get("REEL_PACE", "1.0"))

# "Asematic" -> "a-SEM-uh-tik", as approved for the launch film.
BRAND = "ɐsˈɛmətɪk"

# (line id, on-screen/subtitle text, speed, segments). Segment language "hi" = Devanagari Hindi,
# "en" = English, "ph" = literal phonemes.
LINES = [
    ("01-hook", "Students ke liye ek exciting announcement hai!", 1.0,
     [("en", "Students"), ("hi", "के लिए एक"), ("en", "exciting announcement"), ("hi", "है!")]),
    ("02-intro", "Introducing Asematic Labs —", 0.95,
     [("en", "Introducing"), ("ph", f"{BRAND} lˈæbz,")]),
    ("03-initiative", "ek aisi learning initiative jahan aap sirf concepts nahi,", 1.0,
     [("hi", "एक ऐसी"), ("en", "learning initiative,"), ("hi", "जहाँ आप सिर्फ"), ("en", "concepts"), ("hi", "नहीं,")]),
    ("04-projects", "real-world projects ke through skills build kar sakte ho.", 1.0,
     [("en", "real-world projects"), ("hi", "के"), ("en", "through skills build"), ("hi", "कर सकते हो।")]),
    ("05-explore", "Explore karo Web Development, Data Science aur AI/ML.", 1.0,
     [("en", "Explore"), ("hi", "करो"), ("en", "Web Development, Data Science"), ("hi", "और"), ("ph", "ˈeɪ.ˈaɪ. ˈɛm.ˈɛl.")]),
    ("06-learn", "Learn karo, build karo, aur apne ideas ko reality mein convert karna start karo.", 1.05,
     [("en", "Learn"), ("hi", "करो,"), ("en", "build"), ("hi", "करो, और अपने"), ("en", "ideas"), ("hi", "को"),
      ("en", "reality"), ("hi", "में"), ("en", "convert"), ("hi", "करना"), ("en", "start"), ("hi", "करो।")]),
    ("07-tagline", "Asematic Labs — Learn. Build. Launch.", 0.95,
     [("ph", f"{BRAND} lˈæbz."), ("en", "Learn. Build. Launch!")]),
    ("08-follow", "Follow us for learning resources, projects aur upcoming programs!", 1.05,
     [("en", "Follow us for learning resources, projects"), ("hi", "और"), ("en", "upcoming programs!")]),
]


def main() -> None:
    from kokoro_onnx import Kokoro

    kokoro = Kokoro(str(MODEL_DIR / "kokoro-v1.0.onnx"), str(MODEL_DIR / "voices-v1.0.bin"))
    OUT.mkdir(parents=True, exist_ok=True)
    timing = {}
    for name, text, speed, segments in LINES:
        parts = []
        for lang, chunk in segments:
            if lang == "ph":
                parts.append(chunk)
            else:
                parts.append(kokoro.tokenizer.phonemize(chunk, "hi" if lang == "hi" else "en-us"))
        phonemes = " ".join(parts)
        samples, sr = kokoro.create(phonemes, voice=VOICE, speed=speed * PACE, lang="en-us", is_phonemes=True)
        audio = trim(resample(samples.astype(np.float64), sr, SR_OUT))
        fade = int(0.01 * SR_OUT)
        audio[:fade] *= np.linspace(0, 1, fade)
        audio[-fade * 4 :] *= np.linspace(1, 0, fade * 4)
        audio = compress(presence(audio / max(1e-9, np.max(np.abs(audio)))), threshold_db=-20, ratio=2.5, release=0.12)
        meter = pyln.Meter(SR_OUT, block_size=0.2)
        audio = limit(audio * 10 ** ((TARGET_LUFS - meter.integrated_loudness(audio)) / 20))
        sf.write(OUT / f"{name}.wav", audio.astype(np.float32), SR_OUT, subtype="PCM_16")
        timing[name] = {"text": text, "seconds": round(len(audio) / SR_OUT, 3), "phonemes": phonemes}
        print(f"{name}: {timing[name]['seconds']:.2f}s  {text}")

    gen = ROOT / "src" / "generated"
    gen.mkdir(exist_ok=True)
    meta = {"voice": VOICE, "pace": PACE, "lines": timing}
    (gen / "reel-narration.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
