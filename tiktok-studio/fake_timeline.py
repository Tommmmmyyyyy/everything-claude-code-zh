"""Quick timing estimate (no audio) to preview layouts: python3 fake_timeline.py videos/x/script.json videos/x/build"""
import json, os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tts
spec = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
t = spec.get('lead', .3); lines = []; cues = {}
for li, l in enumerate(spec['lines']):
    words = tts.parse(l['text']); st = t
    for w in words:
        d = .065 * max(2, len(w['spoken'])) + .06
        w['start'] = round(t, 3); w['end'] = round(t + d, 3); t += d
        if re.search(r'[,;:]$', w['display']): t += .18
        if re.search(r'[.?!…]$', w['display']): t += .3
        if 'cue' in w: cues[w['cue']] = w['start']
    lid = l.get('id', f'l{li}')
    lines.append({'id': lid, 'start': round(st, 3), 'end': round(t, 3), 'words': words, 'spoken': ' '.join(w['spoken'] for w in words)})
    cues['line:' + lid] = round(st, 3); cues['end:' + lid] = round(t, 3)
    t += l.get('pause', .35)
json.dump({'duration': round(t + 1.6, 3), 'lines': lines, 'cues': cues}, open(os.path.join(out, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
print(os.path.basename(os.path.dirname(sys.argv[1])), 'fake duration', round(t + 1.6, 1))
