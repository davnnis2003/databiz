/**
 * Data Biz Website Logic
 * - GA4 Event Tracking
 * - Scroll Reveal Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    initGA4Tracking();
    initScrollReveal();
});

/**
 * Initialize GA4 Event Tracking
 */
function initGA4Tracking() {
    // 1. Click Tracking
    document.querySelectorAll('[data-ga-event]').forEach(element => {
        element.addEventListener('click', (e) => {
            const eventName = element.getAttribute('data-ga-event');
            console.log(`GA4 Event Triggered: ${eventName}`); // Debug log
            
            if (typeof gtag === 'function') {
                gtag('event', 'click', {
                    'event_category': 'conversion',
                    'event_label': eventName,
                    'value': 1
                });
            }
        });
    });

    // 2. Scroll Depth Tracking
    let scrollDepths = [25, 50, 75, 100];
    let trackedDepths = [];

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        scrollDepths.forEach(depth => {
            if (scrollPercent >= depth && !trackedDepths.includes(depth)) {
                trackedDepths.push(depth);
                console.log(`GA4 Scroll Depth Triggered: ${depth}%`); // Debug log
                
                if (typeof gtag === 'function') {
                    gtag('event', 'scroll_depth', {
                        'depth': depth
                    });
                }
            }
        });
    });
}

/**
 * Initialize Scroll Reveal Animations
 */
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Once it's revealed, we don't need to observe it anymore
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-vibe-reveal]').forEach(el => {
        observer.observe(el);
    });
}
