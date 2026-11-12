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

# Voices: "fabien" = natural French male (Kyutai, default), "pierre" = French male (Piper UPMC), "tom" = French male (Piper),
#         "siwis" = Kokoro French female.
VOICES = {
    # Kyutai TTS 1.6B (CC-BY 4.0), voice "fabien" = Kyutai's own French male recording (CC0)
    'fabien': {'engine': 'kyutai', 'voice': 'unmute-prod-website/fabieng-enhanced-v2.wav', 'cfg': 2.0, 'temp': .72, 'sid': 0, 'speed': 1.0},
    # ElevenLabs (needs a paid plan for library voices; API key injected by the network proxy or ELEVENLABS_API_KEY)
    'ilan': {'engine': 'eleven', 'voice_id': 'ozVFcYMzEYF561D1IKA0', 'model': 'eleven_multilingual_v2', 'sid': 0, 'speed': 1.0,
             'settings': {'stability': .45, 'similarity_boost': .8, 'style': .2, 'use_speaker_boost': True}},
    # French female voices (Kyutai TTS): f1 = Kyutai staff recording (CC0), f2-f4 = CML-TTS / LibriVox readers (CC BY 4.0)
    'f1': {'engine': 'kyutai', 'voice': 'unmute-prod-website/developpeuse-3.wav', 'cfg': 2.0, 'temp': .7, 'sid': 0, 'speed': 1.0},
    'f2': {'engine': 'kyutai', 'voice': 'cml-tts/fr/10087_11650_000028-0002_enhanced.wav', 'cfg': 2.0, 'temp': .7, 'sid': 0, 'speed': 1.0},
    'f3': {'engine': 'kyutai', 'voice': 'cml-tts/fr/5207_3078_000031-0002_enhanced.wav', 'cfg': 2.0, 'temp': .7, 'sid': 0, 'speed': 1.0},
    'f4': {'engine': 'kyutai', 'voice': 'cml-tts/fr/2154_2576_000020-0003_enhanced.wav', 'cfg': 2.0, 'temp': .7, 'sid': 0, 'speed': 1.0},
    'pierre': {'engine': 'piper', 'dir': 'vits-piper-fr_FR-upmc-medium', 'sid': 1, 'speed': .95},
    'tom': {'engine': 'piper', 'dir': 'vits-piper-fr_FR-tom-medium', 'sid': 0, 'speed': 1.0},
    'siwis': {'engine': 'kokoro', 'dir': 'kokoro-multi-lang-v1_0', 'sid': 31, 'speed': 1.0},
}

def load_tts(voice='pierre'):
    import sherpa_onnx, glob
    v = VOICES[voice]
    if v['engine'] == 'kyutai':
        return KyutaiTTS(v)
    if v['engine'] == 'eleven':
        return ElevenTTS(v)
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


KYUTAI_REPO = 'kyutai/tts-1.6b-en_fr'

class KyutaiTTS:
    """Kyutai TTS 1.6B on CPU, batched; returns audio + per-word start times."""
    def __init__(self, v):
        import torch
        from moshi.models import loaders
        from moshi.models.tts import TTSModel
        torch.set_num_threads(os.cpu_count() or 4)
        self.torch = torch
        d = os.path.join(MODELS, 'kyutai-tts-1.6b-en_fr') + '/'
        if os.path.exists(d + 'config.json'):
            ci = loaders.CheckpointInfo.from_hf_repo(
                KYUTAI_REPO, moshi_weights=d + 'dsm_tts_1e68beda@240.safetensors',
                mimi_weights=d + 'tokenizer-e351c8d8-checkpoint125.safetensors',
                tokenizer=d + 'tokenizer_spm_8k_en_fr_audio.model', config_path=d + 'config.json')
        else:
            ci = loaders.CheckpointInfo.from_hf_repo(KYUTAI_REPO)
        self.tts = TTSModel.from_checkpoint_info(ci, n_q=32, temp=v.get('temp', .6), device='cpu',
                                                 dtype=torch.float32, initial_padding=4)
        self.voice_path = self.tts.get_voice_path(v['voice'])
        self.cfg = v.get('cfg', 2.0)
        self.sample_rate = self.tts.mimi.sample_rate
        self.fps = self.tts.mimi.frame_rate

    def batch(self, texts):
        torch, tts = self.torch, self.tts
        entries = [tts.prepare_script([x], padding_between=1) for x in texts]
        attrs = [tts.make_condition_attributes([self.voice_path], cfg_coef=self.cfg) for _ in texts]
        res = tts.generate(entries, attrs)
        with tts.mimi.streaming(len(texts)), torch.no_grad():
            pcms = [torch.clip(tts.mimi.decode(fr[:, 1:, :]), -1, 1) for fr in res.frames[tts.delay_steps:]]
        pcms = pcms[2:]  # same as moshi's simple_generate: avoids a click at the start
        out = []
        for i in range(len(texts)):
            end = res.end_steps[i] or len(pcms)
            a = torch.cat([p[i, 0] for p in pcms[:end]]).float().numpy()
            words = [(w, max(0.0, (st - 2) / self.fps)) for w, st in res.all_transcripts[i]]
            out.append((a, words))
        return out

class ElevenTTS:
    """ElevenLabs text-to-speech with character timestamps (one request per line, with context)."""
    sample_rate = 44100
    def __init__(self, v):
        self.v = v
    def line(self, text, prev='', nxt=''):
        import subprocess, base64, tempfile
        body = {'text': text, 'model_id': self.v['model'], 'voice_settings': self.v['settings']}
        if prev: body['previous_text'] = prev
        if nxt: body['next_text'] = nxt
        cmd = ['curl', '-s', '-X', 'POST',
               f"https://api.elevenlabs.io/v1/text-to-speech/{self.v['voice_id']}/with-timestamps?output_format=mp3_44100_128",
               '-H', 'Content-Type: application/json', '-d', json.dumps(body)]
        if os.environ.get('ELEVENLABS_API_KEY'): cmd += ['-H', 'xi-api-key: ' + os.environ['ELEVENLABS_API_KEY']]
        d = json.loads(subprocess.run(cmd, capture_output=True, check=True).stdout)
        if 'audio_base64' not in d: raise RuntimeError(f'ElevenLabs: {d}')
        with tempfile.TemporaryDirectory() as td:
            mp3, wav = os.path.join(td, 'a.mp3'), os.path.join(td, 'a.wav')
            open(mp3, 'wb').write(base64.b64decode(d['audio_base64']))
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-ac', '1', '-ar', str(self.sample_rate), wav], check=True)
            a, _ = sf.read(wav, dtype='float32')
        al = d['alignment']; chars, st = al['characters'], al['character_start_times_seconds']
        words, cur, t0 = [], '', None
        for c, t in zip(chars, st):
            if c.isspace():
                if cur: words.append((cur, t0)); cur = ''
            else:
                if not cur: t0 = t
                cur += c
        if cur: words.append((cur, t0))
        return a, words

_NORM = re.compile(r"[^0-9a-zàâäéèêëîïôöùûüœæç']+")
def norm_tok(x): return _NORM.sub('', x.lower().replace('’', "'"))

def map_word_times(words, tts_words, dur):
    """Assign start/end to parsed display words from the TTS word timestamps (fuzzy alignment)."""
    import difflib
    toks = []  # (display word index, normalized spoken token)
    for k, w in enumerate(words):
        for tk in w['spoken'].split():
            toks.append((k, norm_tok(tk)))
    a = [t for _, t in toks]; b = [norm_tok(w) for w, _ in tts_words]
    times = [None] * len(toks)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    for blk in sm.get_matching_blocks():
        for j in range(blk.size):
            times[blk.a + j] = tts_words[blk.b + j][1]
    starts = [None] * len(words)
    for (k, _), tm in zip(toks, times):
        if tm is not None and starts[k] is None: starts[k] = tm
    # fill gaps by interpolation
    last = 0.0
    for k in range(len(words)):
        if starts[k] is None:
            nxt = next((starts[j] for j in range(k + 1, len(words)) if starts[j] is not None), dur)
            starts[k] = last + (nxt - last) * .5
        starts[k] = max(starts[k], last); last = starts[k]
    ends = starts[1:] + [dur]
    return [(round(s, 3), round(max(e, s + .05), 3)) for s, e in zip(starts, ends)]

# ---------- automatic quality check (ASR round-trip, best-of-N) ----------
_ASR = None
def asr_text(x, sr):
    global _ASR
    import sherpa_onnx
    if _ASR is None:
        name = 'turbo' if os.path.isdir(os.path.join(MODELS, 'sherpa-onnx-whisper-turbo')) else 'small'
        W = os.path.join(MODELS, f'sherpa-onnx-whisper-{name}') + '/'
        _ASR = sherpa_onnx.OfflineRecognizer.from_whisper(
            encoder=W + f'{name}-encoder.int8.onnx', decoder=W + f'{name}-decoder.int8.onnx', tokens=W + f'{name}-tokens.txt',
            language='fr', task='transcribe', num_threads=os.cpu_count() or 4)
    n = int(len(x) * 16000 / sr)
    y = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)
    y = np.concatenate([np.zeros(4800, np.float32), y, np.zeros(4800, np.float32)])
    st = _ASR.create_stream(); st.accept_waveform(16000, y); _ASR.decode_stream(st)
    return st.result.text

def _qa_norm(t):
    """normalize for comparison: digits, %, € spelled out in French words, punctuation removed."""
    t = t.lower().replace('\u202f', ' ').replace('\xa0', ' ').replace('’', "'")
    for _ in range(3):
        t = re.sub(r'(\d)[ .](\d{3})\b', r'\1\2', t)
    t = t.replace('€', ' euros ').replace('%', ' pour cent ')
    t = re.sub(r'(\d+),(\d+)', r'\1 virgule \2', t)
    try:
        from num2words import num2words
        t = re.sub(r'\d+', lambda m: ' ' + num2words(int(m.group()), lang='fr') + ' ', t)
    except ImportError:
        pass
    t = re.sub(r'\bx\b', 'fois', t)
    t = re.sub(r"[^a-zàâäéèêëîïôöùûüœæç' ]+", ' ', t.replace('-', ' '))
    return t.split()

def wer(ref, hyp):
    r, h = _qa_norm(ref), _qa_norm(hyp)
    d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(h) + 1):
            cur = min(d[j] + 1, d[j - 1] + 1, prev + (r[i - 1] != h[j - 1]))
            prev, d[j] = d[j], cur
    base = d[len(h)] / max(1, len(r))
    NW = {'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze',
          'quinze', 'seize', 'vingt', 'vingts', 'trente', 'quarante', 'cinquante', 'soixante', 'cent', 'cents', 'mille',
          'million', 'millions', 'virgule', 'zéro'}
    from collections import Counter
    if Counter(w for w in r if w in NW) != Counter(w for w in h if w in NW):
        base += .25  # a misheard number matters more than any other word
    return base

def long_pause(x, sr, limit=.9):
    g = gaps(x, sr)
    return max([b - a for a, b in g], default=0) > limit

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

def apply_tempo(x, sr, tempo):
    """speed up speech without changing pitch (ffmpeg atempo)."""
    if abs(tempo - 1) < 1e-3: return x
    import subprocess, tempfile
    with tempfile.TemporaryDirectory() as td:
        a, b = os.path.join(td, 'a.wav'), os.path.join(td, 'b.wav')
        sf.write(a, x, sr, subtype='FLOAT')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a, '-af', f'atempo={tempo}', b], check=True)
        y, _ = sf.read(b, dtype='float32')
    return y

def process_voice(x, sr, male=True, light=False):
    # gentle polish: high-pass, presence lift, soft compression, peak normalize
    import subprocess, tempfile
    with tempfile.TemporaryDirectory() as td:
        a, b = os.path.join(td, 'a.wav'), os.path.join(td, 'b.wav')
        sf.write(a, x, sr, subtype='PCM_16')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a, '-af',
                        ('highpass=f=60,equalizer=f=250:t=q:w=1.2:g=-1,equalizer=f=3500:t=q:w=1.5:g=1.5,' if light else
                         ('highpass=f=65,equalizer=f=130:t=q:w=1.0:g=2.5,equalizer=f=340:t=q:w=1.2:g=-2,equalizer=f=3000:t=q:w=1.4:g=3,'
                         'equalizer=f=6500:t=q:w=2:g=-1,') if male else
                        'highpass=f=75,equalizer=f=220:t=q:w=1.2:g=1.5,equalizer=f=3200:t=q:w=1.5:g=2.5,equalizer=f=7000:t=q:w=2:g=-1.5,')
                        + 'acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,'
                        + f'aresample={SR_OUT}', '-ar', str(SR_OUT), b], check=True)
        y, _ = sf.read(b, dtype='float32')
    return y

def main(script_path, out_dir):
    spec = json.load(open(script_path))
    os.makedirs(out_dir, exist_ok=True)
    voice = spec.get('voice', 'fabien')
    tts = load_tts(voice)
    sid, speed = spec.get('sid', VOICES[voice]['sid']), spec.get('speed', VOICES[voice]['speed'])
    lead = spec.get('lead', 0.35)
    parsed = []
    for li, line in enumerate(spec['lines']):
        words = parse(line['text'])
        parsed.append((line, words, ' '.join(w['spoken'] for w in words)))
    synth = {}
    if isinstance(tts, ElevenTTS):
        import hashlib, pickle
        sr = tts.sample_rate
        cdir = os.path.join(out_dir, 'tts_cache'); os.makedirs(cdir, exist_ok=True)
        for i, (_, _, sp) in enumerate(parsed):
            k = os.path.join(cdir, hashlib.sha1(f'{voice}|{sp}'.encode()).hexdigest()[:16] + '.pkl')
            if os.path.exists(k): synth[i] = pickle.load(open(k, 'rb')); continue
            prev = parsed[i - 1][2] if i else ''
            nxt = parsed[i + 1][2] if i + 1 < len(parsed) else ''
            synth[i] = tts.line(sp, prev, nxt); pickle.dump(synth[i], open(k, 'wb'))
            print(f'  eleven {parsed[i][0].get("id")}: {len(sp)} chars', flush=True)
    if isinstance(tts, KyutaiTTS):
        sr = tts.sample_rate
        import hashlib, pickle
        cdir = os.path.join(out_dir, 'tts_cache'); os.makedirs(cdir, exist_ok=True)
        key = lambda txt: os.path.join(cdir, hashlib.sha1(f'{voice}|{txt}'.encode()).hexdigest()[:16] + '.pkl')
        for i, (_, _, sp) in enumerate(parsed):
            if os.path.exists(key(sp)): synth[i] = pickle.load(open(key(sp), 'rb'))
        todo = [i for i in range(len(parsed)) if i not in synth]
        print(f'  {len(parsed) - len(todo)} lines from cache, {len(todo)} to synthesize', flush=True)
        order = sorted(todo, key=lambda i: len(parsed[i][2]))
        bs = int(spec.get('batch', 6))
        for b0 in range(0, len(order), bs):
            idx = order[b0:b0 + bs]
            import time as _t; t0 = _t.time()
            outs = tts.batch([parsed[i][2] for i in idx])
            for i, o in zip(idx, outs):
                synth[i] = o; pickle.dump(o, open(key(parsed[i][2]), 'wb'))
            print(f'  batch {b0 // bs + 1}: {len(idx)} lines in {_t.time() - t0:.0f}s', flush=True)
        # QA: re-synthesize lines whose transcript drifts from the text, keep the best take
        tries = int(spec.get('qa_tries', 3))
        score = {}
        for rnd in range(tries):
            bad = []
            for i, (line, words, sp) in enumerate(parsed):
                if i in score and score[i] <= .12: continue
                x = trim(synth[i][0], sr)
                disp = ' '.join(w['display'] for w in words)
                sc = wer(disp, asr_text(x, sr)) + (.3 if long_pause(x, sr) else 0)
                if i not in score or sc < score[i]:
                    score[i] = sc; best = synth[i]
                    pickle.dump(best, open(key(sp), 'wb'))
                else:
                    synth[i] = pickle.load(open(key(sp), 'rb'))
                if score[i] > .12: bad.append(i)
            print(f'  QA round {rnd + 1}: ' + ', '.join(f"{parsed[i][0].get('id')}={score[i]:.2f}" for i in bad) if bad else f'  QA round {rnd + 1}: all lines OK', flush=True)
            if not bad or rnd == tries - 1: break
            for b0 in range(0, len(bad), bs):
                idx = bad[b0:b0 + bs]
                outs = tts.batch([parsed[i][2] for i in idx])
                for i, o in zip(idx, outs): synth[i] = o  # candidate, scored next round
    chunks, lines, t = [], [], lead
    for li, (line, words, spoken) in enumerate(parsed):
        if li in synth:
            raw, tw = synth[li]
            tempo = float(spec.get('tempo', 1.0))
            if tempo != 1.0:
                raw = apply_tempo(raw, sr, tempo); tw = [(w, s_ / tempo) for w, s_ in tw]
            x = trim(raw, sr)
            env = np.where(np.abs(raw) > 0.008)[0]
            off = max(0, env[0] - int(0.07 * sr)) / sr if len(env) else 0.0
            dur = len(x) / sr
            tm = map_word_times(words, [(w, max(0.0, s - off)) for w, s in tw], dur)
        else:
            a = tts.generate(spoken, sid=line.get('sid', sid), speed=line.get('speed', speed))
            sr = a.sample_rate
            x = trim(np.array(a.samples, dtype=np.float32), sr)
            dur = len(x) / sr
            tm = align(words, dur, gaps(x, sr))
        for w, (s_, e_) in zip(words, tm):
            w['start'] = round(t + s_, 3); w['end'] = round(t + e_, 3)
        lines.append({'id': line.get('id', f'l{li}'), 'start': round(t, 3), 'end': round(t + dur, 3),
                      'words': words, 'spoken': spoken})
        chunks.append((t, x))
        t += dur + line.get('pause', spec.get('pause', 0.32))
        print(f"{line.get('id', li):>6} {dur:5.2f}s  {spoken[:70]}")
    total = t + spec.get('tail', 1.2)
    buf = np.zeros(int(total * sr) + 1, dtype=np.float32)
    for st, x in chunks:
        i = int(st * sr); buf[i:i + len(x)] += x
    y = process_voice(buf, sr, male=VOICES[voice]['engine'] != 'kokoro', light=VOICES[voice]['engine'] in ('kyutai', 'eleven'))
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
