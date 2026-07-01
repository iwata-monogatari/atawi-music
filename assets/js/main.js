(function() {
  "use strict";

  var c = document.querySelector("[data-song-list]");
  if (!c) return;

  var af = document.querySelector("[data-artist-filters]");
  var ef = document.querySelector("[data-era-filters]");
  var st = document.querySelector("[data-status]");
  var active = { artist: "all", era: "all" };
  var kind = c.getAttribute("data-page-kind") || "archive";

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

  function filters(s) {
    if (af) {
      var as = uniq(s.map(function(x) { return x.artist; })).sort();
      af.innerHTML = btn("すべて", "artist", "all", true) + as.map(function(a) { return btn(a, "artist", a, false); }).join("");
    }
    if (ef) {
      var es = uniq(s.map(era)).sort();
      ef.innerHTML = btn("すべて", "era", "all", true) + es.map(function(a) { return btn(a, "era", a, false); }).join("");
    }
  }

  function youtubeLine(x) {
    return x.youtube_url ? '<a href="' + e(x.youtube_url) + '" target="_blank" rel="noopener">YouTube</a>' : "<span>公式リンク確認中</span>";
  }

  function pageNumber() {
    var q = new URLSearchParams(location.search);
    var n = Number(q.get("page") || 2);
    return n >= 2 ? Math.floor(n) : 2;
  }

  function pageHref(n) {
    return bp() + "articles/index.html" + (n > 2 ? "?page=" + n : "");
  }

  function paginate(v) {
    if (kind === "home") return { items: v.slice(0, 10), start: 0, page: 1, totalPages: Math.max(1, Math.ceil(Math.max(0, v.length - 10) / 20) + 1) };
    if (v.length <= 10) return { items: v, start: 0, page: 1, totalPages: 1 };
    var p = pageNumber();
    var start = 10 + (p - 2) * 20;
    return { items: v.slice(start, start + 20), start: start, page: p, totalPages: Math.max(2, Math.ceil((v.length - 10) / 20) + 1) };
  }

  function pager(meta) {
    if (meta.totalPages <= 1) return "";
    var html = '<nav class="pagination" aria-label="記事ページ">';
    if (kind !== "home") html += '<a class="btn-gold" href="' + e(bp() || "./") + '">1ページ目</a>';
    for (var i = 2; i <= meta.totalPages; i++) {
      html += '<a class="btn-gold' + (i === meta.page ? " is-active" : "") + '" href="' + e(pageHref(i)) + '">' + i + "ページ目</a>";
    }
    return html + "</nav>";
  }

  function render(s) {
    var v = s.filter(function(x) {
      return x.status === "published" && (active.artist === "all" || x.artist === active.artist) && (active.era === "all" || era(x) === active.era);
    });
    var meta = paginate(v);
    var end = Math.min(meta.start + meta.items.length, v.length);
    if (st) st.textContent = kind === "home" ? v.length + "件中" + meta.items.length + "件を表示" : v.length + "件中" + (meta.items.length ? meta.start + 1 : 0) + "-" + end + "件を表示";
    if (!meta.items.length) {
      c.innerHTML = '<p class="muted">該当する記事はまだありません。</p>' + pager(meta);
      return;
    }
    c.innerHTML = '<ul class="song-list">' + meta.items.map(function(x) {
      var href = bp() + String(x.article_url || "#").replace(/^\//, "");
      return '<li class="song-item"><div class="song-card"><a class="song-main" href="' + e(href) + '"><span class="song-title">' + e(x.title) + '</span><span class="song-detail">' + e(era(x)) + (x.release_year ? " / " + e(x.release_year) : "") + " / " + e(x.artist) + '</span><span class="song-note">' + e(x.summary || "") + '</span><span class="read-label">読む</span></a><div class="song-youtube"><strong>YouTube:</strong> ' + youtubeLine(x) + "</div></div></li>";
    }).join("") + "</ul>" + pager(meta);
  }

  function bind(s) {
    document.addEventListener("click", function(ev) {
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
        document.querySelectorAll('[data-filter-type="' + type + '"]').forEach(function(b) { b.classList.toggle("is-active", b === t); });
      }
      render(s);
    });
  }

  fetch(bp() + "data/songs.json", { cache: "no-cache" }).then(function(r) {
    if (!r.ok) throw Error("HTTP " + r.status);
    return r.json();
  }).then(function(d) {
    var s = (Array.isArray(d) ? d : d.songs || []).filter(function(x) { return x.status === "published"; });
    s.sort(function(a, b) { return (Number(b.release_year) || 0) - (Number(a.release_year) || 0); });
    filters(s);
    bind(s);
    render(s);
  }).catch(function() {
    c.innerHTML = '<p class="muted">記事データを読み込めませんでした。</p>';
  });
})();
