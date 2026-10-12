"""Synthesizes the 10 s launch soundtrack (48 kHz stereo) to audio.wav.

Cues are timed to video.html: network build 0-2 s, fly-through 2-4 s,
riser into the logo reveal at 4.95 s, final hit at 7.0 s, tail to 10 s.
"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
import wave

SR, DUR = 48000, 10.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(20261012)
L = np.zeros(N); R = np.zeros(N)


def note(f):  # semitone helpers
    return 440.0 * 2 ** ((f - 69) / 12)


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)


def env(a, d, start, length=None):
    """Attack/exponential-decay envelope starting at `start` seconds."""
    x = t - start
    e = np.where(x < 0, 0, np.where(x < a, x / max(a, 1e-4), np.exp(-(x - a) / d)))
    if length is not None:
        e *= np.clip((start + length - t) / 0.05, 0, 1)
    return e


def smoothstep(a, b, x):
    k = np.clip((x - a) / (b - a), 0, 1)
    return k * k * (3 - 2 * k)


def add(sig, gain=1.0, pan=0.0):
    global L, R
    L += sig * gain * np.sqrt(0.5 * (1 - pan))
    R += sig * gain * np.sqrt(0.5 * (1 + pan))


def saw(f, phase=0.0):
    ph = (np.cumsum(np.broadcast_to(f, t.shape)) / SR + phase) % 1.0
    return 2 * ph - 1


# --- Pad: A minor add9 -> Fmaj7 at the reveal -> Cmaj9 at the final hit ---
chords = [
    (0.0, [45, 57, 64, 71, 72]),       # A  A  E  B  C
    (4.95, [41, 53, 60, 64, 69]),      # F  F  C  E  A
    (7.0, [36, 48, 55, 64, 71, 74]),   # C  C  G  E  B  D
]
pad = np.zeros(N)
for i, (start, notes) in enumerate(chords):
    end = chords[i + 1][0] if i + 1 < len(chords) else DUR
    gate = smoothstep(start - 0.05, start + 0.25, t) * (1 - smoothstep(end - 0.05, end + 0.3, t)) if i else (1 - smoothstep(end - 0.05, end + 0.3, t))
    for n in notes:
        for det in (-0.08, 0.0, 0.07):
            pad += saw(note(n + det), rng.random()) * gate / len(notes)
pad_env = smoothstep(0.0, 1.8, t) * (0.55 + 0.45 * smoothstep(4.95, 5.4, t)) * (1 - 0.5 * smoothstep(8.5, 10.0, t))
pad_l = lp(pad * pad_env, 1400, 4)
add(pad_l, 0.10, -0.25)
add(lp(np.roll(pad * pad_env, 240), 1400, 4), 0.10, 0.25)

# --- Sub drone ---
sub = np.sin(2 * np.pi * note(33) * t) * smoothstep(0.0, 2.0, t) * (1 - smoothstep(4.6, 4.95, t))
sub += np.sin(2 * np.pi * note(29) * t) * smoothstep(4.95, 5.2, t) * (1 - smoothstep(6.9, 7.05, t))
sub += np.sin(2 * np.pi * note(24) * t) * smoothstep(7.0, 7.2, t) * (1 - smoothstep(8.8, 10.0, t))
add(sub, 0.16)

# --- Scene 1: digital pulses as the network connects ---
for k in range(11):
    st = 0.25 + k * 0.15 + rng.random() * 0.08
    f = note(rng.choice([81, 84, 88, 91, 93]))
    blip = np.sin(2 * np.pi * f * t) * env(0.002, 0.07, st)
    add(blip, 0.06 + 0.02 * rng.random(), rng.uniform(-0.8, 0.8))

# --- Scene 2: 16th-note arpeggio + pulse kick (120 bpm) ---
arp_notes = [57, 64, 69, 72, 76, 72, 69, 64]
step = 0.125
for k in range(int((4.85 - 1.95) / step)):
    st = 1.95 + k * step
    f = note(arp_notes[k % len(arp_notes)] + (12 if k >= 16 else 0))
    sq = np.sign(np.sin(2 * np.pi * f * t)) * 0.6 + np.sin(2 * np.pi * f * 2 * t) * 0.4
    add(sq * env(0.003, 0.06, st, 0.12), 0.035 * (0.6 + 0.4 * k / 23), 0.45 if k % 2 else -0.45)
arp_bus_hp = None
for k in range(int((4.6 - 2.0) / 0.5) + 1):
    st = 2.0 + k * 0.5
    x = np.clip(t - st, 0, None)
    kick = np.sin(2 * np.pi * (45 + 90 * np.exp(-x * 30)) * x) * env(0.002, 0.16, st)
    add(kick, 0.33)

# --- Riser into the reveal ---
rise = smoothstep(3.3, 4.85, t) ** 2 * (1 - smoothstep(4.86, 4.92, t))
noise = rng.standard_normal(N)
noise_hi = hp(noise, 2500)
noise_lo = lp(noise, 1200)
sweep_k = smoothstep(3.3, 4.9, t)
add((noise_lo * (1 - sweep_k) + noise_hi * sweep_k) * rise, 0.07, -0.2)
add((noise_lo * (1 - sweep_k) + np.roll(noise_hi, 97) * sweep_k) * rise, 0.07, 0.2)
fr = 180 * (1 + 6 * smoothstep(3.3, 4.9, t) ** 2)
add(np.sin(2 * np.pi * np.cumsum(fr) / SR) * rise, 0.07)


# --- Impacts ---
def impact(st, power):
    x = np.clip(t - st, 0, None)
    boom = np.sin(2 * np.pi * (32 * x + 40 / 6 * (1 - np.exp(-6 * x)))) * env(0.003, 0.9, st)
    add(np.tanh(boom * 1.8), 0.5 * power)
    crack = lp(rng.standard_normal(N), 3500) * env(0.001, 0.12, st)
    add(crack, 0.35 * power, -0.1)
    add(np.roll(crack, 180), 0.35 * power, 0.1)
    shimmer = sum(np.sin(2 * np.pi * f * t + rng.random() * 6) for f in (1318.5, 1975.5, 2637.0, 3520.0, 4186.0))
    add(shimmer * env(0.01, 1.4, st) / 5, 0.07 * power, 0.0)


impact(4.95, 1.0)
impact(7.0, 0.8)

# Bell chord on the final hit (C maj9)
bell = np.zeros(N)
for n in (72, 76, 79, 83, 86):
    f = note(n)
    bell += (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * env(0.002, 0.3, 7.0)) * env(0.004, 1.6, 7.0)
add(bell / 5, 0.12, 0.0)

# --- Reverb (stereo exponential-noise IR) ---
ir_len = int(SR * 2.4)
ir_t = np.arange(ir_len) / SR
irL = rng.standard_normal(ir_len) * np.exp(-ir_t / 0.55)
irR = rng.standard_normal(ir_len) * np.exp(-ir_t / 0.55)
irL, irR = lp(irL, 6000) / 40, lp(irR, 6000) / 40
wetL = fftconvolve(L, irL)[:N]
wetR = fftconvolve(R, irR)[:N]
L = L + 0.35 * wetL
R = R + 0.35 * wetR

# --- Master: DC/rumble cut, gentle saturation, fades, normalise to -1 dBFS ---
L, R = hp(L, 25), hp(R, 25)
fade = smoothstep(0.0, 0.02, t) * (1 - smoothstep(9.2, 10.0, t) ** 1.5)
L, R = np.tanh(L * 1.2) * fade, np.tanh(R * 1.2) * fade
peak = max(np.abs(L).max(), np.abs(R).max())
g = 10 ** (-1 / 20) / peak
pcm = (np.stack([L, R], 1) * g * 32767).astype(np.int16)
with wave.open('audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('audio.wav written, peak gain', round(20 * np.log10(g), 2), 'dB')
