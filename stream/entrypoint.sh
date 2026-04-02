#!/bin/sh
# Substitute environment variables into the config template
envsubst < /config/go2rtc.yaml.template > /config/go2rtc.yaml
exec go2rtc -c /config/go2rtc.yaml
