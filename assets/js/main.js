/* =========================================================
   ATAWI MUSIC — main.js
   data/songs.json を読み込み、曲一覧を描画する。
   - articles/index.html : 全曲一覧
   - themes/*.html        : data-theme 属性でフィルタした一覧
   ========================================================= */

(function () {
  "use strict";

  // ルート相対でJSONを解決する。GitHub Pages/Cloudflare Pのサブパスにも耐えるよう
  // 現在ページの階層から data/ への相対パスを算出する。
  function dataPath() {
    // 現在のパスの深さを見て ../ を積む
    var path = window.location.pathname;
    // 末尾がスラッシュ or ファイル名を除いたセグメント数
    var segs = path.split("/").filter(Boolean);
    // ファイル名（.html等）を除く
    if (segs.length && /\.[a-z]+$/i.test(segs[segs.length - 1])) {
      segs.pop();
    }
    var up = "";
    for (var i = 0; i < segs.length; i++) up += "../";
    return up + "data/songs.json";
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // 曲1件をリスト項目として描画
  function renderSong(song, baseUp) {
    var li = el("li", "song-item");

    var articleHref = song.article_url
      ? baseUp + song.article_url.replace(/^\//, "")
      : null;

    var inner =
      '<div class="song-title">' +
      esc(song.title) +
      (song.release_year ? ' <span class="yr">' + esc(song.release_year) + "</span>" : "") +
      "</div>" +
      '<div class="song-artist">' + esc(song.artist) +
      (song.artist_kana ? "（" + esc(song.artist_kana) + "）" : "") +
      "</div>";

    if (song.mood && song.mood.length) {
      inner += '<div class="song-meta">';
      song.mood.forEach(function (m) {
        inner += '<span class="tag">' + esc(m) + "</span>";
      });
      inner += "</div>";
    }

    if (song.personal_context) {
      inner += '<div class="song-context">' + esc(song.personal_context) + "</div>";
    }

    if (articleHref) {
      var a = el("a", "song-link");
      a.href = articleHref;
      a.innerHTML = inner;
      li.appendChild(a);
    } else {
      li.innerHTML = inner;
    }
    return li;
  }

  function baseUpFromPath() {
    var path = window.location.pathname;
    var segs = path.split("/").filter(Boolean);
    if (segs.length && /\.[a-z]+$/i.test(segs[segs.length - 1])) segs.pop();
    var up = "";
    for (var i = 0; i < segs.length; i++) up += "../";
    return up;
  }

  function mount() {
    var container = document.querySelector("[data-song-list]");
    if (!container) return;

    var theme = container.getAttribute("data-theme") || null; // フィルタ用
    var loading = el("div", "loading", "曲を読み込んでいます…");
    container.appendChild(loading);

    fetch(dataPath(), { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        container.innerHTML = "";
        var songs = (data && data.songs) || [];

        if (theme) {
          songs = songs.filter(function (s) {
            return s.themes && s.themes.indexOf(theme) !== -1;
          });
        }

        // published を優先し、新しい順（release_year 降順）に
        songs = songs.filter(function (s) { return s.status !== "hidden"; });
        songs.sort(function (a, b) {
          return (b.release_year || 0) - (a.release_year || 0);
        });

        if (!songs.length) {
          container.appendChild(
            el("p", "muted", "この分類の曲はまだ登録されていません。")
          );
          return;
        }

        var ul = el("ul", "song-list");
        var baseUp = baseUpFromPath();
        songs.forEach(function (s) {
          ul.appendChild(renderSong(s, baseUp));
        });
        container.appendChild(ul);
      })
      .catch(function (err) {
        container.innerHTML = "";
        container.appendChild(
          el("p", "muted", "曲データの読み込みに失敗しました。（" + esc(err.message) + "）")
        );
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
