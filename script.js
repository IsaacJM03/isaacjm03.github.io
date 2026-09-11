document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    if (typeof gsap === 'undefined') {
        const preloader = document.getElementById('preloader');
        if (preloader) preloader.style.display = 'none';
        document.querySelectorAll('.hero-name-line span').forEach(el => el.style.transform = 'none');
        document.querySelectorAll('.nav-logo, .nav-link, .hero-social-link, .hero-role, .hero-image').forEach(el => el.style.opacity = '1');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 768;

    // ── Preloader ──
    const preloader = document.getElementById('preloader');
    const preloaderName = preloader.querySelector('.preloader-name');
    const preloaderFill = preloader.querySelector('.preloader-fill');

    const preloaderTl = gsap.timeline({
        onComplete: () => {
            initAnimations();
            preloader.style.pointerEvents = 'none';
        }
    });

    preloaderTl
        .to(preloaderName, { opacity: 1, duration: 0.6, ease: 'power2.out' })
        .to(preloaderFill, { width: '100%', duration: 1.2, ease: 'power2.inOut' }, 0.3)
        .to(preloader, { yPercent: -100, duration: 0.8, ease: 'power3.inOut' }, '+=0.3');

    // ── Custom Cursor ──
    if (!isMobile) {
        const cursor = document.getElementById('cursor');
        const follower = document.getElementById('cursor-follower');
        let cursorX = 0, cursorY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            gsap.to(cursor, { x: cursorX, y: cursorY, duration: 0.1 });
        });

        function updateFollower() {
            followerX += (cursorX - followerX) * 0.12;
            followerY += (cursorY - followerY) * 0.12;
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
            requestAnimationFrame(updateFollower);
        }
        updateFollower();

        const hoverTargets = document.querySelectorAll('a, button, [data-magnetic], .featured-card, .contact-card, .work-row');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => follower.classList.add('hovering'));
            el.addEventListener('mouseleave', () => follower.classList.remove('hovering'));
        });
    }

    // ── Scroll Progress ──
    const scrollProgress = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress.style.width = (scrolled / height * 100) + '%';
    }, { passive: true });

    // ── Magnetic Effect ──
    if (!isMobile) {
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
            });
        });
    }

    // ── Smooth Scroll for Nav Links ──
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── Interactive Hero Canvas ──
    function initHeroCanvas() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const numParticles = isMobile ? 25 : 55;
        const particles = [];
        let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 1.6 + 0.6,
                baseAlpha: Math.random() * 0.35 + 0.15
            });
        }

        window.addEventListener('mousemove', (e) => {
            mouse.targetX = e.clientX;
            mouse.targetY = e.clientY;
        });

        function render() {
            ctx.clearRect(0, 0, width, height);

            mouse.x += (mouse.targetX - mouse.x) * 0.08;
            mouse.y += (mouse.targetY - mouse.y) * 0.08;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 140) {
                    const force = (140 - dist) / 140;
                    p.x -= (dx / dist) * force * 1.5;
                    p.y -= (dy / dist) * force * 1.5;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 70, 85, ${p.baseAlpha})`;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dxx = p.x - p2.x;
                    const dyy = p.y - p2.y;
                    const d = Math.sqrt(dxx * dxx + dyy * dyy);
                    if (d < 95) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 * (1 - d / 95)})`;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(render);
        }
        render();
    }
    initHeroCanvas();

    // ── Interactive Spotlight on Cards ──
    function initCardSpotlights() {
        const cards = document.querySelectorAll('.featured-card, .contact-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--spotlight-x', `${x}px`);
                card.style.setProperty('--spotlight-y', `${y}px`);
            });
        });
    }
    initCardSpotlights();

    // ── Text Decoder Scramble Effect ──
    function initTextScramble() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#';
        const scrambleElements = document.querySelectorAll('[data-scramble], .featured-title, .work-name');

        scrambleElements.forEach(el => {
            const originalText = el.innerText;
            let interval = null;

            el.addEventListener('mouseenter', () => {
                let iteration = 0;
                clearInterval(interval);

                interval = setInterval(() => {
                    el.innerText = originalText
                        .split('')
                        .map((char, index) => {
                            if (index < iteration) return originalText[index];
                            if (char === ' ') return ' ';
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join('');

                    if (iteration >= originalText.length) {
                        clearInterval(interval);
                    }
                    iteration += 1 / 2;
                }, 25);
            });

            el.addEventListener('mouseleave', () => {
                clearInterval(interval);
                el.innerText = originalText;
            });
        });
    }
    initTextScramble();

    // ── Click Particle Burst ──
    function initClickBurst() {
        const colors = ['#ff4655', '#ffffff', '#ff7884', '#34d399'];
        window.addEventListener('click', (e) => {
            const numParticles = 8;
            for (let i = 0; i < numParticles; i++) {
                const particle = document.createElement('div');
                particle.className = 'click-particle';
                const size = Math.random() * 4 + 3;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                particle.style.left = `${e.clientX}px`;
                particle.style.top = `${e.clientY}px`;
                document.body.appendChild(particle);

                const angle = (Math.PI * 2 / numParticles) * i + (Math.random() - 0.5) * 0.5;
                const velocity = Math.random() * 40 + 25;
                const destX = Math.cos(angle) * velocity;
                const destY = Math.sin(angle) * velocity;

                gsap.to(particle, {
                    x: destX,
                    y: destY,
                    opacity: 0,
                    scale: 0.2,
                    duration: 0.5 + Math.random() * 0.2,
                    ease: 'power2.out',
                    onComplete: () => particle.remove()
                });
            }
        });
    }
    initClickBurst();

    // ── Main Animations ──
    function initAnimations() {
        if (prefersReducedMotion) {
            document.querySelectorAll('.hero-name-line span').forEach(el => el.style.transform = 'none');
            document.querySelectorAll('.nav-logo, .nav-link, .hero-social-link, .hero-role, .hero-image').forEach(el => el.style.opacity = '1');
            return;
        }

        // Hero entrance
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        const line1Spans = document.querySelectorAll('.hero-name .hero-name-line:nth-child(1) span');
        const line2Spans = document.querySelectorAll('.hero-name .hero-name-line:nth-child(2) span');

        heroTl
            .to(line1Spans, {
                y: 0,
                duration: 1.2,
                ease: 'power4.out'
            })
            .to(line2Spans, {
                y: 0,
                duration: 1.2,
                ease: 'power4.out'
            }, '<0.15')
            .to('.hero-image', {
                opacity: 1,
                duration: 1.1,
                ease: 'power2.out'
            }, '-=0.8')
            .to('.nav-logo', { opacity: 1, duration: 0.6 }, '-=0.6')
            .to('.nav-link', { opacity: 1, duration: 0.5, stagger: 0.1 }, '-=0.4')
            .to('.hero-social-link', { opacity: 1, duration: 0.4, stagger: 0.08 }, '-=0.4')
            .to('.hero-role', { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.4');

        // Hero parallax on scroll
        gsap.to('.hero-name', {
            yPercent: -25,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        gsap.to('.hero-image', {
            yPercent: 18,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        // About section reveal
        const about = document.querySelector('.about');
        if (about) {
            gsap.from(about.querySelectorAll('.section-label, .about-lead, .about-text p, .about-details'), {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: about,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });
        }

        // Featured cards staggered reveal
        const projects = document.querySelector('.projects');
        if (projects) {
            gsap.from(projects.querySelector('.section-label'), {
                y: 40,
                opacity: 0,
                duration: 0.7,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: projects,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });

            gsap.from('.featured-card', {
                y: 70,
                opacity: 0,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.featured-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        }

        // More work rows reveal
        gsap.from('.work-row', {
            x: -30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.work-list',
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });

        // Contact section reveal
        const contact = document.querySelector('.contact');
        if (contact) {
            gsap.from(contact.querySelectorAll('.section-label, .contact-heading'), {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: contact,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });

            gsap.from('.contact-card', {
                y: 40,
                opacity: 0,
                duration: 0.7,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.contact-grid',
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                }
            });
        }

        // Featured card 3D tilt on hover
        if (!isMobile) {
            document.querySelectorAll('.featured-card').forEach(card => {
                const content = card.querySelector('.card-content');
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;
                    gsap.to(content, {
                        rotateY: x * 6,
                        rotateX: -y * 6,
                        duration: 0.4,
                        ease: 'power2.out',
                        transformPerspective: 1000
                    });
                });

                card.addEventListener('mouseleave', () => {
                    gsap.to(content, {
                        rotateY: 0,
                        rotateX: 0,
                        duration: 0.7,
                        ease: 'elastic.out(1, 0.6)'
                    });
                });
            });
        }

        // Marquee speed on scroll
        const marqueeTrack = document.querySelector('.marquee-track');
        if (marqueeTrack) {
            ScrollTrigger.create({
                trigger: '.skills-marquee',
                start: 'top bottom',
                end: 'bottom top',
                onUpdate: (self) => {
                    const speed = 40 - (self.progress * 20);
                    marqueeTrack.style.animationDuration = speed + 's';
                }
            });
        }

        // Nav hide/show on scroll direction
        let lastScroll = 0;
        const nav = document.getElementById('nav');
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            if (currentScroll > lastScroll && currentScroll > 200) {
                gsap.to(nav, { y: -100, duration: 0.4, ease: 'power2.inOut' });
            } else {
                gsap.to(nav, { y: 0, duration: 0.4, ease: 'power2.inOut' });
            }
            lastScroll = currentScroll;
        }, { passive: true });
    }
});
