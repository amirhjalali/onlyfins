#!/bin/bash
# OnlyFins Stream Relay
# Starts go2rtc + ffmpeg to transcode camera stream to HLS

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HLS_DIR="$SCRIPT_DIR/hls"
GO2RTC="/tmp/go2rtc"

mkdir -p "$HLS_DIR"

# Start go2rtc in background
echo "Starting go2rtc..."
"$GO2RTC" -c "$SCRIPT_DIR/go2rtc.yaml" &
GO2RTC_PID=$!
sleep 3

# Transcode RTSP from go2rtc to HLS (H.264 for browser compatibility)
echo "Starting FFmpeg HLS transcode..."
ffmpeg -i "rtsp://localhost:8554/puffdaddy" \
  -c:v libx264 -preset ultrafast -tune zerolatency \
  -b:v 2500k -maxrate 2500k -bufsize 5000k \
  -vf "scale=1280:720" \
  -g 30 -keyint_min 30 \
  -hls_time 2 \
  -hls_list_size 5 \
  -hls_flags delete_segments+append_list \
  -hls_segment_filename "$HLS_DIR/segment_%03d.ts" \
  "$HLS_DIR/index.m3u8" &
FFMPEG_PID=$!

echo "Stream relay running!"
echo "  go2rtc API: http://localhost:1984"
echo "  HLS output: $HLS_DIR/index.m3u8"
echo "  go2rtc PID: $GO2RTC_PID"
echo "  FFmpeg PID: $FFMPEG_PID"

# Trap exit to clean up
trap "kill $GO2RTC_PID $FFMPEG_PID 2>/dev/null; exit" INT TERM
wait
