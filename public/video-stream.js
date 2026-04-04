import {VideoRTC} from './video-rtc.js';

/**
 * This is example, how you can extend VideoRTC player for your app.
 * Also you can check this example: https://github.com/AlexxIT/WebRTC
 */
class VideoStream extends VideoRTC {
    set divMode(value) {
        this.querySelector('.mode').innerText = value;
        this.querySelector('.status').innerText = '';
    }

    set divError(value) {
        const state = this.querySelector('.mode').innerText;
        if (state !== 'loading') return;
        this.querySelector('.mode').innerText = 'error';
        this.querySelector('.status').innerText = value;
    }

    /**
     * Custom GUI
     */
    oninit() {
        console.debug('stream.oninit');
        super.oninit();

        this.innerHTML = `
        <style>
        video-stream {
            position: relative;
            overflow: hidden;
            display: block;
        }
        .info {
            display: none;
        }
        .controls-overlay {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            padding: 10px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: linear-gradient(transparent, rgba(0,0,0,0.6));
            opacity: 0;
            transition: opacity 0.25s;
            z-index: 5;
        }
        video-stream:hover .controls-overlay,
        video-stream.show-controls .controls-overlay,
        video-stream.paused .controls-overlay { opacity: 1; }
        .ctrl-btn {
            width: 36px; height: 36px;
            background: rgba(255,255,255,0.15);
            border: none; border-radius: 50%;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            padding: 0;
        }
        .ctrl-btn:hover { background: rgba(255,255,255,0.3); }
        .ctrl-btn svg { width: 18px; height: 18px; fill: white; }
        .ctrl-btn.hidden { display: none; }
        .big-play {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            display: flex; align-items: center; justify-content: center;
            background: rgba(0,0,0,0.35);
            z-index: 10;
            cursor: pointer;
            transition: opacity 0.3s;
        }
        .big-play.hidden { display: none; }
        .big-play svg {
            width: 64px; height: 64px; fill: white;
            filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
            opacity: 0.9;
        }
        .big-play:hover svg { opacity: 1; }
        </style>
        <div class="info">
            <div class="status"></div>
            <div class="mode"></div>
        </div>
        <div class="big-play">
            <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        </div>
        <div class="controls-overlay">
            <button class="ctrl-btn play-btn hidden" title="Play">
                <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
            </button>
            <button class="ctrl-btn pause-btn hidden" title="Pause">
                <svg viewBox="0 0 24 24"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>
            </button>
            <span style="flex:1"></span>
            <button class="ctrl-btn fullscreen-btn" title="Fullscreen">
                <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
            </button>
        </div>
        `;

        const info = this.querySelector('.info');
        this.insertBefore(this.video, info);

        // Disable native controls, mute for autoplay policy
        this.video.controls = false;
        this.video.muted = true;

        const playBtn = this.querySelector('.play-btn');
        const pauseBtn = this.querySelector('.pause-btn');
        const bigPlay = this.querySelector('.big-play');
        let hideTimer;
        let started = false;

        const updateBtns = () => {
            playBtn.classList.toggle('hidden', !this.video.paused);
            pauseBtn.classList.toggle('hidden', this.video.paused);
            this.classList.toggle('paused', this.video.paused);
        };

        // Video autoplays muted behind the overlay — just hide overlay on click
        const startPlayback = () => {
            if (started) return;
            started = true;
            bigPlay.classList.add('hidden');
        };

        bigPlay.addEventListener('click', startPlayback);

        // Mobile: tap video to show/hide controls
        this.video.addEventListener('click', () => {
            if (!started) { startPlayback(); return; }
            if (this.classList.contains('show-controls')) {
                this.classList.remove('show-controls');
            } else {
                this.classList.add('show-controls');
                updateBtns();
                clearTimeout(hideTimer);
                hideTimer = setTimeout(() => this.classList.remove('show-controls'), 3000);
            }
        });

        playBtn.addEventListener('click', () => { this.video.play(); updateBtns(); });
        pauseBtn.addEventListener('click', () => { this.video.pause(); updateBtns(); });

        // Auto-resume on stall (Tuya session cycling causes brief drops)
        this.video.addEventListener('stalled', () => {
            if (started) setTimeout(() => { if (this.video.paused) this.video.play(); }, 1000);
        });
        this.video.addEventListener('pause', () => {
            if (started && !this._userPaused) setTimeout(() => this.video.play(), 500);
        });

        // Watchdog: detect frozen video (WebRTC drops don't fire stalled/pause)
        let lastTime = 0;
        setInterval(() => {
            if (!started || this._userPaused) return;
            const t = this.video.currentTime;
            if (t === lastTime && !this.video.paused) {
                // Video frozen — reload the stream
                this.video.pause();
                this.video.play().catch(() => {});
            }
            lastTime = t;
        }, 5000);

        // Track user-initiated pauses
        pauseBtn.addEventListener('mousedown', () => { this._userPaused = true; });
        playBtn.addEventListener('click', () => { this._userPaused = false; });

        // Fullscreen
        this.querySelector('.fullscreen-btn').addEventListener('click', () => {
            const el = this.video;
            if (el.requestFullscreen) el.requestFullscreen();
            else if (el.webkitEnterFullscreen) el.webkitEnterFullscreen();
        });
    }

    onconnect() {
        console.debug('stream.onconnect');
        const result = super.onconnect();
        if (result) this.divMode = 'loading';
        return result;
    }

    ondisconnect() {
        console.debug('stream.ondisconnect');
        super.ondisconnect();
    }

    onopen() {
        console.debug('stream.onopen');
        const result = super.onopen();

        this.onmessage['stream'] = msg => {
            console.debug('stream.onmessge', msg);
            switch (msg.type) {
                case 'error':
                    this.divError = msg.value;
                    break;
                case 'mse':
                case 'hls':
                case 'mp4':
                case 'mjpeg':
                    this.divMode = msg.type.toUpperCase();
                    break;
            }
        };

        return result;
    }

    onclose() {
        console.debug('stream.onclose');
        return super.onclose();
    }

    onpcvideo(ev) {
        console.debug('stream.onpcvideo');
        super.onpcvideo(ev);

        if (this.pcState !== WebSocket.CLOSED) {
            this.divMode = 'RTC';
        }
    }
}

customElements.define('video-stream', VideoStream);
