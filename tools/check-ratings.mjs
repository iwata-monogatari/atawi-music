import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(join(root, path), "utf8");
const songs = JSON.parse(read("data/songs.json")).filter(song => song.status === "published");
const index = new Map(JSON.parse(read("data/search-index.json")).map(song => [song.id, song]));
const errors = [];
const validScore = value => Number.isInteger(value) && value >= 1 && value <= 5;
for (const song of songs) {
  const rating = song.rating;
  if (!rating || !["song", "lyrics", "mv"].includes(rating.selection) || !validScore(rating[rating.selection]) ||
      !validScore(rating.song) || [rating.lyrics, rating.mv].some(value => value != null && !validScore(value))) {
    errors.push(song.id + ": missing or invalid catalog rating");
    continue;
  }
  const listed = index.get(song.id)?.rating;
  if (!listed || ["song", "lyrics", "mv", "selection"].some(key => listed[key] !== rating[key])) {
    errors.push(song.id + ": listing rating is missing or differs from the catalog");
  }
  const article = read(song.article_url.replace(/^\//, ""));
  const panel = article.match(/<div\b[^>]*class="oishi-rating"[^>]*>([\s\S]*?)<\/div>/)?.[1] || "";
  const reason = panel.match(/<p\b[^>]*class="oishi-rating-reason"[^>]*>([\s\S]*?)<\/p>/)?.[1] || "";
  if (!panel.includes("oishi-rating-headline") || !panel.includes("oishi-rating-list") || !panel.includes("★") ||
      !reason.replace(/<[^>]+>/g, "").replace(/^\s*選定理由\s*[：:]?/, "").trim()) {
    errors.push(song.id + ": missing article rating or selection reason");
  }
}
if (errors.length) throw new Error(errors.join("\n"));
console.log(`Verified ratings for ${songs.length} published songs in the catalog, index and articles.`);
