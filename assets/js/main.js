(function () {
  "use strict";

  var container = document.querySelector("[data-song-list]");
  if (!container) return;

  var artistFilters = document.querySelector("[data-artist-filters]");
  var eraFilters = document.querySelector("[data-era-filters]");
  var status = document.querySelector("[data-status]");
  var active = { artist: "all", era: "all" };

  function basePath() {
    var path = window.location.pathname;
    var parts = path.split("/").filter(Boolean);
    if (parts.length && /\.[a-z0-9]+$/i.test(parts[parts.length - 1])) parts.pop();
    return parts.map(function () { return ".."; }).join("/") + (parts.length ? "/" : "");
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeEra(song) {
    if (song.decade) return song.decade;
    var year = Number(song.release_year || song.year);
    if (!year) return "年代未設定";
    return Math.floor(year / 10) * 10 + "年代";
  }

  function songYear(song) {
    return song.release_year || song.year || "";
  }

  function songSummary(song) {
    if (song.summary) return song.summary;
    if (Array.isArray(song.personal_context)) return song.personal_context[0] || "";
    return song.personal_context || "";
  }

  function songHref(song) {
    return song.article_url ? basePath() + song.article_url.replace(/^\//, "") : "#";
  }

  function button(label, type, value, isActive) {
    return '<button class="chip' + (isActive ? " is-active" : "") + '" type="button" data-filter-type="' +
      esc(type) + '" data-filter-value="' + esc(value) + '">' + esc(label) + "</button>";
  }

  function unique(values) {
    return values.filter(function (value, index, array) {
      return value && array.indexOf(value) === index;
    });
  }

  function renderFilters(songs) {
    if (artistFilters) {
      var artists = unique(songs.map(function (song) { return song.artist; })).sort();
      artistFilters.innerHTML = button("すべて", "artist", "all", true) +
        artists.map(function (artist) { return button(artist, "artist", artist, false); }).join("");
    }

    if (eraFilters) {
      var eras = unique(songs.map(normalizeEra)).sort();
      eraFilters.innerHTML = button("すべて", "era", "all", true) +
        eras.map(function (era) { return button(era, "era", era, false); }).join("");
    }
  }

  function renderSongs(songs) {
    var visible = songs.filter(function (song) {
      return song.status !== "hidden" &&
        (active.artist === "all" || song.artist === active.artist) &&
        (active.era === "all" || normalizeEra(song) === active.era);
    });

    if (status) status.textContent = visible.length + "件を表示";

    if (!visible.length) {
      container.innerHTML = '<p class="muted">該当する曲はまだありません。</p>';
      return;
    }

    container.innerHTML = '<ul class="song-list">' + visible.map(function (song) {
      return '<li class="song-item" data-artist="' + esc(song.artist) + '" data-era="' + esc(normalizeEra(song)) + '">' +
        '<a class="song-link" href="' + esc(songHref(song)) + '">' +
        '<span class="song-title">' + esc(song.title) + '</span>' +
        '<span class="song-detail">' + esc(normalizeEra(song)) + (songYear(song) ? " / " + esc(songYear(song)) : "") + " / " + esc(song.artist) + '</span>' +
        '<span class="song-note">' + esc(songSummary(song)) + '</span>' +
        '<span class="read-label">読む</span>' +
        '</a></li>';
    }).join("") + "</ul>";
  }

  function bindFilters(songs) {
    document.addEventListener("click", function (event) {
      var target = event.target.closest("[data-filter-type]");
      if (!target) return;

      var type = target.getAttribute("data-filter-type");
      var value = target.getAttribute("data-filter-value");

      if (type === "all") {
        active.artist = "all";
        active.era = "all";
        document.querySelectorAll("[data-filter-type]").forEach(function (btn) {
          btn.classList.toggle("is-active", btn.getAttribute("data-filter-value") === "all");
        });
      } else {
        active[type] = value;
        document.querySelectorAll('[data-filter-type="' + type + '"]').forEach(function (btn) {
          btn.classList.toggle("is-active", btn === target);
        });
      }

      renderSongs(songs);
    });
  }

  function mountFallback() {
    var items = Array.prototype.slice.call(container.querySelectorAll(".song-item"));
    var fallbackSongs = items.map(function (item) {
      return {
        title: item.querySelector(".song-title") ? item.querySelector(".song-title").textContent : "",
        artist: item.getAttribute("data-artist") || "",
        decade: item.getAttribute("data-era") || "年代未設定",
        summary: item.querySelector(".song-note") ? item.querySelector(".song-note").textContent : "",
        article_url: item.querySelector("a") ? item.querySelector("a").getAttribute("href") : "#",
        status: "published"
      };
    });
    renderFilters(fallbackSongs);
    bindFilters(fallbackSongs);
    if (status) status.textContent = fallbackSongs.length + "件を表示";
  }

  fetch(basePath() + "data/songs.json", { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(function (data) {
      var songs = Array.isArray(data) ? data : data.songs || [];
      songs = songs.filter(function (song) { return song.status !== "hidden"; });
      songs.sort(function (a, b) { return (Number(songYear(b)) || 0) - (Number(songYear(a)) || 0); });
      renderFilters(songs);
      bindFilters(songs);
      renderSongs(songs);
    })
    .catch(function () {
      mountFallback();
    });
})();
