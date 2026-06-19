(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length) {
      var active = 0;
      var setActive = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
          slide.classList.toggle('active', idx === active);
        });
        dots.forEach(function (dot, idx) {
          dot.classList.toggle('active', idx === active);
        });
      };
      dots.forEach(function (dot, idx) {
        dot.addEventListener('click', function () {
          setActive(idx);
        });
      });
      setInterval(function () {
        setActive(active + 1);
      }, 5000);
      setActive(0);
    }

    var searchInput = document.querySelector('[data-filter-input]');
    var categorySelect = document.querySelector('[data-filter-category]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function applyFilters() {
      if (!cards.length) {
        return;
      }
      var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var cat = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var cardCat = card.getAttribute('data-category') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = (!q || text.indexOf(q) !== -1) && (!cat || cardCat === cat) && (!year || cardYear === year);
        card.style.display = matched ? '' : 'none';
      });
    }

    [searchInput, categorySelect, yearSelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', applyFilters);
        node.addEventListener('change', applyFilters);
      }
    });
  });
})();
