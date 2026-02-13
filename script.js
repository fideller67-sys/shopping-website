// ===== Valentine Website JavaScript =====

// DOM Elements
const heartsContainer = document.getElementById('heartsContainer');
const cursorHearts = document.getElementById('cursorHearts');
const introScreen = document.getElementById('introScreen');
const mainContent = document.getElementById('mainContent');
const enterBtn = document.getElementById('enterBtn');
const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');

// New elements for Yes/No flow
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const giftModal = document.getElementById('giftModal');
const moneyOption = document.getElementById('moneyOption');
const messageOption = document.getElementById('messageOption');
const surpriseModal = document.getElementById('surpriseModal');
const modalClose = document.getElementById('modalClose');
const confettiContainer = document.getElementById('confettiContainer');

// Heart emojis for particles
const heartEmojis = ['❤️', '💕', '💖', '💗', '💓', '💝', '💘', '🌹', '✨'];
const confettiColors = ['#ff2d55', '#ff6b9d', '#a855f7', '#ff8a80', '#fce7f3', '#c084fc'];

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    createFloatingHearts();
    setupEventListeners();
    setupIntersectionObserver();
    setupParallax();
    setupRunawayButtons();
});

// ===== Scroll Lock Manager =====
let activeModalsCount = 0;
function toggleScrollLock(lock) {
    if (lock) {
        activeModalsCount++;
        document.body.style.overflow = 'hidden';
    } else {
        activeModalsCount = Math.max(0, activeModalsCount - 1);
        if (activeModalsCount === 0) {
            document.body.style.overflow = '';
        }
    }
}

// ===== Floating Hearts Background =====
function createFloatingHearts() {
    // Create initial hearts
    for (let i = 0; i < 20; i++) {
        setTimeout(() => createHeart(), i * 400);
    }

    // Continuously create hearts
    setInterval(createHeart, 800);
}

function createHeart() {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];

    // Random starting position
    heart.style.left = Math.random() * 100 + '%';
    heart.style.animationDuration = (Math.random() * 5 + 6) + 's';
    heart.style.animationDelay = Math.random() * 2 + 's';
    heart.style.fontSize = (Math.random() * 1.5 + 0.8) + 'rem';

    heartsContainer.appendChild(heart);

    // Remove heart after animation
    setTimeout(() => {
        if (heart.parentNode) {
            heart.remove();
        }
    }, 12000);
}

// ===== Cursor Heart Particles =====
let lastMouseMove = 0;

function createCursorHeart(x, y) {
    const now = Date.now();
    if (now - lastMouseMove < 50) return; // Throttle
    lastMouseMove = now;

    const heart = document.createElement('span');
    heart.className = 'cursor-heart';
    heart.textContent = heartEmojis[Math.floor(Math.random() * 5)];

    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;

    cursorHearts.appendChild(heart);

    setTimeout(() => {
        if (heart.parentNode) {
            heart.remove();
        }
    }, 1500);
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Enter button click
    enterBtn.addEventListener('click', handleEnter);

    // Music control
    musicBtn.addEventListener('click', toggleMusic);

    // Yes button - opens gift modal
    yesBtn.addEventListener('click', () => {
        triggerConfetti();
        // Create heart explosion from Yes button
        createHeartExplosion(yesBtn);
        setTimeout(() => {
            openGiftModal();
        }, 300); // reduced delay for faster response
    });

    // Message option - opens love letter
    messageOption.addEventListener('click', () => {
        closeGiftModal();
        triggerConfetti();
        setTimeout(() => {
            openSurpriseModal();
        }, 300);
    });

    // Modal close
    modalClose.addEventListener('click', closeSurpriseModal);
    surpriseModal.querySelector('.modal-overlay').addEventListener('click', closeSurpriseModal);

    // Cursor hearts
    document.addEventListener('mousemove', (e) => {
        createCursorHeart(e.clientX, e.clientY);
    });

    // Keyboard accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (surpriseModal.classList.contains('active')) {
                closeSurpriseModal();
            }
            if (giftModal.classList.contains('active')) {
                closeGiftModal();
            }
        }
    });

    // Touch support for mobile
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        createCursorHeart(touch.clientX, touch.clientY);
    }, { passive: true });
}

// ===== Runaway Buttons =====
function setupRunawayButtons() {
    // No button runs away from cursor
    setupRunawayElement(noBtn, 120);

    // Money option runs away from cursor
    setupRunawayElement(moneyOption, 120);
}

function setupRunawayElement(element, escapeDistance) {
    if (!element) return;

    let isRunning = false;

    // Store initial position to limit movement range
    let startX = 0;
    let startY = 0;
    let initialized = false;

    // Initialize position relative to parent
    const initPosition = () => {
        if (initialized) return;
        startX = element.offsetLeft;
        startY = element.offsetTop;
        initialized = true;
    };

    const handleMove = (x, y) => {
        if (!initialized) initPosition();
        if (isRunning) return;

        const rect = element.getBoundingClientRect();
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;

        const distanceX = x - elementCenterX;
        const distanceY = y - elementCenterY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // If cursor is close, run away!
        if (distance < escapeDistance) {
            isRunning = true;

            // Calculate escape direction (opposite of cursor)
            const angle = Math.atan2(distanceY, distanceX);
            const moveDistance = 50; // Increased jump distance

            // Move away
            let moveX = Math.cos(angle + Math.PI) * moveDistance;
            let moveY = Math.sin(angle + Math.PI) * moveDistance;

            // Add MORE randomness
            moveX += (Math.random() - 0.5) * 150; // Increased randomness
            moveY += (Math.random() - 0.5) * 150;

            // Current relative position
            let currentX = parseFloat(element.style.left) || 0;
            let currentY = parseFloat(element.style.top) || 0;

            // New position calculation
            let newX = currentX + moveX;
            let newY = currentY + moveY;

            // Constrain to slightly larger area (radius 200px from start)
            const distFromStart = Math.sqrt(newX * newX + newY * newY);
            if (distFromStart > 200) {
                // If too far, bounce back towards center with some randomness
                newX = newX * -0.6 + (Math.random() - 0.5) * 50;
                newY = newY * -0.6 + (Math.random() - 0.5) * 50;
            }

            // Apply new position
            element.style.position = 'relative';
            element.style.transition = 'all 0.2s ease-out'; // Slightly slower for "not that fast" feel
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';

            // Reset running flag
            setTimeout(() => {
                isRunning = false;
            }, 150);
        }
    };

    document.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));

    // Touch support
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    }, { passive: true });

    // Extra safety: run on hover/mouseenter
    element.addEventListener('mouseenter', (e) => {
        handleMove(e.clientX, e.clientY);
    });
}

// ===== Heart Explosion Effect =====
function createHeartExplosion(sourceElement) {
    const rect = sourceElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const heart = document.createElement('span');
            heart.className = 'floating-heart';
            heart.textContent = heartEmojis[Math.floor(Math.random() * 5)];
            heart.style.position = 'fixed';
            heart.style.left = centerX + 'px';
            heart.style.top = centerY + 'px';
            heart.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
            heart.style.opacity = '1';
            heart.style.zIndex = '9999';
            heart.style.pointerEvents = 'none';
            heart.style.animation = 'none';
            heart.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

            document.body.appendChild(heart);

            const angle = (i / 20) * 360;
            const distance = 80 + Math.random() * 80;
            const x = Math.cos(angle * Math.PI / 180) * distance;
            const y = Math.sin(angle * Math.PI / 180) * distance;

            requestAnimationFrame(() => {
                heart.style.transform = `translate(${x}px, ${y}px) scale(0)`;
                heart.style.opacity = '0';
            });

            setTimeout(() => heart.remove(), 800);
        }, i * 30);
    }
}

// ===== Enter Transition =====
function handleEnter() {
    // Add ripple effect
    const ripple = enterBtn.querySelector('.btn-ripple');
    if (ripple) {
        ripple.style.transform = 'scale(20)';
        ripple.style.opacity = '0';
    }

    // Create burst of hearts
    createHeartExplosion(enterBtn);

    // Hide intro screen
    setTimeout(() => {
        introScreen.classList.add('hidden');
        mainContent.classList.add('visible');

        // Try to play music
        playMusic();

        // Animate first section
        setTimeout(() => {
            const firstCard = document.querySelector('.glass-card');
            if (firstCard) {
                firstCard.classList.add('visible');
            }
        }, 500);
    }, 500);
}

// ===== Music Control =====
let isMusicPlaying = false;

function toggleMusic() {
    if (isMusicPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function playMusic() {
    bgMusic.volume = 0.3;
    const playPromise = bgMusic.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            isMusicPlaying = true;
            musicBtn.classList.add('playing');
            musicBtn.setAttribute('aria-label', 'Pause Music');
        }).catch((error) => {
            console.log('Music autoplay prevented:', error);
            // Music will need user interaction to play
        });
    }
}

function pauseMusic() {
    bgMusic.pause();
    isMusicPlaying = false;
    musicBtn.classList.remove('playing');
    musicBtn.setAttribute('aria-label', 'Play Music');
}

// ===== Intersection Observer for Animations =====
function setupIntersectionObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate glass cards
                const card = entry.target.querySelector('.glass-card');
                if (card) {
                    card.classList.add('visible');
                }

                // Animate love items with stagger
                const loveItems = entry.target.querySelectorAll('.love-item');
                loveItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, index * 150);
                });

                // Trigger confetti in final section
                if (entry.target.id === 'finalSection') {
                    triggerConfetti();
                }
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('.timeline-section, .final-section').forEach(section => {
        observer.observe(section);
    });
}

// ===== Parallax Effect =====
function setupParallax() {
    window.addEventListener('scroll', () => {
        requestAnimationFrame(handleParallax);
    }, { passive: true });
}

function handleParallax() {
    const scrolled = window.pageYOffset;
    const sections = document.querySelectorAll('[data-parallax]');

    sections.forEach(section => {
        const speed = parseFloat(section.dataset.parallax) || 0.5;
        const rect = section.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;

        if (inView) {
            const yPos = (rect.top * speed * 0.5);
            const bg = section.querySelector('.section-bg');
            if (bg) {
                bg.style.transform = `translateY(${yPos}px)`;
            }

            // Floating elements parallax
            const floatElements = section.querySelectorAll('.float-element');
            floatElements.forEach((el, i) => {
                const depth = (i + 1) * 0.3;
                el.style.transform = `translateY(${yPos * depth}px)`;
            });
        }
    });
}

// ===== Gift Modal =====
function openGiftModal() {
    giftModal.classList.add('active');
    toggleScrollLock(true);

    // Reset money option position
    if (moneyOption) {
        moneyOption.style.left = '0';
        moneyOption.style.top = '0';
    }
}

function closeGiftModal() {
    giftModal.classList.remove('active');
    toggleScrollLock(false);
}

// ===== Surprise Modal (Love Letter) =====
function openSurpriseModal() {
    surpriseModal.classList.add('active');
    toggleScrollLock(true);

    // Create celebration confetti
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createConfettiPiece(confettiContainer), i * 30);
    }
}

function closeSurpriseModal() {
    surpriseModal.classList.remove('active');
    toggleScrollLock(false);
}

// ===== Confetti =====
function triggerConfetti() {
    for (let i = 0; i < 30; i++) {
        setTimeout(() => createConfettiPiece(confettiContainer), i * 50);
    }
}

function createConfettiPiece(container) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    const isHeart = Math.random() > 0.5;
    if (isHeart) {
        confetti.textContent = heartEmojis[Math.floor(Math.random() * 5)];
        confetti.style.fontSize = (Math.random() * 1 + 0.8) + 'rem';
        confetti.style.background = 'none';
    } else {
        confetti.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.width = (Math.random() * 10 + 5) + 'px';
        confetti.style.height = (Math.random() * 10 + 5) + 'px';
    }

    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
    confetti.style.animationDelay = Math.random() * 0.5 + 's';

    container.appendChild(confetti);

    setTimeout(() => {
        if (confetti.parentNode) {
            confetti.remove();
        }
    }, 5000);
}

// ===== Smooth Scroll for Enhanced UX =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Easter Egg: Konami Code =====
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join('') === konamiPattern.join('')) {
        activateEasterEgg();
    }
});

function activateEasterEgg() {
    // Super heart explosion!
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const heart = document.createElement('span');
            heart.className = 'floating-heart';
            heart.textContent = '❤️';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.top = Math.random() * 100 + '%';
            heart.style.fontSize = (Math.random() * 3 + 1) + 'rem';
            heart.style.position = 'fixed';
            heart.style.zIndex = '9999';
            heart.style.animation = 'heartBeat 0.5s ease-in-out infinite';
            heart.style.opacity = '1';

            document.body.appendChild(heart);

            setTimeout(() => heart.remove(), 3000);
        }, i * 30);
    }
}

// ===== Performance: Reduce animations when tab is not visible =====
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.querySelectorAll('.floating-heart').forEach(heart => {
            heart.style.animationPlayState = 'paused';
        });
    } else {
        document.querySelectorAll('.floating-heart').forEach(heart => {
            heart.style.animationPlayState = 'running';
        });
    }
});

// ===== Memories Carousel =====
(function () {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const carousel = document.getElementById('memoriesCarousel');

    if (!slides.length || !carousel) return;

    let currentIndex = 0;
    let autoSlideInterval = null;
    const SLIDE_INTERVAL = 5000; // 5 seconds

    function goToSlide(index) {
        // Wrap around
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        // Update slides
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');

        // Update dots
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[index]) dots[index].classList.add('active');

        currentIndex = index;
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, SLIDE_INTERVAL);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }

    // Arrow buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoSlide();
        });
    }

    // Dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.dataset.slide, 10);
            goToSlide(slideIndex);
            resetAutoSlide();
        });
    });

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoSlide);
    carousel.addEventListener('mouseleave', startAutoSlide);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Only respond when carousel is in viewport
        const rect = carousel.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) return;

        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoSlide();
        }
    });

    // Touch / Swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        startAutoSlide();
    }, { passive: true });

    // Start auto-slide
    startAutoSlide();
})();

// ===== Video Surprise Modal =====
(function () {
    const videoSurpriseBtn = document.getElementById('videoSurpriseBtn');
    const videoModal = document.getElementById('videoModal');
    const videoModalClose = document.getElementById('videoModalClose');
    const videoModalOverlay = document.getElementById('videoModalOverlay');
    const surpriseVideo = document.getElementById('surpriseVideo');

    if (!videoSurpriseBtn || !videoModal) return;

    function openVideoModal() {
        videoModal.classList.add('active');
        toggleScrollLock(true);
        if (surpriseVideo) {
            surpriseVideo.play().catch(() => { });
        }
    }

    function closeVideoModal() {
        videoModal.classList.remove('active');
        toggleScrollLock(false);
        if (surpriseVideo) {
            surpriseVideo.pause();
        }
    }

    videoSurpriseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openVideoModal();
    });

    videoModalClose.addEventListener('click', closeVideoModal);
    videoModalOverlay.addEventListener('click', closeVideoModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });
})();

// ===== Console Love Message =====
console.log('%c💕 Made with love 💕', 'color: #ff2d55; font-size: 24px; font-weight: bold;');
console.log('%cHappy Valentine\'s Day!', 'color: #a855f7; font-size: 16px;');
