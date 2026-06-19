function setupVideoPlayer(config) {
  var video = document.getElementById('movie-player');
  var overlay = document.querySelector('[data-player-overlay]');
  var button = document.querySelector('[data-player-button]');
  var loaded = false;
  var hls = null;

  if (!video || !config || !config.url) {
    return;
  }

  function markReady() {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  function playVideo() {
    var result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  function loadVideo() {
    if (loaded) {
      playVideo();
      markReady();
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.url;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      playVideo();
      markReady();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(config.url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      markReady();
      return;
    }

    video.src = config.url;
    video.addEventListener('loadedmetadata', playVideo, { once: true });
    playVideo();
    markReady();
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      loadVideo();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      loadVideo();
    });
  }

  video.addEventListener('play', markReady);
  video.addEventListener('click', function () {
    if (!loaded) {
      loadVideo();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
