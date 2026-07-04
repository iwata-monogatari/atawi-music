import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// songs.json の読み込み
const songsFile = join(root, "data", "songs.json");
const songs = JSON.parse(readFileSync(songsFile, "utf8"));
const publishedSongs = songs.filter(s => !s.status || s.status === "published");

console.log(`開始: ${publishedSongs.length}件のリンクチェックを実行します。`);

const results = [];
let brokenCount = 0;

// API制限対策のためにシーケンシャルに、適度なインターバルを挟んでチェックする
for (let i = 0; i < publishedSongs.length; i++) {
  const song = publishedSongs[i];
  const progress = `[${i + 1}/${publishedSongs.length}]`;
  const result = {
    id: song.id,
    title: song.title,
    artist: song.artist,
    youtube_url: song.youtube_url,
    article_url: song.article_url,
    youtube_ok: true,
    article_ok: true,
    error_message: ""
  };

  // 1. 自サイトの記事HTMLの存在チェック
  const htmlPath = join(root, "articles", `${song.id}.html`);
  if (!existsSync(htmlPath)) {
    result.article_ok = false;
    result.error_message += "記事HTMLファイルが存在しません。 ";
  }

  // 2. YouTubeのリンクチェック
  if (!song.youtube_url) {
    result.youtube_ok = false;
    result.error_message += "YouTubeのURLが登録されていません。 ";
  } else {
    // oEmbed API を利用してチェック
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(song.youtube_url)}&format=json`;
    try {
      const response = await fetch(oembedUrl);
      if (response.status !== 200) {
        result.youtube_ok = false;
        result.error_message += `YouTube動画が非公開または削除されています (ステータス: ${response.status})。 `;
      }
    } catch (e) {
      result.youtube_ok = false;
      result.error_message += `YouTubeへのアクセスに失敗しました: ${e.message}。 `;
    }
  }

  if (!result.youtube_ok || !result.article_ok) {
    brokenCount++;
    console.error(`${progress} NG: ${song.artist} - ${song.title} (${result.error_message})`);
  } else {
    console.log(`${progress} OK: ${song.artist} - ${song.title}`);
  }

  results.push(result);

  // 連続リクエストによるレートリミット（429）を防ぐためのディレイ (100ms)
  await new Promise(resolve => setTimeout(resolve, 100));
}

// レポートの書き出し
const reportMdFile = join(root, "data", "link-check-report.md");
const dateStr = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

let reportMd = `# リンク切れチェックレポート\n\n`;
reportMd += `実行日時: ${dateStr} (日本時間)\n`;
reportMd += `総チェック件数: ${publishedSongs.length} 件\n`;
reportMd += `リンク切れ検出件数: **${brokenCount}** 件\n\n`;

if (brokenCount > 0) {
  reportMd += `## 検出された異常リンク一覧\n\n`;
  reportMd += `| 歌手名 | 曲名 | 記事リンク | YouTubeリンク | 異常内容 |\n`;
  reportMd += `| --- | --- | --- | --- | --- |\n`;
  results.filter(r => !r.youtube_ok || !r.article_ok).forEach(r => {
    reportMd += `| ${r.artist} | ${r.title} | [記事](${r.article_url}) | [YouTube](${r.youtube_url}) | ${r.error_message} |\n`;
  });
} else {
  reportMd += `🎉 すべての公開楽曲のリンク（記事HTML、YouTube公式動画）が正常に機能しています。\n`;
}

writeFileSync(reportMdFile, reportMd, "utf8");
console.log(`\nレポートを書き出しました: ${reportMdFile}`);

// 検出された件数が1件以上あればエラー終了することで GitHub Actions 側で検知可能にする
if (brokenCount > 0) {
  console.error(`異常なリンクが ${brokenCount} 件検出されました。`);
  process.exit(1);
} else {
  console.log("すべてのリンクチェックが成功しました。");
  process.exit(0);
}
