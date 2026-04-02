#!/bin/sh
# Generate go2rtc config from environment variables
cat > /config/go2rtc.yaml << EOF
streams:
  puffdaddy:
    - "tuya://openapi.tuyaus.com?device_id=${TUYA_DEVICE_ID}&uid=${TUYA_UID}&client_id=${TUYA_CLIENT_ID}&client_secret=${TUYA_CLIENT_SECRET}"

api:
  listen: ":1984"

ffmpeg:
  bin: ffmpeg
EOF

exec go2rtc -c /config/go2rtc.yaml
