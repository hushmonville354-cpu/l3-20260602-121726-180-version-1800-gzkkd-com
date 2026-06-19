(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  if (!form || !input || !results) {
    return;
  }

  input.value = initial;

  var render = function (query) {
    var q = query.trim().toLowerCase();
    var list = (window.SITE_MOVIES || []).filter(function (movie) {
      if (!q) {
        return false;
      }
      return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags.join(' '), movie.oneLine]
        .join(' ')
        .toLowerCase()
        .indexOf(q) !== -1;
    }).slice(0, 120);

    if (!q) {
      results.innerHTML = '<div class="empty-state">输入片名、地区、类型或关键词开始搜索。</div>';
      return;
    }

    if (!list.length) {
      results.innerHTML = '<div class="empty-state">没有找到匹配内容，换个关键词再试。</div>';
      return;
    }

    results.innerHTML = list.map(function (movie) {
      return [
        '<article class="movie-card movie-card-wide">',
        '  <a class="wide-cover" href="' + movie.url + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="play-badge">▶</span>',
        '  </a>',
        '  <div class="wide-body">',
        '    <a href="' + movie.url + '" class="movie-title">' + escapeHtml(movie.title) + '</a>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="movie-meta">',
        '      <span>' + movie.year + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  };

  var escapeHtml = function (value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
    window.history.replaceState(null, '', url);
    render(query);
  });

  input.addEventListener('input', function () {
    render(input.value);
  });

  render(initial);
})();
