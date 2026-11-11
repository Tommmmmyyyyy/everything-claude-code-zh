#!/bin/bash
# Installation unique : dépendances Python/Node + modèles de voix françaises (Pierre, Tom, Siwis).
set -e
cd "$(dirname "$0")"
pip install "sherpa-onnx<2" soundfile numpy
npm install
npx playwright install chromium
mkdir -p models
B=https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models
for m in vits-piper-fr_FR-upmc-medium vits-piper-fr_FR-tom-medium kokoro-multi-lang-v1_0; do
  [ -d "models/$m" ] || curl -L "$B/$m.tar.bz2" | tar xj -C models
done
echo "OK : tout est installé."
