"""Generates the voice-over lines in public/audio/narration/ with open neural TTS models that run
locally (no API key or paid service).

Default engine "kokoro": Kokoro-82M (Apache-2.0) with the af_heart voice, read slightly slower with
a corrected brand pronunciation. Alternative engine "vctk": a VITS model trained on the VCTK English
corpus, speaker p248 (a young Indian woman reading English), run through sherpa-onnx.

Setup (model files are not committed):
    pip install sherpa-onnx soundfile numpy scipy pyloudnorm          # vctk engine
    curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-vctk.tar.bz2
    tar xjf vits-vctk.tar.bz2
    pip install kokoro-onnx                                           # kokoro engine (optional)
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

Run from the project root:
    KOKORO_DIR=/path/to/kokoro/files python3 scripts/make_narration.py
    NARRATION_ENGINE=vctk VCTK_DIR=/path/to/vits-vctk python3 scripts/make_narration.py

VCTK options (environment variables):
    VCTK_SPEAKER      VCTK speaker id (default p248)
    VCTK_SPEED        speaking speed (default 0.9: slightly slow, for maximum clarity)
    VCTK_NOISE        sampling noise (default 0 = deterministic and clearest)
    VCTK_BRAND        lexicon pronunciation of "asematic" (default "ɐ s ˈ ɛ m æ t ɪ k" = a-SEM-a-tik)

Kokoro options (environment variables):
    NARRATION_VOICE   a Kokoro voice, or a blend such as "hf_alpha:0.6+af_heart:0.4"
    NARRATION_PACE    multiplies every line's speed (1.08 = 8% faster, more energetic)
    NARRATION_PITCH   pitch shift in semitones, formant-preserving (needs ffmpeg with rubberband)
    BRAND_PHONEMES    override the pronunciation of "Asematic"
    TO_PHONEMES       how "to" is said before the brand: "tuː" (full, default) or "tʊ" (reduced)
    BRAND_SPEED       speed of the two brand lines (default 0.95; lower = slower, clearer)

Each line is written as its own WAV so the composition can place it exactly on the scene
timeline (see src/utils/timing.ts). Durations are written to src/generated/narration.json.
"""
import json
import os
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
ENGINE = os.environ.get("NARRATION_ENGINE", "kokoro")
VCTK_DIR = Path(os.environ.get("VCTK_DIR", "vits-vctk"))
VCTK_SPEAKER = os.environ.get("VCTK_SPEAKER", "p248")
VCTK_SPEED = float(os.environ.get("VCTK_SPEED", "0.9"))
VCTK_BRAND = os.environ.get("VCTK_BRAND", "ɐ s ˈ ɛ m æ t ɪ k")
VCTK_NOISE = float(os.environ.get("VCTK_NOISE", "0"))
# Speaker order of the sherpa-onnx vits-vctk model (sid = index).
VCTK_SPEAKERS = (
    "p225 p226 p227 p228 p229 p230 p231 p232 p233 p234 p236 p237 p238 p239 p240 p241 p243 p244 p245 p246 "
    "p247 p248 p249 p250 p251 p252 p253 p254 p255 p256 p257 p258 p259 p260 p261 p262 p263 p264 p265 p266 "
    "p267 p268 p269 p270 p271 p272 p273 p274 p275 p276 p277 p278 p279 p280 p281 p282 p283 p284 p285 p286 "
    "p287 p288 p292 p293 p294 p295 p297 p298 p299 p300 p301 p302 p303 p304 p305 p306 p307 p308 p310 p311 "
    "p312 p313 p314 p315 p316 p317 p318 p323 p326 p329 p330 p333 p334 p335 p336 p339 p340 p341 p343 p345 "
    "p347 p351 p360 p361 p362 p363 p364 p374 p376"
).split()
OUT = ROOT / "public" / "audio" / "narration"
MODEL_DIR = Path(os.environ.get("KOKORO_DIR", "."))
VOICE = os.environ.get("NARRATION_VOICE", "af_heart")  # clear international English female voice
PACE = float(os.environ.get("NARRATION_PACE", "0.95"))  # a touch slower for clear diction
PITCH = float(os.environ.get("NARRATION_PITCH", "0"))
SR_OUT = 48000
TARGET_LUFS = -16.0  # each line is levelled to this, so the mix gains in the composition are predictable

# "Asematic" -> "a-SEM-uh-tik": stress on SEM so the "se" is clearly heard, and a light, unstressed
# "-ma-" (a stressed "ass-eh-MAT-ik" swallowed the "se" and sounded like "AsemAtic"). Kokoro's
# default G2P says "asi-MAD-ik"; the brand name is pronounced from this phoneme string instead.
BRAND_PHONEMES = os.environ.get("BRAND_PHONEMES", "ɐsˈɛmətɪk")
# A full "too" before the brand keeps "to Asematic" from blurring into "to a-sematic".
TO_PHONEMES = os.environ.get("TO_PHONEMES", "tʊ")
# Brand lines are read slowest so "Asematic Labs" is unmistakable; the rest keeps a natural pace.
BRAND_SPEED = float(os.environ.get("BRAND_SPEED", "0.95"))

# Exclamation marks lift the intonation for an upbeat, active read (on-screen text is unaffected).
LINES = [
    ("01-welcome", "Welcome to Asematic Labs!", BRAND_SPEED),
    ("02-learn", "Learn industry-ready skills,", 1.05),
    ("03-build", "build real-world projects,", 1.05),
    ("04-turn", "and turn your potential into opportunity!", 0.9),  # slower: the longest, densest line
    ("05-future", "Your future starts here!", 1.0),
    ("06-launch", "Asematic Labs, now launching!", BRAND_SPEED),
]


# Plain spellings for the VCTK lexicon (it has no hyphenated compounds); calm full stops on the
# brand lines keep "Labs" crisp.
VCTK_TEXT = {
    # The model swallows "Labs" when it ends a sentence, so this line is spoken with a helper word
    # ("..., everyone.") and the audio is cut at the pause before it. The film says only
    # "Welcome to Asematic Labs."
    "01-welcome": "Welcome to Asematic Labs, everyone.",
    "02-learn": "Learn industry ready skills,",
    "03-build": "build real world projects,",
    "04-turn": "and turn your potential into opportunity!",
    "05-future": "Your future starts here!",
    "06-launch": "Asematic Labs, now launching.",
}


def cut_before_last_word(x: np.ndarray, sr: int) -> np.ndarray:
    """Cuts a clip at the last pause that still has a full word (>= 0.3 s of audio) after it."""
    hop = int(0.01 * sr)
    energy = np.array([np.sqrt(np.mean(x[i : i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
    quiet = energy < 0.03 * energy.max()
    gaps, i = [], 0
    while i < len(energy):
        if quiet[i]:
            j = i
            while j < len(energy) and quiet[j]:
                j += 1
            if j < len(energy) and (len(energy) - j) * hop / sr >= 0.3 and i * hop / sr > 0.8:
                gaps.append(i)
            i = j
        else:
            i += 1
    return x[: gaps[-1] * hop + int(0.03 * sr)]


def vctk_engine():
    """Returns synth(name, text) -> (samples, sample_rate) for the VCTK model."""
    import sherpa_onnx

    lexicon = Path(tempfile.mkdtemp()) / "lexicon.txt"
    lexicon.write_text((VCTK_DIR / "lexicon.txt").read_text() + f"asematic {VCTK_BRAND}\n")
    tts = sherpa_onnx.OfflineTts(
        sherpa_onnx.OfflineTtsConfig(
            model=sherpa_onnx.OfflineTtsModelConfig(
                vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                    model=str(VCTK_DIR / "vits-vctk.onnx"),
                    lexicon=str(lexicon),
                    tokens=str(VCTK_DIR / "tokens.txt"),
                    # Sampling noise: lower = steadier, clearer articulation; 0 makes it repeatable.
                    noise_scale=VCTK_NOISE,
                    noise_scale_w=VCTK_NOISE,
                ),
                num_threads=4,
            )
        )
    )
    sid = VCTK_SPEAKERS.index(VCTK_SPEAKER)

    def synth(name, _text):
        text = VCTK_TEXT[name]
        a = tts.generate(text, sid=sid, speed=VCTK_SPEED)
        x = np.array(a.samples)
        if text.endswith(", everyone."):
            x = cut_before_last_word(x, a.sample_rate)
            text = text.replace(", everyone.", ".")
        return x, a.sample_rate, text

    return synth


def kokoro_engine():
    """Returns synth(name, text) -> (samples, sample_rate, phonemes) for Kokoro."""
    from kokoro_onnx import Kokoro

    kokoro = Kokoro(str(MODEL_DIR / "kokoro-v1.0.onnx"), str(MODEL_DIR / "voices-v1.0.bin"))
    voice = load_voice(kokoro, VOICE)
    speeds = {name: speed for name, _, speed in LINES}

    def synth(name, text):
        phonemes = kokoro.tokenizer.phonemize(text, "en-us")
        for flapped in ("ˌæsɪmˈæɾɪk", "æsɪmˈæɾɪk", "ˌæsɪmˈætɪk"):
            phonemes = phonemes.replace(flapped, BRAND_PHONEMES)
        phonemes = phonemes.replace(f"tʊ {BRAND_PHONEMES}", f"{TO_PHONEMES} {BRAND_PHONEMES}")
        # Brand lines never speed up past 1.0 so "Asematic Labs" stays crisp at any pace.
        speed = speeds[name]
        line_speed = min(speed * PACE, 1.0) if BRAND_PHONEMES in phonemes else speed * PACE
        samples, sr = kokoro.create(phonemes, voice=voice, speed=line_speed, lang="en-us", is_phonemes=True)
        return pitch_shift(resample(samples.astype(np.float64), sr, SR_OUT), PITCH), SR_OUT, phonemes

    return synth


def load_voice(kokoro, spec: str):
    """A single voice name, or a weighted blend: "hf_alpha:0.6+af_heart:0.4"."""
    if "+" not in spec and ":" not in spec:
        return spec
    parts = [p.split(":") for p in spec.split("+")]
    total = sum(float(w) for _, w in parts)
    return sum(kokoro.get_voice_style(n) * (float(w) / total) for n, w in parts)


def pitch_shift(x: np.ndarray, semitones: float) -> np.ndarray:
    """Formant-preserving pitch shift through ffmpeg's rubberband filter (duration unchanged)."""
    if abs(semitones) < 1e-3:
        return x
    with tempfile.TemporaryDirectory() as d:
        src, dst = Path(d) / "in.wav", Path(d) / "out.wav"
        sf.write(src, x.astype(np.float32), SR_OUT)
        ratio = 2 ** (semitones / 12)
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", f"rubberband=pitch={ratio}:formant=preserved:pitchq=quality", str(dst)],
            check=True,
        )
        y, _ = sf.read(dst)
    return y


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
    OUT.mkdir(parents=True, exist_ok=True)
    timing = {}
    synth = vctk_engine() if ENGINE == "vctk" else kokoro_engine()
    for name, text, _speed in LINES:
        samples, sr, spoken = synth(name, text)
        audio = trim(resample(np.asarray(samples, dtype=np.float64), sr, SR_OUT))
        # Short fades so no line starts or ends with a click.
        fade = int(0.01 * SR_OUT)
        audio[:fade] *= np.linspace(0, 1, fade)
        audio[-fade * 4 :] *= np.linspace(1, 0, fade * 4)
        audio = presence(audio / max(1e-9, np.max(np.abs(audio))))
        # Light compression: heavier settings lift the quiet gaps between words and smear
        # consonants ("Labs" was heard as "clabse").
        audio = compress(audio, threshold_db=-20, ratio=2.5, release=0.12)
        meter = pyln.Meter(SR_OUT, block_size=0.2)
        audio = audio * 10 ** ((TARGET_LUFS - meter.integrated_loudness(audio)) / 20)
        audio = limit(audio)
        sf.write(OUT / f"{name}.wav", audio.astype(np.float32), SR_OUT, subtype="PCM_16")
        timing[name] = {"text": text, "seconds": round(len(audio) / SR_OUT, 3), "spoken": spoken}
        lufs = meter.integrated_loudness(audio)
        peak = 20 * np.log10(np.max(np.abs(audio)))
        print(f"{name}: {timing[name]['seconds']:.2f}s  {lufs:.1f} LUFS  peak {peak:.1f} dBFS  {spoken}")

    gen = ROOT / "src" / "generated"
    gen.mkdir(exist_ok=True)
    meta = {"engine": ENGINE, "voice": VCTK_SPEAKER if ENGINE == "vctk" else VOICE, "lines": timing}
    (gen / "narration.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
