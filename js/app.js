/* main.js — Lógica Unificada y Corregida */

// Pulse sutil WhatsApp
setInterval(() => document.querySelector('.whatsapp-button')?.classList.toggle('attn'), 12000);

// Debounce util
function debounce(fn, wait = 150) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), wait); };
}

document.addEventListener('DOMContentLoaded', () => {
    /* ========== 1) CSS var: --scroll-padding ========== */
    const navEl = document.querySelector('.nav');
    const setScrollPadding = () => {
        if (!navEl) return;
        const h = navEl.offsetHeight || 0;
        document.documentElement.style.setProperty('--scroll-padding', `${h}px`);
    };
    setScrollPadding();
    window.addEventListener('resize', debounce(setScrollPadding, 200));

    /* ========== 2) NAV móvil accesible corregido ========== */
    const MENU = document.getElementById('nav-menu');
    const BTN_TOGGLE = document.getElementById('nav__toggle');
    const BTN_CLOSE = document.getElementById('nav__close');
    const BACKDROP = document.querySelector('.nav__backdrop');
    const mqDesktop = window.matchMedia('(min-width: 1200px)');

    const lockScroll = (on) => { document.documentElement.style.overflow = on ? 'hidden' : ''; };

    const openMenu = () => {
        if (!MENU || mqDesktop.matches) return;
        MENU.hidden = false;
        MENU.inert = false;
        MENU.classList.add('is-active');
        BTN_TOGGLE?.setAttribute('aria-expanded', 'true');
        BACKDROP?.classList.add('active');
        lockScroll(true);
    };

    const closeMenu = () => {
        if (!MENU || mqDesktop.matches) return;
        MENU.classList.remove('is-active');
        MENU.hidden = true;
        MENU.inert = true;
        BTN_TOGGLE?.setAttribute('aria-expanded', 'false');
        BACKDROP?.classList.remove('active');
        lockScroll(false);
    };

    // Función crucial: Limpia estados de móvil al pasar a Desktop
    const handleDesktopChange = (e) => {
        if (e.matches) {
            // Estamos en Desktop
            if (MENU) {
                MENU.hidden = false;
                MENU.inert = false;
                MENU.classList.remove('is-active');
            }
            BACKDROP?.classList.remove('active');
            lockScroll(false);
        } else {
            // Estamos en Móvil (inicializar estado cerrado)
            if (MENU && !MENU.classList.contains('is-active')) {
                MENU.hidden = true;
                MENU.inert = true;
            }
        }
    };

    BTN_TOGGLE?.addEventListener('click', () => (MENU && !MENU.hidden) ? closeMenu() : openMenu());
    [BTN_CLOSE, BACKDROP].forEach(el => el?.addEventListener('click', closeMenu));

    // Escuchar cambios de resolución
    mqDesktop.addEventListener('change', handleDesktopChange);
    handleDesktopChange(mqDesktop); // Ejecutar al cargar

    /* ========== 3) Lógica de Carrusel (Dots) REUTILIZABLE ========== */
    function initCarouselDots(containerSelector) {
        const containers = document.querySelectorAll(containerSelector);

        containers.forEach(container => {
            if (window.getComputedStyle(container).display === 'none') return;

            const dotsContainer = container.parentElement.querySelector('.dots-navigation');
            if (!dotsContainer) return;

            const cards = Array.from(container.children);

            dotsContainer.innerHTML = '';
            cards.forEach((_, i) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dotsContainer.appendChild(dot);
            });

            const dots = dotsContainer.querySelectorAll('.dot');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const index = cards.indexOf(entry.target);
                        dots.forEach((d, i) => d.classList.toggle('active', i === index));
                    }
                });
            }, { root: container, threshold: 0.6 });

            cards.forEach(c => observer.observe(c));
        });
    }

    /* ========== 4) Inicializador de Tabs ========== */
    function initTabs({ buttonSelector, cardsSelector, activeBtnClass, cardsActivePrefix }) {
        const btns = document.querySelectorAll(buttonSelector);
        const allCards = document.querySelectorAll(cardsSelector);

        const updateTabUI = (targetBtn) => {
            btns.forEach(btn => {
                const img = btn.querySelector('img');
                const isActive = btn === targetBtn;
                btn.classList.toggle(activeBtnClass, isActive);
                btn.setAttribute('aria-selected', isActive);

                if (img) {
                    if (isActive && btn.dataset.iconActive) img.src = btn.dataset.iconActive;
                    else if (!isActive && btn.dataset.iconDefault) img.src = btn.dataset.iconDefault;
                }
            });

            const target = targetBtn.dataset.target;
            allCards.forEach(group => {
                group.style.display = group.classList.contains(`${cardsActivePrefix}${target}`) ? 'flex' : 'none';
            });

            initCarouselDots(cardsSelector);
        };

        btns.forEach(btn => btn.addEventListener('click', () => updateTabUI(btn)));

        const initialActive = document.querySelector(`${buttonSelector}.${activeBtnClass}`) || btns[0];
        if (initialActive) updateTabUI(initialActive);
    }

    /* ========== 5) Ejecución ========== */

    // Iniciar Rutinas
    initTabs({
        buttonSelector: '.rutinas__selector-btn',
        cardsSelector: '.rutinas__cards',
        activeBtnClass: 'rutinas__selector-btn--active',
        cardsActivePrefix: 'rutinas__cards--'
    });

    // Iniciar Dietas
    initCarouselDots('.dietas__cards');

    // Footer Año
    const timeEl = document.querySelector('.footer time');
    if (timeEl) timeEl.textContent = new Date().getFullYear();
});