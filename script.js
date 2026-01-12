// Smooth scroll for internal links
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

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all project cards and skill categories
document.addEventListener('DOMContentLoaded', () => {
    // Add initial animation state
    const animatedElements = document.querySelectorAll('.project-card, .skill-category, .contact-link');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Add parallax effect to hero with throttling
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const hero = document.querySelector('.hero');
                if (hero && scrolled < window.innerHeight) {
                    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // Add hover effect sound (visual feedback)
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });

    // Dynamic gradient background effect
    const hero = document.querySelector('.hero');
    if (hero) {
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX / window.innerWidth;
            mouseY = e.clientY / window.innerHeight;
            
            hero.style.setProperty('--mouse-x', mouseX);
            hero.style.setProperty('--mouse-y', mouseY);
        });
    }

    // Add stagger animation to project cards
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Scroll progress indicator
    const createScrollIndicator = () => {
        const indicator = document.createElement('div');
        indicator.style.position = 'fixed';
        indicator.style.top = '0';
        indicator.style.left = '0';
        indicator.style.height = '3px';
        indicator.style.background = 'linear-gradient(90deg, #ff4655 0%, #ff6b6b 100%)';
        indicator.style.zIndex = '9999';
        indicator.style.transition = 'width 0.1s ease';
        document.body.appendChild(indicator);

        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            indicator.style.width = scrolled + '%';
        });
    };

    createScrollIndicator();

    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

// Add cursor trail effect with object pooling for better performance
const trailPool = [];
const maxTrailLength = 20;
let lastTrailTime = 0;
const trailInterval = 50; // Only create trail every 50ms

document.addEventListener('mousemove', (e) => {
    if (window.innerWidth > 768) { // Only on desktop
        const now = Date.now();
        if (now - lastTrailTime < trailInterval) return;
        lastTrailTime = now;

        let trailObj = trailPool.find(t => !t.active);
        
        if (!trailObj) {
            const trailElement = document.createElement('div');
            trailElement.className = 'cursor-trail';
            document.body.appendChild(trailElement);
            trailObj = { element: trailElement, active: false };
            trailPool.push(trailObj);
        }
        
        trailObj.active = true;
        trailObj.element.style.left = e.pageX + 'px';
        trailObj.element.style.top = e.pageY + 'px';
        trailObj.element.style.opacity = '1';
        trailObj.element.style.transform = 'scale(1)';

        setTimeout(() => {
            trailObj.element.style.opacity = '0';
            trailObj.element.style.transform = 'scale(0)';
        }, 50);

        setTimeout(() => {
            trailObj.active = false;
        }, 500);
    }
});

// Add cursor trail styles
const style = document.createElement('style');
style.textContent = `
    .cursor-trail {
        position: absolute;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: rgba(255, 70, 85, 0.5);
        pointer-events: none;
        transition: all 0.5s ease;
        z-index: 9998;
    }
`;
document.head.appendChild(style);
