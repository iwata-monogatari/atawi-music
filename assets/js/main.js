(function() {
  "use strict";

  var container = document.querySelector("[data-song-list]");
  if (!container) return;

  // ARTIST_FILTER_GUARD: 「歌手で選ぶ」は data-artist-filters から自動生成する。明示的な変更指示がない限り、artist-row付与、6列/5列、もっと見る/閉じる、URL復元を壊さないこと。
  var artistFilters = document.querySelector("[data-artist-filters]");
  var eraFilters = document.querySelector("[data-era-filters]");
  var status = document.querySelector("[data-status]");
  var searchBox = document.querySelector("[data-search-box]");
  var kind = container.getAttribute("data-page-kind") || "archive";
  var active = { artist: "all", era: "all", sort: "featured", q: "" };
  var artistKana = {};
  var ARTIST_VISIBLE_ROWS = 7;
  var ARTIST_COLUMNS_DESKTOP = 6;
  var ARTIST_COLUMNS_MOBILE = 5;
  var artistExpanded = false;

  (function initFromQuery() {
    var query = new URLSearchParams(location.search);
    active.artist = query.get("artist") || active.artist;
    active.era = query.get("era") || active.era;
    active.sort = query.get("sort") || active.sort;
    active.q = query.get("q") || active.q;
  })();

  function bp() {
    var parts = location.pathname.split("/").filter(Boolean);
    if (parts.length && /\.[a-z0-9]+$/i.test(parts[parts.length - 1])) parts.pop();
    return parts.map(function() { return ".."; }).join("/") + (parts.length ? "/" : "");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalize(value) {
    var text = String(value == null ? "" : value);
    if (text.normalize) text = text.normalize("NFKC");
    text = text.toLowerCase();
    var out = "";
    for (var i = 0; i < text.length; i++) {
      var code = text.charCodeAt(i);
      if (code >= 0x30a1 && code <= 0x30f6) code -= 0x60;
      out += String.fromCharCode(code);
    }
    return out.replace(/[\s　]+/g, "");
  }

  function artistList(song) {
    return song.artists && song.artists.length ? song.artists : [song.artist];
  }

  function era(song) {
    return song.decade || (song.release_year ? Math.floor(Number(song.release_year) / 10) * 10 + "年代" : "年代未設定");
  }

  function nameGroup(value) {
    var c = String(value || "").charAt(0);
    if (/[0-9]/.test(c)) return 2;
    if (/[A-Za-z]/.test(c)) return 1;
    return 0;
  }

  function artistKey(value) {
    return nameGroup(value) === 0 ? (artistKana[value] || value) : value;
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

  function unique(values) {
    return values.filter(function(value, index, array) {
      return value && array.indexOf(value) === index;
    });
  }

  function sortSongs(songs) {
    var list = songs.slice();
    if (active.sort === "release_desc") {
      return list.sort(function(a, b) { return (Number(b.release_year) || 0) - (Number(a.release_year) || 0) || compareFeatured(a, b); });
    }
    if (active.sort === "release_asc") {
      return list.sort(function(a, b) { return (Number(a.release_year) || 0) - (Number(b.release_year) || 0) || compareFeatured(a, b); });
    }
    if (active.sort === "created_desc") {
      return list.sort(function(a, b) { return compareText(b.created_at, a.created_at) || compareFeatured(a, b); });
    }
    if (active.sort === "artist") {
      return list.sort(function(a, b) {
        var ga = nameGroup(a.artist), gb = nameGroup(b.artist);
        if (ga !== gb) return ga - gb;
        return compareText(artistKey(a.artist), artistKey(b.artist)) || compareText(a.title, b.title);
      });
    }
    if (active.sort === "title") {
      return list.sort(function(a, b) { return compareText(a.title, b.title) || compareText(a.artist, b.artist); });
    }
    return list.sort(compareFeatured);
  }

  function artistColumnCount() {
    return window.matchMedia && window.matchMedia("(max-width: 720px)").matches ? ARTIST_COLUMNS_MOBILE : ARTIST_COLUMNS_DESKTOP;
  }

  // ARTIST_FILTER_GUARD: 選択中の歌手が隠れないように、折りたたみ/展開仕様を維持する。
  function layoutArtistRows() {
    if (!artistFilters) return;
    artistFilters.classList.add("artist-row");
    var chips = Array.prototype.slice.call(artistFilters.querySelectorAll(".chip"));
    var visibleLimit = (ARTIST_VISIBLE_ROWS * artistColumnCount()) - 1;
    if (chips.length <= visibleLimit + 1) return;

    var activeChip = artistFilters.querySelector(".chip.is-active");
    var activeIndex = chips.indexOf(activeChip);
    var activeHidden = activeIndex >= visibleLimit;
    if (activeHidden) artistExpanded = true;

    if (!artistExpanded) {
      chips.forEach(function(chip, index) {
        if (index >= visibleLimit) chip.classList.add("chip-hidden");
      });
    }

    var moreButton = document.createElement("button");
    moreButton.className = "chip chip-more";
    moreButton.type = "button";
    moreButton.setAttribute("data-action", artistExpanded ? "collapse-artists" : "expand-artists");
    moreButton.textContent = artistExpanded ? "閉じる" : "もっと見る";
    artistFilters.appendChild(moreButton);
  }

  function searchHaystack(song) {
    if (!song._haystack) {
      var parts = [song.title, song.artist, song.summary, song.release_year, artistKana[song.artist] || ""]
        .concat(song.artists || [], song.kana || []);
      song._haystack = normalize(parts.join(" "));
    }
    return song._haystack;
  }

  function matchesSearch(song) {
    if (!active.q) return true;
    var tokens = String(active.q).split(/[\s　]+/).filter(Boolean).map(normalize);
    if (!tokens.length) return true;
    var haystack = searchHaystack(song);
    return tokens.every(function(token) { return haystack.indexOf(token) !== -1; });
  }

  function button(label, type, value, isActive) {
    return '<button class="chip' + (isActive ? ' is-active' : '') + '" type="button" data-filter-type="' + escapeHtml(type) + '" data-filter-value="' + escapeHtml(value) + '"' + (type === "sort" ? ' aria-pressed="' + (isActive ? 'true' : 'false') + '"' : '') + '>' + escapeHtml(label) + '</button>';
  }

  function renderFilters(songs) {
    if (artistFilters) {
      var artists = unique(songs.reduce(function(acc, song) { return acc.concat(artistList(song)); }, []));
      artists.sort(function(a, b) {
        var ga = nameGroup(a), gb = nameGroup(b);
        if (ga !== gb) return ga - gb;
        return compareText(artistKey(a), artistKey(b));
      });
      artistFilters.innerHTML = button("すべて", "artist", "all", active.artist === "all") + artists.map(function(artist) {
        return button(artist, "artist", artist, active.artist === artist);
      }).join("");
      layoutArtistRows();
    }
    if (eraFilters) {
      var eras = unique(songs.map(era)).sort();
      eraFilters.innerHTML = button("すべて", "era", "all", active.era === "all") + eras.map(function(value) {
        return button(value, "era", value, active.era === value);
      }).join("");
    }
    document.querySelectorAll('[data-filter-type="sort"]').forEach(function(btn) {
      var isActive = btn.getAttribute("data-filter-value") === active.sort;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function queryParts() {
    var parts = [];
    if (active.q) parts.push("q=" + encodeURIComponent(active.q));
    if (active.artist !== "all") parts.push("artist=" + encodeURIComponent(active.artist));
    if (active.era !== "all") parts.push("era=" + encodeURIComponent(active.era));
    if (active.sort !== "featured") parts.push("sort=" + encodeURIComponent(active.sort));
    return parts;
  }

  function syncUrl() {
    var parts = queryParts();
    history.replaceState(null, "", location.pathname + (parts.length ? "?" + parts.join("&") : ""));
  }

  function pageHref() {
    var parts = queryParts();
    return bp() + "articles/" + (parts.length ? "?" + parts.join("&") : "");
  }

  function youtubeLine(song) {
    return song.youtube_url ? '<a href="' + escapeHtml(song.youtube_url) + '" target="_blank" rel="noopener">YouTube</a>' : '<span>公式リンク確認中</span>';
  }

  function youtubeId(url) {
    var match = String(url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
    return match ? match[1] : "";
  }

  function thumb(song) {
    var id = youtubeId(song.youtube_url);
    if (!id) return '<span class="song-thumb song-thumb-empty" aria-hidden="true"></span>';
    return '<span class="song-thumb"><img src="https://i.ytimg.com/vi/' + escapeHtml(id) + '/hqdefault.jpg" alt="" loading="lazy" width="480" height="360"></span>';
  }

  function card(song) {
    var href = bp() + String(song.article_url || "#").replace(/^\//, "");
    var star = song.recommended ? '<span class="song-star" aria-hidden="true">★</span>' : "";
    return '<li class="song-item"><div class="song-card"><a class="song-main" href="' + escapeHtml(href) + '">' + thumb(song) + '<span class="song-body"><span class="song-title">' + star + escapeHtml(song.title) + '</span><span class="song-detail">' + escapeHtml(era(song)) + (song.release_year ? ' / ' + escapeHtml(song.release_year) : '') + ' / ' + escapeHtml(song.artist) + '</span><span class="song-note">' + escapeHtml(song.summary || '') + '</span><span class="read-label">読む</span></span></a><div class="song-youtube"><strong>YouTube:</strong> ' + youtubeLine(song) + '</div></div></li>';
  }

  function filterSongs(songs) {
    return songs.filter(function(song) {
      return (active.artist === "all" || artistList(song).indexOf(active.artist) !== -1) &&
        (active.era === "all" || era(song) === active.era) &&
        matchesSearch(song);
    });
  }

  function render(songs) {
    var filtered = sortSongs(filterSongs(songs));
    var visible = kind === "home" ? filtered.slice(0, 10) : filtered;
    if (status) {
      status.textContent = kind === "home"
        ? filtered.length + "件中" + visible.length + "件を表示"
        : filtered.length + "件の記事を表示";
    }
    if (!visible.length) {
      container.innerHTML = '<p class="muted">該当する記事はまだありません。</p>';
      return;
    }
    container.innerHTML = '<ul class="song-list">' + visible.map(card).join("") + '</ul>' + (kind === "home" ? '<nav class="pagination" aria-label="記事ページ"><a class="btn-gold" href="' + escapeHtml(pageHref()) + '">すべての記事を見る</a></nav>' : "");
  }

  function bind(songs) {
    if (searchBox) {
      searchBox.value = active.q;
      var timer = null;
      searchBox.addEventListener("input", function() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function() {
          active.q = searchBox.value.trim();
          syncUrl();
          render(songs);
        }, 200);
      });
    }

    document.addEventListener("click", function(event) {
      var actionTarget = event.target.closest("[data-action]");
      if (actionTarget) {
        var action = actionTarget.getAttribute("data-action");
        if (action === "expand-artists" || action === "collapse-artists") {
          artistExpanded = action === "expand-artists";
          renderFilters(songs);
        }
        return;
      }
      var target = event.target.closest("[data-filter-type]");
      if (!target) return;
      var type = target.getAttribute("data-filter-type");
      var value = target.getAttribute("data-filter-value");
      active[type] = value;
      syncUrl();
      renderFilters(songs);
      render(songs);
    });

    if (window.matchMedia) {
      var resizeTimer = null;
      window.addEventListener("resize", function() {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
          renderFilters(songs);
        }, 120);
      });
    }
  }

  Promise.all([
    fetch(bp() + "data/search-index.json", { cache: "no-cache" }).then(function(response) {
      if (!response.ok) throw Error("HTTP " + response.status);
      return response.json();
    }).catch(function() {
      return fetch(bp() + "data/songs.json", { cache: "no-cache" }).then(function(response) {
        if (!response.ok) throw Error("HTTP " + response.status);
        return response.json();
      });
    }),
    fetch(bp() + "data/artists.json", { cache: "no-cache" }).then(function(response) {
      return response.ok ? response.json() : [];
    }).catch(function() { return []; })
  ]).then(function(results) {
    var rawSongs = results[0];
    var artists = results[1] || [];
    artists.forEach(function(artist) {
      if (artist.name && artist.kana) artistKana[artist.name] = artist.kana;
    });
    var songs = (Array.isArray(rawSongs) ? rawSongs : rawSongs.songs || []).filter(function(song) {
      return !song.status || song.status === "published";
    });
    songs = sortSongs(songs);
    renderFilters(songs);
    bind(songs);
    render(songs);
  }).catch(function() {
    container.innerHTML = '<p class="muted">記事データを読み込めませんでした。</p>';
  });
})();
