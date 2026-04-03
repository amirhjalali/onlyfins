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
        }
        .info {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            padding: 12px;
            color: white;
            display: flex;
            justify-content: space-between;
            pointer-events: none;
        }
        .fullscreen-btn {
            position: absolute;
            bottom: 12px;
            right: 12px;
            width: 36px;
            height: 36px;
            background: rgba(0,0,0,0.5);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 5;
            padding: 0;
        }
        .fullscreen-btn:hover { background: rgba(0,0,0,0.7); }
        .fullscreen-btn svg { width: 20px; height: 20px; fill: white; }
        </style>
        <div class="info">
            <div class="status"></div>
            <div class="mode"></div>
        </div>
        <button class="fullscreen-btn" title="Fullscreen">
            <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
        </button>
        `;

        const info = this.querySelector('.info');
        this.insertBefore(this.video, info);

        // Disable native controls — use click-to-play/pause instead
        this.video.controls = false;
        this.video.addEventListener('click', () => {
            if (this.video.paused) this.video.play();
            else this.video.pause();
        });

        // Fullscreen button
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
