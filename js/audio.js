// Romantic Audio Engine
// Plays "Gone, Gone, Gone" by Phillip Phillips (MP3 Format)
// Continuous Playback - Zero Lag RAM Preload

class RomanticAudioEngine {
    constructor() {
        this.mp3Url = 'assets/music/Phillip%20Phillips%20-%20Gone%2C%20Gone%2C%20Gone.mp3';
        this.audioEl = document.getElementById('bg-audio') || new Audio(this.mp3Url);
        if (!this.audioEl.src || !this.audioEl.src.includes('Gone')) {
            this.audioEl.src = this.mp3Url;
        }
        this.audioEl.loop = true;
        this.audioEl.preload = 'auto';
        this.audioEl.volume = 1.0;
        this.isPlaying = false;
        this.isLoaded = false;
        this.ctx = null;

        // Sync state with audio events
        this.audioEl.addEventListener('play', () => {
            this.isPlaying = true;
            if (window.onAudioStateChange) window.onAudioStateChange(true);
        });

        this.audioEl.addEventListener('canplaythrough', () => {
            this.isLoaded = true;
        });
    }

    setBlobSource(blobUrl) {
        this.audioEl.src = blobUrl;
        this.audioEl.load();
        this.isLoaded = true;
    }

    isReady() {
        return this.isLoaded || this.audioEl.readyState >= 3;
    }

    initCtx() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    play() {
        this.initCtx();
        if (this.audioEl.paused) {
            const p = this.audioEl.play();
            if (p !== undefined) {
                p.then(() => {
                    this.isPlaying = true;
                    if (window.onAudioStateChange) window.onAudioStateChange(true);
                }).catch(() => {
                    this.isPlaying = false;
                });
            }
        } else {
            this.isPlaying = true;
            if (window.onAudioStateChange) window.onAudioStateChange(true);
        }
    }

    // No stop button - song plays continuously
    toggle() {
        this.play();
        return true;
    }

    pause() {
        // Intentionally kept playing: no button to stop
        this.play();
    }

    playWaxSealCrack() {
        this.initCtx();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const chimeFreqs = [523.25, 659.25, 783.99, 1046.50];
        chimeFreqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);
            gain.gain.setValueAtTime(0.08, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 1.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 1.2);
        });
    }

    playCandleBlow() {
        this.initCtx();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.35;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, now);
        filter.frequency.exponentialRampToValueAtTime(250, now + 0.35);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
    }

    playBloomPop() {
        this.initCtx();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    playHeartbeat() {
        this.initCtx();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Two-part heartbeat (lub - dub)
        [0, 0.18].forEach((delay, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const baseFreq = idx === 0 ? 58 : 52;
            osc.frequency.setValueAtTime(baseFreq, now + delay);
            osc.frequency.exponentialRampToValueAtTime(32, now + delay + 0.16);

            const vol = idx === 0 ? 0.35 : 0.28;
            gain.gain.setValueAtTime(vol, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.16);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.16);
        });
    }

    playSupernovaChord() {
        this.initCtx();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // D-major 9th ethereal shimmer chord (D4, F#4, A4, C#5, E5)
        const notes = [293.66, 369.99, 440.00, 554.37, 659.25, 880.00];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.03);

            gain.gain.setValueAtTime(0.07, now + idx * 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.03 + 2.4);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.03);
            osc.stop(now + idx * 0.03 + 2.4);
        });
    }
}

window.romanticAudio = new RomanticAudioEngine();
