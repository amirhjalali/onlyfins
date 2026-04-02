#!/bin/bash
set -e

mkdir -p /config

cat > /config/go2rtc.yaml << EOF
streams:
  puffdaddy_raw:
    - "tuya://openapi.tuyaus.com?device_id=${TUYA_DEVICE_ID}&uid=${TUYA_UID}&client_id=${TUYA_CLIENT_ID}&client_secret=${TUYA_CLIENT_SECRET}"
  puffdaddy:
    - "ffmpeg:puffdaddy_raw#video=h264"

api:
  listen: ":3000"
  static_dir: /www

ffmpeg:
  bin: ffmpeg
EOF

echo "Config:"
cat /config/go2rtc.yaml
echo "Starting go2rtc..."
exec go2rtc -c /config/go2rtc.yaml
