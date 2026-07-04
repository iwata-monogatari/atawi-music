import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// 記事IDを引数から取得
const articleId = process.argv[2];
if (!articleId) {
  console.error("エラー: 削除する記事ID（例: eikichi-yazawa-001）を指定してください。");
  process.exit(1);
}

const songsFile = join(root, "data", "songs.json");
const songs = JSON.parse(readFileSync(songsFile, "utf8"));

// 削除対象の曲が存在するか確認
const targetSong = songs.find(s => s.id === articleId);
if (!targetSong) {
  console.log(`警告: songs.json 内にID「${articleId}」の曲が見つかりませんでした。HTMLファイルの削除とインデックス更新のみ進めます。`);
}

// 1. data/songs.json から削除
const nextSongs = songs.filter(s => s.id !== articleId);
writeFileSync(songsFile, JSON.stringify(nextSongs, null, 2), "utf8");
console.log(`songs.json から ID 「${articleId}」 を削除しました。（残り曲数: ${nextSongs.length}）`);

// 2. 記事HTMLファイルを削除
const articleHtmlPath = join(root, "articles", `${articleId}.html`);
if (existsSync(articleHtmlPath)) {
  unlinkSync(articleHtmlPath);
  console.log(`記事ファイル ${basename(articleHtmlPath)} を削除しました。`);
} else {
  console.log(`記事ファイル ${basename(articleHtmlPath)} は既に存在しません。`);
}

// 3. HTMLファイル内の件数記述および JSON-LD を自動更新
const publishedCount = nextSongs.filter(s => !s.status || s.status === "published").length;

const ldJson = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "numberOfItems": publishedCount,
  "itemListElement": nextSongs.map((s, idx) => {
    let url = s.article_url || '';
    if (!url.startsWith('http')) {
      url = 'https://atawimusic.link' + (url.startsWith('/') ? url : '/' + url);
    }
    return {
      "@type": "ListItem",
      "position": idx + 1,
      "url": url,
      "name": `${s.artist} | ${s.title}`
    };
  })
};
const newLdString = JSON.stringify(ldJson);

const targetHtmls = [
  join(root, "index.html"),
  join(root, "articles", "index.html")
];

targetHtmls.forEach(file => {
  if (!existsSync(file)) return;
  let html = readFileSync(file, "utf8");
  
  // JSON-LD の置換
  const ldRegex = /(<script type="application\/ld\+json" data-static-article-list>)(.*?)(<\/script>)/;
  if (ldRegex.test(html)) {
    html = html.replace(ldRegex, `$1${newLdString}$3`);
  }
  
  // テキスト内の件数表記を動的に置換 (例: "234件の" -> "233件の")
  // "234件中10件を表示" -> "233件中10件を表示" などのパターンに対応
  html = html.replace(/\b\d+件(の音楽考察|件中\d+件を表示|の記事を表示)/g, (match, p1) => {
    if (p1.includes("件中")) {
      return `${publishedCount}件中10件を表示`;
    }
    return `${publishedCount}件${p1}`;
  });

  // メタタグdescriptionなどの "234件の" 箇所を安全に更新
  html = html.replace(/公開している\d+件の/g, `公開している${publishedCount}件の`);
  html = html.replace(/確認できる\d+件の/g, `確認できる${publishedCount}件の`);

  writeFileSync(file, html, "utf8");
  console.log(`${basename(file)} 内の静的曲数表記とJSON-LDを ${publishedCount} 件に自動更新しました。`);
});

// 4. tools/build-search-index.mjs を実行して軽量インデックスを再構築
try {
  console.log("軽量インデックスを再構築しています...");
  execSync("node tools/build-search-index.mjs", { cwd: root, stdio: "inherit" });
} catch (e) {
  console.error("警告: 軽量インデックスの再構築に失敗しました。", e.message);
}

console.log("=== 自動削除処理が完了しました ===");
