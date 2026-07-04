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

  function youtubeId(url) {
    var match = String(url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
    return match ? match[1] : "";
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

  function renderRecommend(currentSong, songs) {
    var pool = songs.filter(function(s) {
      return s.id !== currentSong.id && (!s.status || s.status === "published");
    });
    if (!pool.length) return;

    var sameArtist = pool.filter(function(s) { return s.artist === currentSong.artist; });
    var sameEra = pool.filter(function(s) { return s.decade === currentSong.decade; });
    
    var nextSong = null;
    if (sameArtist.length > 0) {
      nextSong = sameArtist[Math.floor(Math.random() * sameArtist.length)];
    } else if (sameEra.length > 0) {
      nextSong = sameEra[Math.floor(Math.random() * sameEra.length)];
    } else {
      nextSong = pool[Math.floor(Math.random() * pool.length)];
    }

    if (!nextSong) return;

    var ytId = youtubeId(nextSong.youtube_url);
    var thumbUrl = ytId ? 'https://i.ytimg.com/vi/' + e(ytId) + '/hqdefault.jpg' : '';
    var href = bp() + String(nextSong.article_url || "#").replace(/^\//, "");

    var html = '<div class="recommendation-area">' +
      '<h3>あなたへのおすすめの次の1曲</h3>' +
      '<a class="recommendation-card" href="' + e(href) + '">' +
      (thumbUrl ? '<img class="recommendation-thumb" src="' + thumbUrl + '" alt="" loading="lazy">' : '') +
      '<div class="recommendation-body">' +
      '<span class="recommendation-title">' + e(nextSong.title) + ' / ' + e(nextSong.artist) + '</span>' +
      '<span class="recommendation-desc">' + e(nextSong.summary || '') + '</span>' +
      '</div>' +
      '</a>' +
      '</div>';

    var div = document.createElement("div");
    div.innerHTML = html;
    mount.parentNode.insertBefore(div.firstChild, mount);
  }

  fetch(bp() + "data/songs.json", { cache: "no-cache" }).then(function(r) {
    if (!r.ok) throw Error("HTTP " + r.status);
    return r.json();
  }).then(function(d) {
    var songs = Array.isArray(d) ? d : d.songs || [];
    function baseName(p) {
      return String(p || "").split("/").filter(Boolean).pop().replace(/\.html$/i, "");
    }
    var file = baseName(location.pathname);
    var song = songs.filter(function(s) {
      return s.article_url && baseName(s.article_url) === file;
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
    renderRecommend(song, songs);
  }).catch(function() { mount.remove(); });
})();
