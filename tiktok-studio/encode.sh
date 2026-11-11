#!/bin/bash
# encode.sh <video_dir> <out.mp4>
set -e
B=$1/build
ffmpeg -v error -y -framerate 30 -i $B/frames/%05d.jpg -i $B/mix.wav \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -profile:v high -level 4.1 -r 30 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart "$2"
ls -la "$2"
