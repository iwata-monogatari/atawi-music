(function () {
  function loadFujigaokaAnalytics() {
    if (document.querySelector('script[data-fujigaoka-analytics="true"]')) return;
    var script = document.createElement("script");
    script.defer = true;
    script.src = "https://fujigaoka-analytics-worker.hiroyukio0122.workers.dev/tracker.js";
    script.setAttribute("data-site", "atawi-music");
    script.setAttribute("data-fujigaoka-analytics", "true");
    document.head.appendChild(script);
  }

  loadFujigaokaAnalytics();
  function injectRandomEncounterLabel() {
    var headerLinks = document.querySelector(".header-links");
    if (!headerLinks || headerLinks.querySelector(".header-random-encounter")) {
      return;
    }

    var span = document.createElement("span");
    span.className = "header-random-encounter";
    span.textContent = "✨ ランダムに1曲と出会う";
    headerLinks.insertBefore(span, headerLinks.firstChild);
  }

  injectRandomEncounterLabel();

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