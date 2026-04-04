#!/bin/bash
set -e

mkdir -p /config

cat > /config/go2rtc.yaml << EOF
streams:
  puffdaddy_raw:
    - "tuya://openapi.tuyaus.com?device_id=${TUYA_DEVICE_ID}&uid=${TUYA_UID}&client_id=${TUYA_CLIENT_ID}&client_secret=${TUYA_CLIENT_SECRET}"
  puffdaddy:
    - "ffmpeg:puffdaddy_raw#video=copy#raw=-bsf:v hevc_metadata=crop_bottom=16"
  puffdaddy_tv:
    - "ffmpeg:puffdaddy_raw#video=h264#width=1280#height=720"

api:
  listen: ":3000"
  static_dir: /www

ffmpeg:
  bin: ffmpeg
  h264: "-codec:v libx264 -preset:v ultrafast -tune:v zerolatency -g:v 30"
EOF

echo "Starting go2rtc..."
exec go2rtc -c /config/go2rtc.yaml
