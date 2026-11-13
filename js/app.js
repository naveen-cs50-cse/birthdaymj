// Pinterest Scrapbook & Van Gogh Sunflower Interactive Engine
// Clean Photography: No Cringe Text Below Images, No Clumsy Polaroid Boxes, Pure Aesthetics
// iPhone 16 Pro Optimized & 120fps Silky Smooth Playback

document.addEventListener('DOMContentLoaded', () => {
    const rawItems = window.MEMORIES_DATA || [];

    // Separate photos & videos
    const allPhotos = rawItems.filter(x => x.type === 'image');
    const allVideos = rawItems.filter(x => x.type === 'video');

    // 0. Master Birthday Story Collage (Hero Item #0)
    const heroStoryItem = {
        type: 'image',
        src: 'assets/pinterest/hero_birthday_story.webp?v=20th',
        thumb: 'assets/pinterest/hero_birthday_story.webp?v=20th',
        title: 'Happy 20th Birthday Mju 🌻'
    };

    // 1. Curate First 10 for Filmstrip Reel
    const filmstripItems = allPhotos.slice(0, 10);

    // 2. Curate Next 8 for Starry Night Section
    const starryItems = allPhotos.slice(10, 18);

    // 3. All remaining photos for Pinterest Mood Board
    const moodboardItems = allPhotos.slice(18);

    // Master list for Lightbox (Hero collage is item 0)
    const masterItems = [
        heroStoryItem,
        ...filmstripItems,
        ...starryItems,
        ...allVideos,
        ...moodboardItems
    ];

    // Initialize Canvas Physics
    const canvasEngine = new window.SunflowerCanvasEngine('sunflower-canvas');

    // DOM Elements
    const audioDisc = document.getElementById('audio-disc');
    const audioBars = document.getElementById('audio-bars');
    const audioLabel = document.getElementById('audio-label');

    const heroCenterpiece = document.getElementById('hero-cutout-click');
    const filmstripTrack = document.getElementById('filmstrip-track');
    const starryTrack = document.getElementById('starry-track');
    const videosTrack = document.getElementById('videos-track');
    const moodboardGrid = document.getElementById('moodboard-grid');

    // RAM Video Elements & Blob Cache (Zero Lag Streaming)
    const videoElementsMap = new Map();
    const videoBlobs = new Map();

    // =========================================
    // 0. LOCK SCREEN GATEWAY & BACKGROUND RAM PRELOADER
    // =========================================
    const gateScreen = document.getElementById('gate-screen');
    const gateEnterBtn = document.getElementById('gate-enter-btn');
    const gateProgressBar = document.getElementById('gate-progress-bar');
    const gateStatusText = document.getElementById('gate-loader-status');
    const gatePromptText = document.getElementById('gate-prompt-text');
    const gateTimerSec = document.getElementById('gate-timer-sec');
    const gateLoaderPct = document.getElementById('gate-loader-pct');

    let gateUnlocked = false;
    let allAssetsReady = false;
    let userPendingUnlock = false;

    // Progress Trackers
    let audioPct = 0;
    let audioLoaded = false;
    let videosLoadedCount = 0;
    let imagesLoadedCount = 0;

    // Core Visual Assets to Download in Background
    const imagesToPreload = [
        'assets/pinterest/hero_birthday_story.webp?v=20th',
        'assets/pinterest/sunflower_painterly_pin.webp',
        'assets/pinterest/starry_sunflowers_bg.webp'
    ];

    // Pre-cache all memory thumbnails so scrolling never stutters
    masterItems.forEach(item => {
        if (item.thumb && !imagesToPreload.includes(item.thumb)) {
            imagesToPreload.push(item.thumb);
        }
    });

    const totalImages = imagesToPreload.length;
    const totalVideos = allVideos.length;
    const preloaderStartTime = performance.now();

    // Update Live Countdown & Progress Bar (Videos 75%, Audio 15%, Images 10%)
    function updateCombinedProgress() {
        const videoPct = totalVideos > 0 ? (videosLoadedCount / totalVideos) * 100 : 100;
        const imagePct = totalImages > 0 ? (imagesLoadedCount / totalImages) * 100 : 100;

        const combinedPct = Math.min(100, Math.round(
            (videoPct * 0.75) + (audioPct * 0.15) + (imagePct * 0.10)
        ));

        if (gateProgressBar) {
            gateProgressBar.style.width = `${combinedPct}%`;
        }
        if (gateLoaderPct) {
            gateLoaderPct.textContent = `${combinedPct}%`;
        }

        // Live Timer Countdown Calculation
        const elapsedSec = (performance.now() - preloaderStartTime) / 1000;
        let remainingSec = 0;
        if (combinedPct > 5 && combinedPct < 100) {
            const estimatedTotal = elapsedSec / (combinedPct / 100);
            remainingSec = Math.max(1, Math.min(5, Math.ceil(estimatedTotal - elapsedSec)));
        } else if (combinedPct <= 5) {
            remainingSec = 3;
        }

        if (combinedPct >= 100 && audioLoaded) {
            allAssetsReady = true;
            if (gateTimerSec) gateTimerSec.textContent = 'Ready ✨';
            if (gateStatusText) gateStatusText.textContent = `All ${totalVideos} videos, song & photos buffered in RAM 💛`;
            if (gatePromptText) gatePromptText.textContent = 'Tap the sunflower to enter 🌻';
            if (gateEnterBtn) gateEnterBtn.classList.add('is-ready');

            // If user clicked while loading, auto-unlock instantly
            if (userPendingUnlock && !gateUnlocked) {
                unlockGate();
            }
        } else {
            if (gateTimerSec) {
                gateTimerSec.textContent = `${remainingSec}s left`;
            }
            if (gateStatusText) {
                gateStatusText.textContent = userPendingUnlock 
                    ? `Buffering videos into RAM (${videosLoadedCount}/${totalVideos}) • ${remainingSec}s left...` 
                    : `Buffering 34 videos & song into RAM (${remainingSec}s left)...`;
            }
        }
    }

    // 1. Background Download of "Phillip Phillips - Gone, Gone, Gone.mp3" into RAM Blob
    const mp3Url = 'assets/music/Phillip%20Phillips%20-%20Gone%2C%20Gone%2C%20Gone.mp3';
    const audioXhr = new XMLHttpRequest();
    audioXhr.open('GET', mp3Url, true);
    audioXhr.responseType = 'blob';

    audioXhr.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
            audioPct = (e.loaded / e.total) * 100;
        } else {
            audioPct = Math.min(95, audioPct + 20);
        }
        updateCombinedProgress();
    };

    audioXhr.onload = () => {
        if (audioXhr.status === 200 || audioXhr.status === 0) {
            const audioBlob = audioXhr.response;
            const blobUrl = URL.createObjectURL(audioBlob);
            window.romanticAudio.setBlobSource(blobUrl);
            audioPct = 100;
            audioLoaded = true;
            updateCombinedProgress();
        }
    };

    audioXhr.onerror = () => {
        audioPct = 100;
        audioLoaded = true;
        updateCombinedProgress();
    };

    audioXhr.send();

    // 2. Background Preload of All Memory Thumbnails
    imagesToPreload.forEach(url => {
        const img = new Image();
        img.onload = () => {
            imagesLoadedCount++;
            updateCombinedProgress();
        };
        img.onerror = () => {
            imagesLoadedCount++;
            updateCombinedProgress();
        };
        img.src = url;
    });

    // 3. Concurrent Worker Pool: Download ALL 34 Videos into RAM Blobs (27.4 MB Total)
    async function preloadAllVideosInRAM() {
        const queue = [...allVideos];
        const concurrency = 6; // 6 concurrent HTTP/2 connections for max throughput

        async function worker() {
            while (queue.length > 0) {
                const item = queue.shift();
                if (!item) break;
                try {
                    const resp = await fetch(encodeURI(item.src));
                    if (resp.ok) {
                        const blob = await resp.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        videoBlobs.set(item.src, blobUrl);

                        // If video element is already mounted, attach blob directly
                        const el = videoElementsMap.get(item.src);
                        if (el) {
                            el.src = blobUrl;
                            el.load();
                        }
                    }
                } catch (e) {
                    // Fail gracefully - will stream normally if fetch fails
                }
                videosLoadedCount++;
                updateCombinedProgress();
            }
        }

        const workers = [];
        for (let i = 0; i < concurrency; i++) {
            workers.push(worker());
        }
        await Promise.all(workers);
    }

    preloadAllVideosInRAM();

    // Safety timeout: unlock gate if taking longer than 6 seconds so user is never blocked
    setTimeout(() => {
        if (!allAssetsReady) {
            allAssetsReady = true;
            audioLoaded = true;
            audioPct = 100;
            updateCombinedProgress();
        }
    }, 6000);

    // Tap Sunflower Handler
    function unlockGate() {
        if (gateUnlocked) return;
        gateUnlocked = true;

        // 1. Play song instantly from RAM Blob (0 latency!)
        window.romanticAudio.play();

        // 2. Play bloom chime sound FX
        window.romanticAudio.playBloomPop();

        // 3. Trigger sunflower petal burst confetti
        canvasEngine.triggerBirthdayConfetti();

        // 4. Animate gate unlock
        gateScreen.classList.add('unlocked');

        // 5. Hide gate after smooth transition
        setTimeout(() => {
            gateScreen.style.display = 'none';
        }, 850);
    }

    if (gateEnterBtn && gateScreen) {
        const handleGateClick = () => {
            if (allAssetsReady) {
                unlockGate();
            } else {
                // If not ready yet: wiggle button and show live remaining seconds!
                userPendingUnlock = true;
                gateEnterBtn.classList.remove('wiggle');
                void gateEnterBtn.offsetWidth; // Trigger reflow for CSS animation
                gateEnterBtn.classList.add('wiggle');

                if (gatePromptText) {
                    gatePromptText.textContent = 'Hold on cutie! Loading surprise... 🌻';
                }
                updateCombinedProgress();
            }
        };

        gateEnterBtn.addEventListener('click', handleGateClick);
        gateEnterBtn.addEventListener('touchstart', handleGateClick, { passive: true });
    }

    // Lightbox Elements
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxMedia = document.getElementById('lightbox-media');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxCounter = document.getElementById('lightbox-counter');
    let currentLightboxIdx = 0;

    // Letter Elements
    const letterModal = document.getElementById('letter-modal');
    const letterClose = document.getElementById('letter-close');
    const openLetterBtns = document.querySelectorAll('.btn-open-letter');

    const candleWrapper = document.querySelector('.candle-wrapper');
    const candleFlame = document.getElementById('candle-flame');
    const birthdayGameModal = document.getElementById('birthday-game-modal');
    const birthdayGameClose = document.getElementById('birthday-game-close');
    const birthdayGameBoard = document.getElementById('birthday-game-board');
    const birthdayGameLock = document.getElementById('birthday-game-lock');
    const birthdayGameGrid = document.getElementById('birthday-game-grid');
    const birthdayGameRound = document.getElementById('birthday-game-round');
    const birthdayGameChance = document.getElementById('birthday-game-chance');
    const birthdayGameInstruction = document.getElementById('birthday-game-instruction');
    const birthdayGameNote = document.getElementById('birthday-game-note');
    const birthdayGameTimer = document.getElementById('birthday-game-timer');
    const birthdayGameWaitText = document.getElementById('birthday-game-wait-text');
    const birthdayGameIntro = document.getElementById('birthday-game-intro');
    const birthdayGameIntroCount = document.getElementById('birthday-game-intro-count');
    const birthdayGameFlash = document.getElementById('birthday-game-flash');
    const birthdayGameWin = document.getElementById('birthday-game-win');

    // Audio State Sync
    window.onAudioStateChange = (playing) => {
        if (audioDisc) audioDisc.classList.add('spinning');
        if (audioBars) audioBars.classList.add('playing');
        if (audioLabel) audioLabel.textContent = 'Gone, Gone, Gone 🎵';
    };

    const audioPill = document.getElementById('audio-pill') || document.getElementById('audio-toggle');
    if (audioPill) {
        audioPill.addEventListener('click', () => {
            window.romanticAudio.play();
        });
    }

    // Attempt instant autoplay
    window.romanticAudio.play();

    // Auto-play song on first touch / scroll anywhere on screen
    const triggerAudioOnFirstTouch = () => {
        window.romanticAudio.play();
    };
    ['click', 'touchstart', 'touchend', 'scroll', 'pointerdown', 'keydown'].forEach(evt => {
        window.addEventListener(evt, triggerAudioOnFirstTouch, { passive: true });
    });

    // 1. Hero Cutout Tap -> Fullscreen Lightbox
    if (heroCenterpiece) {
        heroCenterpiece.addEventListener('click', () => {
            openLightbox(0);
        });
    }

    // 2. Render 35mm Filmstrip Reel (No Text Below!)
    if (filmstripTrack) {
        filmstripTrack.innerHTML = '';
        const frag = document.createDocumentFragment();

        filmstripItems.forEach((item, idx) => {
            const frame = document.createElement('div');
            frame.className = 'clean-film-frame';
            frame.innerHTML = `
                <div class="film-mark-text">
                    <span>DESIGNLAB 400</span>
                    <span>${String(idx + 1).padStart(2, '0')}A</span>
                </div>
                <div class="film-img-wrapper">
                    <img src="${item.thumb}" alt="35mm Frame" loading="lazy">
                </div>
            `;
            frame.addEventListener('click', () => {
                openLightbox(1 + idx);
            });
            frag.appendChild(frame);
        });

        filmstripTrack.appendChild(frag);
    }

    // 3. Render Starry Night Cards (No Text Below!)
    if (starryTrack) {
        starryTrack.innerHTML = '';
        const frag = document.createDocumentFragment();

        starryItems.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'clean-starry-card';
            card.innerHTML = `
                <img class="card-painterly-pin" src="assets/pinterest/sunflower_painterly_pin.webp" alt="pin">
                <img src="${item.thumb}" alt="Starry Photo" loading="lazy">
            `;
            card.addEventListener('click', () => {
                const globalIdx = 1 + filmstripItems.length + idx;
                openLightbox(globalIdx);
            });
            frag.appendChild(card);
        });

        starryTrack.appendChild(frag);
    }

    // 4. Render Candid Videos Reel (RAM Pre-Buffered, Auto-Playing, Zero-Lag Swiping!)
    if (videosTrack) {
        videosTrack.innerHTML = '';
        const frag = document.createDocumentFragment();
        const reelVideos = [];

        allVideos.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'clean-video-card';

            const video = document.createElement('video');
            const ramSrc = videoBlobs.get(item.src) || encodeURI(item.src);
            video.src = ramSrc;
            video.poster = item.thumb;
            video.loop = true;
            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.setAttribute('muted', '');
            video.setAttribute('loop', '');
            video.preload = 'auto'; // AUTO! Frames ready in memory!

            videoElementsMap.set(item.src, video);
            reelVideos.push(video);
            card.appendChild(video);

            // Tapping opens fullscreen lightbox
            card.addEventListener('click', () => {
                const globalIdx = 1 + filmstripItems.length + starryItems.length + idx;
                openLightbox(globalIdx);
            });
            frag.appendChild(card);
        });

        videosTrack.appendChild(frag);

        // Pre-Warming Virtualized Smooth Playback Observer:
        // rootMargin: '250px 600px 250px 600px' detects upcoming videos 600px BEFORE entering viewport!
        // The upcoming video starts playing in RAM before the card slides in, so left-to-right swiping is 100% INSTANT!
        if ('IntersectionObserver' in window) {
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const v = entry.target;
                    if (entry.isIntersecting) {
                        const p = v.play();
                        if (p !== undefined) p.catch(() => {});
                    } else {
                        v.pause();
                    }
                });
            }, { rootMargin: '250px 600px 250px 600px', threshold: 0.05 });

            reelVideos.forEach(v => videoObserver.observe(v));
        } else {
            reelVideos.forEach(v => v.play().catch(() => {}));
        }
    }

    // 5. Render Pinterest Mood Board (All Remaining Photos, No Text Below!)
    if (moodboardGrid) {
        moodboardGrid.innerHTML = '';
        const frag = document.createDocumentFragment();

        moodboardItems.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'clean-mosaic-card';

            const hasTape = (idx % 3 === 0);
            card.innerHTML = `
                ${hasTape ? '<div class="mosaic-tape"></div>' : ''}
                <img src="${item.thumb}" alt="Memory Photo" loading="lazy">
            `;

            card.addEventListener('click', () => {
                const globalIdx = 1 + filmstripItems.length + starryItems.length + allVideos.length + idx;
                openLightbox(globalIdx);
            });

            frag.appendChild(card);
        });

        moodboardGrid.appendChild(frag);
    }

    // 6. Lightbox
    function openLightbox(index) {
        currentLightboxIdx = index;
        updateLightboxView();
        lightboxModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightboxModal.classList.remove('is-open');
        lightboxMedia.innerHTML = '';
        document.body.style.overflow = '';
    }

    function updateLightboxView() {
        const item = masterItems[currentLightboxIdx];
        if (!item) return;

        lightboxCounter.textContent = `${currentLightboxIdx + 1} / ${masterItems.length}`;
        lightboxMedia.innerHTML = '';

        if (item.type === 'video') {
            const video = document.createElement('video');
            const blobUrl = videoBlobs.get(item.src);
            video.src = blobUrl || encodeURI(item.src);
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.setAttribute('webkit-playsinline', 'true');
            video.className = 'lightbox-video';
            lightboxMedia.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = encodeURI(item.src);
            img.className = 'lightbox-img';
            lightboxMedia.appendChild(img);
        }
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => {
        currentLightboxIdx = (currentLightboxIdx - 1 + masterItems.length) % masterItems.length;
        updateLightboxView();
    });
    lightboxNext.addEventListener('click', () => {
        currentLightboxIdx = (currentLightboxIdx + 1) % masterItems.length;
        updateLightboxView();
    });

    // Touch & Keyboard Navigation
    window.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxPrev.click();
        if (e.key === 'ArrowRight') lightboxNext.click();
    });

    let touchStartX = 0;
    lightboxModal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxModal.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) lightboxPrev.click();
            else lightboxNext.click();
        }
    }, { passive: true });

    // 7. Love Letter Modal
    openLetterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            letterModal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            window.romanticAudio.playWaxSealCrack();
        });
    });

    letterClose.addEventListener('click', () => {
        letterModal.classList.remove('is-open');
        document.body.style.overflow = '';
    });

    // 8. Birthday Letter Game
    const birthdayGameStorageKey = 'sunflower24BirthdayGame_v1';
    const birthdayGameBoxCount = 24;
    const birthdayGameFirstWaitMs = 60 * 1000;
    let birthdayGameCountdown = null;
    let birthdayGameIntroTimer = null;
    let birthdayGameBusy = true;
    let birthdayGameState = null;

    function randomGameBox(excluded) {
        const available = Array.from({ length: birthdayGameBoxCount }, (_, id) => id)
            .filter(id => !excluded.includes(id));
        return available[Math.floor(Math.random() * available.length)];
    }

    function loadBirthdayGameState() {
        try {
            const saved = JSON.parse(localStorage.getItem(birthdayGameStorageKey));
            if (saved && Array.isArray(saved.crossed)) {
                return {
                    round: Math.max(1, Number(saved.round) || 1),
                    lockedUntil: Number(saved.lockedUntil) || 0,
                    crossed: [...new Set(saved.crossed)].filter(id => id >= 0 && id < birthdayGameBoxCount),
                    targetId: Number.isInteger(saved.targetId) ? saved.targetId : 0,
                    introSeen: saved.introSeen === true,
                    candleActivated: saved.candleActivated === true,
                    memoryMode: saved.memoryMode === true,
                    won: saved.won === true
                };
            }
        } catch (error) {
            console.warn('Birthday game state could not be loaded.', error);
        }

        return {
            round: 1,
            lockedUntil: 0,
            crossed: [],
            targetId: Math.floor(Math.random() * birthdayGameBoxCount),
            introSeen: false,
            candleActivated: false,
            memoryMode: false,
            won: false
        };
    }

    function saveBirthdayGameState() {
        try {
            localStorage.setItem(birthdayGameStorageKey, JSON.stringify(birthdayGameState));
        } catch (error) {
            console.warn('Birthday game state could not be saved.', error);
        }
    }

    function shuffleBirthdayGameBoxes() {
        const boxes = Array.from({ length: birthdayGameBoxCount }, (_, id) => id);
        for (let index = boxes.length - 1; index > 0; index--) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [boxes[index], boxes[swapIndex]] = [boxes[swapIndex], boxes[index]];
        }
        return boxes;
    }

    function setBirthdayGameView(view) {
        birthdayGameBoard.classList.toggle('hidden', view !== 'board');
        birthdayGameLock.classList.toggle('hidden', view !== 'lock');
    }

    function buildBirthdayGameRound() {
        birthdayGameGrid.innerHTML = '';
        birthdayGameRound.textContent = `ROUND ${birthdayGameState.round}`;
        birthdayGameChance.textContent = 'CHANCE LEFT: 1';
        birthdayGameInstruction.textContent = 'Pick carefully, my little sunflower.';
        birthdayGameNote.textContent = birthdayGameState.crossed.length
            ? `${birthdayGameState.crossed.length} box${birthdayGameState.crossed.length === 1 ? '' : 'es'} already crossed out.`
            : '';

        shuffleBirthdayGameBoxes().forEach((boxId, slot) => {
            const box = document.createElement('button');
            const crossed = birthdayGameState.crossed.includes(boxId);
            box.type = 'button';
            box.className = `birthday-game-box${crossed ? ' crossed' : ''}`;
            box.textContent = crossed ? '❌' : '🎁';
            box.disabled = birthdayGameBusy || crossed;
            box.setAttribute('aria-label', crossed ? 'Already tried, crossed out' : `Mystery box ${slot + 1}`);
            box.addEventListener('click', () => pickBirthdayGameBox(box, boxId));
            birthdayGameGrid.appendChild(box);
        });
    }

    function enableBirthdayGameBoxes() {
        birthdayGameBusy = false;
        birthdayGameGrid.querySelectorAll('.birthday-game-box').forEach(box => {
            if (!box.classList.contains('crossed')) box.disabled = false;
        });
    }

    function showBirthdayGameIntro() {
        birthdayGameBusy = true;
        birthdayGameIntro.classList.remove('hidden', 'fade');
        let count = 3;
        birthdayGameIntroCount.textContent = `GET READY · ${count}`;
        clearInterval(birthdayGameIntroTimer);
        birthdayGameIntroTimer = setInterval(() => {
            count -= 1;
            if (count > 0) {
                birthdayGameIntroCount.textContent = `GET READY · ${count}`;
                return;
            }
            clearInterval(birthdayGameIntroTimer);
            birthdayGameIntro.classList.add('fade');
            setTimeout(() => {
                birthdayGameIntro.classList.add('hidden');
                enableBirthdayGameBoxes();
            }, 260);
        }, 1000);
    }

    function openBirthdayGame() {
        birthdayGameState = birthdayGameState || loadBirthdayGameState();
        birthdayGameModal.classList.add('is-open');
        birthdayGameModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        if (birthdayGameState.won) {
            showBirthdayGameWin();
            return;
        }

        if (birthdayGameState.lockedUntil > Date.now()) {
            setBirthdayGameView('lock');
            updateBirthdayGameTimer();
            clearInterval(birthdayGameCountdown);
            birthdayGameCountdown = setInterval(updateBirthdayGameTimer, 1000);
            return;
        }

        if (birthdayGameState.lockedUntil) {
            birthdayGameState.lockedUntil = 0;
            birthdayGameState.round += 1;
            birthdayGameState.targetId = randomGameBox(birthdayGameState.crossed);
            saveBirthdayGameState();
        }

        setBirthdayGameView('board');
        buildBirthdayGameRound();
        if (birthdayGameState.introSeen) {
            enableBirthdayGameBoxes();
        } else {
            birthdayGameState.introSeen = true;
            saveBirthdayGameState();
            showBirthdayGameIntro();
        }
    }

    function closeBirthdayGame(returnToMemories = true) {
        clearInterval(birthdayGameCountdown);
        clearInterval(birthdayGameIntroTimer);
        birthdayGameModal.classList.remove('is-open');
        birthdayGameModal.setAttribute('aria-hidden', 'true');
        birthdayGameIntro.classList.add('hidden');
        birthdayGameWin.classList.add('hidden');
        document.body.style.overflow = '';

        if (returnToMemories && birthdayGameState.candleActivated) {
            birthdayGameState.memoryMode = true;
            saveBirthdayGameState();
        }
    }

    function flashBirthdayGameRed() {
        birthdayGameFlash.classList.remove('flash');
        void birthdayGameFlash.offsetWidth;
        birthdayGameFlash.classList.add('flash');
    }

    function pickBirthdayGameBox(box, boxId) {
        if (birthdayGameBusy || box.disabled || birthdayGameState.crossed.includes(boxId)) return;
        birthdayGameBusy = true;
        birthdayGameGrid.querySelectorAll('.birthday-game-box').forEach(item => {
            item.disabled = true;
        });

        if (boxId === birthdayGameState.targetId) {
            box.textContent = '💌';
            birthdayGameState.won = true;
            saveBirthdayGameState();
            showBirthdayGameWin();
            return;
        }

        flashBirthdayGameRed();
        birthdayGameState.crossed.push(boxId);
        birthdayGameState.lockedUntil = Date.now() + birthdayGameFirstWaitMs * (2 ** (birthdayGameState.round - 1));
        saveBirthdayGameState();
        box.classList.add('crossed');
        box.textContent = '❌';
        birthdayGameChance.textContent = 'CHANCES LEFT: 0';
        birthdayGameNote.textContent = 'Ayyo, mwahhh Ammulu, all the best for next round, try better!';
        birthdayGameWaitText.textContent = `Next round in ${birthdayGameFirstWaitMs * (2 ** (birthdayGameState.round - 1)) / 60000} minute${birthdayGameState.round === 1 ? '' : 's'}.`;

        setTimeout(() => {
            setBirthdayGameView('lock');
            updateBirthdayGameTimer();
            clearInterval(birthdayGameCountdown);
            birthdayGameCountdown = setInterval(updateBirthdayGameTimer, 1000);
        }, 520);
    }

    function updateBirthdayGameTimer() {
        const remaining = Math.max(0, birthdayGameState.lockedUntil - Date.now());
        if (remaining === 0) {
            clearInterval(birthdayGameCountdown);
            birthdayGameState.lockedUntil = 0;
            birthdayGameState.round += 1;
            birthdayGameState.targetId = randomGameBox(birthdayGameState.crossed);
            saveBirthdayGameState();
            setBirthdayGameView('board');
            buildBirthdayGameRound();
            enableBirthdayGameBoxes();
            return;
        }

        const totalSeconds = Math.ceil(remaining / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        birthdayGameTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        birthdayGameWaitText.textContent = 'Your next try will be ready soon. 💛';
    }

    function showBirthdayGameWin() {
        birthdayGameBusy = true;
        birthdayGameGrid.querySelectorAll('.birthday-game-box').forEach(box => {
            box.disabled = true;
        });
        birthdayGameWin.classList.remove('hidden');
        birthdayGameWin.setAttribute('aria-hidden', 'false');

        for (let index = 0; index < 34; index += 1) {
            const sunflower = document.createElement('div');
            sunflower.className = 'birthday-game-falling-sun';
            sunflower.textContent = ['🌻', '🌼', '💛'][Math.floor(Math.random() * 3)];
            sunflower.style.left = `${Math.random() * 100}vw`;
            sunflower.style.animationDuration = `${3 + Math.random() * 3}s`;
            sunflower.style.animationDelay = `${Math.random() * 0.8}s`;
            birthdayGameWin.appendChild(sunflower);
        }

        setTimeout(() => {
            birthdayGameWin.classList.add('hidden');
            birthdayGameWin.setAttribute('aria-hidden', 'true');
            closeBirthdayGame(false);
            letterModal.classList.add('is-open');
            letterModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            window.romanticAudio.playWaxSealCrack();
        }, 2600);
    }

    birthdayGameState = loadBirthdayGameState();

    if (birthdayGameState.candleActivated && !birthdayGameState.memoryMode && gateScreen) {
        gateUnlocked = true;
        gateScreen.classList.add('unlocked');
        gateScreen.style.display = 'none';
        setTimeout(openBirthdayGame, 0);
    }

    if (candleFlame && candleWrapper) {
        candleFlame.addEventListener('click', () => {
            birthdayGameState.candleActivated = true;
            birthdayGameState.memoryMode = false;
            saveBirthdayGameState();
            openBirthdayGame();
        });
    }

    if (birthdayGameClose) birthdayGameClose.addEventListener('click', closeBirthdayGame);

    window.addEventListener('keydown', event => {
        if (event.key === 'Escape' && birthdayGameModal.classList.contains('is-open')) {
            closeBirthdayGame();
        }
    });
});
