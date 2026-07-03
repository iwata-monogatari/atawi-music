(function() {
  "use strict";

  // Fill these in once each program is approved, then redeploy — every article picks it up automatically.
  var CONFIG = {
    amazonAssociateTag: "fujigaokaserv-22",
    appleAffiliateToken: "" // Apple Services Performance Partners token, e.g. "1000l3reua"
  };

  var mount = document.querySelector("[data-streaming-links]");
  if (!mount) return;

  function bp() {
    var p = location.pathname.split("/").filter(Boolean);
    if (p.length && /\.[a-z0-9]+$/i.test(p[p.length - 1])) p.pop();
    return p.map(function() { return ".."; }).join("/") + (p.length ? "/" : "");
  }

  function e(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function amazonUrl(query) {
    var url = "https://www.amazon.co.jp/s?k=" + encodeURIComponent(query);
    if (CONFIG.amazonAssociateTag) url += "&tag=" + encodeURIComponent(CONFIG.amazonAssociateTag);
    return url;
  }

  function appleUrl(trackViewUrl) {
    if (!CONFIG.appleAffiliateToken) return trackViewUrl;
    var sep = trackViewUrl.indexOf("?") >= 0 ? "&" : "?";
    return trackViewUrl + sep + "at=" + encodeURIComponent(CONFIG.appleAffiliateToken);
  }

  function render(links) {
    if (!links.length) { mount.remove(); return; }
    var sponsored = links.some(function(l) { return l.sponsored; });
    mount.innerHTML = '<strong>配信サイトで聴く:</strong> <span class="streaming-buttons">' +
      links.map(function(l) {
        return '<a class="btn-gold btn-stream" href="' + e(l.href) + '" target="_blank" rel="noopener' + (l.sponsored ? ' sponsored' : '') + '">' + e(l.label) + "</a>";
      }).join("") +
      "</span>" + (sponsored ? '<span class="streaming-disclosure">(PR) 一部リンクはアフィリエイトプログラムを含みます</span>' : "");
  }

  fetch(bp() + "data/songs.json", { cache: "no-cache" }).then(function(r) {
    if (!r.ok) throw Error("HTTP " + r.status);
    return r.json();
  }).then(function(d) {
    var songs = Array.isArray(d) ? d : d.songs || [];
    var file = location.pathname.split("/").filter(Boolean).pop();
    var song = songs.filter(function(s) {
      return s.article_url && s.article_url.split("/").filter(Boolean).pop() === file;
    })[0];
    if (!song) { mount.remove(); return; }

    var query = song.artist + " " + song.title;
    var links = [];

    fetch("https://itunes.apple.com/search?term=" + encodeURIComponent(query) + "&country=jp&media=music&entity=song&limit=3")
      .then(function(r) { return r.json(); })
      .then(function(d2) {
        var hit = (d2.results || [])[0];
        if (hit && hit.trackViewUrl) {
          links.push({ label: "Apple Musicで聴く", href: appleUrl(hit.trackViewUrl), sponsored: !!CONFIG.appleAffiliateToken });
        }
      })
      .catch(function() {})
      .then(function() {
        links.push({ label: "Amazonで探す", href: amazonUrl(query), sponsored: !!CONFIG.amazonAssociateTag });
        render(links);
      });
  }).catch(function() { mount.remove(); });
})();
