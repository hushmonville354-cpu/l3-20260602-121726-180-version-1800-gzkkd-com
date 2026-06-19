(function() {
    const toggle = document.querySelector('.nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (toggle && mobileMenu) {
        toggle.addEventListener('click', function() {
            const open = !mobileMenu.classList.contains('is-open');
            mobileMenu.classList.toggle('is-open', open);
            toggle.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    const carousel = document.querySelector('[data-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
        const prev = carousel.querySelector('.hero-prev');
        const next = carousel.querySelector('.hero-next');
        let index = Math.max(0, slides.findIndex(function(slide) {
            return slide.classList.contains('is-active');
        }));
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function() {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                show(dotIndex);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    const filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        const params = new URLSearchParams(window.location.search);
        const searchInput = document.getElementById('movie-search');
        const regionFilter = document.getElementById('region-filter');
        const typeFilter = document.getElementById('type-filter');
        const yearFilter = document.getElementById('year-filter');
        const resetButton = document.getElementById('filter-reset');
        const cards = Array.from(document.querySelectorAll('#search-grid .movie-card'));
        const empty = document.querySelector('.search-empty');

        if (searchInput && params.get('q')) {
            searchInput.value = params.get('q');
        }

        function matchText(card, keyword) {
            if (!keyword) {
                return true;
            }
            const haystack = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags,
                card.textContent
            ].join(' ').toLowerCase();
            return haystack.indexOf(keyword) !== -1;
        }

        function filterCards() {
            const keyword = (searchInput.value || '').trim().toLowerCase();
            const region = regionFilter.value;
            const type = typeFilter.value;
            const year = yearFilter.value;
            let visible = 0;

            cards.forEach(function(card) {
                const matched = matchText(card, keyword)
                    && (!region || card.dataset.region === region)
                    && (!type || card.dataset.type === type)
                    && (!year || card.dataset.year === year);
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, regionFilter, typeFilter, yearFilter].forEach(function(control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        });

        resetButton.addEventListener('click', function() {
            searchInput.value = '';
            regionFilter.value = '';
            typeFilter.value = '';
            yearFilter.value = '';
            filterCards();
        });

        filterCards();
    }
}());
