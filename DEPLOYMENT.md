# OnlyFins Deployment Guide

## What We Built
- OnlyFans parody site streaming Puff Daddy (figure 8 puffer) 24/7
- HomiQ camera → Tuya Cloud API → go2rtc → browser (WebRTC/MSE)
- Single `index.html` with generated images, no framework

## Running Locally

```bash
# 1. Start go2rtc (camera stream relay)
/tmp/go2rtc -c /tmp/go2rtc-local.yaml &

# If go2rtc binary is missing, download it:
curl -L -o /tmp/go2rtc.zip https://github.com/AlexxIT/go2rtc/releases/download/v1.9.14/go2rtc_mac_arm64.zip
cd /tmp && unzip -o go2rtc.zip && chmod +x go2rtc

# go2rtc-local.yaml needs these contents (NOT in repo for security):
cat > /tmp/go2rtc-local.yaml << 'EOF'
streams:
  puffdaddy:
    - "tuya://openapi.tuyaus.com?device_id=eb7a4244784e59b66dmkys&uid=az1675279868048Gibpj&client_id=3smytt3phac83ppkksdd&client_secret=9fafea8dcdc0419f82fca6760cac7ecb"
api:
  listen: ":1984"
ffmpeg:
  bin: ffmpeg
EOF

# 2. Start web server
cd /Users/amirhjalali/onlyfins/public && python3 -m http.server 8080 &

# 3. Open http://localhost:8080
```

## Deploying to Coolify

### Step 1: Deploy go2rtc (Docker service)
1. In Coolify, create a new **Docker** resource from GitHub repo `amirhjalali/onlyfins`
2. It will build from the `Dockerfile` in the repo root
3. Set environment variables:
   - `TUYA_DEVICE_ID` = `eb7a4244784e59b66dmkys`
   - `TUYA_UID` = `az1675279868048Gibpj`
   - `TUYA_CLIENT_ID` = `3smytt3phac83ppkksdd`
   - `TUYA_CLIENT_SECRET` = `9fafea8dcdc0419f82fca6760cac7ecb`
4. Expose port **1984**
5. Assign a domain (e.g., `stream.onlyfins.com` or whatever you have)
6. Make sure HTTPS is enabled

### Step 2: Deploy the static site
Option A — **Cloudflare Pages** (recommended, free CDN):
1. Go to https://dash.cloudflare.com → Pages → Create
2. Connect GitHub repo `amirhjalali/onlyfins`
3. Set build output directory to `public`
4. No build command needed (it's static)
5. Deploy

Option B — **Coolify static site**:
1. Create another resource from the same repo
2. Configure as static site, serve from `public/`

### Step 3: Update stream URL
In `public/index.html`, find this line:
```js
: 'https://stream.onlyfins.com'; // replace with your go2rtc deployment URL
```
Replace `stream.onlyfins.com` with whatever domain Coolify assigned to the go2rtc service. Commit and push.

## Architecture
```
HomiQ Camera → Tuya Cloud → go2rtc (Coolify) → browser (WebRTC)
                                                  ↑
                              Static site (Cloudflare Pages) serves the HTML
```

## Tuya IoT Platform
- Account: iot.tuya.com
- Project: "OnlyFins" (Western America data center)
- Camera linked via Smart Life app
- API subscriptions: IoT Video Live Stream, Smart Home Device Management

## Key Files
- `public/index.html` — the entire site (single file)
- `public/assets/` — generated images (logo, avatar, banner, posts)
- `stream/go2rtc.yaml` — go2rtc config (uses env vars, safe to commit)
- `Dockerfile` — builds go2rtc container for Coolify
- `.env.example` — template for required environment variables
