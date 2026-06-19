(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = qs('[data-menu-button]');
    var menu = qs('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    show(0);
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');

    if (!panel) {
      return;
    }

    var input = qs('[data-filter-keyword]', panel);
    var yearSelect = qs('[data-filter-year]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var cards = qsa('[data-movie-card]');

    function filter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags')).toLowerCase();
        var cardYear = card.getAttribute('data-year');
        var cardType = card.getAttribute('data-type');
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        card.classList.toggle('hidden-by-filter', !matched);
      });
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filter);
        control.addEventListener('change', filter);
      }
    });
  }

  function initPlayer() {
    var shells = qsa('[data-player-shell]');

    shells.forEach(function (shell) {
      var video = qs('video', shell);
      var overlay = qs('[data-play-overlay]', shell);
      var src = shell.getAttribute('data-src');
      var loaded = false;

      function loadSource() {
        if (loaded || !video || !src) {
          return;
        }

        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(src);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }
      }

      function play() {
        loadSource();

        if (overlay) {
          overlay.classList.add('hidden');
        }

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove('hidden');
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('hidden');
          }
        });
      }
    });
  }

  function initSearchPage() {
    var form = qs('[data-site-search-form]');
    var results = qs('[data-search-results]');

    if (!form || !results || !window.SITE_MOVIES) {
      return;
    }

    var input = qs('[name="q"]', form);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function render(query) {
      var keyword = query.trim().toLowerCase();

      if (!keyword) {
        results.innerHTML = '<p class="section-desc">请输入影片标题、类型、地区、标签或年份进行搜索。</p>';
        return;
      }

      var matched = window.SITE_MOVIES.filter(function (movie) {
        return movie.text.toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 160);

      if (!matched.length) {
        results.innerHTML = '<p class="section-desc">没有找到匹配影片，请尝试更换关键词。</p>';
        return;
      }

      results.innerHTML = '<div class="grid">' + matched.map(function (movie) {
        return [
          '<article class="card">',
          '  <a href="' + movie.url + '">',
          '    <div class="poster-wrap">',
          '      <img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy">',
          '      <span class="poster-badge">' + movie.year + '</span>',
          '    </div>',
          '    <div class="card-body">',
          '      <h3 class="card-title">' + movie.title + '</h3>',
          '      <p class="card-text">' + movie.oneLine + '</p>',
          '      <div class="meta-line"><span>' + movie.region + '</span><span>' + movie.type + '</span></div>',
          '    </div>',
          '  </a>',
          '</article>'
        ].join('');
      }).join('') + '</div>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value : '';
      history.replaceState(null, '', './search.html?q=' + encodeURIComponent(query));
      render(query);
    });

    render(initialQuery);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayer();
    initSearchPage();
  });
})();
