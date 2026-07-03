(function() {
  "use strict";

  var c = document.querySelector("[data-song-list]");
  if (!c) return;

  var af = document.querySelector("[data-artist-filters]");
  var ef = document.querySelector("[data-era-filters]");
  var st = document.querySelector("[data-status]");
  var active = { artist: "all", era: "all", sort: "featured" };
  var kind = c.getAttribute("data-page-kind") || "archive";
  var artistKana = {};
  var ARTIST_VISIBLE_ROWS = 7;
  var artistExpanded = false;

  (function initFromQuery() {
    var q = new URLSearchParams(location.search);
    var a = q.get("artist"); if (a) active.artist = a;
    var er = q.get("era"); if (er) active.era = er;
    var so = q.get("sort"); if (so) active.sort = so;
  })();

  function bp() {
    var p = location.pathname.split("/").filter(Boolean);
    if (p.length && /\.[a-z0-9]+$/i.test(p[p.length - 1])) p.pop();
    return p.map(function() { return ".."; }).join("/") + (p.length ? "/" : "");
  }

  function e(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function era(s) {
    return s.decade || (s.release_year ? Math.floor(Number(s.release_year) / 10) * 10 + "年代" : "年代未設定");
  }

  function btn(l, t, v, a) {
    return '<button class="chip' + (a ? " is-active" : "") + '" type="button" data-filter-type="' + e(t) + '" data-filter-value="' + e(v) + '">' + e(l) + "</button>";
  }

  function uniq(a) {
    return a.filter(function(v, i, r) { return v && r.indexOf(v) === i; });
  }

  function artistList(x) {
    return (x.artists && x.artists.length) ? x.artists : [x.artist];
  }

  function nameGroup(v) {
    var c = String(v || "").charAt(0);
    if (/[0-9]/.test(c)) return 2;
    if (/[A-Za-z]/.test(c)) return 1;
    return 0;
  }

  function artistKey(v) {
    return nameGroup(v) === 0 ? (artistKana[v] || v) : v;
  }

  function sortArtistNames(a) {
    return a.slice().sort(function(x, y) {
      var gx = nameGroup(x), gy = nameGroup(y);
      return gx !== gy ? gx - gy : compareText(artistKey(x), artistKey(y));
    });
  }

  function layoutArtistRows() {
    if (!af) return;
    var chips = Array.prototype.slice.call(af.querySelectorAll(".chip"));
    var tops = [];
    chips.forEach(function(c) {
      if (tops.indexOf(c.offsetTop) === -1) tops.push(c.offsetTop);
    });
    tops.sort(function(a, b) { return a - b; });
    if (tops.length <= ARTIST_VISIBLE_ROWS) return;

    var cutoffTop = tops[ARTIST_VISIBLE_ROWS];
    var activeChip = af.querySelector(".chip.is-active");
    var activeHidden = !!activeChip && activeChip.offsetTop >= cutoffTop;
    var moreBtn = document.createElement("button");
    moreBtn.className = "chip chip-more";
    moreBtn.type = "button";

    if (artistExpanded || activeHidden) {
      moreBtn.setAttribute("data-action", "collapse-artists");
      moreBtn.textContent = "閉じる";
      af.appendChild(moreBtn);
      return;
    }

    var visibleChips = [];
    chips.forEach(function(c) {
      if (c.offsetTop >= cutoffTop) c.classList.add("chip-hidden");
      else visibleChips.push(c);
    });
    moreBtn.setAttribute("data-action", "expand-artists");
    moreBtn.textContent = "もっと見る";
    af.appendChild(moreBtn);

    var lastRowTop = tops[ARTIST_VISIBLE_ROWS - 1];
    var guard = 0;
    while (moreBtn.offsetTop > lastRowTop && visibleChips.length && guard < visibleChips.length) {
      visibleChips.pop().classList.add("chip-hidden");
      guard++;
    }
  }

  function filters(s) {
    if (af) {
      var as = sortArtistNames(uniq(s.reduce(function(acc, x) { return acc.concat(artistList(x)); }, [])));
      af.innerHTML = btn("すべて", "artist", "all", active.artist === "all") + as.map(function(a) { return btn(a, "artist", a, a === active.artist); }).join("");
      layoutArtistRows();
    }
    if (ef) {
      var es = uniq(s.map(era)).sort();
      ef.innerHTML = btn("すべて", "era", "all", active.era === "all") + es.map(function(a) { return btn(a, "era", a, a === active.era); }).join("");
    }
    document.querySelectorAll('[data-filter-type="sort"]').forEach(function(b) {
      var isActive = b.getAttribute("data-filter-value") === active.sort;
      b.classList.toggle("is-active", isActive);
      b.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function filterQueryParts() {
    var parts = [];
    if (active.artist !== "all") parts.push("artist=" + encodeURIComponent(active.artist));
    if (active.era !== "all") parts.push("era=" + encodeURIComponent(active.era));
    if (active.sort !== "featured") parts.push("sort=" + encodeURIComponent(active.sort));
    return parts;
  }

  function syncUrl() {
    var qs = filterQueryParts();
    var url = location.pathname + (qs.length ? "?" + qs.join("&") : "");
    history.replaceState(null, "", url);
  }

  function youtubeLine(x) {
    return x.youtube_url ? '<a href="' + e(x.youtube_url) + '" target="_blank" rel="noopener">YouTube</a>' : "<span>公式リンク確認中</span>";
  }

  function ytId(url) {
    var m = String(url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
    return m ? m[1] : "";
  }

  function thumbBlock(x) {
    var id = ytId(x.youtube_url);
    if (!id) return '<span class="song-thumb song-thumb-empty" aria-hidden="true"></span>';
    return '<span class="song-thumb"><img src="https://i.ytimg.com/vi/' + e(id) + '/hqdefault.jpg" alt="" loading="lazy" width="480" height="360"></span>';
  }

  function compareText(a, b) {
    return String(a || "").localeCompare(String(b || ""), "ja");
  }

  function compareFeatured(a, b) {
    var ao = Number(a.featured_order) || 9999;
    var bo = Number(b.featured_order) || 9999;
    if (ao !== bo) return ao - bo;
    return compareText(a.title, b.title);
  }

  function sortSongs(s) {
    var v = s.slice();
    if (active.sort === "release_desc") {
      return v.sort(function(a, b) { return (Number(b.release_year) || 0) - (Number(a.release_year) || 0) || compareFeatured(a, b); });
    }
    if (active.sort === "release_asc") {
      return v.sort(function(a, b) { return (Number(a.release_year) || 0) - (Number(b.release_year) || 0) || compareFeatured(a, b); });
    }
    if (active.sort === "created_desc") {
      return v.sort(function(a, b) { return compareText(b.created_at, a.created_at) || compareFeatured(a, b); });
    }
    if (active.sort === "artist") {
      return v.sort(function(a, b) {
        var ga = nameGroup(a.artist), gb = nameGroup(b.artist);
        if (ga !== gb) return ga - gb;
        return compareText(artistKey(a.artist), artistKey(b.artist)) || compareText(a.title, b.title);
      });
    }
    if (active.sort === "title") {
      return v.sort(function(a, b) { return compareText(a.title, b.title) || compareText(a.artist, b.artist); });
    }
    return v.sort(compareFeatured);
  }

  function pageNumber() {
    var q = new URLSearchParams(location.search);
    if (active.sort !== "featured") {
      var n0 = Number(q.get("page"));
      return n0 >= 1 ? Math.floor(n0) : 1;
    }
    var n = Number(q.get("page") || 2);
    return n >= 2 ? Math.floor(n) : 2;
  }

  function pageHref(n) {
    var parts = filterQueryParts();
    var needsPage = active.sort !== "featured" ? n > 1 : n > 2;
    if (needsPage) parts.push("page=" + n);
    return bp() + "articles/index.html" + (parts.length ? "?" + parts.join("&") : "");
  }

  function homeHref() {
    var parts = filterQueryParts();
    return (bp() || "./") + (parts.length ? "?" + parts.join("&") : "");
  }

  function paginate(v) {
    if (kind === "home") return { items: v.slice(0, 10), start: 0, page: 1, totalPages: Math.max(1, Math.ceil(Math.max(0, v.length - 10) / 20) + 1) };
    if (active.sort !== "featured") {
      if (v.length <= 20) return { items: v, start: 0, page: 1, totalPages: 1 };
      var p1 = pageNumber();
      var start1 = (p1 - 1) * 20;
      return { items: v.slice(start1, start1 + 20), start: start1, page: p1, totalPages: Math.max(1, Math.ceil(v.length / 20)) };
    }
    if (v.length <= 10) return { items: v, start: 0, page: 1, totalPages: 1 };
    var p = pageNumber();
    var start = 10 + (p - 2) * 20;
    return { items: v.slice(start, start + 20), start: start, page: p, totalPages: Math.max(2, Math.ceil((v.length - 10) / 20) + 1) };
  }

  function miniSort() {
    var opts = [["featured", "掲載順"], ["created_desc", "新着順"]];
    return '<span class="mini-sort" role="group" aria-label="並び順(簡易)">' + opts.map(function(o) {
      var isActive = active.sort === o[0];
      return '<button class="chip chip-mini' + (isActive ? " is-active" : "") + '" type="button" data-filter-type="sort" data-filter-value="' + o[0] + '" aria-pressed="' + (isActive ? "true" : "false") + '">' + o[1] + "</button>";
    }).join("") + "</span>";
  }

  function pager(meta) {
    if (meta.totalPages <= 1) return "";
    var links;
    if (kind === "home") {
      links = '<a class="btn-gold" href="' + e(pageHref(active.sort !== "featured" ? 1 : 2)) + '">11件目以降を読む</a>';
    } else if (active.sort !== "featured") {
      links = "";
      for (var j = 1; j <= meta.totalPages; j++) {
        links += '<a class="btn-gold' + (j === meta.page ? " is-active" : "") + '" href="' + e(pageHref(j)) + '">' + j + "ページ目</a>";
      }
    } else {
      links = '<a class="btn-gold" href="' + e(homeHref()) + '">トップの10件へ</a>';
      for (var i = 2; i <= meta.totalPages; i++) {
        links += '<a class="btn-gold' + (i === meta.page ? " is-active" : "") + '" href="' + e(pageHref(i)) + '">' + i + "ページ目</a>";
      }
    }
    return '<nav class="pagination" aria-label="記事ページ"><span class="pagination-links">' + links + "</span>" + miniSort() + "</nav>";
  }

  function render(s) {
    var v = s.filter(function(x) {
      return x.status === "published" && (active.artist === "all" || artistList(x).indexOf(active.artist) !== -1) && (active.era === "all" || era(x) === active.era);
    });
    v = sortSongs(v);
    var meta = paginate(v);
    var end = Math.min(meta.start + meta.items.length, v.length);
    if (st) st.textContent = kind === "home" ? v.length + "件中" + meta.items.length + "件を表示" : v.length + "件中" + (meta.items.length ? meta.start + 1 : 0) + "-" + end + "件を表示";
    if (!meta.items.length) {
      c.innerHTML = '<p class="muted">該当する記事はまだありません。</p>' + pager(meta);
      return;
    }
    c.innerHTML = '<ul class="song-list">' + meta.items.map(function(x) {
      var href = bp() + String(x.article_url || "#").replace(/^\//, "");
      return '<li class="song-item"><div class="song-card"><a class="song-main" href="' + e(href) + '">' + thumbBlock(x) + '<span class="song-body"><span class="song-title">' + e(x.title) + '</span><span class="song-detail">' + e(era(x)) + (x.release_year ? " / " + e(x.release_year) : "") + " / " + e(x.artist) + '</span><span class="song-note">' + e(x.summary || "") + '</span><span class="read-label">読む</span></span></a><div class="song-youtube"><strong>YouTube:</strong> ' + youtubeLine(x) + "</div></div></li>";
    }).join("") + "</ul>" + pager(meta);
  }

  function bind(s) {
    document.addEventListener("click", function(ev) {
      var toggle = ev.target.closest("[data-action]");
      if (toggle) {
        var action = toggle.getAttribute("data-action");
        if (action === "expand-artists" || action === "collapse-artists") {
          artistExpanded = action === "expand-artists";
          filters(s);
        }
        return;
      }
      var t = ev.target.closest("[data-filter-type]");
      if (!t) return;
      var type = t.getAttribute("data-filter-type");
      var val = t.getAttribute("data-filter-value");
      if (type === "all") {
        active.artist = "all";
        active.era = "all";
        document.querySelectorAll("[data-filter-type]").forEach(function(b) { b.classList.toggle("is-active", b.getAttribute("data-filter-value") === "all"); });
      } else {
        active[type] = val;
        document.querySelectorAll('[data-filter-type="' + type + '"]').forEach(function(b) {
          var isActive = b === t;
          b.classList.toggle("is-active", isActive);
          if (type === "sort") b.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
      }
      syncUrl();
      render(s);
    });
  }

  Promise.all([
    fetch(bp() + "data/songs.json", { cache: "no-cache" }).then(function(r) {
      if (!r.ok) throw Error("HTTP " + r.status);
      return r.json();
    }),
    fetch(bp() + "data/artists.json", { cache: "no-cache" }).then(function(r) {
      return r.ok ? r.json() : [];
    }).catch(function() { return []; })
  ]).then(function(results) {
    var d = results[0];
    (results[1] || []).forEach(function(a) { if (a.name && a.kana) artistKana[a.name] = a.kana; });
    var s = (Array.isArray(d) ? d : d.songs || []).filter(function(x) { return x.status === "published"; });
    s = sortSongs(s);
    filters(s);
    bind(s);
    render(s);
  }).catch(function() {
    c.innerHTML = '<p class="muted">記事データを読み込めませんでした。</p>';
  });
})();
