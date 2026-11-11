"""Script JSON -> voice.wav + timeline.json (word-level timings for captions & cues).

Script syntax inside "text":
  {DISPLAY|SPOKEN}  caption shows DISPLAY, TTS says SPOKEN
  {*DISPLAY|SPOKEN} same, highlighted chip in caption
  *word*            highlighted plain word
  ^cue              named cue = start time of the next word
"""
import json, re, sys, os
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.environ.get('TTS_MODELS', os.path.join(HERE, 'models'))
SR_OUT = 48000

# Voices: "pierre" = native French male (Piper UPMC, default), "tom" = French male (Piper),
#         "siwis" = Kokoro French female.
VOICES = {
    'pierre': {'engine': 'piper', 'dir': 'vits-piper-fr_FR-upmc-medium', 'sid': 1, 'speed': .95},
    'tom': {'engine': 'piper', 'dir': 'vits-piper-fr_FR-tom-medium', 'sid': 0, 'speed': 1.0},
    'siwis': {'engine': 'kokoro', 'dir': 'kokoro-multi-lang-v1_0', 'sid': 31, 'speed': 1.0},
}

def load_tts(voice='pierre'):
    import sherpa_onnx, glob
    v = VOICES[voice]
    d = os.path.join(MODELS, v['dir']) + '/'
    if v['engine'] == 'kokoro':
        mc = sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
            model=d + 'model.onnx', voices=d + 'voices.bin', tokens=d + 'tokens.txt',
            data_dir=d + 'espeak-ng-data', lexicon=d + 'lexicon-us-en.txt,' + d + 'lexicon-zh.txt', lang='fr'), num_threads=4)
    else:
        onnx = glob.glob(d + '*.onnx')[0]
        mc = sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=onnx, tokens=d + 'tokens.txt', data_dir=d + 'espeak-ng-data', noise_scale=.667, noise_scale_w=.8), num_threads=4)
    return sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=mc))

TOKEN_RE = re.compile(r'\{(\*?)([^|}]*)\|([^}]*)\}([^\s{]*)|\^(\w+)|(\S+)')

def parse(text):
    words, pending_cue = [], None
    for m in TOKEN_RE.finditer(text):
        if m.group(5):
            pending_cue = m.group(5); continue
        if m.group(2) is not None and m.group(3) is not None and m.group(6) is None:
            hl, disp, spoken, tail = bool(m.group(1)), m.group(2), m.group(3), m.group(4) or ''
            disp += tail; spoken += tail
        else:
            raw = m.group(6); hl = False
            if raw.startswith('*'):
                hl = True; raw = raw[1:]
                raw = raw.replace('*', '', 1)
            disp = spoken = raw
        w = {'display': disp, 'spoken': spoken, 'hl': hl}
        if pending_cue: w['cue'] = pending_cue; pending_cue = None
        words.append(w)
    return words

VOW = re.compile(r'[aeiouyàâäéèêëîïôöùûüœæ]+', re.I)
def syllables(s):
    s = re.sub(r"[^\wàâäéèêëîïôöùûüœæç'-]", ' ', s.lower())
    n = 0
    for w in re.split(r"[\s'-]+", s):
        if not w: continue
        if w.isdigit(): n += 2 * len(w); continue
        k = len(VOW.findall(w))
        if len(w) > 3 and re.search(r'(e|es|ent)$', w) and k > 1: k -= 1
        n += max(1, k)
    return max(1, n)

def trim(x, sr, thr=0.008):
    env = np.abs(x)
    idx = np.where(env > thr)[0]
    if len(idx) == 0: return x
    a = max(0, idx[0] - int(0.07 * sr)); b = min(len(x), idx[-1] + int(0.06 * sr))
    return x[a:b]

def gaps(x, sr):
    hop = int(0.01 * sr); fr = int(0.025 * sr)
    rms = np.array([np.sqrt(np.mean(x[i:i + fr] ** 2)) for i in range(0, max(1, len(x) - fr), hop)])
    thr = max(0.006, 0.08 * np.percentile(rms, 95))
    sil = rms < thr
    out, i = [], 0
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]: j += 1
            if (j - i) * 0.01 >= 0.11 and i > 0 and j < len(sil):
                out.append((i * 0.01, j * 0.01))
            i = j
        else: i += 1
    return out

PUNCT_END = re.compile(r'[,;:.?!…]$|\.\.\.$')

def align(words, dur, gp):
    """Assign start/end to each word inside [0,dur], snapping punctuation to detected gaps."""
    wts = [syllables(w['spoken']) + 0.6 for w in words]
    total = sum(wts)
    # proportional guess
    t, guess = 0.0, []
    for wt in wts:
        guess.append((t, t + dur * wt / total)); t += dur * wt / total
    anchors = [(0, 0.0, 0.0)]  # (word index start, time) -> segments
    used = set()
    for i, w in enumerate(words[:-1]):
        if PUNCT_END.search(w['display']) or PUNCT_END.search(w['spoken']):
            g_end = guess[i][1]
            best = None
            for k, (a, b) in enumerate(gp):
                if k in used: continue
                d = abs((a + b) / 2 - g_end)
                if d < 0.6 and (best is None or d < best[0]): best = (d, k)
            if best is not None:
                used.add(best[1]); a, b = gp[best[1]]
                anchors.append((i + 1, a, b))
    anchors.sort()
    anchors.append((len(words), dur, dur))
    out = [None] * len(words)
    for (i0, _, s0), (i1, e1, _) in zip(anchors[:-1], anchors[1:]):
        seg = words[i0:i1]
        if not seg: continue
        tot = sum(wts[i0:i1]); t = s0; span = max(0.05, e1 - s0)
        for k in range(i0, i1):
            d = span * wts[k] / tot
            out[k] = (round(t, 3), round(t + d, 3)); t += d
    return out

def process_voice(x, sr, male=True):
    # gentle polish: high-pass, presence lift, soft compression, peak normalize
    import subprocess, tempfile
    with tempfile.TemporaryDirectory() as td:
        a, b = os.path.join(td, 'a.wav'), os.path.join(td, 'b.wav')
        sf.write(a, x, sr, subtype='PCM_16')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a, '-af',
                        (('highpass=f=65,equalizer=f=130:t=q:w=1.0:g=2.5,equalizer=f=340:t=q:w=1.2:g=-2,equalizer=f=3000:t=q:w=1.4:g=3,'
                         'equalizer=f=6500:t=q:w=2:g=-1,') if male else
                        'highpass=f=75,equalizer=f=220:t=q:w=1.2:g=1.5,equalizer=f=3200:t=q:w=1.5:g=2.5,equalizer=f=7000:t=q:w=2:g=-1.5,')
                        + 'acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,'
                        + f'aresample={SR_OUT}', '-ar', str(SR_OUT), b], check=True)
        y, _ = sf.read(b, dtype='float32')
    return y

def main(script_path, out_dir):
    spec = json.load(open(script_path))
    os.makedirs(out_dir, exist_ok=True)
    voice = spec.get('voice', 'pierre')
    tts = load_tts(voice)
    sid, speed = spec.get('sid', VOICES[voice]['sid']), spec.get('speed', VOICES[voice]['speed'])
    lead = spec.get('lead', 0.35)
    chunks, lines, t = [], [], lead
    sr = None
    for li, line in enumerate(spec['lines']):
        words = parse(line['text'])
        spoken = ' '.join(w['spoken'] for w in words)
        a = tts.generate(spoken, sid=line.get('sid', sid), speed=line.get('speed', speed))
        sr = a.sample_rate
        x = trim(np.array(a.samples, dtype=np.float32), sr)
        dur = len(x) / sr
        tm = align(words, dur, gaps(x, sr))
        for w, (s, e) in zip(words, tm):
            w['start'] = round(t + s, 3); w['end'] = round(t + e, 3)
        lines.append({'id': line.get('id', f'l{li}'), 'start': round(t, 3), 'end': round(t + dur, 3),
                      'words': words, 'spoken': spoken})
        chunks.append((t, x))
        t += dur + line.get('pause', spec.get('pause', 0.32))
        print(f"{line.get('id', li):>6} {dur:5.2f}s  {spoken[:70]}")
    total = t + spec.get('tail', 1.2)
    buf = np.zeros(int(total * sr) + 1, dtype=np.float32)
    for st, x in chunks:
        i = int(st * sr); buf[i:i + len(x)] += x
    y = process_voice(buf, sr, male=VOICES[voice]['engine'] == 'piper')
    y = y / max(1e-6, np.max(np.abs(y))) * 0.89
    sf.write(os.path.join(out_dir, 'voice.wav'), y, SR_OUT, subtype='PCM_16')
    cues = {}
    for ln in lines:
        cues['line:' + ln['id']] = ln['start']
        cues['end:' + ln['id']] = ln['end']
        for w in ln['words']:
            if 'cue' in w: cues[w['cue']] = w['start']
    json.dump({'duration': round(total, 3), 'lines': lines, 'cues': cues}, open(os.path.join(out_dir, 'timeline.json'), 'w'),
              ensure_ascii=False, indent=1)
    print('total', round(total, 2), 's')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
