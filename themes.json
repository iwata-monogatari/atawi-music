# ATAWI MUSIC

**ATAWI MUSIC｜大石浩之の、過去をさかのぼり、今を聴く音楽考察**

> 過去をさかのぼるほど、今が大事になる。

好きだった曲を、もう一度さかのぼって聴く。あの頃の街や、若い頃の自分の記憶とともに、一曲ずつ考えていく音楽考察サイトです。

Presented by Hiroyuki Oishi

---

## 構成

```
/
├── index.html              トップ（トップコピー・テーマ・最近の一曲）
├── about.html              プロフィール
├── home-and-memory.html    家と記憶（本業との接続）
├── contact.html            お問い合わせ
├── articles/
│   ├── index.html          記事一覧（songs.json を読み込み表示）
│   ├── somewhere-in-tokyo.html
│   └── nulbarich-tokyo.html
├── themes/                 テーマ別一覧（songs.json をフィルタ表示）
│   ├── tokyo.html          東京で頑張っていた頃
│   ├── night.html          夜に残る曲
│   ├── city.html           街を思い出す曲
│   ├── work.html           仕事帰りに効く曲
│   └── adult.html          大人になって分かる曲
├── assets/
│   ├── css/style.css       黒・チャコール基調＋控えめゴールド
│   ├── js/main.js          songs.json を読み込み曲一覧を描画
│   └── images/
│       ├── logo/           ロゴと favicon.png を配置
│       └── profile/        大石浩之の顔写真を配置
├── data/
│   ├── songs.json          曲データベース（表示の元データ）
│   ├── artists.json
│   ├── genres.json
│   └── themes.json
├── robots.txt
├── sitemap.xml
└── README.md
```

## 曲の追加方法

`data/songs.json` の `songs` 配列に1件追加し、`articles/` に記事HTMLを1枚置くだけで、
記事一覧・該当テーマページに自動で表示されます（main.js が読み込み）。

各曲は id / title / artist / artist_kana / release_year / decade / genre /
songwriters / youtube_url / article_url / themes / mood / personal_context / status を持ちます。

## 記事方針

- 歌詞の全文転載・長い引用は禁止
- 公式 YouTube リンク（または埋め込み）を使用
- 本文は大石浩之自身の解釈・記憶・人生との接続を中心に
- 画像素材は不要（ロゴと本人の顔写真のみ）

## 公開（Cloudflare Pages）

- Framework preset: **None**
- Build command: **（空欄）**
- Build output directory: **/**

ビルド不要の静的サイトです。リポジトリ直下をそのまま公開できます。

## 画像の差し替え

- `assets/images/logo/favicon.png` … サイトアイコン（正方形）
- `assets/images/logo/logo.png` … 横長ロゴ（任意）
- `assets/images/profile/` … 大石浩之の顔写真（about.html のプレースホルダーと差し替え）
