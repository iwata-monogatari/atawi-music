(function() {
  "use strict";

  // Fill these in once each program is approved, then redeploy — every article picks it up automatically.
  var CONFIG = {
    amazonAssociateTag: "fujigaokaserv-22",
    rakutenAffiliateId: "", // Rakuten affiliate ID, e.g. "12a34567.89abcdef.12a34567.89abcdef"
    rakutenMusicA8: {
      // A8.net program link is the same for every song (subscription signup, not per-track).
      href: "https://px.a8.net/svt/ejp?a8mat=4B7SGX+22F7EA+5WLM+5YRHE",
      pixel: "https://www12.a8.net/0.gif?a8mat=4B7SGX+22F7EA+5WLM+5YRHE"
    }
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

  function rakutenUrl(query) {
    var target = "https://search.rakuten.co.jp/search/mall/" + encodeURIComponent(query) + "/";
    if (!CONFIG.rakutenAffiliateId) return target;
    return "https://hb.afl.rakuten.co.jp/hgc/" + CONFIG.rakutenAffiliateId + "/?pc=" + encodeURIComponent(target);
  }

  function render(links) {
    if (!links.length) { mount.remove(); return; }
    var sponsored = links.some(function(l) { return l.sponsored; });
    var pixels = links.filter(function(l) { return l.pixel; }).map(function(l) {
      return '<img src="' + e(l.pixel) + '" alt="" width="1" height="1" style="border:0" loading="lazy">';
    }).join("");
    mount.innerHTML = '<strong>CD/音源を探す:</strong> <span class="streaming-buttons">' +
      links.map(function(l) {
        return '<a class="btn-gold btn-stream" href="' + e(l.href) + '" target="_blank" rel="noopener' + (l.sponsored ? ' sponsored' : '') + '">' + e(l.label) + "</a>";
      }).join("") +
      "</span>" + (sponsored ? '<span class="streaming-disclosure">(PR) 一部リンクはアフィリエイトプログラムを含みます</span>' : "") + pixels;
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
    var links = [
      { label: "Amazonで探す", href: amazonUrl(query), sponsored: !!CONFIG.amazonAssociateTag },
      { label: "楽天市場で探す", href: rakutenUrl(query), sponsored: !!CONFIG.rakutenAffiliateId }
    ];
    if (CONFIG.rakutenMusicA8 && CONFIG.rakutenMusicA8.href) {
      links.push({ label: "楽天ミュージックで聴く", href: CONFIG.rakutenMusicA8.href, pixel: CONFIG.rakutenMusicA8.pixel, sponsored: true });
    }
    render(links);
  }).catch(function() { mount.remove(); });
})();
