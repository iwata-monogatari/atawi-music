// data/songs.json (台帳) から検索・一覧表示用の軽量インデックス data/search-index.json を生成する。
// 実行: node tools/build-search-index.mjs
// songs.json を編集したら必ず再実行すること(記事作成スキルのSite Registration手順に含まれる)。
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const songsRaw = JSON.parse(readFileSync(join(root, "data", "songs.json"), "utf8"));
const songs = Array.isArray(songsRaw) ? songsRaw : songsRaw.songs || [];

let artists = [];
try {
  const a = JSON.parse(readFileSync(join(root, "data", "artists.json"), "utf8"));
  artists = Array.isArray(a) ? a : a.artists || [];
} catch {}
const kanaByName = new Map(artists.filter(a => a.name && a.kana).map(a => [a.name, a.kana]));

const index = songs
  .filter(s => s.status === "published")
  .map(s => {
    const names = (s.artists && s.artists.length ? s.artists : [s.artist]).filter(Boolean);
    const entry = {
      id: s.id,
      title: s.title,
      artist: s.artist,
      release_year: s.release_year,
      decade: s.decade,
      article_url: s.article_url,
      youtube_url: s.youtube_url,
      created_at: s.created_at,
      summary: s.summary,
      featured_order: s.featured_order
    };
    if (s.artists && s.artists.length) entry.artists = s.artists;
    if (s.recommended) entry.recommended = true;
    const kana = names.map(n => kanaByName.get(n)).filter(Boolean);
    if (kana.length) entry.kana = kana;
    return entry;
  });

const out = JSON.stringify(index);
writeFileSync(join(root, "data", "search-index.json"), out);
console.log(`search-index.json: ${index.length} songs, ${Math.round(out.length / 1024)} KB (songs.json: ${songs.length} entries)`);
