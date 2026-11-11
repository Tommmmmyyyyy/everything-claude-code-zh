#!/bin/bash
# encode.sh <video_dir> <out.mp4>   (FPS=60 ./encode.sh ... for 60 fps renders)
set -e
B=$1/build
FPS=${FPS:-30}
ffmpeg -v error -y -framerate $FPS -i $B/frames/%05d.jpg -i $B/mix.wav \
  -c:v libx264 -preset slow -crf 16 -tune animation -pix_fmt yuv420p -profile:v high -level 4.2 -r $FPS -g $((FPS*2)) \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart "$2"
ls -la "$2"
