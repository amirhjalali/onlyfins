#!/bin/bash
set -e

mkdir -p /config

cat > /config/go2rtc.yaml << EOF
streams:
  # Raw Tuya HEVC source. go2rtc stamps the container header with the
  # camera's ADVERTISED resolution (2560x1440) but it actually encodes
  # 2304x1296 — that mismatch is what paints the green L-band on iOS.
  puffdaddy_raw:
    - "tuya://openapi.tuyaus.com?device_id=${TUYA_DEVICE_ID}&uid=${TUYA_UID}&client_id=${TUYA_CLIENT_ID}&client_secret=${TUYA_CLIENT_SECRET}"
  # Zero-CPU stream copy: ffmpeg rebuilds the MP4/MSE header from the real
  # SPS (2304x1296), so declared == actual and the green band disappears.
  # No transcode, no quality loss. index.html already points at puffdaddy.
  puffdaddy:
    - "ffmpeg:puffdaddy_raw#video=copy"

api:
  listen: ":3000"
  static_dir: /www

ffmpeg:
  bin: ffmpeg
EOF

echo "Starting go2rtc..."
exec go2rtc -c /config/go2rtc.yaml
