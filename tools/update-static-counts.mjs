import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const songsFile = join(root, "data", "songs.json");
const songs = JSON.parse(readFileSync(songsFile, "utf8"));
const publishedSongs = songs.filter(s => !s.status || s.status === "published");
const publishedCount = publishedSongs.length;

console.log(`曲数同期処理を開始します。現在の published 曲数: ${publishedCount}`);

// JSON-LD の生成
const ldJson = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "numberOfItems": publishedCount,
  "itemListElement": publishedSongs.map((s, idx) => {
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
  
  // テキスト内の件数表記を動的に置換 (例: "233件の" -> "234件の")
  html = html.replace(/\b\d+件(の音楽考察|件中\d+件を表示|の記事を表示)/g, (match, p1) => {
    if (p1.includes("件中")) {
      return `${publishedCount}件中10件を表示`;
    }
    return `${publishedCount}件${p1}`;
  });

  html = html.replace(/公開している\d+件の/g, `公開している${publishedCount}件の`);
  html = html.replace(/確認できる\d+件の/g, `確認できる${publishedCount}件の`);

  writeFileSync(file, html, "utf8");
  console.log(`${basename(file)} 内の静的曲数表記とJSON-LDを ${publishedCount} 件に同期しました。`);
});

// 軽量インデックスを再構築
try {
  console.log("軽量インデックスを再構築しています...");
  execSync("node tools/build-search-index.mjs", { cwd: root, stdio: "inherit" });
} catch (e) {
  console.error("警告: 軽量インデックスの再構築に失敗しました。", e.message);
}

console.log("=== 曲数同期処理が完了しました ===");
