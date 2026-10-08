# 2026-10-09 Search Console URL audit

Baseline: main `770c4de014eb83e1c280995ba9941ef108c0283a`.

- The sitemap-specific 404 report contained one example: `/articles/kubota-toshinobu-003.html` (last crawl shown: 2026-08-08). Live testing on 2026-10-09 returned 308 to `/articles/kubota-toshinobu-003`, then 200. The old failure was not reproduced; its original cause cannot be established from that report.
- All 455 original sitemap URLs finished with HTTP 200. Of these, 453 redirected while their canonical tags still pointed to the `.html` URL.
- All-known-pages 404 examples: 115 URLs; 2 currently returned 200 (the two forms of the Kubota article), and 113 returned 404. These are different from the one sitemap-specific example.
- Two deleted redirect stubs had known replacements: `somewhere-in-tokyo` → `furuuchi-toko-001`, and `nulbarich-tokyo` → `nulbarich-001`. Restore explicit 301 redirects for both extensionless and `.html` aliases. Their original destinations are documented in commit `9a74e6a`.
- Other removed articles remain 404. No unrelated redirects to the home page and no restoration of intentionally removed content.
- Published data and search index each contain 450 articles. The fixed home-page count of 473 was stale. No articles were deleted in this repair.
- `/articles/funky-monkey-babys-001.html` was missing from the sitemap despite being published.

## Maintenance

`node tools/build-search-index.mjs` now also runs `node tools/build-seo.mjs`. The SEO generator builds the sitemap from published records, preserves existing lastmod values, and normalizes canonical tags to Cloudflare Pages' extensionless destinations. Existing inbound `.html` links continue to redirect through Pages normally.

Run `node --test tools/build-seo.test.mjs` and `node tools/build-seo.mjs --check`. Both production predeploy guards run the SEO check; missing articles, incorrect canonical targets, duplicate URLs and stale output stop publication.

Deploy a clean public asset directory. Exclude repository instructions, tooling, backups, reports and internal JSON such as `data/youtube-official-mv.json`. Public JSON used by the frontend: songs, search-index, artists, themes and genres.

## References

- Cloudflare Pages route matching: https://developers.cloudflare.com/pages/configuration/serving-pages/
- Google canonical guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
