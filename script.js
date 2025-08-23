// Theme Toggle Functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Add transition effect
        document.body.style.transition = 'all 0.3s ease';
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
    
    // Update navbar background based on new theme
    updateNavbarBackground(theme);
}

function updateNavbarBackground(theme) {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        if (theme === 'dark') {
            navbar.style.background = 'rgba(15, 23, 42, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        }
    } else {
        if (theme === 'dark') {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    }
}

// Enhanced Skills Animation
function initSkillsAnimation() {
    const skillItems = document.querySelectorAll('.skill-item[data-skill]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillItem = entry.target;
                const progressBar = skillItem.querySelector('.skill-progress-bar');
                const level = skillItem.getAttribute('data-level');
                
                if (progressBar) {
                    setTimeout(() => {
                        progressBar.style.width = level + '%';
                    }, 200);
                }
                
                observer.unobserve(skillItem);
            }
        });
    }, { threshold: 0.5 });
    
    skillItems.forEach(item => observer.observe(item));
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
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

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (window.scrollY > 100) {
        if (currentTheme === 'dark') {
            navbar.style.background = 'rgba(15, 23, 42, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        }
        navbar.style.boxShadow = '0 2px 20px var(--shadow-color)';
    } else {
        if (currentTheme === 'dark') {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
        navbar.style.boxShadow = 'none';
    }
});

// Floating Action Button functionality
const floatingBtn = document.querySelector('.floating-action-btn');
if (floatingBtn) {
    floatingBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Show/hide floating button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            floatingBtn.style.opacity = '1';
            floatingBtn.style.transform = 'translateY(0)';
        } else {
            floatingBtn.style.opacity = '0';
            floatingBtn.style.transform = 'translateY(100px)';
        }
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            
            // Trigger specific animations for different elements
            if (entry.target.classList.contains('skill-item')) {
                animateSkillProgress(entry.target);
            }
            
            if (entry.target.classList.contains('project-card')) {
                entry.target.style.animationDelay = `${Math.random() * 0.3}s`;
            }
        }
    });
}, observerOptions);

// Observe all sections and interactive elements for animation
document.querySelectorAll('section, .skill-item, .project-card').forEach(element => {
    observer.observe(element);
});

// Animate skill progress bars
function animateSkillProgress(skillItem) {
    const progressBar = skillItem.querySelector('.progress-bar');
    if (progressBar) {
        const percentage = progressBar.getAttribute('data-percentage');
        progressBar.style.width = percentage + '%';
    }
}

// Enhanced Counter Animation for About Stats
function animateAboutCounters() {
    const counters = document.querySelectorAll('.about-stats .stat-progress-fill');
    
    counters.forEach(counter => {
        const circle = counter.closest('.stat-circle');
        const numberElement = circle.querySelector('.stat-number');
        const target = parseInt(numberElement.textContent);
        
        // Animate the SVG progress
        counter.style.strokeDashoffset = '0';
        
        // Animate the number
        let current = 0;
        const increment = target / 50;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                numberElement.textContent = Math.ceil(current) + '+';
                setTimeout(updateCounter, 30);
            } else {
                numberElement.textContent = target + '+';
            }
        };
        
        updateCounter();
    });
}

// Trigger about counter animation when about section is visible
const aboutSection = document.querySelector('#about');
if (aboutSection) {
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateAboutCounters();
                aboutObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    aboutObserver.observe(aboutSection);
}

// Parallax effect for floating shapes
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.floating-shape');
    
    shapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        shape.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.1}deg)`;
    });
});

// Enhanced project card interactions
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-12px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(-8px) scale(1)';
    });
});

// Enhanced skill item animations
document.querySelectorAll('.skill-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px) scale(1.02)';
        this.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.2)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.boxShadow = 'none';
    });
});

// Timeline item animations
document.querySelectorAll('.timeline-item').forEach((item, index) => {
    item.style.animationDelay = `${index * 0.2}s`;
    
    item.addEventListener('mouseenter', function() {
        const content = this.querySelector('.timeline-content');
        const badge = this.querySelector('.timeline-badge');
        
        if (content) content.style.transform = 'translateY(-8px)';
        if (badge) badge.style.transform = 'translateY(-50%) scale(1.1)';
    });
    
    item.addEventListener('mouseleave', function() {
        const content = this.querySelector('.timeline-content');
        const badge = this.querySelector('.timeline-badge');
        
        if (content) content.style.transform = 'translateY(-5px)';
        if (badge) badge.style.transform = 'translateY(-50%) scale(1)';
    });
});

// Typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title .gradient-text');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        typeWriter(heroTitle, originalText, 50);
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add CSS for loading state
if (!document.querySelector('#loading-styles')) {
    const loadingStyle = document.createElement('style');
    loadingStyle.id = 'loading-styles';
    loadingStyle.textContent = `
        body:not(.loaded) {
            overflow: hidden;
        }
        
        body:not(.loaded)::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        body:not(.loaded)::after {
            content: 'Loading...';
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 1.5rem;
            font-weight: 600;
            z-index: 10000;
        }
    `;
    document.head.appendChild(loadingStyle);
}

// Smooth reveal animation for sections
function revealOnScroll() {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.75) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });
}

// Initialize reveal animation
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// Add initial styles for reveal animation
if (!document.querySelector('#reveal-styles')) {
    const revealStyle = document.createElement('style');
    revealStyle.id = 'reveal-styles';
    revealStyle.textContent = `
        section {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s ease-out;
        }
        
        section:first-child {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(revealStyle);
}

// Enhanced scroll-triggered animations
const scrollAnimations = {
    init() {
        this.observeElements();
        this.bindEvents();
    },

    observeElements() {
        const elements = document.querySelectorAll('[data-animate]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));
    },

    animateElement(element) {
        const animation = element.getAttribute('data-animate');
        element.classList.add(animation);
    },

    bindEvents() {
        window.addEventListener('scroll', this.throttle(this.handleScroll, 16));
    },

    handleScroll() {
        // Add scroll-based animations here
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-parallax') || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    },

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
};

// Initialize scroll animations
scrollAnimations.init();

// Initialize enhanced animations
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initSkillsAnimation();
    initCodingProfiles();
    enhanceFloatingShapes();
    enhanceSkillAnimations();
    enhanceProjectCards();
});

// Enhanced coding profiles animations
function initCodingProfiles() {
    const profileCards = document.querySelectorAll('.profile-card');
    
    profileCards.forEach((card, index) => {
        // Add staggered animation delay
        card.style.animationDelay = `${index * 0.2}s`;
        
        // Add 3D tilt effect on mouse move
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });
        
        // Reset transform on mouse leave
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
        
        // Add click ripple effect
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(102, 126, 234, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 1;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Enhanced floating shapes with 3D rotation
function enhanceFloatingShapes() {
    const shapes = document.querySelectorAll('.floating-shape');
    
    shapes.forEach((shape, index) => {
        // Add 3D rotation
        shape.style.transformStyle = 'preserve-3d';
        shape.style.animation = `float ${6 + index * 2}s ease-in-out infinite, rotate-3d ${20 + index * 5}s linear infinite`;
        
        // Add parallax effect
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            const rotateX = scrolled * 0.1;
            const rotateY = scrolled * 0.05;
            
            shape.style.transform = `translateY(${yPos}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
    });
}

// Enhanced skill animations with progress bars
function enhanceSkillAnimations() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach((item) => {
        // Remove staggered entrance to prevent grid misalignment
        // item.style.animationDelay = `${index * 0.1}s`;
        
        // Add progress bar animation on hover
        item.addEventListener('mouseenter', function() {
            const progressBar = document.createElement('div');
            progressBar.className = 'skill-progress-bar';
            progressBar.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, #667eea, #764ba2);
                width: 0%;
                transition: width 0.6s ease;
                border-radius: 0 0 4px 4px;
            `;
            
            this.appendChild(progressBar);
            
            setTimeout(() => {
                progressBar.style.width = '100%';
            }, 100);
        });
        
        item.addEventListener('mouseleave', function() {
            const progressBar = this.querySelector('.skill-progress-bar');
            if (progressBar) {
                progressBar.style.width = '0%';
                setTimeout(() => {
                    progressBar.remove();
                }, 600);
            }
        });
    });
}

// Enhanced project card interactions
function enhanceProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card) => {
        // Remove staggered entrance to prevent grid misalignment
        // card.style.animationDelay = `${index * 0.2}s`;
        
        // Enhanced 3D hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.03) rotateX(5deg)';
            this.style.boxShadow = '0 25px 50px rgba(102, 126, 234, 0.3)';
        });
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const moveX = (x - centerX) / 20;
            const moveY = (y - centerY) / 2;
            
            card.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-8px) scale(1) rotateX(0deg)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        });
    });
}

// Add some interactive elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize enhanced animations
    initCodingProfiles();
    enhanceFloatingShapes();
    enhanceSkillAnimations();
    enhanceProjectCards();
    
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation keyframes
    if (!document.querySelector('#ripple-styles')) {
        const rippleStyle = document.createElement('style');
        rippleStyle.id = 'ripple-styles';
        rippleStyle.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(rippleStyle);
    }
});
