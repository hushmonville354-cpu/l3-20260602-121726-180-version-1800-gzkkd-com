(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = $('[data-menu-toggle]');
    var nav = $('[data-main-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    show(0);
    play();
  }

  function setupImageFallbacks() {
    $all('.cover-fallback img').forEach(function (image) {
      image.addEventListener('error', function () {
        var holder = image.closest('.cover-fallback');

        if (holder) {
          holder.classList.add('image-missing');
        }
      });
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var form = $('[data-filter-form]');
    var list = $('[data-movie-list]');

    if (!form || !list) {
      return;
    }

    var cards = $all('.movie-card', list);
    var count = $('[data-result-count]');
    var params = new URLSearchParams(window.location.search);

    ['q', 'year', 'region', 'type'].forEach(function (name) {
      var field = form.elements[name];

      if (field && params.get(name)) {
        field.value = params.get(name);
      }
    });

    function applyFilters() {
      var q = normalize(form.elements.q && form.elements.q.value);
      var year = normalize(form.elements.year && form.elements.year.value);
      var region = normalize(form.elements.region && form.elements.region.value);
      var type = normalize(form.elements.type && form.elements.type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));

        var matched = true;

        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }

        if (year && normalize(card.dataset.year) !== year) {
          matched = false;
        }

        if (region && normalize(card.dataset.region).indexOf(region) === -1) {
          matched = false;
        }

        if (type && normalize(card.dataset.type).indexOf(type) === -1) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '共 ' + visible + ' 部影片';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters();
    });

    $all('input, select', form).forEach(function (field) {
      field.addEventListener('input', applyFilters);
      field.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  function setupPlayers() {
    $all('.player-shell').forEach(function (shell) {
      var video = $('.movie-player', shell);
      var button = $('[data-player-start]', shell);
      var url = shell.getAttribute('data-video-url');
      var hlsInstance;

      if (!video || !button || !url) {
        return;
      }

      function loadAndPlay() {
        button.classList.add('hidden');

        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }

          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              try {
                hlsInstance.destroy();
              } catch (error) {}
              video.src = url;
              video.play().catch(function () {});
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.play().catch(function () {});
        } else {
          video.src = url;
          video.play().catch(function () {});
        }
      }

      button.addEventListener('click', loadAndPlay);
      video.addEventListener('click', function () {
        if (video.paused) {
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupImageFallbacks();
    setupFilters();
    setupPlayers();
  });
})();
