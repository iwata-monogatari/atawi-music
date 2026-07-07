(function() {
  "use strict";

  var container = document.querySelector("[data-song-list]");
  if (!container) return;

  // ARTIST_FILTER_GUARD: 「歌手で選ぶ」は data-artist-filters から自動生成する。明示的な変更指示がない限り、artist-row付与、6列/5列、もっと見る/閉じる、URL復元を壊さないこと。
  var artistFilters = document.querySelector("[data-artist-filters]");
  var eraFilters = document.querySelector("[data-era-filters]");
  var themeFilters = document.querySelector("[data-theme-filters]");
  var status = document.querySelector("[data-status]");
  var kind = container.getAttribute("data-page-kind") || "archive";
  var active = { artist: "all", era: "all", theme: "all", themeGroup: "all", sort: "created_desc" };
  var shouldPlayRandom = false;
  var themes = [];
  var artistKana = {};
  var ARTIST_VISIBLE_ROWS = 7;
  var ARTIST_COLUMNS_DESKTOP = 6;
  var ARTIST_COLUMNS_MOBILE = 3;
  var artistExpanded = false;
  // PAGINATION_GUARD: 2026-07-05に確定した仕様。index/articlesとも検索ボックスは廃止し、
  // 「次の20件を見る」ボタンで20件刻みに読み込む方式に統一済み。明示的な変更指示がない限り、
  // PAGE_SIZEの変更、「すべて見る」的な全件リンクの復活、キーワード検索UIの復元をしないこと。
  var PAGE_SIZE = 20;
  var visibleCount = PAGE_SIZE;

  (function initFromQuery() {
    var query = new URLSearchParams(location.search);
    active.artist = query.get("artist") || active.artist;
    active.era = query.get("era") || active.era;
    active.theme = query.get("theme") || active.theme;
    if (active.theme === "all" && query.get("mood")) active.theme = query.get("mood");
    active.themeGroup = query.get("themeGroup") || active.themeGroup;
    active.sort = query.get("sort") || active.sort;
    shouldPlayRandom = query.get("random") === "1";
  })();

  
  // MOOD_GROUPS_GUARD: 2026-07-05に確定した「今の気分から選ぶ」の仕様。明示的な変更指示がない限り、
  // タイトル（特に「街と人生を思い出す曲」「大人になって分かる曲」）・タグの絞り込み件数・並び順を変更／復元しないこと。
  var MOOD_GROUPS = [
    {
      id: "positive",
      title: "前を向きたい曲",
      subtitle: "プラス・回復・元気・行動系",
      tags: [
        "元気をもらえる曲",
        "前向きになれる曲",
        "仕事帰りに効く曲"
      ]
    },
    {
      id: "calm",
      title: "静かに整えたい曲",
      subtitle: "落ち着き・整理・休息系",
      tags: [
        "落ち着く曲",
        "雨の日に聴きたい曲"
      ]
    },
    {
      id: "night",
      title: "夜と孤独に寄り添う曲",
      subtitle: "寂しさ・喪失・内省系",
      tags: [
        "夜に残る曲",
        "孤独に寄り添う曲"
      ]
    },
    {
      id: "memory",
      title: "街と人生を思い出す曲",
      subtitle: "記憶・青春・街・東京系",
      tags: [
        "東京の記憶",
        "青春を思い出す曲"
      ]
    },
    {
      id: "philosophy",
      title: "大人になって分かる曲",
      subtitle: "哲学・人生・成熟・再解釈系",
      tags: [
        "大人になって分かる曲",
        "歌詞が刺さる曲"
      ]
    }
  ];

  function matchesThemeGroup(song, themeGroupId) {
    var group = MOOD_GROUPS.find(function(g) { return g.id === themeGroupId; });
    if (!group) return true;
    return group.tags.some(function(tagName) {
      var keywords = themeKeywords[tagName];
      if (!keywords) return false;
      var text = normalize((song.title || "") + " " + (song.artist || "") + " " + (song.summary || ""));
      return keywords.some(function(kw) {
        return text.indexOf(normalize(kw)) !== -1;
      });
    });
  }

  var themeKeywords = {
    "東京で頑張っていた頃": ["東京"],
    "夜に残る曲": ["夜", "深夜"],
    "仕事帰りに効く曲": ["仕事", "帰り", "働く", "職場", "通勤"],
    "大人になって分かる曲": ["大人", "歳", "年齢", "時代"],
    "作業効率が上がる曲": ["ビート", "テンポ", "集中", "作業", "リズム"],
    "落ち着く曲": ["落ち着く", "静か", "癒し", "バラード"],
    "元気をもらえる曲": ["元気", "前向き", "勇気", "力", "背中"],
    "街を思い出す曲": ["街", "都会", "景色", "風景"],
    "家や記憶につながる曲": ["家", "記憶", "思い出", "歴史", "土地", "実家", "家族"],
    "過去をさかのぼり今を聴く曲": ["過去", "今", "さかのぼり", "現在"],
    "東京の記憶": ["東京", "都会"],
    "会えない人を思い出す曲": ["会えない", "遠い", "届かない", "恋人", "別れ", "サヨナラ", "さよなら"],
    "青春を思い出す曲": ["青春", "若い", "学生", "学校", "友達", "部活", "あの頃"],
    "孤独に寄り添う曲": ["孤独", "一人", "ひとり", "寂しい", "夜", "静か"],
    "旅に出たくなる曲": ["旅", "風", "空", "海", "どこか", "遠く", "ドライブ"],
    "雨の日に聴きたい曲": ["雨", "傘", "水たまり", "しずく", "レイン"],
    "季節の変わり目に聴く曲": ["春", "夏", "秋", "冬", "風", "季節", "桜", "雪"],
    "日曜日を静かに過ごす曲": ["休み", "日曜日", "静か", "朝", "コーヒー", "ゆったり"],
    "懐かしい風を感じる曲": ["懐かしい", "風", "記憶", "子供", "昔"],
    "前を向いて歩くための曲": ["前向き", "歩く", "進む", "未来", "希望", "力", "勇気"],
    "心を整理したい時の曲": ["整理", "心", "静か", "涙", "見つめる"],
    "海や空を眺めながら聴く曲": ["海", "空", "青", "波", "風", "水平線"],
    "誰かの幸せを願う曲": ["幸せ", "願う", "愛", "君", "祈る"],
    "自分の原点に立ち返る曲": ["原点", "昔", "子供", "親", "故郷", "地元"],
    "前向きになれる曲": ["前向き", "進む", "未来", "希望", "勇気", "背中"],
    "歌詞が刺さる曲": ["歌詞", "刺さる", "刺さった", "染みる", "言葉"]
  };

  function matchesTheme(song) {
    if (active.theme === "all") return true;
    var keywords = themeKeywords[active.theme];
    if (!keywords) return true;
    var text = normalize((song.title || "") + " " + (song.artist || "") + " " + (song.summary || ""));
    return keywords.some(function(kw) {
      return text.indexOf(normalize(kw)) !== -1;
    });
  }

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
    if (themeFilters) {
      var htmlContent = "";
      var resetActive = (active.themeGroup === "all" && active.theme === "all");
      
      
      if (kind === "home") {
        htmlContent += '<div class="mood-group-list">';
        htmlContent += '<a class="mood-group-card mood-card-all' + (resetActive ? ' is-active' : '') + '" href="/articles/">' +
          '<span class="mood-group-title">すべての曲</span>' +
          '<span class="mood-group-subtitle">' + songs.length + '件の音楽考察</span>' +
          '</a>';
        MOOD_GROUPS.forEach(function(group) {
          var isActive = active.themeGroup === group.id;
          var links = (group.links || group.tags || []).map(function(link) {
            var label = typeof link === "string" ? link : link.label;
            var value = typeof link === "string" ? link : link.theme;
            return '<a href="/articles/?mood=' + encodeURIComponent(value) + '">' + escapeHtml(label) + '</a>';
          }).join("");
          htmlContent += '<div class="mood-group-card' + (isActive ? ' is-active' : '') + '">' +
            '<span class="mood-group-title">' + escapeHtml(group.title) + '</span>' +
            '<span class="mood-group-subtitle">' + escapeHtml(group.subtitle) + '</span>' +
            (links ? '<div class="mood-link-list">' + links + '</div>' : '') +
            '</div>';
        });
        htmlContent += '</div>';
      } else {
        htmlContent += '<h4 class="filter-subheading">大きく選ぶ</h4>';
        htmlContent += '<div class="mood-group-list">';
        MOOD_GROUPS.forEach(function(group) {
          var isActive = active.themeGroup === group.id;
          htmlContent += '<button class="mood-group-card' + (isActive ? ' is-active' : '') + '" type="button" data-filter-type="themeGroup" data-filter-value="' + escapeHtml(group.id) + '">' +
            '<span class="mood-group-title">' + escapeHtml(group.title) + '</span>' +
            '<span class="mood-group-subtitle">' + escapeHtml(group.subtitle) + '</span>' +
            '</button>';
        });
        htmlContent += '</div>';
        
        htmlContent += '<h4 class="filter-subheading">細かく選ぶ</h4>';
        htmlContent += '<div class="chip-row">';
        themes.forEach(function(value) {
          var isActive = active.theme === value;
          htmlContent += button(value, "theme", value, isActive);
        });
        htmlContent += '</div>';
      }
      themeFilters.innerHTML = htmlContent;
    }
    document.querySelectorAll('[data-filter-type="sort"]').forEach(function(btn) {
      var isActive = btn.getAttribute("data-filter-value") === active.sort;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function queryParts() {
    var parts = [];
    if (active.artist !== "all") parts.push("artist=" + encodeURIComponent(active.artist));
    if (active.era !== "all") parts.push("era=" + encodeURIComponent(active.era));
    if (active.themeGroup !== "all") parts.push("themeGroup=" + encodeURIComponent(active.themeGroup));
    if (active.theme !== "all") parts.push("theme=" + encodeURIComponent(active.theme));
    if (active.sort !== "created_desc") parts.push("sort=" + encodeURIComponent(active.sort));
    return parts;
  }

  function syncUrl() {
    var parts = queryParts();
    history.replaceState(null, "", location.pathname + (parts.length ? "?" + parts.join("&") : ""));
  }

  function youtubeLine(song) {
    return song.youtube_url ? '<a href="' + escapeHtml(song.youtube_url) + '" target="_blank" rel="noopener">YouTube</a>' : '<span>公式リンク確認中</span>';
  }

  function toStars(n) {
    var filled = Math.max(0, Math.min(5, Number(n) || 0));
    return "★".repeat(filled) + "☆".repeat(5 - filled);
  }

  var SELECTION_LABEL = { song: "曲がいい", lyrics: "歌詞がいい", mv: "MVがいい" };

  function selectionBlock(song) {
    var r = song.rating;
    if (!r || !r.selection || r[r.selection] == null) return "";
    var label = SELECTION_LABEL[r.selection];
    if (!label) return "";
    return '<div class="card-selection"><span class="card-selection-label">' + escapeHtml(label) + '</span><span class="card-selection-stars">' + toStars(r[r.selection]) + '</span></div>';
  }

  function ratingLine(song) {
    var r = song.rating;
    if (!r) return "";
    var parts = [];
    if (r.song != null) parts.push("曲：" + toStars(r.song));
    if (r.lyrics != null) parts.push("歌詞：" + toStars(r.lyrics));
    if (r.mv != null) parts.push("MV：" + toStars(r.mv));
    if (!parts.length) return "";
    return '<span class="song-rating">' + escapeHtml(parts.join("　")) + '</span>';
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
    return '<li class="song-item"><div class="song-card"><a class="song-main" href="' + escapeHtml(href) + '">' + thumb(song) + '<span class="song-body"><span class="song-title">' + star + escapeHtml(song.title) + '</span><span class="song-detail">' + escapeHtml(era(song)) + (song.release_year ? ' / ' + escapeHtml(song.release_year) : '') + ' / ' + escapeHtml(song.artist) + '</span><span class="song-note">' + escapeHtml(song.summary || '') + '</span><span class="read-label">読む</span></span>' + selectionBlock(song) + '</a><div class="song-youtube"><span class="song-youtube-link"><strong>YouTube:</strong> ' + youtubeLine(song) + '</span>' + ratingLine(song) + '</div></div></li>';
  }

  function filterSongs(songs) {
    return songs.filter(function(song) {
      return (active.artist === "all" || artistList(song).indexOf(active.artist) !== -1) &&
        (active.era === "all" || era(song) === active.era) &&
        matchesTheme(song);
    });
  }

  // SORT_BUTTONS_GUARD: デフォルトは新着順（created_desc）。掲載順・新着順の切り替えは
  // ページ最下部の簡易ソート（miniSort、次の20件を見るボタンの右側）としてのみ復活済み。
  function miniSort() {
    var opts = [["featured", "掲載順"], ["created_desc", "新着順"]];
    return '<span class="mini-sort" role="group" aria-label="並び順(簡易)">' + opts.map(function(o) {
      var isActive = active.sort === o[0];
      return '<button class="chip chip-mini' + (isActive ? " is-active" : "") + '" type="button" data-filter-type="sort" data-filter-value="' + o[0] + '" aria-pressed="' + (isActive ? "true" : "false") + '">' + o[1] + "</button>";
    }).join("") + "</span>";
  }

  function render(songs) {
    var filtered = sortSongs(filterSongs(songs));
    var visible = filtered.slice(0, visibleCount);
    if (status) {
      status.textContent = filtered.length + "件中" + visible.length + "件を表示";
    }
    if (!visible.length) {
      container.innerHTML = '<p class="muted">該当する記事はまだありません。</p>';
      return;
    }
    var showMoreButton = visibleCount < filtered.length
      ? '<button class="btn-gold" type="button" data-action="show-more">次の20件を見る</button>'
      : "";
    container.innerHTML = '<ul class="song-list">' + visible.map(card).join("") + '</ul><nav class="pagination" aria-label="記事ページ">' + showMoreButton + miniSort() + '</nav>';
  }

  function bind(songs) {
    document.addEventListener("click", function(event) {
      var actionTarget = event.target.closest("[data-action]");
      if (actionTarget) {
        var action = actionTarget.getAttribute("data-action");
        if (action === "expand-artists" || action === "collapse-artists") {
          artistExpanded = action === "expand-artists";
          renderFilters(songs);
        } else if (action === "show-more") {
          visibleCount += PAGE_SIZE;
          render(songs);
        }
        return;
      }
      var target = event.target.closest("[data-filter-type]");
      if (!target) return;
      var type = target.getAttribute("data-filter-type");
      var value = target.getAttribute("data-filter-value");
      active[type] = value;
      visibleCount = PAGE_SIZE;
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
    }).catch(function() { return []; }),
    fetch(bp() + "data/themes.json", { cache: "no-cache" }).then(function(response) {
      return response.ok ? response.json() : [];
    }).catch(function() { return []; })
  ]).then(function(results) {
    var rawSongs = results[0];
    var artists = results[1] || [];
    themes = results[2] || [];
    artists.forEach(function(artist) {
      if (artist.name && artist.kana) artistKana[artist.name] = artist.kana;
    });
    var songs = (Array.isArray(rawSongs) ? rawSongs : rawSongs.songs || []).filter(function(song) {
      return !song.status || song.status === "published";
    });
    songs = sortSongs(songs);
    window.playRandomSong = function() {
      if (!songs || !songs.length) return;
      var randomSong = songs[Math.floor(Math.random() * songs.length)];
      var href = bp() + String(randomSong.article_url || "#").replace(/^\//, "");
      window.location.href = href;
    };
    if (shouldPlayRandom) {
      window.playRandomSong();
      return;
    }
    renderFilters(songs);
    bind(songs);
    render(songs);
  }).catch(function() {
    container.innerHTML = '<p class="muted">記事データを読み込めませんでした。</p>';
  });
})();
