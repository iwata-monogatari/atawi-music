(function () {
  function loadFujigaokaAnalytics() {
    if (document.querySelector('script[data-fujigaoka-analytics="true"]')) return;
    var script = document.createElement("script");
    script.defer = true;
    script.src = "https://fujigaoka-analytics-worker.hiroyukio0122.workers.dev/tracker.js?v=20260711-2";
    script.setAttribute("data-site", "atawi-music");
    script.setAttribute("data-fujigaoka-analytics", "true");
    document.head.appendChild(script);
  }

  loadFujigaokaAnalytics();

  function setTracking(selector, eventName) {
    document.querySelectorAll(selector).forEach(function (element) {
      if (!element.hasAttribute("data-track-click")) {
        element.setAttribute("data-track-click", eventName);
      }
    });
  }

  function annotateTracking() {
    setTracking('a[href*="youtube.com"], a[href*="youtu.be"]', "youtube_click");
    setTracking(".song-main", "article_card_click");
    setTracking('.btn-random-encounter, a[href*="random=1"]', "random_song_click");
    setTracking('[data-filter-type="artist"]', "artist_filter");
    setTracking('[data-filter-type="era"]', "decade_filter");
    setTracking('[data-filter-type="theme"], [data-filter-type="themeGroup"], .mood-group-card', "mood_filter");
    setTracking('a[href^="/contact"], a[href*="/contact"]', "contact_transition");
  }

  annotateTracking();

  if (window.MutationObserver) {
    var trackingRefreshQueued = false;
    new MutationObserver(function () {
      if (trackingRefreshQueued) return;
      trackingRefreshQueued = true;
      window.requestAnimationFrame(function () {
        trackingRefreshQueued = false;
        annotateTracking();
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  function normalizeRandomEncounterLink() {
    var headerLinks = document.querySelector(".header-links");
    if (!headerLinks) {
      return;
    }

    var label = "\u2728 \u30e9\u30f3\u30c0\u30e0\u306b1\u66f2\u3068\u51fa\u4f1a\u3046";
    var items = headerLinks.querySelectorAll(".header-random-encounter");
    var first = items[0];
    var link;

    if (first && first.tagName.toLowerCase() === "a") {
      link = first;
    } else {
      link = document.createElement("a");
      link.className = "header-random-encounter";

      if (first) {
        first.replaceWith(link);
      } else {
        headerLinks.insertBefore(link, headerLinks.firstChild);
      }
    }

    link.href = "/?random=1";
    link.textContent = label;
    link.setAttribute("aria-label", "\u30e9\u30f3\u30c0\u30e0\u306b1\u66f2\u3068\u51fa\u4f1a\u3046");
    if (!link.hasAttribute("data-track-click")) {
      link.setAttribute("data-track-click", "random_song_click");
    }

    for (var index = 1; index < items.length; index += 1) {
      items[index].remove();
    }
  }

  function injectRandomEncounterLabel() {
    if (document.querySelector(".site-header .header-random-encounter")) {
      return;
    }

    var headerLinks = document.querySelector(".header-links");
    if (!headerLinks || headerLinks.querySelector(".header-random-encounter")) {
      return;
    }

    var span = document.createElement("span");
    span.className = "header-random-encounter";
    span.textContent = "✨ ランダムに1曲と出会う";
    headerLinks.insertBefore(span, headerLinks.firstChild);
  }

  normalizeRandomEncounterLink();

  var target = document.querySelector('[data-site-footer]');
  if (!target) return;

  fetch('/assets/partials/footer.html', { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error('Footer request failed');
      return response.text();
    })
    .then(function (html) {
      target.outerHTML = html;
    })
    .catch(function () {
      target.remove();
    });
})();
