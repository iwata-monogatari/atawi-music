(function () {
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
