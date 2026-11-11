#!/bin/bash
# Installation unique : dépendances Python/Node, modèles de voix et de contrôle qualité.
set -e
cd "$(dirname "$0")"
pip install "sherpa-onnx<2" soundfile numpy torch huggingface_hub safetensors sentencepiece einops "sphn<0.3"
pip install --no-deps "moshi==0.2.13"
npm install
npx playwright install chromium
mkdir -p models
B=https://github.com/k2-fsa/sherpa-onnx/releases
for m in vits-piper-fr_FR-upmc-medium vits-piper-fr_FR-tom-medium kokoro-multi-lang-v1_0; do
  [ -d "models/$m" ] || curl -L "$B/download/tts-models/$m.tar.bz2" | tar xj -C models
done
[ -d models/sherpa-onnx-whisper-turbo ] || curl -L "$B/download/asr-models/sherpa-onnx-whisper-turbo.tar.bz2" | tar xj -C models
python3 - <<'PY'
from huggingface_hub import hf_hub_download
for f in ['config.json', 'tokenizer_spm_8k_en_fr_audio.model',
          'tokenizer-e351c8d8-checkpoint125.safetensors', 'dsm_tts_1e68beda@240.safetensors']:
    hf_hub_download('kyutai/tts-1.6b-en_fr', f, local_dir='models/kyutai-tts-1.6b-en_fr')
PY
echo "OK : tout est installé."
