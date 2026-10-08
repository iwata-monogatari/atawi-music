// Keep sitemap destinations and canonical tags aligned with Cloudflare Pages.
// Existing .html inbound links remain valid through Pages' permanent redirects.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://atawimusic.link";
const check = process.argv.includes("--check");
const errors = [];
const changes = new Map();

function publicUrl(value) {
  const url = new URL(value, origin);
  if (url.origin !== origin || url.search || url.hash) throw new Error(`Invalid site URL: ${value}`);
  url.pathname = url.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
  return url.href;
}

function htmlPath(url) {
  const path = new URL(url).pathname;
  return join(root, path.endsWith("/") ? `${path}index.html` : `${path}.html`);
}

const songs = JSON.parse(readFileSync(join(root, "data/songs.json"), "utf8"));
const published = songs.filter(song => song.status === "published");
const staticUrls = ["/", "/about", "/contact", "/home-and-memory", "/oishi-selection-viewpoint", "/articles/"];
const urls = [...staticUrls.map(publicUrl), ...published.map(song => publicUrl(song.article_url))];
if (new Set(urls).size !== urls.length) errors.push("Duplicate published URL.");

const oldSitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const dates = new Map();
for (const match of oldSitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>)?\s*<\/url>/g)) {
  dates.set(publicUrl(match[1]), match[2]);
}
for (const song of published) {
  const url = publicUrl(song.article_url);
  if (!dates.has(url) && /^\d{4}-\d{2}-\d{2}/.test(song.created_at || "")) dates.set(url, song.created_at.slice(0, 10));
}

const canonicalPattern = /(<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["'])([^"']+)(["'][^>]*>)/g;
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || ["tools", "docs", "data"].includes(entry.name)) continue;
    const file = join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith(".html") && !entry.name.startsWith("index_backup_")) {
      const html = readFileSync(file, "utf8");
      const updated = html.replace(canonicalPattern, (tag, before, url, after) => {
        if (!url.startsWith(`${origin}/`)) return tag;
        return `${before}${publicUrl(url)}${after}`;
      });
      if (html !== updated) changes.set(file, updated);
    }
  }
}
walk(root);

for (const url of urls) {
  const file = htmlPath(url);
  if (!existsSync(file)) { errors.push(`Missing published HTML: ${url}`); continue; }
  const html = changes.get(file) ?? readFileSync(file, "utf8");
  const canonicals = [...html.matchAll(canonicalPattern)].map(match => match[2]);
  if (canonicals.length !== 1 || canonicals[0] !== url) errors.push(`Canonical mismatch: ${url}`);
  if (/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) errors.push(`Published page is noindex: ${url}`);
}

const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(url => {
  const date = dates.get(url);
  return `  <url>\n    <loc>${url.replaceAll("&", "&amp;")}</loc>\n${date ? `    <lastmod>${date}</lastmod>\n` : ""}  </url>`;
}).join("\n") + "\n</urlset>\n";
if (oldSitemap.replaceAll("\r\n", "\n") !== sitemap) changes.set(join(root, "sitemap.xml"), sitemap);
if (errors.length) throw new Error(errors.join("\n"));
if (check && changes.size) throw new Error(`SEO files are stale (${changes.size}). Run node tools/build-seo.mjs.`);
if (!check) for (const [file, content] of changes) writeFileSync(file, content);
console.log(`SEO ${check ? "check" : "build"} passed: ${published.length} articles, ${urls.length} sitemap URLs, ${check ? 0 : changes.size} files updated.`);
