# OnlyFins

An OnlyFans parody website for streaming Puff Daddy — a figure 8 pufferfish — 24/7.

**Live:** [onlyfins.amirhjalali.com](https://onlyfins.amirhjalali.com)

## How it works

A HomiQ aquarium camera streams via the Tuya Cloud API to [go2rtc](https://github.com/AlexxIT/go2rtc), which transcodes and serves the video over MSE (WebSocket) to the browser. The entire site is a single `index.html` with generated images — no framework, no build step.

```
HomiQ Camera → Tuya Cloud → go2rtc (H.264 transcode) → MSE WebSocket → Browser
```

## Tech stack

- **Camera:** HomiQ Life 3MP 2K Aquarium Pet Camera (Tuya-based)
- **Stream relay:** go2rtc v1.9.14 with FFmpeg H.264 transcode
- **Frontend:** Static HTML/CSS/JS, MSE player via WebSocket
- **Images:** Generated with Gemini API
- **Hosting:** Coolify (Docker) on a VPS

## Running locally

```bash
# Download go2rtc
curl -L -o /tmp/go2rtc.zip https://github.com/AlexxIT/go2rtc/releases/download/v1.9.14/go2rtc_mac_arm64.zip
cd /tmp && unzip -o go2rtc.zip && chmod +x go2rtc

# Create config (fill in your Tuya credentials)
cp .env.example .env
# Edit .env with your values, then:
source .env && cat > /tmp/go2rtc-local.yaml << EOF
streams:
  puffdaddy:
    - "tuya://openapi.tuyaus.com?device_id=$TUYA_DEVICE_ID&uid=$TUYA_UID&client_id=$TUYA_CLIENT_ID&client_secret=$TUYA_CLIENT_SECRET"
api:
  listen: ":1984"
  static_dir: $(pwd)/public
ffmpeg:
  bin: ffmpeg
EOF

# Start
/tmp/go2rtc -c /tmp/go2rtc-local.yaml
# Open http://localhost:1984
```

## Deploying to Coolify

See [DEPLOYMENT.md](DEPLOYMENT.md) for full instructions.

## About Puff Daddy

Puff Daddy is a *Dichotomyctere ocellatus* (figure 8 puffer) — a brackish water species known for their curious personality, snail-crushing teeth, and ability to puff up when threatened. He streams 24/7 from a lovingly maintained aquarium in NYC.

---

*This is a parody. No fish were harmed in the making of this website.*
