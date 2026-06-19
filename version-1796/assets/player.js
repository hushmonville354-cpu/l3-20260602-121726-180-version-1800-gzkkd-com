(function () {
  function setup(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var source = player.getAttribute('data-src');
    var hls = null;
    var ready = false;

    function load() {
      if (!video || !source) {
        return;
      }
      if (!ready) {
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', load);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          load();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.js-player')).forEach(setup);
})();
