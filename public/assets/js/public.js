// Public navigation and existing map presentation. No authentication or ML decisions here.
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('public-menu-toggle');
    const nav = document.getElementById('public-navigation');
    const mobile = window.matchMedia('(max-width: 1023px)');
    if (toggle && nav) {
        let open = false;
        document.body.classList.add('public-nav-enhanced');
        function sync() {
            toggle.hidden = !mobile.matches;
            nav.hidden = mobile.matches && !open;
            toggle.setAttribute('aria-expanded', String(open && mobile.matches));
            toggle.setAttribute('aria-label', open ? 'Close public navigation' : 'Open public navigation');
        }
        toggle.addEventListener('click', () => { open = !open; sync(); });
        nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { open = false; sync(); }));
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && open) { open = false; sync(); toggle.focus(); }
        });
        document.addEventListener('click', event => {
            if (open && !nav.contains(event.target) && !toggle.contains(event.target)) { open = false; sync(); }
        });
        mobile.addEventListener('change', () => { open = false; sync(); });
        sync();
        if (document.body.classList.contains('public-page') && typeof IntersectionObserver !== 'undefined') {
            const observer = new IntersectionObserver(entries => {
                const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (!visible) return;
                nav.querySelectorAll('[data-public-section]').forEach(link => {
                    if (link.dataset.publicSection === visible.target.id) link.setAttribute('aria-current', 'location');
                    else link.removeAttribute('aria-current');
                });
            }, { rootMargin: '-110px 0px -45% 0px', threshold: [0, .25, .5] });
            document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
        }
    }
    document.querySelectorAll('[data-public-map]').forEach(container => {
        let initialized = false;
        function initialize() {
            if (!initialized && container.getClientRects().length && typeof window.initHazardMap === 'function') {
                initialized = true;
                window.initHazardMap(container.id, { zoom: 14, publicView: true });
            }
        }
        const disclosure = container.closest('.auth-map-disclosure');
        if (disclosure) disclosure.addEventListener('toggle', initialize);
        initialize();
    });
});
