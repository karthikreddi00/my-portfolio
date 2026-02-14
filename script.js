/* ============================================
   SCRIPT.JS — Modern Portfolio Interactions
   ============================================ */

// ==========================================
// 1. THEME TOGGLE
// ==========================================
(function initTheme() {
    const saved = localStorage.getItem('portfolio-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'dark'); // default dark
    document.documentElement.setAttribute('data-theme', theme);
    updateIcon(theme);
})();

function updateIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
    updateIcon(next);
});

// ==========================================
// 2. MOBILE HAMBURGER MENU
// ==========================================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
});

// Close menu when a nav link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('open');
        document.body.style.overflow = '';
    });
});

// ==========================================
// 3. NAVBAR — Scroll Effects & Active Link
// ==========================================
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function handleNavScroll() {
    const scrollY = window.scrollY;

    // Add scrolled class
    if (scrollY > 60) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }

    // Active link highlight
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 120;
        const height = section.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', handleNavScroll, { passive: true });

// ==========================================
// 4. SCROLL-TO-TOP FLOATING BUTTON
// ==========================================
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn?.classList.add('visible');
    } else {
        scrollTopBtn?.classList.remove('visible');
    }
}, { passive: true });

scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ==========================================
// 5. SCROLL REVEAL (IntersectionObserver)
// ==========================================
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

// ==========================================
// 6. TYPING ANIMATION
// ==========================================
function initTypingAnimation() {
    const el = document.getElementById('typingText');
    if (!el) return;

    const roles = [
        'B.Tech CSE Student',
        'Programming Enthusiast',
        'Cybersecurity Aspirant',
        'Competitive Programmer',
        'Open-Source Contributor'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let pauseEnd = 0;

    function tick() {
        const now = Date.now();
        if (now < pauseEnd) {
            requestAnimationFrame(tick);
            return;
        }

        const currentRole = roles[roleIndex];

        if (!isDeleting) {
            charIndex++;
            el.textContent = currentRole.substring(0, charIndex);

            if (charIndex === currentRole.length) {
                isDeleting = true;
                pauseEnd = now + 2000; // pause at full text
            }
        } else {
            charIndex--;
            el.textContent = currentRole.substring(0, charIndex);

            if (charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
            }
        }

        const speed = isDeleting ? 40 : 80;
        setTimeout(() => requestAnimationFrame(tick), speed);
    }

    // Start after a short delay
    setTimeout(tick, 800);
}

// ==========================================
// 7. COUNTER ANIMATION
// ==========================================
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1500;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * ease);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

// ==========================================
// 8. HERO CANVAS — Particle Network
// ==========================================
function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;
    let w, h;

    function resize() {
        const section = canvas.parentElement;
        w = canvas.width = section.offsetWidth;
        h = canvas.height = section.offsetHeight;
    }

    function createParticles() {
        const count = Math.min(Math.floor((w * h) / 18000), 80);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.4 + 0.1
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const lineColor = isDark ? '0, 212, 255' : '0, 150, 200';
        const dotColor = isDark ? '0, 212, 255' : '0, 120, 180';

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${dotColor}, ${p.alpha})`;
            ctx.fill();

            // Connect nearby particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(${lineColor}, ${0.08 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        animId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            createParticles();
        }, 200);
    });
}

// ==========================================
// 9. CURSOR GLOW FOLLOWER
// ==========================================
function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow || window.innerWidth < 768) return;

    let mx = 0, my = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
    }, { passive: true });

    function animate() {
        cx += (mx - cx) * 0.12;
        cy += (my - cy) * 0.12;
        glow.style.left = cx + 'px';
        glow.style.top = cy + 'px';
        requestAnimationFrame(animate);
    }

    animate();
}

// ==========================================
// 10. CONTACT FORM HANDLER
// ==========================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('.btn-primary');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
        btn.style.pointerEvents = 'none';

        const formData = new FormData(form);
        formData.append('access_key', ''); // placeholder — see below

        try {
            const res = await fetch('https://formsubmit.co/ajax/kartheekreddy2605@gmail.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    name: form.querySelector('#name').value,
                    email: form.querySelector('#email').value,
                    message: form.querySelector('#message').value,
                    _subject: 'New Portfolio Contact Message'
                })
            });

            if (res.ok) {
                btn.innerHTML = '<i class="fas fa-check"></i> <span>Message Sent!</span>';
                form.reset();
            } else {
                btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Failed — try email</span>';
            }
        } catch {
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Failed — try email</span>';
        }

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.pointerEvents = '';
        }, 3000);
    });
}

// ==========================================
// 11. LENIS SMOOTH SCROLL
// ==========================================
let lenis;

function initLenis() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
        smoothWheel: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Nav anchor clicks use Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                lenis.scrollTo(target, { offset: 0 });
            }
        });
    });
}

// ==========================================
// 12. GLOBAL FLOATING PARTICLES
// ==========================================
function initGlobalParticles() {
    const canvas = document.getElementById('globalParticles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let dots = [];
    let w, h;
    let time = 0;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function createDots() {
        const count = Math.min(Math.floor((w * h) / 12000), 90);
        dots = [];
        for (let i = 0; i < count; i++) {
            dots.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 2.5 + 0.8,
                baseAlpha: Math.random() * 0.5 + 0.15,
                phase: Math.random() * Math.PI * 2,
                hue: [190, 210, 260, 280, 160][Math.floor(Math.random() * 5)]
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        time += 0.008;

        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const globalAlpha = isDark ? 1 : 0.85;

        for (let i = 0; i < dots.length; i++) {
            const d = dots[i];
            d.x += d.vx;
            d.y += d.vy;

            if (d.x < -10) d.x = w + 10;
            if (d.x > w + 10) d.x = -10;
            if (d.y < -10) d.y = h + 10;
            if (d.y > h + 10) d.y = -10;

            // Pulsing shimmer
            const pulse = 0.5 + 0.5 * Math.sin(time * 2 + d.phase);
            const alpha = d.baseAlpha * (0.6 + 0.4 * pulse) * globalAlpha;

            // Glow layer
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r * 3, 0, Math.PI * 2);
            const glowHue = isDark ? d.hue : 210;
            ctx.fillStyle = `hsla(${glowHue}, 100%, ${isDark ? 65 : 55}%, ${alpha * 0.12})`;
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${glowHue}, 100%, ${isDark ? 75 : 50}%, ${alpha})`;
            ctx.fill();

            // Connect nearby particles with faint lines
            for (let j = i + 1; j < dots.length; j++) {
                const d2 = dots[j];
                const dx = d.x - d2.x;
                const dy = d.y - d2.y;
                const dist = dx * dx + dy * dy;
                if (dist < 22000) { // ~148px
                    const lineAlpha = (1 - dist / 22000) * 0.08 * globalAlpha;
                    ctx.beginPath();
                    ctx.moveTo(d.x, d.y);
                    ctx.lineTo(d2.x, d2.y);
                    ctx.strokeStyle = `hsla(${glowHue}, 80%, ${isDark ? 65 : 50}%, ${lineAlpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    resize();
    createDots();
    draw();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            createDots();
        }, 200);
    });
}

// ==========================================
// INITIALISE EVERYTHING
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initScrollReveal();
    initTypingAnimation();
    initCounterAnimation();
    initHeroCanvas();
    initCursorGlow();
    initContactForm();
    initGlobalParticles();
    handleNavScroll(); // set initial state
});
