(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  var mobileNav = qs('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  qsa('[data-carousel]').forEach(function (carousel) {
    var slides = qsa('[data-slide]', carousel);
    var dots = qsa('[data-carousel-dot]', carousel);
    var prev = qs('[data-carousel-prev]', carousel);
    var next = qs('[data-carousel-next]', carousel);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  var homeSearch = qs('[data-home-search]');
  if (homeSearch) {
    homeSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input[name="q"]', homeSearch);
      var query = input ? input.value.trim() : '';
      var url = './search.html';
      if (query) {
        url += '?q=' + encodeURIComponent(query);
      }
      window.location.href = url;
    });
  }

  qsa('[data-filter-panel]').forEach(function (panel) {
    var container = panel.parentElement || document;
    var input = qs('[data-filter-input]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var yearSelect = qs('[data-filter-year]', panel);
    var items = qsa('.movie-card, .rank-row', container);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function matchYear(itemYear, selected) {
      if (!selected) {
        return true;
      }
      var year = parseInt(itemYear || '0', 10);
      if (selected === '2010') {
        return year >= 2010 && year < 2020;
      }
      if (selected === '2000') {
        return year >= 2000 && year < 2010;
      }
      if (selected === '1990') {
        return year > 0 && year < 2000;
      }
      return String(year) === selected;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var selectedType = typeSelect ? typeSelect.value : '';
      var selectedYear = yearSelect ? yearSelect.value : '';

      items.forEach(function (item) {
        var haystack = [
          item.dataset.title,
          item.dataset.region,
          item.dataset.genre,
          item.dataset.type,
          item.dataset.tags,
          item.dataset.year
        ].join(' ').toLowerCase();
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var itemType = item.dataset.type || '';
        var okType = !selectedType || itemType.indexOf(selectedType) !== -1;
        var okYear = matchYear(item.dataset.year, selectedYear);
        item.classList.toggle('is-filtered-out', !(okQuery && okType && okYear));
      });
    }

    ['input', 'change'].forEach(function (name) {
      if (input) {
        input.addEventListener(name, apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener(name, apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener(name, apply);
      }
    });

    apply();
  });
})();
