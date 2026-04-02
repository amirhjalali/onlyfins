# OnlyFins — Design Spec

An OnlyFans parody website for streaming a live pufferfish (Puff Daddy) 24/7.

## Architecture

Three layers:

1. **Stream Relay** (Mac Mini, always on, same LAN as camera)
   - go2rtc connects to HomiQ camera via Tuya Cloud API
   - Exposes RTSP/HLS locally
   - FFmpeg transcodes RTSP → HLS (H.264 + .m3u8 + .ts segments)
   - Segments uploaded to hosting server or served directly

2. **Hosting** (public)
   - Static site served via a VPS or static host (Cloudflare Pages, Vercel, etc.)
   - HLS segments need to be accessible publicly — either:
     - Relay server has a public endpoint (ngrok, Cloudflare Tunnel, or VPS)
     - Or segments are pushed to cloud storage (R2, S3)
   - Simplest for POC: Cloudflare Tunnel from Mac Mini to expose go2rtc's HLS output

3. **Frontend** (static HTML/CSS/JS)
   - Single page, no framework
   - HLS.js for video playback
   - OnlyFans parody UI (light theme, blue accent #00AFF0)

## Stream Pipeline

```
HomiQ Camera (192.168.86.33:6668)
  → go2rtc (Tuya Cloud API source)
  → HLS output (go2rtc built-in or FFmpeg transcode)
  → Cloudflare Tunnel (public URL)
  → Browser (HLS.js player)
```

### Camera Details
- HomiQ Life 3MP 2K Aquarium Pet Camera
- Tuya-based, T31 chip
- Device ID: eb7a4244784e59b66dmkys
- Stream: H.265/HEVC 2560x1440 (needs H.264 transcode for browser)
- go2rtc Tuya Cloud API source (verified working)

### go2rtc Config
```yaml
streams:
  puffdaddy:
    - "tuya://openapi.tuyaus.com?device_id=<id>&uid=<uid>&client_id=<id>&client_secret=<secret>"
api:
  listen: ":1984"
```

## Frontend Design

OnlyFans profile page parody — light theme, matching their actual UI:

- **Header**: "onlyfins" logo (lowercase, Inter font, "only" regular / "fins" bold blue), generated fish logo icon, subscribe button
- **Banner**: Generated underwater scene image
- **Profile**: Puff Daddy avatar (generated), @puffdaddy_official handle, verified badge, fish pun bio
- **Stats bar**: Fake subscriber/like/media counts
- **Live stream**: Full-width HLS.js player with LIVE badge and viewer count
- **Tip button**: "Send Puff Daddy a Treat" (cosmetic)
- **Subscribe CTA**: "It's free. He's a fish."
- **Post feed**: Fake posts with fish puns and screenshots from the stream

### Tech Stack
- Single `index.html` with inline CSS/JS
- HLS.js CDN for video playback
- Generated images (Gemini) for logo, avatar, banner
- No build tools, no framework

## Hosting Plan (POC)
- Site files: static host (Cloudflare Pages or just served from Mac Mini)
- Stream: go2rtc on Mac Mini, exposed via Cloudflare Tunnel
- Domain: TBD (onlyfins.com or similar if available)

## Future Enhancements (post-POC)
- Real subscriber count / visitor counter
- Tip jar (link to fish food wishlist)
- Snapshot gallery (auto-capture stills from stream)
- Temperature/humidity overlay from camera sensors
- Mobile-responsive design polish
- Custom domain and SSL
