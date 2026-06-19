function toggleMobileMenu() {
  var panel = document.querySelector('.mobile-panel');
  if (panel) {
    panel.classList.toggle('open');
  }
}

function goSearch(form) {
  var input = form.querySelector('input[name="q"]');
  var value = input ? input.value.trim() : '';
  if (value) {
    window.location.href = 'search.html?q=' + encodeURIComponent(value);
  } else {
    window.location.href = 'search.html';
  }
  return false;
}

function setupHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  if (slides.length < 2) {
    return;
  }
  var index = 0;
  setInterval(function () {
    slides[index].classList.remove('active');
    index = (index + 1) % slides.length;
    slides[index].classList.add('active');
  }, 4600);
}

function setupCatalogFilter() {
  var queryInput = document.querySelector('#siteSearch');
  var yearSelect = document.querySelector('#yearFilter');
  var regionSelect = document.querySelector('#regionFilter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-title]'));
  if (!cards.length) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  if (queryInput && initialQuery) {
    queryInput.value = initialQuery;
  }
  function applyFilter() {
    var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var region = regionSelect ? regionSelect.value : '';
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-genre') || ''
      ].join(' ').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedYear = !year || cardYear === year;
      var matchedRegion = !region || cardRegion.indexOf(region) !== -1;
      card.classList.toggle('hidden-card', !(matchedQuery && matchedYear && matchedRegion));
    });
  }
  if (queryInput) {
    queryInput.addEventListener('input', applyFilter);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilter);
  }
  if (regionSelect) {
    regionSelect.addEventListener('change', applyFilter);
  }
  applyFilter();
}

function bindMoviePlayer(streamUrl) {
  var video = document.querySelector('#moviePlayer');
  var cover = document.querySelector('#playerCover');
  var button = document.querySelector('#playButton');
  if (!video || !cover || !button || !streamUrl) {
    return;
  }
  var prepared = false;
  function prepare() {
    if (prepared) {
      return;
    }
    prepared = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }
  function play() {
    prepare();
    cover.classList.add('hidden');
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }
  cover.addEventListener('click', play);
  button.addEventListener('click', function (event) {
    event.stopPropagation();
    play();
  });
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setupHero();
  setupCatalogFilter();
});
