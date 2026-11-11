"""Procedural music bed + sound effects + final mix (royalty-free, generated from scratch).
usage: python3 audio.py <video_dir> [--seed N] [--key D]
reads build/voice.wav, build/sfx.json  -> writes build/music.wav, build/mix.wav
"""
import sys, os, json
import numpy as np, soundfile as sf

SR = 48000
rng = np.random.default_rng(7)

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)

def fft_filter(x, lo=None, hi=None, slope=1.0):
    """zero-phase spectral band filter with soft (gaussian-ish) edges."""
    n = len(x); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / (1 + (f / hi) ** (4 * slope))
    if lo: g *= 1 / (1 + (lo / np.maximum(f, 1)) ** (4 * slope))
    return np.fft.irfft(X * g, n)

def onepole_lp(x, a):
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s += a[i] * (x[i] - s) if hasattr(a, '__len__') else a * (x[i] - s); y[i] = s
    return y

def env_ad(n, att, dec):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(att, 1e-4)) * np.exp(-np.maximum(0, t - att) / dec)
    return e

# ---------------- SFX ----------------
def sfx_pop(g=1):
    n = int(.16 * SR); t = np.arange(n) / SR
    f = 260 + 700 * np.exp(-t / .025)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * env_ad(n, .002, .05) + .25 * np.sin(2 * ph) * env_ad(n, .001, .02)
    return x * .8 * g

def sfx_click(g=1):
    n = int(.05 * SR); x = rng.standard_normal(n) * env_ad(n, .0005, .004)
    x = fft_filter(x, lo=1800, hi=7000)
    t = np.arange(n) / SR; x += .4 * np.sin(2 * np.pi * 1600 * t) * env_ad(n, .0005, .008)
    y = np.zeros(int(.1 * SR)); y[:n] += x; y[int(.045 * SR):int(.045 * SR) + n] += .6 * x
    return y * 1.2 * g

def sfx_whoosh(g=1, dur=.5):
    n = int(dur * SR); x = rng.standard_normal(n)
    t = np.arange(n) / n
    cut = 400 + 5200 * np.sin(np.pi * np.clip(t * 1.05, 0, 1)) ** 2
    a = 1 - np.exp(-2 * np.pi * cut / SR)
    y = onepole_lp(x, a); y = onepole_lp(y, a)
    y = fft_filter(y, lo=180)
    e = np.sin(np.pi * t) ** 1.6
    return y * e * .55 * g

def sfx_swoosh(g=1): return sfx_whoosh(g * .8, .32)

def sfx_ding(g=1, f0=1318.5):
    n = int(1.6 * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for ratio, amp, dec in [(1, 1, .9), (2.0, .35, .5), (2.76, .18, .35), (5.4, .07, .18), (.5, .3, .7)]:
        x += amp * np.sin(2 * np.pi * f0 * ratio * t) * np.exp(-t / dec)
    x *= np.minimum(1, t / .002)
    return x * .28 * g

def sfx_stamp(g=1):
    n = int(.4 * SR); t = np.arange(n) / SR
    f = 55 + 120 * np.exp(-t / .03); body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .12)
    nz = fft_filter(rng.standard_normal(n), lo=150, hi=2500) * np.exp(-t / .03)
    return (body * .9 + nz * .35) * g

def sfx_sparkle(g=1):
    n = int(1.0 * SR); x = np.zeros(n)
    notes = [2093, 2637, 3136, 3951, 3136, 4186]
    for i, f in enumerate(notes):
        st = int((.02 + i * .065) * SR); m = n - st; t = np.arange(m) / SR
        x[st:] += np.sin(2 * np.pi * f * t) * np.exp(-t / .12) * (.9 - i * .08)
    return x * .16 * g

def sfx_rise(g=1, dur=1.0):
    dur = max(.3, dur); n = int(dur * SR); t = np.arange(n) / n
    f = 220 * 2 ** (t * 1.6)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * .12
    nz = rng.standard_normal(n); a = 1 - np.exp(-2 * np.pi * (500 + 5000 * t ** 2) / SR); nz = onepole_lp(nz, a)
    e = t ** 1.5 * (1 - np.clip((t - .94) / .06, 0, 1))
    return (tone + nz * .35) * e * .45 * g

def sfx_fill(g=1, dur=1.0):
    """accelerating soft ticks (counting)"""
    n = int((dur + .1) * SR); x = np.zeros(n); k = 0; tt = 0.0
    tick = fft_filter(rng.standard_normal(int(.012 * SR)) * env_ad(int(.012 * SR), .0003, .003), lo=2500, hi=9000)
    tone = np.sin(2 * np.pi * 2400 * np.arange(len(tick)) / SR) * env_ad(len(tick), .0003, .004) * .5
    while tt < dur:
        st = int(tt * SR); x[st:st + len(tick)] += (tick + tone) * (.6 + .4 * (k % 2))
        gap = .11 * (1 - tt / dur * .7); tt += gap; k += 1
    return x * .5 * g

def sfx_draw(g=1, dur=1.0):
    dur = max(.3, dur); n = int(dur * SR); t = np.arange(n) / n
    nz = fft_filter(rng.standard_normal(n), lo=1500, hi=6000)
    e = np.minimum(1, t / .08) * np.minimum(1, (1 - t) / .15) * (.6 + .4 * np.sin(t * 40) ** 2)
    return nz * e * .07 * g

SFX = {'pop': sfx_pop, 'click': sfx_click, 'whoosh': sfx_whoosh, 'swoosh': sfx_swoosh, 'ding': sfx_ding, 'stamp': sfx_stamp,
       'sparkle': sfx_sparkle, 'rise': sfx_rise, 'fill': sfx_fill, 'draw': sfx_draw}

def render_sfx(events, total):
    out = np.zeros(int(total * SR) + SR * 2)
    for ev in events:
        fn = SFX[ev['name']]
        x = fn(ev.get('gain', 1), ev['dur']) if ev.get('dur') and ev['name'] in ('rise', 'fill', 'draw') else fn(ev.get('gain', 1))
        st = int(ev['at'] * SR)
        if ev['name'] == 'whoosh': st -= int(.18 * SR)  # whoosh peaks a bit after start
        st = max(0, st); out[st:st + len(x)] += x[:len(out) - st]
    return out[:int(total * SR)]

# ---------------- MUSIC ----------------
def music(total, bpm=96, seed=3, root=50):
    """Minimal warm electronic bed: pad + sub bass + soft keys + light drums with sidechain."""
    r = np.random.default_rng(seed)
    beat = 60 / bpm; bar = 4 * beat
    n = int(total * SR) + SR; L = np.zeros(n); R = np.zeros(n)
    t_all = np.arange(n) / SR
    # progression (semitones from root): i9 – VImaj7 – IIImaj7 – VII6sus
    prog_ = [[0, 3, 7, 10, 14], [-4, 0, 3, 7, 10], [3, 7, 10, 14, 17], [-2, 2, 5, 9, 12]]
    bass_ = [0, -4, 3, -2]
    nbars = int(np.ceil(total / bar)) + 1
    # ---- pad (additive, alias-free) ----
    pad = np.zeros(n)
    for b in range(nbars):
        ch = prog_[(b // 2) % 4]
        if b % 2: continue
        st = int(b * bar * SR); ln = int(2 * bar * SR + .6 * SR); ln = min(ln, n - st)
        if ln <= 0: break
        tt = np.arange(ln) / SR
        seg = np.zeros(ln)
        for note in ch:
            f0 = midi(root + 12 + note)
            for det in (-.06, 0, .07):
                f = f0 * 2 ** (det / 12)
                for k in range(1, 9):
                    fk = f * k
                    if fk > 4000: break
                    amp = (1 / k) * np.exp(-(fk / 1300) ** 2)
                    seg += amp * np.sin(2 * np.pi * fk * tt + r.uniform(0, 6.28))
        env = np.minimum(1, tt / .5) * np.minimum(1, (ln / SR - tt) / .6)
        pad[st:st + ln] += seg * env
    pad /= np.max(np.abs(pad)) + 1e-9
    # ---- bass ----
    bass = np.zeros(n)
    pattern = [0, 1.5, 2.5, 3.5]  # beats
    for b in range(nbars):
        rootn = bass_[(b // 2) % 4]
        f = midi(root - 12 + rootn)
        for k, pb in enumerate(pattern):
            st = int((b * bar + pb * beat) * SR); ln = int(beat * (.9 if k == 0 else .45) * SR)
            if st >= n: break
            ln = min(ln, n - st); tt = np.arange(ln) / SR
            e = np.minimum(1, tt / .008) * np.exp(-tt / (.35 if k == 0 else .18))
            bass[st:st + ln] += (np.sin(2 * np.pi * f * tt) + .18 * np.sin(4 * np.pi * f * tt)) * e * (1 if k == 0 else .7)
    # ---- keys arp (8ths, with echo) ----
    keys = np.zeros(n)
    for b in range(nbars):
        ch = prog_[(b // 2) % 4]
        seq = [ch[1], ch[2], ch[3], ch[4], ch[3], ch[2], ch[4], ch[2]]
        for i, note in enumerate(seq):
            if r.random() < .22: continue
            st = int((b * bar + i * beat / 2) * SR); ln = int(.5 * SR)
            if st >= n: break
            ln = min(ln, n - st); tt = np.arange(ln) / SR
            f = midi(root + 24 + note)
            e = np.minimum(1, tt / .003) * np.exp(-tt / .16)
            keys[st:st + ln] += (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt) * np.exp(-tt / .05)) * e * (.75 + .25 * r.random())
    d = int(beat * .75 * SR)
    echo = np.zeros(n); echo[d:] += keys[:-d] * .35; echo[2 * d:] += keys[:-2 * d] * .15
    keysL, keysR = keys + echo * .3, keys + echo * 1.0
    # ---- drums ----
    kick = np.zeros(n); hat = np.zeros(n); clap = np.zeros(n); side = np.ones(n)
    kn = int(.35 * SR); kt = np.arange(kn) / SR
    ksmp = np.sin(2 * np.pi * np.cumsum(48 + 110 * np.exp(-kt / .035)) / SR) * np.exp(-kt / .16)
    hn = int(.05 * SR); hsmp = fft_filter(r.standard_normal(hn), lo=6500, hi=14000) * env_ad(hn, .0005, .012)
    cn = int(.25 * SR); ct = np.arange(cn) / SR
    csmp = fft_filter(r.standard_normal(cn), lo=900, hi=5000) * (np.exp(-ct / .06)) + .3 * np.sin(2 * np.pi * 190 * ct) * np.exp(-ct / .05)
    duck = 1 - .55 * np.exp(-np.arange(int(.3 * SR)) / SR / .09)
    for b in range(nbars):
        for q in range(4):
            st = int((b * bar + q * beat) * SR)
            if st >= n: break
            if q in (0, 2) or (q == 3 and b % 4 == 3):
                m = min(kn, n - st); kick[st:st + m] += ksmp[:m]
                m2 = min(len(duck), n - st); side[st:st + m2] = np.minimum(side[st:st + m2], duck[:m2])
            if q in (1, 3):
                m = min(cn, n - st); clap[st:st + m] += csmp[:m]
            for o in (0, .5):
                s2 = int((b * bar + (q + o) * beat) * SR)
                if s2 >= n: continue
                m = min(hn, n - s2); hat[s2:s2 + m] += hsmp[:m] * (1 if o else .45)
    # ---- arrangement: soften drums in first bar, fade at end ----
    arr = np.minimum(1, t_all / (bar * .5)) ** .5
    fade = np.clip((total - t_all) / 2.5, 0, 1)
    padL = pad * side * .30; padR = np.roll(pad, int(.012 * SR)) * side * .30
    bs = bass * side * .42
    Lm = padL + bs + keysL * .085 + kick * .55 * arr + clap * .10 * arr + hat * .07 * arr
    Rm = padR + bs + keysR * .085 + kick * .55 * arr + clap * .10 * arr + np.roll(hat, int(.004 * SR)) * .07 * arr
    out = np.stack([Lm, Rm], 1) * fade[:, None]
    out = out[:int(total * SR)]
    return out / (np.max(np.abs(out)) + 1e-9) * .8

def envelope(x, att=.02, rel=.35, win=.03):
    a = np.abs(x); w = int(win * SR)
    m = np.convolve(a, np.ones(w) / w, mode='same')
    # asymmetric smoothing on a decimated grid for speed
    hop = 240; d = m[::hop]; e = np.zeros_like(d); s = 0
    ka, kr = 1 - np.exp(-hop / SR / att), 1 - np.exp(-hop / SR / rel)
    for i, v in enumerate(d):
        s += (ka if v > s else kr) * (v - s); e[i] = s
    return np.interp(np.arange(len(x)), np.arange(len(e)) * hop, e)

def main(vdir, seed=3, root=50, bpm=96):
    b = os.path.join(vdir, 'build')
    voice, sr = sf.read(os.path.join(b, 'voice.wav'), dtype='float64'); assert sr == SR
    total = len(voice) / SR
    events = json.load(open(os.path.join(b, 'sfx.json')))
    fx = render_sfx(events, total)
    mus = music(total, bpm=bpm, seed=seed, root=root)
    sf.write(os.path.join(b, 'music.wav'), mus.astype(np.float32), SR)
    env = envelope(voice); env = env / (np.percentile(env, 95) + 1e-9)
    duck = 1 - .5 * np.clip(env, 0, 1)
    vrms = np.sqrt(np.mean(voice[np.abs(voice) > .02] ** 2))
    mrms = np.sqrt(np.mean(mus ** 2))
    mus = mus * (vrms / mrms) * 10 ** (-17 / 20) * duck[:, None]
    fxs = np.stack([fx, fx], 1) * .55
    v2 = np.stack([voice, voice], 1)
    mix = v2 + mus + fxs
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    mix = mix / (np.max(np.abs(mix)) + 1e-9) * .95
    sf.write(os.path.join(b, 'mix.wav'), mix.astype(np.float32), SR)
    print('mix written', round(total, 2), 's, events', len(events))

if __name__ == '__main__':
    a = sys.argv[1:]
    kw = {}
    if '--seed' in a: kw['seed'] = int(a[a.index('--seed') + 1])
    if '--root' in a: kw['root'] = int(a[a.index('--root') + 1])
    if '--bpm' in a: kw['bpm'] = float(a[a.index('--bpm') + 1])
    main(a[0], **kw)
