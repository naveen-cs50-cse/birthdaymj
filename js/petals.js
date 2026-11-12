// Painterly Sunflower Background Physics
// Uses painterly Van Gogh sunflower blooms drifting softly across the screen

class SunflowerCanvasEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.sunflowerImg = new Image();
        this.sunflowerImg.src = 'assets/pinterest/sunflower_painterly_pin.webp';
        this.sunflowerLoaded = false;
        this.sunflowerImg.onload = () => {
            this.sunflowerLoaded = true;
        };

        this.items = [];
        this.burstParticles = [];
        this.confettiParticles = [];
        this.maxFlowers = 16;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.touchX = -1000;
        this.touchY = -1000;

        this.resize();
        this.initItems();
        this.bindEvents();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize(), { passive: true });

        window.addEventListener('mousemove', (e) => {
            this.touchX = e.clientX;
            this.touchY = e.clientY;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.touchX = e.touches[0].clientX;
                this.touchY = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('click', (e) => {
            const target = e.target;
            if (target.closest('button, a, input, video, .lightbox-content, .hero-polaroid-frame, .film-frame, .starry-card, .video-polaroid-card')) {
                return;
            }
            this.spawnBloomBurst(e.clientX, e.clientY);
        });
    }

    initItems() {
        this.items = [];
        for (let i = 0; i < this.maxFlowers; i++) {
            this.items.push(this.createFlower(true));
        }
    }

    createFlower(randomY = false) {
        return {
            x: Math.random() * this.width,
            y: randomY ? Math.random() * this.height : -50,
            size: 26 + Math.random() * 28,
            speedY: 0.6 + Math.random() * 0.9,
            speedX: -0.2 + Math.random() * 0.4,
            angle: Math.random() * Math.PI * 2,
            angularSpeed: (Math.random() - 0.5) * 0.02,
            oscillationSpeed: 0.015 + Math.random() * 0.02,
            oscillationOffset: Math.random() * Math.PI * 2,
            opacity: 0.4 + Math.random() * 0.4
        };
    }

    spawnBloomBurst(x, y) {
        if (window.romanticAudio && window.romanticAudio.playBloomPop) {
            window.romanticAudio.playBloomPop();
        }

        const count = 6;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.3);
            const speed = 2.0 + Math.random() * 3.0;
            this.burstParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.0,
                size: 16 + Math.random() * 16,
                angle: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.1,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.015
            });
        }
    }

    triggerBirthdayConfetti() {
        const count = 90;
        const colors = ['#FFB300', '#F59E0B', '#FBBF24', '#F43F5E', '#FFFBEB', '#38BDF8'];

        for (let i = 0; i < count; i++) {
            this.confettiParticles.push({
                x: this.width * 0.5 + (Math.random() - 0.5) * 220,
                y: this.height * 0.65,
                vx: (Math.random() - 0.5) * 14,
                vy: - (8 + Math.random() * 14),
                sizeW: 6 + Math.random() * 8,
                sizeH: 10 + Math.random() * 12,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.0,
                decay: 0.008 + Math.random() * 0.007,
                gravity: 0.32 + Math.random() * 0.18,
                isFlower: Math.random() > 0.65
            });
        }
    }

    triggerSunflowerSupernova() {
        const count = 130;
        const centerX = this.width * 0.5;
        const centerY = this.height * 0.45;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.35);
            const speed = 4.5 + Math.random() * 9.5;
            this.burstParticles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                size: 26 + Math.random() * 34,
                angle: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.16,
                life: 1.0,
                decay: 0.007 + Math.random() * 0.006
            });
        }

        this.triggerBirthdayConfetti();
    }

    loop() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Drifting Sunflowers
        for (let i = 0; i < this.items.length; i++) {
            const f = this.items[i];

            f.y += f.speedY;
            f.x += f.speedX + Math.sin(f.oscillationOffset) * 0.6;
            f.oscillationOffset += f.oscillationSpeed;
            f.angle += f.angularSpeed;

            const dx = f.x - this.touchX;
            const dy = f.y - this.touchY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80 && dist > 0) {
                const force = (80 - dist) / 80;
                f.x += (dx / dist) * force * 3.5;
                f.y += (dy / dist) * force * 2.5;
            }

            if (this.sunflowerLoaded) {
                this.ctx.save();
                this.ctx.translate(f.x, f.y);
                this.ctx.rotate(f.angle);
                this.ctx.globalAlpha = f.opacity;
                this.ctx.drawImage(this.sunflowerImg, -f.size / 2, -f.size / 2, f.size, f.size);
                this.ctx.restore();
            }

            if (f.y > this.height + 60 || f.x < -60 || f.x > this.width + 60) {
                this.items[i] = this.createFlower(false);
            }
        }

        // Draw Burst Particles
        for (let i = this.burstParticles.length - 1; i >= 0; i--) {
            const p = this.burstParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.06;
            p.angle += p.rotSpeed;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.burstParticles.splice(i, 1);
                continue;
            }

            if (this.sunflowerLoaded) {
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.angle);
                this.ctx.globalAlpha = p.life;
                const sz = p.size * p.life;
                this.ctx.drawImage(this.sunflowerImg, -sz / 2, -sz / 2, sz, sz);
                this.ctx.restore();
            }
        }

        // Draw Confetti
        for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
            const cp = this.confettiParticles[i];
            cp.x += cp.vx;
            cp.y += cp.vy;
            cp.vy += cp.gravity;
            cp.vx *= 0.98;
            cp.rotation += cp.rotSpeed;
            cp.life -= cp.decay;

            if (cp.life <= 0 || cp.y > this.height + 60) {
                this.confettiParticles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(cp.x, cp.y);
            this.ctx.rotate((cp.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = Math.max(0, cp.life);

            if (cp.isFlower && this.sunflowerLoaded) {
                this.ctx.drawImage(this.sunflowerImg, -10, -10, 20, 20);
            } else {
                this.ctx.fillStyle = cp.color;
                this.ctx.fillRect(-cp.sizeW / 2, -cp.sizeH / 2, cp.sizeW, cp.sizeH);
            }
            this.ctx.restore();
        }

        requestAnimationFrame(this.loop);
    }
}

window.SunflowerCanvasEngine = SunflowerCanvasEngine;
