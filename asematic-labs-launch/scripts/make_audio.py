"""Synthesizes the soundtrack and sound effects (48 kHz WAV). Everything is generated from code,
so there are no licensing questions.

    public/audio/music.wav      15 s score, structured around the five scenes
    public/audio/sfx/*.wav      one-shot effects, placed on the timeline in src/AsematicLabsLaunch.tsx

Run from the project root:  python3 scripts/make_audio.py   (needs numpy, scipy, soundfile, pyloudnorm)

Every file is loudness-normalised (music to -16 LUFS, effects to -18 LUFS) so the gains set in
src/AsematicLabsLaunch.tsx mean the same thing whenever the sounds are regenerated.

Score (D major, 120 BPM, 1 beat = 15 frames):
    0.0 - 2.5 s   Dadd9 pad swells out of silence, airy shimmer
    2.5 - 8.0 s   soft pluck arpeggio enters (G/D -> Bm7 -> A), clean pulse
    8.0 - 11.5 s  layers stack up, filter opens, riser into the reveal
   11.5 - 15.0 s  peak on Dmaj9 with bell motif (the sonic logo), then a natural decay to silence
"""
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
rng = np.random.default_rng(11)


# ---------- helpers ----------
def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def smooth(a, b, x):
    k = np.clip((x - a) / (b - a), 0, 1)
    return k * k * (3 - 2 * k)


def adsr(n, a, d, s, r, sustain_s):
    t = np.arange(n) / SR
    e = np.where(t < a, t / a, s + (1 - s) * np.exp(-(t - a) / d))
    rel = smooth(sustain_s, sustain_s + r, t)
    return e * (1 - rel)


def reverb_ir(seconds=2.4, decay=2.2, seed=3):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * decay)
    left = r.standard_normal(n) * env
    right = r.standard_normal(n) * env
    left, right = lp(left, 7000), lp(right, 7000)
    left[: int(0.012 * SR)] = 0
    right[: int(0.017 * SR)] = 0
    norm = np.sqrt(np.sum(left**2))
    return left / norm, right / norm


IR = reverb_ir()


def verb(mono, wet=0.35):
    lch = fftconvolve(mono, IR[0])[: len(mono)]
    rch = fftconvolve(mono, IR[1])[: len(mono)]
    return np.stack([mono * (1 - wet) + lch * wet * 2.2, mono * (1 - wet) + rch * wet * 2.2], 1)


def pan(mono, p):
    return np.stack([mono * np.sqrt(0.5 * (1 - p)), mono * np.sqrt(0.5 * (1 + p))], 1)


def normalize(x, peak_db=-1.0):
    return x / max(1e-9, np.max(np.abs(x))) * 10 ** (peak_db / 20)


def fade(x, fin=0.005, fout=0.02):
    x = x.copy()
    a, b = int(fin * SR), int(fout * SR)
    if a:
        x[:a] *= np.linspace(0, 1, a)[:, None] if x.ndim == 2 else np.linspace(0, 1, a)
    if b:
        x[-b:] *= np.linspace(1, 0, b)[:, None] if x.ndim == 2 else np.linspace(1, 0, b)
    return x


def write(path, x, peak_db=-1.0, lufs=-18.0):
    path.parent.mkdir(parents=True, exist_ok=True)
    x = normalize(x, peak_db)
    meter = pyln.Meter(SR, block_size=min(0.4, len(x) / SR * 0.5))
    loud = meter.integrated_loudness(x)
    if np.isfinite(loud):
        x = x * 10 ** ((lufs - loud) / 20)
    # Keep peaks safe after loudness gain.
    peak = np.max(np.abs(x))
    if peak > 10 ** (peak_db / 20):
        x = x / peak * 10 ** (peak_db / 20)
    x = fade(x)
    sf.write(path, x.astype(np.float32), SR, subtype="PCM_24")
    print(f"{path.relative_to(ROOT)}  {len(x) / SR:.2f}s  {meter.integrated_loudness(x):.1f} LUFS  peak {20 * np.log10(np.max(np.abs(x))):.1f} dBFS")


# ---------- music ----------
def make_music():
    dur = 15.0
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))

    # Pad: detuned saws through a slowly opening low-pass. Chords as (start_s, end_s, notes).
    chords = [
        (0.0, 2.6, [50, 57, 62, 64, 69]),  # Dadd9
        (2.4, 5.4, [43, 55, 62, 66, 69]),  # G/D-ish (G2 bass)
        (5.2, 6.8, [47, 54, 62, 66, 69]),  # Bm7
        (6.6, 8.1, [45, 52, 61, 64, 69]),  # A
        (7.9, 9.8, [43, 55, 62, 67, 71]),  # Gmaj7 colour
        (9.6, 11.6, [45, 57, 61, 64, 71]),  # Asus-ish, lifting
        (11.4, 15.0, [38, 50, 57, 61, 64, 66, 69]),  # Dmaj9 peak
    ]
    pad = np.zeros(n)
    for start, end, notes in chords:
        seg = (t >= start - 0.01) & (t < end + 0.6)
        env = smooth(start - 0.05, start + 0.45, t) * (1 - smooth(end - 0.05, end + 0.55, t))
        for note in notes:
            for det in (-0.07, 0.0, 0.08):
                f = midi(note + det)
                ph = (f * t + rng.random()) % 1.0
                pad[seg] += (2 * ph[seg] - 1) * env[seg] * (0.45 if note < 48 else 0.35)
    # Filter opens over the film (from 1.4 kHz to 7 kHz at the peak), rendered in blocks.
    cutoff = 1400 + 5600 * smooth(0.0, 11.5, t)
    filtered = np.zeros(n)
    block = 2400
    zi = None
    for i in range(0, n, block):
        sos = butter(2, cutoff[i], "low", fs=SR, output="sos")
        from scipy.signal import sosfilt_zi

        if zi is None:
            zi = sosfilt_zi(sos) * 0
        y, zi = sosfilt(sos, pad[i : i + block], zi=zi)
        filtered[i : i + block] = y
    pad_level = 0.10 * (0.35 + 0.65 * smooth(0, 1.8, t)) * (1 + 0.5 * smooth(10.5, 11.6, t))
    pad_out = verb(filtered * pad_level, wet=0.45)
    out += pad_out

    # Sub swell under the opening and the peak.
    sub = np.sin(2 * np.pi * midi(38) * t) * (0.06 * smooth(0, 2.2, t) * (1 - smooth(2.4, 3.2, t)) + 0.09 * smooth(11.45, 11.6, t) * np.exp(-np.maximum(0, t - 11.6) / 2.2))
    out += pan(sub, 0)

    # Pluck arpeggio, 16th notes at 120 BPM, from 2.5 s to 11.5 s.
    arp_sets = [
        (2.5, 5.25, [62, 66, 69, 74, 69, 66]),
        (5.25, 6.75, [62, 66, 71, 74, 71, 66]),
        (6.75, 8.0, [61, 64, 69, 73, 69, 64]),
        (8.0, 9.75, [62, 67, 71, 74, 79, 74]),
        (9.75, 11.5, [64, 69, 73, 76, 81, 76]),
    ]
    step = 0.125
    pluck = np.zeros((n, 2))
    k = 0
    for start, end, notes in arp_sets:
        s = start
        while s < end - 0.01:
            note = notes[k % len(notes)]
            ln = int(0.32 * SR)
            i0 = int(s * SR)
            tt = np.arange(ln) / SR
            f = midi(note)
            tone = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 30)
            env = np.exp(-tt * 14) * (1 - np.exp(-tt * 900))
            vel = 0.7 + 0.3 * ((k % 4) == 0)
            build = 0.55 + 0.45 * smooth(2.5, 11.0, s)
            seg = tone * env * vel * build * 0.11
            e = min(n, i0 + ln)
            pluck[i0:e] += pan(seg[: e - i0], 0.35 if k % 2 else -0.35)
            k += 1
            s += step
    out += np.stack([verb(pluck[:, 0], 0.4)[:, 0], verb(pluck[:, 1], 0.4)[:, 1]], 1)

    # Clean pulse: soft filtered kick on each beat + gentle off-beat shaker, 2.5 s to 11.5 s.
    beat = 0.5
    s = 2.5
    while s < 11.45:
        i0 = int(s * SR)
        ln = int(0.25 * SR)
        tt = np.arange(ln) / SR
        f = 55 + 70 * np.exp(-tt * 40)
        kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 18) * 0.16 * (0.6 + 0.4 * smooth(2.5, 8.0, s))
        e = min(n, i0 + ln)
        out[i0:e] += pan(kick[: e - i0], 0)
        # shaker on the off-beat
        j0 = int((s + beat / 2) * SR)
        sl = int(0.06 * SR)
        if j0 + sl < n:
            sh = hp(rng.standard_normal(sl), 7000) * np.exp(-np.arange(sl) / SR * 70) * 0.03 * smooth(4.0, 9.0, s)
            out[j0 : j0 + sl] += pan(sh, 0.25)
        s += beat

    # Riser into the reveal: filtered noise sweeping up 9.5 -> 11.5 s.
    riser_t = smooth(9.3, 11.45, t) * (1 - smooth(11.45, 11.55, t))
    noise = rng.standard_normal(n)
    riser = bp(noise, 1500, 9000) * riser_t**2 * 0.05
    out += verb(riser, 0.3)

    # Sonic logo: bell motif at the peak (A5 - D6 - F#6 - A6), long decays.
    bell = np.zeros(n)
    for when, note, g in [(11.52, 81, 1.0), (11.77, 86, 0.8), (12.02, 90, 0.75), (12.27, 93, 0.9)]:
        i0 = int(when * SR)
        ln = n - i0
        tt = np.arange(ln) / SR
        f = midi(note)
        partials = np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt * 3) + 0.2 * np.sin(2 * np.pi * 5.4 * f * tt) * np.exp(-tt * 6)
        bell[i0:] += partials * np.exp(-tt * 1.5) * (1 - np.exp(-tt * 600)) * g * 0.05
    out += verb(bell, 0.5)

    # Peak air: high shimmer pad on the final chord.
    air = bp(rng.standard_normal(n), 6000, 12000) * 0.012 * smooth(11.4, 12.0, t)
    out += verb(air, 0.6)

    # Master: gentle fade-in, natural decay to silence by 15 s.
    master = smooth(0.0, 0.25, t) * (1 - smooth(13.2, 14.95, t))
    out *= master[:, None]
    out = np.tanh(out * 1.6) / 1.6  # soft limiting
    write(ROOT / "public" / "audio" / "music.wav", out, -3.0, lufs=-16.0)


# ---------- sound effects ----------
def noise(seconds):
    return rng.standard_normal(int(seconds * SR))


def tt(seconds):
    return np.arange(int(seconds * SR)) / SR


def sfx_rise():
    # Soft cinematic rise for the opening: airy noise + upward glide.
    x = tt(2.4)
    env = smooth(0, 2.0, x) ** 1.6 * (1 - smooth(2.05, 2.4, x))
    air = bp(noise(2.4), 800, 6000) * 0.25
    f = 220 + 440 * smooth(0, 2.2, x)
    glide = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.15 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.08
    return verb((air + glide) * env, 0.5)


def sfx_particles():
    # Fine digital shimmer: randomized short high sine grains, deterministic seed.
    r = np.random.default_rng(5)
    d = 2.2
    out = np.zeros((int(d * SR), 2))
    for _ in range(46):
        st = r.uniform(0, d - 0.2)
        f = r.uniform(2400, 7200)
        ln = int(0.08 * SR)
        x = np.arange(ln) / SR
        g = np.sin(2 * np.pi * f * x) * np.exp(-x * 60) * (1 - np.exp(-x * 2000)) * r.uniform(0.3, 1.0)
        g *= 0.4 + 0.6 * np.sin(np.pi * st / d)
        i0 = int(st * SR)
        out[i0 : i0 + ln] += pan(g, r.uniform(-0.8, 0.8))
    return np.stack([verb(out[:, 0], 0.55)[:, 0], verb(out[:, 1], 0.55)[:, 1]], 1)


def sfx_logo_hit():
    # Low-impact, premium logo reveal: soft sub thump + filtered body + airy tail.
    x = tt(2.2)
    f = 48 + 60 * np.exp(-x * 22)
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 5.5) * 0.7
    body = lp(noise(2.2), 900) * np.exp(-x * 9) * 0.25
    air = bp(noise(2.2), 3000, 10000) * np.exp(-x * 3.0) * 0.05
    tone = (np.sin(2 * np.pi * midi(74) * x) + 0.5 * np.sin(2 * np.pi * midi(81) * x)) * np.exp(-x * 2.4) * 0.1
    return verb(thump + body + air + tone, 0.35)


def sfx_whoosh(seconds=0.9, lo=300, hi=5000, peak=0.55):
    x = tt(seconds)
    env = np.exp(-(((x / seconds) - peak) ** 2) / 0.045)
    n = noise(seconds)
    # Sweep a band-pass upward by crossfading two filtered layers.
    low = bp(n, lo, lo * 4)
    high = bp(n, hi / 3, hi)
    mix = smooth(0, seconds, x)
    w = (low * (1 - mix) + high * mix) * env
    left = w * (0.5 + 0.5 * (1 - mix))
    right = w * (0.5 + 0.5 * mix)
    st = np.stack([left, right], 1)
    return np.stack([verb(st[:, 0], 0.3)[:, 0], verb(st[:, 1], 0.3)[:, 1]], 1)


def sfx_click():
    x = tt(0.18)
    c = np.sin(2 * np.pi * 2600 * x) * np.exp(-x * 160) * 0.6 + hp(noise(0.18), 3000) * np.exp(-x * 400) * 0.3
    return verb(c, 0.2)


def sfx_keys():
    # Light keyboard: ~12 soft key taps with natural spacing.
    r = np.random.default_rng(9)
    d = 1.3
    out = np.zeros(int(d * SR))
    st = 0.02
    while st < d - 0.12:
        ln = int(0.05 * SR)
        x = np.arange(ln) / SR
        f = r.uniform(1800, 3200)
        k = (bp(r.standard_normal(ln), f * 0.6, f * 1.6) * np.exp(-x * 120) + np.sin(2 * np.pi * 180 * x) * np.exp(-x * 90) * 0.4) * r.uniform(0.5, 1.0)
        i0 = int(st * SR)
        out[i0 : i0 + ln] += k
        st += r.uniform(0.07, 0.13)
    return verb(out, 0.18)


def sfx_confirm():
    # Subtle digital confirmation: two quick rising sine notes.
    x = tt(1.0)
    out = np.zeros(len(x))
    for when, note in [(0.0, 81), (0.09, 88)]:
        xx = np.clip(x - when, 0, None)
        out += np.sin(2 * np.pi * midi(note) * xx) * np.exp(-xx * 7) * (x >= when) * (1 - np.exp(-xx * 800))
    return verb(out * 0.5, 0.4)


def sfx_card():
    # Soft card placement: muted tap + tiny tonal tick.
    x = tt(0.5)
    tap = lp(noise(0.5), 1800) * np.exp(-x * 45) * 0.6
    tick = np.sin(2 * np.pi * 1320 * x) * np.exp(-x * 40) * 0.2
    return verb(tap + tick, 0.25)


def sfx_short_rise():
    x = tt(1.1)
    f = 400 * 2 ** (2 * smooth(0, 1.05, x))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3 + bp(noise(1.1), 2000, 8000) * 0.15
    env = smooth(0, 0.95, x) ** 2 * (1 - smooth(0.98, 1.1, x))
    return verb(tone * env, 0.45)


def sfx_ambience():
    # Soft digital ambience bed: gentle filtered noise + faint high tone, 15 s.
    x = tt(15.0)
    bed = bp(noise(15.0), 300, 2500) * 0.25 * (0.8 + 0.2 * np.sin(2 * np.pi * 0.13 * x))
    hum = np.sin(2 * np.pi * midi(86) * x) * 0.01 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.21 * x))
    env = smooth(0, 1.5, x) * (1 - smooth(13.0, 14.9, x))
    return verb((bed + hum) * env, 0.5)


def make_sfx():
    d = ROOT / "public" / "audio" / "sfx"
    write(d / "rise.wav", sfx_rise())
    write(d / "particles.wav", sfx_particles())
    write(d / "logo-hit.wav", sfx_logo_hit())
    write(d / "sweep.wav", sfx_whoosh(1.0, 250, 6000, 0.55))
    write(d / "whoosh.wav", sfx_whoosh(0.8, 180, 4200, 0.6))
    write(d / "click.wav", sfx_click())
    write(d / "keys.wav", sfx_keys())
    write(d / "confirm.wav", sfx_confirm())
    write(d / "card.wav", sfx_card())
    write(d / "short-rise.wav", sfx_short_rise())
    write(d / "ambience.wav", sfx_ambience())


if __name__ == "__main__":
    make_music()
    make_sfx()
