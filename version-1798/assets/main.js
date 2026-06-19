(function () {
  'use strict';

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function initImageFallbacks() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-fallback');
      }, { once: true });
    });
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');

    if (!root) {
      return;
    }

    var slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (slides.length < 2) {
      return;
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    restart();
  }

  function initFilters() {
    var form = document.querySelector('[data-filter-form]');
    var cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    var count = document.querySelector('[data-filter-count]');

    if (!form || cards.length === 0) {
      return;
    }

    var keyword = form.querySelector('[data-filter-keyword]');
    var year = form.querySelector('[data-filter-year]');
    var region = form.querySelector('[data-filter-region]');
    var type = form.querySelector('[data-filter-type]');

    function applyFilters() {
      var keywordValue = normalize(keyword && keyword.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matched = true;

        if (keywordValue && !searchText.includes(keywordValue)) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    form.addEventListener('input', applyFilters);
    form.addEventListener('change', applyFilters);
    form.addEventListener('reset', function () {
      window.setTimeout(applyFilters, 0);
    });
    applyFilters();
  }

  function initSearchPage() {
    var input = document.querySelector('[data-search-page-input]');
    var form = document.querySelector('[data-search-page-form]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');

    if (!input || !form || !results || !summary || !window.MOVIE_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function cardTemplate(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<a class="tag" href="search.html?q=' + encodeURIComponent(tag) + '">#' + escapeHtml(tag) + '</a>';
      }).join('');

      return '' +
        '<article class="movie-card">' +
        '  <a class="poster" href="videos/' + escapeHtml(movie.file) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '    <span class="duration">' + escapeHtml(movie.duration) + '</span>' +
        '  </a>' +
        '  <div class="movie-card-body">' +
        '    <div class="movie-card-meta">' +
        '      <a class="pill" href="categories/' + escapeHtml(movie.categorySlug) + '.html">' + escapeHtml(movie.categoryName) + '</a>' +
        '      <span>' + escapeHtml(movie.year) + '</span>' +
        '    </div>' +
        '    <h3><a href="videos/' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
        '    <div class="movie-card-tags">' + tags + '</div>' +
        '  </div>' +
        '</article>';
    }

    function performSearch() {
      var query = normalize(input.value);

      if (!query) {
        results.innerHTML = '';
        summary.textContent = '请输入关键词开始搜索。';
        return;
      }

      var matched = window.MOVIE_DATA.filter(function (movie) {
        return normalize(movie.search).includes(query);
      }).slice(0, 240);

      if (matched.length === 0) {
        results.innerHTML = '';
        summary.textContent = '未找到相关影片，请尝试更换关键词。';
        return;
      }

      results.innerHTML = matched.map(cardTemplate).join('\n');
      summary.textContent = '找到 ' + matched.length + ' 部相关影片。';
      initImageFallbacks();
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('q', input.value.trim());
      window.history.replaceState({}, '', nextUrl.toString());
      performSearch();
    });

    input.addEventListener('input', performSearch);
    performSearch();
  }

  function initPlayer() {
    var video = document.getElementById('movie-player');
    var shell = document.querySelector('[data-player-shell]');
    var playButton = document.querySelector('[data-play-button]');
    var status = document.querySelector('[data-player-status]');

    if (!video || !shell) {
      return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachSource() {
      if (!source) {
        setStatus('当前影片暂未配置播放源。');
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('已使用浏览器原生 HLS 播放能力加载。');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('HLS 播放源已加载，点击播放按钮开始观看。');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，请刷新页面或稍后重试。');
          }
        });
        return;
      }

      video.src = source;
      setStatus('浏览器不支持 HLS.js，已尝试直接加载播放源。');
    }

    function playVideo() {
      shell.classList.add('is-playing');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          shell.classList.remove('is-playing');
          setStatus('浏览器阻止了自动播放，请再次点击播放器。');
        });
      }
    }

    attachSource();

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  onReady(function () {
    initImageFallbacks();
    initMobileMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayer();
  });
})();
