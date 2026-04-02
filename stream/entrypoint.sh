#!/bin/bash
set -e

mkdir -p /config

cat > /config/go2rtc.yaml << EOF
streams:
  puffdaddy:
    - "tuya://openapi.tuyaus.com?device_id=${TUYA_DEVICE_ID}&uid=${TUYA_UID}&client_id=${TUYA_CLIENT_ID}&client_secret=${TUYA_CLIENT_SECRET}"

api:
  listen: ":1984"

ffmpeg:
  bin: ffmpeg
EOF

echo "Starting go2rtc with config:"
cat /config/go2rtc.yaml

exec go2rtc -c /config/go2rtc.yaml
