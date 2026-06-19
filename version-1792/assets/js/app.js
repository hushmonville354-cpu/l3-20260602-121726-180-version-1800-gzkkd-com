(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-nav-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 1) {
    var current = 0;
    var show = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show((current + 1) % slides.length);
    }, 5000);
  }

  var filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    var keyword = filterForm.querySelector('[data-filter-keyword]');
    var year = filterForm.querySelector('[data-filter-year]');
    var type = filterForm.querySelector('[data-filter-type]');
    var reset = filterForm.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var apply = function () {
      var q = (keyword && keyword.value ? keyword.value : '').trim().toLowerCase();
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      cards.forEach(function (card) {
        var text = [card.getAttribute('data-title'), card.getAttribute('data-region'), card.getAttribute('data-type')].join(' ').toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          ok = false;
        }
        if (t && card.getAttribute('data-type') !== t) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
      });
    };
    ['input', 'change'].forEach(function (eventName) {
      if (keyword) keyword.addEventListener(eventName, apply);
      if (year) year.addEventListener(eventName, apply);
      if (type) type.addEventListener(eventName, apply);
    });
    if (reset) {
      reset.addEventListener('click', function () {
        filterForm.reset();
        apply();
      });
    }
  }
})();
