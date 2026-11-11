#!/bin/bash
# Installation unique : dépendances Python/Node + modèle de voix (Kokoro, voix française « ff_siwis »).
set -e
cd "$(dirname "$0")"
pip install "sherpa-onnx<2" soundfile numpy
npm install
npx playwright install chromium
mkdir -p models
if [ ! -d models/kokoro-multi-lang-v1_0 ]; then
  curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_0.tar.bz2 | tar xj -C models
fi
echo "OK : tout est installé."
