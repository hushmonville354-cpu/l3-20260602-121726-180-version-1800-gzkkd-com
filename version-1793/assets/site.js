(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement;
            var input = panel.querySelector("[data-search-input]");
            var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-select]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (input && query) {
                input.value = query;
            }

            function match(card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-category"),
                    card.textContent
                ].join(" ").toLowerCase();
                var term = input ? input.value.trim().toLowerCase() : "";
                if (term && haystack.indexOf(term) === -1) {
                    return false;
                }
                return selects.every(function (select) {
                    var field = select.getAttribute("data-filter-select");
                    var value = select.value;
                    if (!value) {
                        return true;
                    }
                    return (card.getAttribute("data-" + field) || "") === value;
                });
            }

            function apply() {
                cards.forEach(function (card) {
                    card.classList.toggle("is-hidden", !match(card));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        players.forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".play-overlay");
            var stream = shell.getAttribute("data-stream");
            var prepared = false;
            var hls = null;

            function prepare() {
                if (prepared || !video || !stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                prepared = true;
            }

            function play() {
                prepare();
                shell.classList.add("is-playing");
                if (button) {
                    button.setAttribute("hidden", "hidden");
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        shell.classList.remove("is-playing");
                        if (button) {
                            button.removeAttribute("hidden");
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    shell.classList.add("is-playing");
                });
            }
            window.addEventListener("beforeunload", function () {
                if (hls && hls.destroy) {
                    hls.destroy();
                }
            });
        });
    }

    onReady(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
