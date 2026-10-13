"""Synthesizes the 33.3 s score for the vertical reel (AsematicLabsReel) into public/audio/reel/music.wav.
Original, generated from code (no licensing questions). Sound effects are shared with the launch film
(public/audio/sfx/).

Run from the project root:  python3 scripts/make_reel_audio.py   (needs numpy, scipy, soundfile, pyloudnorm)

Structure (D major, 120 BPM, one bar = 2 s):
     0.0 -  3.5 s  hook: bright pluck and pulse from the first beat, riser into the intro
     3.5 - 23.5 s  groove under the voice-over: D - Bm - G - A, filter slowly opening
    23.5 - 25.5 s  build: riser and fills into the tagline
    25.5 s         peak on Dmaj9 with the bell motif (sonic logo) on "Asematic Labs"
    28.5 - 33.3 s  light outro bed under "Follow us", decaying to silence
"""
import sys
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt, sosfilt_zi

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_audio import ROOT, SR, bp, hp, midi, pan, rng, smooth, verb, write  # noqa: E402

DUR = 1000 / 30  # matches the composition length
PEAK = 25.5


def make_reel_music():
    n = int(DUR * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))

    # Chord loop, one bar each.
    loop = [
        [38, 50, 57, 62, 66, 69],  # D
        [35, 47, 54, 62, 66, 69],  # Bm
        [43, 55, 59, 62, 67, 71],  # G
        [45, 57, 61, 64, 69, 73],  # A
    ]
    chords = []
    s, i = 0.0, 0
    while s < PEAK - 0.01:
        chords.append((s, min(s + 2.0, PEAK), loop[i % 4]))
        s += 2.0
        i += 1
    chords.append((PEAK, DUR, [38, 50, 57, 61, 64, 66, 69]))  # Dmaj9 peak and outro

    pad = np.zeros(n)
    for start, end, notes in chords:
        seg = (t >= start - 0.05) & (t < end + 0.5)
        env = smooth(start - 0.05, start + 0.25, t) * (1 - smooth(end - 0.05, end + 0.45, t))
        for note in notes:
            for det in (-0.07, 0.0, 0.08):
                ph = (midi(note + det) * t + rng.random()) % 1.0
                pad[seg] += (2 * ph[seg] - 1) * env[seg] * (0.4 if note < 48 else 0.3)
    cutoff = 1800 + 5200 * smooth(0, PEAK, t)
    filtered, zi, block = np.zeros(n), None, 2400
    for k in range(0, n, block):
        sos = butter(2, cutoff[k], "low", fs=SR, output="sos")
        if zi is None:
            zi = sosfilt_zi(sos) * 0
        filtered[k : k + block], zi = sosfilt(sos, pad[k : k + block], zi=zi)
    pad_level = 0.09 * (0.6 + 0.4 * smooth(0, 1.0, t)) * (1 + 0.4 * smooth(PEAK - 1, PEAK + 0.2, t))
    out += verb(filtered * pad_level, wet=0.45)

    # Pluck arpeggio (16ths) from the first beat until the peak, following the chords.
    arps = {0: [62, 66, 69, 74, 69, 66], 1: [62, 66, 71, 74, 71, 66], 2: [62, 67, 71, 74, 79, 74], 3: [64, 69, 73, 76, 81, 76]}
    pluck = np.zeros((n, 2))
    step, s, k = 0.125, 0.0, 0
    while s < PEAK - 0.01:
        notes = arps[int(s // 2.0) % 4]
        note = notes[k % len(notes)]
        i0, ln = int(s * SR), int(0.3 * SR)
        tt = np.arange(ln) / SR
        f = midi(note)
        tone = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 30)
        env = np.exp(-tt * 15) * (1 - np.exp(-tt * 900))
        vel = (0.7 + 0.3 * ((k % 4) == 0)) * (0.75 + 0.25 * smooth(3, PEAK, s))
        seg = tone * env * vel * 0.1
        e = min(n, i0 + ln)
        pluck[i0:e] += pan(seg[: e - i0], 0.35 if k % 2 else -0.35)
        k += 1
        s += step
    out += np.stack([verb(pluck[:, 0], 0.4)[:, 0], verb(pluck[:, 1], 0.4)[:, 1]], 1)

    # Pulse: soft kick on every beat, off-beat shaker, both from the start.
    s = 0.0
    while s < PEAK - 0.01:
        i0, ln = int(s * SR), int(0.25 * SR)
        tt = np.arange(ln) / SR
        f = 55 + 70 * np.exp(-tt * 40)
        kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 18) * 0.15
        e = min(n, i0 + ln)
        out[i0:e] += pan(kick[: e - i0], 0)
        j0, sl = int((s + 0.25) * SR), int(0.06 * SR)
        if j0 + sl < n:
            sh = hp(rng.standard_normal(sl), 7000) * np.exp(-np.arange(sl) / SR * 70) * 0.028
            out[j0 : j0 + sl] += pan(sh, 0.25)
        s += 0.5

    # Risers into the intro (3.5 s) and into the peak.
    noise = rng.standard_normal(n)
    riser = bp(noise, 1500, 9000) * (smooth(2.0, 3.45, t) * (1 - smooth(3.45, 3.55, t)) * 0.6 + smooth(23.3, PEAK - 0.05, t) * (1 - smooth(PEAK - 0.05, PEAK + 0.05, t))) ** 2 * 0.05
    out += verb(riser, 0.3)

    # Sub swell on the peak.
    sub = np.sin(2 * np.pi * midi(38) * t) * 0.09 * smooth(PEAK - 0.05, PEAK + 0.1, t) * np.exp(-np.maximum(0, t - PEAK) / 2.5)
    out += pan(sub, 0)

    # Sonic logo: the same bell motif as the launch film.
    bell = np.zeros(n)
    for when, note, g in [(PEAK + 0.02, 81, 1.0), (PEAK + 0.27, 86, 0.8), (PEAK + 0.52, 90, 0.75), (PEAK + 0.77, 93, 0.9)]:
        i0 = int(when * SR)
        tt = np.arange(n - i0) / SR
        f = midi(note)
        partials = np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt * 3) + 0.2 * np.sin(2 * np.pi * 5.4 * f * tt) * np.exp(-tt * 6)
        bell[i0:] += partials * np.exp(-tt * 1.5) * (1 - np.exp(-tt * 600)) * g * 0.05
    out += verb(bell, 0.5)

    # Light outro pulse under the "Follow us" line: soft plucks on the beat, fading out.
    s = PEAK + 2.0
    while s < DUR - 1.0:
        i0, ln = int(s * SR), int(0.4 * SR)
        tt = np.arange(ln) / SR
        tone = np.sin(2 * np.pi * midi([69, 74, 78, 74][int((s - PEAK) * 2) % 4]) * tt) * np.exp(-tt * 9) * 0.05 * (1 - smooth(29, DUR - 1, s))
        e = min(n, i0 + ln)
        out[i0:e] += pan(tone[: e - i0], 0.2)
        s += 0.5

    master = smooth(0.0, 0.08, t) * (1 - smooth(DUR - 3.0, DUR - 0.1, t))
    out *= master[:, None]
    out = np.tanh(out * 1.6) / 1.6
    write(ROOT / "public" / "audio" / "reel" / "music.wav", out, -3.0, lufs=-16.0)


if __name__ == "__main__":
    make_reel_music()
