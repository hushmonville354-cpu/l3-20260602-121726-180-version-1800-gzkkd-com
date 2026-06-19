function initMoviePlayer(src) {
  var video = document.querySelector('[data-player-video]');
  var cover = document.querySelector('[data-player-cover]');
  var button = document.querySelector('[data-player-button]');
  if (!video || !src) {
    return;
  }
  var loaded = false;
  var hlsInstance = null;

  function bind() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
    } else {
      video.src = src;
    }
  }

  function start() {
    bind();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.controls = true;
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }
  if (cover) {
    cover.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (!loaded || video.paused) {
      start();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
