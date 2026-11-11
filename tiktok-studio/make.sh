#!/bin/bash
# Fabrique une vidéo complète : ./make.sh videos/v1_cafe [sortie.mp4]
# Variables optionnelles : WORKERS=4  AUDIO_ARGS="--seed 11 --root 48 --bpm 100"
set -e
cd "$(dirname "$0")"
V=${1%/}
OUT=${2:-out/$(basename "$V").mp4}
mkdir -p "$(dirname "$OUT")"
python3 tts.py "$V/script.json" "$V/build"            # 1. voix + timings mot à mot
rm -rf "$V/build/frames"
node render.js "$V" --workers "${WORKERS:-4}"         # 2. images (1080x1920, 30 i/s)
python3 audio.py "$V" ${AUDIO_ARGS}                   # 3. musique + bruitages + mixage
./encode.sh "$V" "$OUT"                               # 4. MP4 prêt pour TikTok
