"""Synthesizes public/soundtrack.wav (25 s, 48 kHz stereo), cued to the scene timeline.

Run from the project root: python3 scripts/make_soundtrack.py  (needs numpy + scipy)
"""
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR, DUR, FPS = 48000, 25.0, 30
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, fc):
    return sosfilt(butter(4, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc):
    return sosfilt(butter(2, fc, "high", fs=SR, output="sos"), x)


def smooth(a, b, x):
    k = np.clip((x - a) / (b - a), 0, 1)
    return k * k * (3 - 2 * k)


def env(start, attack, decay):
    x = t - start
    return np.where(x < 0, 0, np.where(x < attack, x / attack, np.exp(-(x - attack) / decay)))


def add(sig, gain, pan=0.0):
    global L, R
    L += sig * gain * np.sqrt(0.5 * (1 - pan))
    R += sig * gain * np.sqrt(0.5 * (1 + pan))


def saw(f):
    ph = (f * t + rng.random()) % 1.0
    return 2 * ph - 1


sec = lambda frame: frame / FPS  # noqa: E731

# Pad progression per scene: hook, intro, demo, showcase, features, CTA
chords = [
    (0, [45, 57, 60, 64, 71]),        # Am9
    (3, [41, 53, 57, 60, 64]),        # Fmaj7
    (6, [43, 55, 59, 62, 69]),        # G6/9
    (14, [45, 57, 60, 64, 67]),       # Am7
    (19, [41, 53, 57, 60, 67]),       # Fadd9
    (22, [36, 48, 55, 64, 71, 74]),   # Cmaj9
]
pad = np.zeros(N)
for i, (start, notes) in enumerate(chords):
    end = chords[i + 1][0] if i + 1 < len(chords) else DUR
    gate = smooth(start - 0.1, start + 0.2, t) * (1 - smooth(end - 0.1, end + 0.2, t))
    if i == 0:
        gate = 1 - smooth(end - 0.1, end + 0.2, t)
    for n in notes:
        for det in (-0.07, 0.0, 0.06):
            pad += saw(midi(n + det)) * gate / len(notes)
pad *= smooth(0, 0.6, t) * (1 - 0.4 * smooth(23, 25, t))
add(lp(pad, 1500), 0.11, -0.2)
add(lp(np.roll(pad, 300), 1500), 0.11, 0.2)

# Driving pulse: soft kick on every beat (120 bpm) from the intro to the CTA
for k in range(int((22 - 3) / 0.5)):
    st = 3 + k * 0.5
    x = np.clip(t - st, 0, None)
    add(np.sin(2 * np.pi * (48 + 80 * np.exp(-x * 32)) * x) * env(st, 0.002, 0.15), 0.28)
    hat = hp(rng.standard_normal(N), 7000) * env(st + 0.25, 0.001, 0.03)
    add(hat, 0.03, 0.3)


def impact(st, power):
    x = np.clip(t - st, 0, None)
    boom = np.sin(2 * np.pi * (34 * x + 7 * (1 - np.exp(-6 * x)))) * env(st, 0.003, 0.8)
    add(np.tanh(boom * 1.8), 0.5 * power)
    add(lp(rng.standard_normal(N), 3000) * env(st, 0.001, 0.1), 0.3 * power)


def click(st, gain=0.25):
    add(hp(rng.standard_normal(N), 2500) * env(st, 0.0005, 0.012), gain)
    add(np.sin(2 * np.pi * 1800 * t) * env(st, 0.0005, 0.02), gain * 0.4)


def whoosh(st, length=0.5, gain=0.08):
    shape = smooth(st, st + length * 0.7, t) * (1 - smooth(st + length * 0.7, st + length, t))
    add(hp(rng.standard_normal(N), 1500) * shape, gain, -0.3)
    add(hp(rng.standard_normal(N), 1500) * shape, gain, 0.3)


def pop(st, note, gain=0.08):
    add(np.sin(2 * np.pi * midi(note) * t) * env(st, 0.003, 0.18), gain)


# Scene 1: hook slam
impact(0.05, 0.9)
# Scene 2: logo reveal
whoosh(2.6, 0.45)
impact(3.0, 1.0)
# Scene 3: demo (starts at 6 s)
demo = 6.0
click(demo + sec(40))
for c in range(31):  # typing
    click(demo + sec(48 + c * 2), 0.07 + 0.03 * rng.random())
click(demo + sec(150), 0.3)
for i, n in enumerate((76, 79, 83)):  # result cards
    pop(demo + sec(168 + i * 8), n)
# Scene 4: showcase crossfades
for st in (14.0, 15.67, 17.33):
    whoosh(st - 0.3, 0.5, 0.06)
# Scene 5: feature lines
for i, n in enumerate((72, 76, 79)):
    pop(19 + sec(14 + i * 10), n, 0.07)
# Scene 6: CTA hit + bell
impact(22.0, 0.9)
bell = sum(np.sin(2 * np.pi * midi(n) * t) for n in (72, 76, 79, 83)) * env(22.0, 0.005, 1.4) / 4
add(bell, 0.1)

# Reverb, master
ir_t = np.arange(int(SR * 2.0)) / SR
for side in ("L", "R"):
    ir = lp(rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.5), 6000) / 45
    if side == "L":
        L = L + 0.3 * fftconvolve(L, ir)[:N]
    else:
        R = R + 0.3 * fftconvolve(R, ir)[:N]
fade = smooth(0, 0.02, t) * (1 - smooth(23.6, 25.0, t))
L, R = np.tanh(hp(L, 25) * 1.2) * fade, np.tanh(hp(R, 25) * 1.2) * fade
g = 10 ** (-1 / 20) / max(np.abs(L).max(), np.abs(R).max())
pcm = (np.stack([L, R], 1) * g * 32767).astype(np.int16)
with wave.open("public/soundtrack.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote public/soundtrack.wav")
