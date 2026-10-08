import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "atawi-seo-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const dir of ["tools", "data", "articles"]) mkdirSync(join(root, dir));
  copyFileSync(join(dirname(fileURLToPath(import.meta.url)), "build-seo.mjs"), join(root, "tools/build-seo.mjs"));
  for (const path of ["index", "about", "contact", "home-and-memory", "oishi-selection-viewpoint", "articles/index", "articles/retained", "articles/new"]) {
    const url = path === "index" ? "/" : path === "articles/index" ? "/articles/" : `/${path}.html`;
    writeFileSync(join(root, `${path}.html`), `<html><head><link rel="canonical" href="https://atawimusic.link${url}"></head><body><h1>本文を保持</h1><a href="/articles/retained.html">旧リンク</a></body></html>`);
  }
  writeFileSync(join(root, "data/songs.json"), JSON.stringify([
    { status: "published", article_url: "/articles/retained.html", created_at: "2026-07-01" },
    { status: "published", article_url: "/articles/new.html", created_at: "2026-10-09" },
    { status: "draft", article_url: "/articles/draft.html" },
  ]));
  writeFileSync(join(root, "sitemap.xml"), '<urlset><url><loc>https://atawimusic.link/articles/retained.html</loc><lastmod>2026-07-02</lastmod></url><url><loc>https://atawimusic.link/articles/deleted.html</loc></url></urlset>');
  return { root, run: (...args) => execFileSync(process.execPath, [join(root, "tools/build-seo.mjs"), ...args], { encoding: "utf8", stdio: "pipe" }) };
}

test("sitemap contains every published page and removes deleted/draft URLs; body and dates survive", t => {
  const { root, run } = fixture(t);
  const file = join(root, "articles/retained.html");
  const before = readFileSync(file, "utf8");
  run();
  const xml = readFileSync(join(root, "sitemap.xml"), "utf8");
  assert.equal((xml.match(/<loc>/g) || []).length, 8);
  assert.match(xml, /<loc>https:\/\/atawimusic.link\/articles\/new<\/loc>/);
  assert.match(xml, /2026-07-02/);
  assert.doesNotMatch(xml, /deleted|draft|\.html/);
  assert.equal(readFileSync(file, "utf8"), before.replace('retained.html"', 'retained"'));
  assert.match(run("--check"), /0 files updated/);
  assert.match(run(), /0 files updated/);
});

test("check rejects stale output without changing it", t => {
  const { root, run } = fixture(t);
  const before = readFileSync(join(root, "sitemap.xml"), "utf8");
  assert.throws(() => run("--check"), /SEO files are stale/);
  assert.equal(readFileSync(join(root, "sitemap.xml"), "utf8"), before);
});

test("missing article blocks generation before any changes", t => {
  const { root, run } = fixture(t);
  rmSync(join(root, "articles/new.html"));
  const before = readFileSync(join(root, "articles/retained.html"), "utf8");
  assert.throws(() => run(), /Missing published HTML/);
  assert.equal(readFileSync(join(root, "articles/retained.html"), "utf8"), before);
});

test("duplicate destinations and incorrect canonical targets block generation", t => {
  const { root, run } = fixture(t);
  const dataFile = join(root, "data/songs.json");
  const songs = JSON.parse(readFileSync(dataFile, "utf8"));
  writeFileSync(dataFile, JSON.stringify([...songs, songs[0]]));
  assert.throws(() => run(), /Duplicate published URL/);
  writeFileSync(dataFile, JSON.stringify(songs));
  const article = join(root, "articles/new.html");
  writeFileSync(article, readFileSync(article, "utf8").replace('/articles/new.html', '/articles/retained.html'));
  assert.throws(() => run(), /Canonical mismatch/);
});
