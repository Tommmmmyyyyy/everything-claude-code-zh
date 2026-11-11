"""Use an existing voice-over (e.g. exported from ElevenLabs) instead of generating one.

usage: python3 align_audio.py <script.json> <voice.mp3|wav> <build_dir>

Transcribes the audio with word timestamps (faster-whisper), aligns those words with the
script, and writes build/voice.wav + build/timeline.json in the same format as tts.py, so the
animations and karaoke captions follow the real voice.
"""
import json, os, re, sys, subprocess, difflib, tempfile
import numpy as np, soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tts  # parse(), process_voice()

SR_OUT = 48000
ASR_MODEL = os.environ.get('ALIGN_MODEL', 'deepdml/faster-whisper-large-v3-turbo-ct2')


def norm_tokens(text):
    """lowercase words, hyphens split, digits/€/% spelled out like the script."""
    from num2words import num2words
    t = text.lower().replace('’', "'").replace(' ', ' ').replace('\xa0', ' ')
    t = re.sub(r'(\d)[ .](\d{3})\b', r'\1\2', t)
    t = re.sub(r'(\d)[ .](\d{3})\b', r'\1\2', t)
    t = t.replace('€', ' euros ').replace('%', ' pour cent ')
    t = re.sub(r'\d+', lambda m: ' ' + num2words(int(m.group()), lang='fr') + ' ', t)
    t = re.sub(r"\bx\b", 'fois', t)
    t = re.sub(r"[^a-zàâäéèêëîïôöùûüœæç' ]+", ' ', t.replace('-', ' '))
    return t.split()


def main(script_path, audio_path, out_dir):
    from faster_whisper import WhisperModel
    spec = json.load(open(script_path))
    os.makedirs(out_dir, exist_ok=True)
    lead, tail = spec.get('lead', 0.3), spec.get('tail', 1.6)

    with tempfile.TemporaryDirectory() as td:
        wav = os.path.join(td, 'v.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', audio_path, '-ac', '1', '-ar', '44100', wav], check=True)
        x, sr = sf.read(wav, dtype='float32')
        w16 = os.path.join(td, 'v16.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', audio_path, '-ac', '1', '-ar', '16000', w16], check=True)
        a16, _ = sf.read(w16, dtype='float32')

    model = WhisperModel(ASR_MODEL, device='cpu', compute_type='int8', cpu_threads=os.cpu_count() or 4)
    segs, _ = model.transcribe(a16, language='fr', word_timestamps=True, beam_size=5,
                               condition_on_previous_text=True, vad_filter=False)
    hyp = []  # (token, start, end)
    asr_text = []
    for s in segs:
        for w in s.words:
            asr_text.append(w.word)
            toks = norm_tokens(w.word)
            if not toks: continue
            d = (w.end - w.start) / len(toks)
            for i, tk in enumerate(toks):
                hyp.append((tk, w.start + i * d, w.start + (i + 1) * d))
    print('ASR:', ''.join(asr_text)[:300], '...')

    # reference tokens from the script (spoken side)
    lines = []
    ref = []  # (line idx, word idx, token)
    for li, line in enumerate(spec['lines']):
        words = tts.parse(line['text'])
        lines.append((line, words))
        for k, w in enumerate(words):
            for tk in norm_tokens(w['spoken']):
                ref.append((li, k, tk))
    sm = difflib.SequenceMatcher(a=[r[2] for r in ref], b=[h[0] for h in hyp], autojunk=False)
    t_start, t_end = [None] * len(ref), [None] * len(ref)
    matched = 0
    for blk in sm.get_matching_blocks():
        for j in range(blk.size):
            t_start[blk.a + j] = hyp[blk.b + j][1]; t_end[blk.a + j] = hyp[blk.b + j][2]; matched += 1
    print(f'aligned {matched}/{len(ref)} script tokens')

    # per display word start/end
    out_lines = []
    tok_by_word = {}
    for i, (li, k, _) in enumerate(ref):
        tok_by_word.setdefault((li, k), []).append(i)
    flat = []  # (li, k) in order
    for li, (line, words) in enumerate(lines):
        for k in range(len(words)): flat.append((li, k))
    starts, ends = {}, {}
    for key in flat:
        idx = tok_by_word.get(key, [])
        ss = [t_start[i] for i in idx if t_start[i] is not None]
        ee = [t_end[i] for i in idx if t_end[i] is not None]
        starts[key] = min(ss) if ss else None
        ends[key] = max(ee) if ee else None
    # interpolate missing starts, keep monotonic
    last = 0.0
    for n, key in enumerate(flat):
        if starts[key] is None:
            nxt = next((starts[k2] for k2 in flat[n + 1:] if starts[k2] is not None), len(x) / sr)
            starts[key] = last + (nxt - last) * .5
        starts[key] = max(starts[key], last); last = starts[key]
    cues = {}
    for li, (line, words) in enumerate(lines):
        keys = [(li, k) for k in range(len(words))]
        for n, key in enumerate(keys):
            w = words[key[1]]
            w['start'] = round(lead + starts[key], 3)
            nxt = starts[keys[n + 1]] if n + 1 < len(keys) else (ends[key] or starts[key] + .4)
            w['end'] = round(lead + max(nxt, starts[key] + .05), 3)
            if 'cue' in w: cues[w['cue']] = w['start']
        lid = line.get('id', f'l{li}')
        st, en = words[0]['start'], max(w['end'] for w in words)
        lend = ends[keys[-1]]
        if lend is not None: en = round(lead + lend, 3); words[-1]['end'] = en
        out_lines.append({'id': lid, 'start': st, 'end': en, 'words': words,
                          'spoken': ' '.join(w['spoken'] for w in words)})
        cues['line:' + lid] = st; cues['end:' + lid] = en
        print(f'{lid:>6} {st:7.2f} -> {en:7.2f}  {out_lines[-1]["spoken"][:60]}')

    total = lead + len(x) / sr + tail
    buf = np.zeros(int(total * sr) + 1, dtype=np.float32)
    i0 = int(lead * sr); buf[i0:i0 + len(x)] = x
    y = tts.process_voice(buf, sr, male=True, light=True)
    y = y / max(1e-6, np.max(np.abs(y))) * 0.89
    sf.write(os.path.join(out_dir, 'voice.wav'), y, SR_OUT, subtype='PCM_16')
    json.dump({'duration': round(total, 3), 'lines': out_lines, 'cues': cues},
              open(os.path.join(out_dir, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    print('total', round(total, 2), 's')


if __name__ == '__main__':
    main(*sys.argv[1:4])
