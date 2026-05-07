/**
 * Data Biz Website Logic
 * - GA4 Event Tracking
 * - Scroll Reveal Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    initGA4Tracking();
    initScrollReveal();
    fetchLatestInsights();
});

/**
 * Fetch latest articles from Substack RSS feed
 */
async function fetchLatestInsights() {
    const grid = document.querySelector('.insights-grid');
    if (!grid) return;

    const SUBSTACK_URL = 'https://jimmypang.substack.com';
    const RSS_URL = `${SUBSTACK_URL}/feed`;
    const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            // Clear current static content (or keep it as fallback if fetch failed)
            // But here we'll replace it with the latest 3 items
            const latestPosts = data.items.slice(0, 3);
            
            // Build new HTML
            let html = '';
            latestPosts.forEach((post, index) => {
                // Clean up the description (Substack RSS often includes full content or long snippets)
                let summary = post.description.replace(/<[^>]*>?/gm, '').split('.')[0] + '.';
                if (summary.length > 120) summary = summary.substring(0, 117) + '...';

                // Use post thumbnail or a default image if not present
                const thumbnail = post.thumbnail || post.enclosure.link || 'assets/roadmap_prioritization.png';

                html += `
                    <article class="insight-card" data-vibe-reveal>
                        <div class="insight-image">
                            <img src="${thumbnail}" alt="${post.title}">
                        </div>
                        <div class="insight-content">
                            <h4>${post.title}</h4>
                            <p>${summary}</p>
                            <a href="${post.link}" class="btn-text" target="_blank" rel="noopener" data-ga-event="dynamic_article_click_${index + 1}">Read the article →</a>
                        </div>
                    </article>
                `;
            });

            grid.innerHTML = html;

            // Re-initialize scroll reveal for new elements
            initScrollReveal();
        }
    } catch (error) {
        console.error('Failed to fetch Substack feed:', error);
        // Fallback to static content already in HTML
    }
}

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
