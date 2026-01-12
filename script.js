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

// Enhanced typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    element.style.opacity = '1';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

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

    // Parallax effect for avatar on scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const hero = document.querySelector('.hero');
                const avatar = document.querySelector('.avatar-container');
                
                if (hero && scrolled < window.innerHeight) {
                    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
                }
                
                if (avatar && scrolled < window.innerHeight) {
                    const rotation = scrolled * 0.1;
                    avatar.style.transform = `translateY(-${scrolled * 0.3}px) rotate(${rotation}deg)`;
                }
                
                ticking = false;
            });
            ticking = true;
        }
    });

    // Add hover effect sound (visual feedback)
    // Project cards stagger animation is set below
    const allProjectCards = document.querySelectorAll('.project-card');
    allProjectCards.forEach(card => {
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

    // Add 3D tilt effect to cards
    const cards = document.querySelectorAll('.project-card, .skill-category');
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });

    // Animated skill bars on hover
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.05}s`;
        
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) translateY(-2px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
        });
    });

    // Dynamic gradient background that follows mouse
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            section.style.background = `
                radial-gradient(circle at ${x}% ${y}%, rgba(255, 70, 85, 0.05) 0%, transparent 50%),
                ${section.style.backgroundColor || getComputedStyle(section).backgroundColor}
            `;
        });
    });

    // Add stagger animation to project cards
    allProjectCards.forEach((card, index) => {
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
