(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startSlides() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function resetSlides() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }

    startSlides();
  }

  if (slides.length) {
    showSlide(0);
    startSlides();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      resetSlides();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      resetSlides();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
      resetSlides();
    });
  });

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterRegion = document.querySelector('[data-filter-region]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var noResults = document.querySelector('[data-no-results]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyQueryFromUrl() {
    if (!filterInput) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      filterInput.value = query;
    }
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var query = normalize(filterInput ? filterInput.value : '');
    var year = filterYear ? filterYear.value : '';
    var region = filterRegion ? filterRegion.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchYear = !year || card.getAttribute('data-year') === year;
      var matchRegion = !region || card.getAttribute('data-region') === region;
      var matched = matchQuery && matchYear && matchRegion;

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.classList.toggle('is-visible', visible === 0);
    }
  }

  applyQueryFromUrl();

  [filterInput, filterYear, filterRegion].forEach(function (field) {
    if (field) {
      field.addEventListener('input', filterCards);
      field.addEventListener('change', filterCards);
    }
  });

  filterCards();
})();
