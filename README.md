# ATAWI MUSIC Complete Package

作成日：2026-07-01

## 内容

- `docs/atawi_music_site_design_complete.md`  
  DB設計まで組み込んだ完全版サイト設計書

- `docs/one_shot_implementation_prompt.md`  
  Codex / Claude Code / Antigravity へそのまま渡す一括実装プロンプト

- `docs/atawi_music_youtube_song_analysis_skill_text_only.md`  
  YouTubeリンクから曲分析・WEBページ化する文字主体版スキル

- `data/songs.json`  
  初期2曲を登録した音楽台帳

- `data/artists.json` / `data/genres.json` / `data/themes.json`  
  将来拡張用の分類台帳

- `assets/images/logo/atawi-music-logo-reference.png`  
  ロゴ参考画像

- `assets/images/profile/oishi.jpg`  
  大石浩之プロフィール写真

## 方針

曲が主役。  
文章が軸。  
顔写真は署名。  
ロゴは看板。  
画像素材は不要。

静的HTML/CSS/JS + data/songs.json で開始し、GitHub → Cloudflare Pagesで公開する。
