"""Generates the voice-over lines in public/audio/narration/ with Kokoro-82M (Apache-2.0),
an open neural TTS model that runs locally through ONNX Runtime. No API key or paid service.

Setup (model files are ~350 MB and are not committed):
    pip install kokoro-onnx soundfile numpy scipy pyloudnorm
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

Run from the project root:
    KOKORO_DIR=/path/to/model/files python3 scripts/make_narration.py

Each line is written as its own WAV so the composition can place it exactly on the scene
timeline (see src/utils/timing.ts). Durations are written to src/generated/narration.json.
"""
import json
import os
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio" / "narration"
MODEL_DIR = Path(os.environ.get("KOKORO_DIR", "."))
VOICE = os.environ.get("NARRATION_VOICE", "hm_omega")  # warm male voice with an Indian English accent
SR_OUT = 48000
TARGET_LUFS = -16.0  # each line is levelled to this, so the mix gains in the composition are predictable

# "Asematic" -> "ASS-eh-MAT-ik", with a full "e", a crisp t and the stress on MAT. Kokoro's default
# G2P says "asi-MAD-ik"; the brand name is pronounced from this phoneme string instead. Tested
# against "AY-seh-MAT-ik", which this voice blurs into "Is somatic" at the start of a sentence.
# Change it here if the brand team prefers a different reading.
BRAND_PHONEMES = "ˌæsɛmˈætɪk"
# Brand lines are read slowest so "Asematic Labs" is unmistakable; the rest keeps a natural pace.
BRAND_SPEED = 0.95

LINES = [
    ("01-welcome", "Welcome to Asematic Labs.", BRAND_SPEED),
    ("02-learn", "Learn industry-ready skills,", 1.05),
    ("03-build", "build real-world projects,", 1.05),
    ("04-turn", "and turn your potential into opportunity.", 1.05),
    ("05-future", "Your future starts here.", 1.0),
    ("06-launch", "Asematic Labs, now launching.", BRAND_SPEED),
]


def resample(x: np.ndarray, sr_in: int, sr_out: int) -> np.ndarray:
    from scipy.signal import resample_poly

    g = np.gcd(sr_in, sr_out)
    return resample_poly(x, sr_out // g, sr_in // g)


def trim(x: np.ndarray, thresh: float = 0.004, pad: int = 480) -> np.ndarray:
    idx = np.nonzero(np.abs(x) > thresh)[0]
    if len(idx) == 0:
        return x
    return x[max(0, idx[0] - pad) : min(len(x), idx[-1] + pad * 4)]


def presence(x: np.ndarray) -> np.ndarray:
    """Clarity EQ: remove low rumble and lift the 2-6 kHz consonant band by about 4 dB."""
    from scipy.signal import butter, sosfilt

    x = sosfilt(butter(2, 90, "high", fs=SR_OUT, output="sos"), x)
    band = sosfilt(butter(2, [2000, 6000], "band", fs=SR_OUT, output="sos"), x)
    return x + band * 0.6


def compress(x: np.ndarray, threshold_db: float = -24.0, ratio: float = 3.0, attack: float = 0.004, release: float = 0.09) -> np.ndarray:
    """Gentle feed-forward compressor: evens out syllable levels so the voice sits clearly on top of the music."""
    a_att = np.exp(-1.0 / (attack * SR_OUT))
    a_rel = np.exp(-1.0 / (release * SR_OUT))
    env = np.zeros_like(x)
    level = 0.0
    for i, v in enumerate(np.abs(x)):
        coeff = a_att if v > level else a_rel
        level = coeff * level + (1 - coeff) * v
        env[i] = level
    env_db = 20 * np.log10(np.maximum(env, 1e-6))
    over = np.maximum(0.0, env_db - threshold_db)
    gain_db = -over * (1 - 1 / ratio)
    return x * 10 ** (gain_db / 20)


def limit(x: np.ndarray, ceiling_db: float = -1.5) -> np.ndarray:
    """Soft limiter: transparent below the knee, smoothly saturating toward the ceiling."""
    c = 10 ** (ceiling_db / 20)
    knee = 0.7 * c
    y = x.copy()
    over = np.abs(x) > knee
    y[over] = np.sign(x[over]) * (knee + (c - knee) * np.tanh((np.abs(x[over]) - knee) / (c - knee)))
    return y


def main() -> None:
    kokoro = Kokoro(str(MODEL_DIR / "kokoro-v1.0.onnx"), str(MODEL_DIR / "voices-v1.0.bin"))
    OUT.mkdir(parents=True, exist_ok=True)
    timing = {}
    for name, text, speed in LINES:
        phonemes = kokoro.tokenizer.phonemize(text, "en-us")
        for flapped in ("ˌæsɪmˈæɾɪk", "æsɪmˈæɾɪk", "ˌæsɪmˈætɪk"):
            phonemes = phonemes.replace(flapped, BRAND_PHONEMES)
        samples, sr = kokoro.create(phonemes, voice=VOICE, speed=speed, lang="en-us", is_phonemes=True)
        audio = trim(resample(samples.astype(np.float64), sr, SR_OUT))
        # Short fades so no line starts or ends with a click.
        fade = int(0.01 * SR_OUT)
        audio[:fade] *= np.linspace(0, 1, fade)
        audio[-fade * 4 :] *= np.linspace(1, 0, fade * 4)
        audio = compress(presence(audio / max(1e-9, np.max(np.abs(audio)))))
        meter = pyln.Meter(SR_OUT, block_size=0.2)
        audio = audio * 10 ** ((TARGET_LUFS - meter.integrated_loudness(audio)) / 20)
        audio = limit(audio)
        sf.write(OUT / f"{name}.wav", audio.astype(np.float32), SR_OUT, subtype="PCM_16")
        timing[name] = {"text": text, "seconds": round(len(audio) / SR_OUT, 3), "phonemes": phonemes}
        lufs = meter.integrated_loudness(audio)
        peak = 20 * np.log10(np.max(np.abs(audio)))
        print(f"{name}: {timing[name]['seconds']:.2f}s  {lufs:.1f} LUFS  peak {peak:.1f} dBFS  {phonemes}")

    gen = ROOT / "src" / "generated"
    gen.mkdir(exist_ok=True)
    (gen / "narration.json").write_text(json.dumps({"voice": VOICE, "lines": timing}, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
