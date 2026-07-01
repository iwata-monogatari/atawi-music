# 「ATAWI MUSIC｜大石浩之の、過去をさかのぼり、今を聴く音楽考察」サイト設計書

作成日：2026年7月1日  
公開方式：GitHubリポジトリ管理 → Cloudflare Pages自動公開  
目的：音楽考察を入口に、大石浩之という個人への信頼を育て、最終的に磐田市周辺の相続・空き家・不動産相談へ自然につなげる。

---

## 1. サイト名の最終方針

### 表のサイトタイトル

# ATAWI MUSIC

読み：アタウィ・ミュージック  
英字補助：ATAWI MUSIC

### 正式名称

**ATAWI MUSIC｜大石浩之の、過去をさかのぼり、今を聴く音楽考察**

### 表示ルール

- ロゴ・ヘッダーの主表示：**ATAWI MUSIC**
- ロゴ下の正式クレジット：**Presented by Hiroyuki Oishi**
- トップページのファーストビュー：**ATAWI MUSIC｜大石浩之の、過去をさかのぼり、今を聴く音楽考察**
- HTML title：`ATAWI MUSIC｜大石浩之の、過去をさかのぼり、今を聴く音楽考察`
- OGPタイトル：`ATAWI MUSIC｜大石浩之の、過去をさかのぼり、今を聴く音楽考察`
- 記事末尾プロフィール：`大石浩之が、仕事・街・記憶とともに音楽を読むブログ`

### なぜ「ATAWI MUSIC」が良いか

**ATAWI** は、**IWATA** を逆からたどった言葉である。  
磐田をそのまま出すのではなく、今いる場所から過去へさかのぼるように、IWATAを静かに反転させている。

音楽を聴くことは、過去へ戻ることに似ている。  
若い頃の東京、仕事帰りの夜、会えなかった人、帰る場所になった磐田。  
しかし、このサイトは過去に閉じこもるための場所ではない。

**過去をさかのぼるほど、今が大事になる。**  
これが ATAWI MUSIC の中心思想である。

音楽レビューサイトではなく、**人生・街・記憶と音楽を重ねて読む個人メディア**として成立させる。

---

## 2. サイトコンセプト

### コンセプト文

**夜に聴いた一曲が、昔の街や、若い頃の自分を連れてくる。**  
ATAWI MUSICは、大石浩之が、仕事・街・記憶・人生とともに音楽を読むブログです。

### サイトの立ち位置

このサイトは、音楽評論家による専門レビューではない。  
歌の上手さ、コード進行、売上、ランキングを主軸にするサイトでもない。

主軸は、次の3つである。

1. その曲が、なぜ大人に刺さるのか
2. その曲が、どんな記憶を呼び戻すのか
3. その曲を通して、街・仕事・家族・人生をどう見つめ直すのか

### 読者に与えたい印象

- この人は、曲を人生で聴いている
- この人は、街や記憶を大切にしている
- この人は、家や土地も単なる商品として見ていない
- この人になら、相続した実家や空き家の話をしてもよさそうだ

---

## 3. マネタイズ方針

### 最終ゴール

最終ゴールは、磐田市周辺の次の相談につなげること。

- 相続した実家の整理
- 空き家の売却・管理
- 土地・建物の売却相談
- 親の家の片づけ
- 住まいと介護が絡む相談

### ただし、タイトルでは不動産色を出さない

サイトタイトルに「不動産屋社長」「富士ヶ丘サービス」は入れない。

理由は、音楽記事を読みに来た人が、入口で営業感を受けると離脱する可能性があるため。

ただし、本業は隠さない。  
プロフィール、フッター、記事末尾の自然な導線で正直に示す。

### 導線の基本思想

**音楽 → 記憶 → 街 → 家 → 相談**

この順番を守る。

悪い導線：

> この曲が好きな方は、不動産売却はこちら

良い導線：

> 音楽が昔の街や部屋を思い出させるように、家や土地にも、誰かの時間が残っています。磐田市周辺で、相続した実家・空き家・土地の整理に悩んでいる方は、富士ヶ丘サービスまでご相談ください。

---

## 4. トップページ設計

### URL

`/index.html`

### ファーストビュー

表示内容：

```text
ATAWI MUSIC
大石浩之の、過去をさかのぼり、今を聴く音楽考察

過去をさかのぼるほど、今が大事になる。
```

CTAは最初に出しすぎない。  
トップの最初のボタンは音楽記事への入口にする。

ボタン案：

- 最新の記事を読む
- 東京の記憶を読む
- 夜に残る一曲を読む

### トップページ構成

1. ヒーローエリア
2. 最新記事3本
3. テーマ別入口
   - 東京で頑張っていた頃
   - 夜に効く曲
   - 大人になって分かる曲
   - 街を思い出す曲
   - 仕事帰りに聴きたい曲
4. 大石浩之プロフィール
5. 家・土地・空き家相談への自然導線
6. フッター

---

## 5. 記事ページ設計

### 記事タイトル例

- Nulbarich『TOKYO』は、東京で折れなかった自分を思い出す曲
- 古内東子『somewhere in TOKYO』は、同じ街にいるのに遠い人を思い出す曲
- 夜のタクシーで聴くと効く、大人の名曲
- 若い頃の自分に会いに行く音楽

### 記事ページの基本構成

1. 記事タイトル
2. リード文
3. 楽曲情報
   - 曲名
   - アーティスト名
   - 公開・発売年
   - 公式YouTubeリンク
4. 本文
   - なぜ刺さるのか
   - どんな記憶が戻るのか
   - 大人になって分かる部分
   - 大石浩之自身の体験との接続
5. 注意書き
   - 歌詞全文は掲載しない
   - 必要な場合のみ短く引用し、出典を明示する
6. 関連記事
7. プロフィール
8. 家・土地・空き家相談への自然導線

### 記事末尾CTA例

```text
音楽は、昔住んだ街や、若い頃の自分を思い出させてくれます。
家や土地もまた、誰かの時間が残る場所です。

磐田市周辺で、相続した実家・空き家・土地の整理に悩んでいる方は、富士ヶ丘サービスまでご相談ください。
```

ボタン：

**家・土地・空き家の整理について相談する**

---

## 6. 必須ページ

### 1. トップページ

`index.html`

役割：サイト全体の入口。  
「ATAWI MUSIC」というブランド名と、大石浩之の音楽観を伝える。

### 2. 記事一覧ページ

`articles/index.html`

役割：全記事を一覧表示する。

### 3. テーマ別ページ

- `themes/tokyo.html`：東京で頑張っていた頃
- `themes/night.html`：夜に効く曲
- `themes/city.html`：街を思い出す曲
- `themes/work.html`：仕事帰りに聴きたい曲
- `themes/adult.html`：大人になって分かる曲

### 4. プロフィールページ

`about.html`

内容：

- 大石浩之について
- 富士ヶ丘サービス株式会社 代表取締役であること
- 介護と不動産の仕事をしていること
- なぜ音楽について書くのか
- なぜ街・記憶・家に関心があるのか

### 5. 相談ページ

`home-and-memory.html`

表のタイトル：

**家と記憶の相談室**

直接的に「不動産売却」と出しすぎず、音楽サイトからの文脈に合わせる。  
ただしページ内では、相続・空き家・土地建物売却の相談ができることを明記する。

### 6. お問い合わせページ

`contact.html`

問い合わせ先：

- 富士ヶ丘サービス株式会社
- TEL：0538-31-3308
- 不動産相談フォームまたはメール導線

---

## 7. ディレクトリ構成

静的HTMLで開始する。  
最初はビルドツールを使わず、GitHubにアップしたHTML/CSS/JSをCloudflare Pagesで公開する。

```text
atawi-music/
├── index.html
├── about.html
├── home-and-memory.html
├── contact.html
├── articles/
│   ├── index.html
│   ├── nulbarich-tokyo.html
│   └── somewhere-in-tokyo.html
├── themes/
│   ├── tokyo.html
│   ├── night.html
│   ├── city.html
│   ├── work.html
│   └── adult.html
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── images/
│       ├── ogp/
│       └── profile/
├── robots.txt
├── sitemap.xml
└── README.md
```

---

## 8. GitHub運用方針

### リポジトリ名案

第一候補：

```text
atawi-music
```

第二候補：

```text
oishi-atawi-music
```

第三候補：

```text
atawi-music-blog
```

### 推奨

**atawi-music** が最も良い。

理由：

- 短い
- 覚えやすい
- ブランド名と一致する
- 将来、独自ドメインにしても違和感がない

---

## 9. Cloudflare Pages公開設計

### 基本方針

GitHubリポジトリとCloudflare Pagesを連携し、mainブランチにpushしたら自動公開される形にする。

Cloudflare PagesはGitHubまたはGitLabのリポジトリと接続でき、接続後は対象ブランチに変更をpushするたびに自動でデプロイされる。  
参考：Cloudflare Pages Git integration  
https://developers.cloudflare.com/pages/configuration/git-integration/

### Cloudflare Pages設定

静的HTML運用の場合：

```text
Framework preset：None
Build command：空欄
Build output directory：/
Root directory：/
Production branch：main
```

Cloudflare Pagesでは、ビルドコマンドや出力ディレクトリをプロジェクトに合わせて設定できる。  
参考：Cloudflare Pages Build configuration  
https://developers.cloudflare.com/pages/configuration/build-configuration/

### 独自ドメイン設定

候補：

- `atawi-music.jp`
- `atawi-music.com`
- `oishi-atawi-music.com`
- `music.hiroyuki-oishi.com`

最終的にはドメイン取得可否を確認して決める。  
Cloudflare Pagesでは、ダッシュボードのWorkers & Pagesから対象プロジェクトを選び、Custom domainsで独自ドメインを追加する。  
参考：Cloudflare Pages Custom domains  
https://developers.cloudflare.com/pages/configuration/custom-domains/

---


---

## 10-A. ロゴイメージ設計

### 基本ロゴ

ロゴは、添付のイメージを方向性の基準とする。

```text
ATAWI
MUSIC
Presented by Hiroyuki Oishi
```

### ロゴに込める思想

- **ATAWI**：IWATAを逆からたどる言葉。過去へさかのぼる視点を表す。
- **MUSIC**：このサイトの入口は、必ず音楽であることを明確にする。
- **Presented by Hiroyuki Oishi**：大石浩之の個人チャンネルであることを、上品に示す。
- 黒い背景：夜、記憶、静けさ、深い余韻。
- ゴールド：大人の品格、時間を経ても残る価値。
- シルバー：冷静さ、都市性、東京の記憶。
- 音符：音楽への敬意。
- 波線・スイープライン：音の流れ、記憶が過去へさかのぼる線。

### ロゴ表記ルール

正式表記は、必ず以下とする。

```text
ATAWI MUSIC
Presented by Hiroyuki Oishi
```

禁止表記：

```text
ATAWI MUSIC PRESENT
Presents by Hiroyuki Oishi
Present by Hiroyuki Oishi
Hiroyuki Oihis
Hiroyuki Oihis
```

※ 英語として自然な表記は **Presented by Hiroyuki Oishi**。  
生成AIでロゴを作る場合、名前の綴り崩れが起きやすいため、必ず最終確認する。

### ロゴ種類

最低限、以下の4種類を用意する。

```text
assets/images/logo/atawi-music-logo-main.png
assets/images/logo/atawi-music-logo-header.png
assets/images/logo/atawi-music-logo-icon.png
assets/images/logo/atawi-music-logo-horizontal.png
```

### 1. メインロゴ

用途：

- トップページのファーストビュー
- OGP画像
- サイト紹介画像
- SNS投稿用バナー

仕様：

- 黒背景
- ATAWIを大きく表示
- MUSICを字間広めで配置
- 下部にPresented by Hiroyuki Oishi
- ゴールドとシルバーの金属感
- 音符・波線を控えめに使用

### 2. サイトヘッダー用ロゴ

用途：

- 全ページ共通ヘッダー
- スマホ表示
- ナビゲーション横

仕様：

- 横長
- 高さは40〜64px程度でも読めること
- 装飾は控えめ
- `ATAWI MUSIC` を最優先
- `Presented by Hiroyuki Oishi` は小さく入れるか、省略してもよい

### 3. 正方形アイコン

用途：

- favicon
- SNSアイコン
- OGPの補助画像
- スマホホーム画面アイコン

仕様：

- 正方形
- 黒背景
- `A` または `AM` を中心にする
- 音符を小さく入れる
- 小さくしても認識できるよう、文字数を減らす
- `Presented by` は入れない

### 4. 横長ロゴ

用途：

- 記事ページ上部
- フッター
- YouTubeチャンネルバナー
- SNSヘッダー

仕様：

- 白背景版と黒背景版を用意する
- `ATAWI MUSIC` の可読性を優先
- 装飾は波線1本程度に抑える
- 小さな表示でも高級感が残ること

### ロゴ制作プロンプト

生成AIで再作成する場合は、以下を使う。

```text
Create a refined luxury music brand logo for "ATAWI MUSIC".
Use a deep black charcoal background, metallic gold and silver serif typography,
subtle musical note motifs, elegant soundwave or piano-line accents,
and a sweeping gold line suggesting sound, memory, and time.
Include the exact text:
ATAWI MUSIC
Presented by Hiroyuki Oishi

The design should feel mature, quiet, premium, and suitable for a personal music essay channel.
Avoid pop, neon, cartoon, club, EDM, or aggressive music label styles.
Ensure all text is spelled correctly.
```

---

## 10-B. サイトデザインへのロゴ反映

### ヘッダー

ヘッダー左上に、横長の `ATAWI MUSIC` ロゴを配置する。  
背景は黒またはチャコール。  
ナビゲーションは白文字、ホバー時のみゴールドにする。

### ファーストビュー

トップページのファーストビューでは、メインロゴを中央に置く。

下には次のコピーを配置する。

```text
過去をさかのぼるほど、今が大事になる。
大石浩之が、仕事・街・記憶とともに音楽を読む。
```

CTAは控えめにする。

```text
最新の記事を読む
音楽考察を読む
```

### 記事ページ

記事ページではロゴを主張しすぎない。  
記事タイトルと本文が主役である。

上部には小さなヘッダーロゴ。  
記事末尾に、プロフィールとともに `Presented by Hiroyuki Oishi` の思想を自然に置く。

### フッター

フッターではロゴとともに、以下を記載する。

```text
ATAWI MUSIC
Presented by Hiroyuki Oishi

音楽を通して、過去をさかのぼり、今を聴き直す。
運営：大石浩之｜富士ヶ丘サービス株式会社 代表取締役
```


## 10. デザイン方針

### 色

夜の印象を出すが、暗すぎて読みにくくしない。

推奨カラー：

```css
:root {
  --bg: #111317;
  --panel: #1b1f26;
  --text: #f3eee7;
  --muted: #b8aea3;
  --accent: #c9a46a;
  --line: rgba(255,255,255,0.12);
}
```

### 雰囲気

- 夜
- 静か
- 大人
- 東京の記憶
- 仕事帰り
- 余白がある
- 売り込み臭を出さない

### 避ける表現

- 派手な音楽メディア風
- 若者向けランキングサイト風
- 不動産営業LP風
- 過剰なCTA
- 歌詞転載サイト風

---

## 11. 法務・著作権ルール

音楽考察サイトで特に注意する。

### 禁止

- 歌詞全文の転載
- 歌詞の長い引用
- CDジャケット画像の無断使用
- アーティスト写真の無断使用
- YouTube動画のダウンロード転載
- 他サイトのレビュー丸写し

### 許容方針

- 公式YouTubeリンクを紹介する
- 公式MVを埋め込む場合は、YouTubeの共有・埋め込み機能を使う
- 歌詞を扱う場合は、短く、引用の必然性がある範囲にする
- 引用箇所は本文と明確に区別する
- 出典を明示する
- 基本は自分の解釈・記憶・体験を本文の中心にする

文化庁の著作権制度資料では、報道・批評・研究等の目的で他人の著作物を引用できる場合がある一方、公表済み著作物であること、公正な慣行に合うこと、正当な範囲内であること、出所明示などが求められる。  
参考：文化庁 著作権制度資料  
https://www.bunka.go.jp/seisaku/chosakuken/

JASRACは、JASRACと利用許諾契約を締結している一部ブログサービスでは個人ユーザーが個別許諾なしで歌詞掲載できる場合があると案内しているが、自前サイトでの歌詞掲載は別扱いになる可能性があるため、ATAWI MUSICでは歌詞掲載を最小限にする。  
参考：JASRAC 歌詞・楽譜の配信  
https://www.jasrac.or.jp/users/internet/score/

---

## 12. SEO設計

### 狙う検索軸

- 曲名 + 考察
- 曲名 + 大人に刺さる
- 曲名 + 東京
- アーティスト名 + 曲名 + 意味
- 夜に聴きたい曲
- 東京で頑張っていた頃 曲
- 仕事帰りに聴きたい曲

### タイトルタグ例

```text
Nulbarich『TOKYO』は、東京で折れなかった自分を思い出す曲｜ATAWI MUSIC
```

### メタディスクリプション例

```text
Nulbarich『TOKYO』を、大石浩之が仕事・街・記憶の視点から読む。東京で頑張っていた頃の自分、都会の孤独、折れなかった記憶をたどる音楽考察。
```

---

## 13. 初期記事10本案

1. Nulbarich『TOKYO』は、東京で折れなかった自分を思い出す曲
2. 古内東子『somewhere in TOKYO』は、同じ街にいるのに遠い人を思い出す曲
3. 東京で頑張っていた頃に聴くと戻ってくる音楽
4. 仕事帰りの夜に効く曲とは何か
5. 大人になってから分かる恋愛ソング
6. 若い頃の自分に会いに行く音楽
7. 街の名前が出てくる曲が、なぜ心に残るのか
8. 派手ではないのに、後から効く曲
9. 泣かせに来ない曲ほど、なぜ泣けるのか
10. 家や部屋の記憶を連れてくる音楽

---

## 14. 初回実装タスク

### 第1段階：最小公開

- GitHubリポジトリ `atawi-music` を作成
- `index.html` 作成
- `style.css` 作成
- `about.html` 作成
- 記事2本作成
  - Nulbarich『TOKYO』
  - 古内東子『somewhere in TOKYO』
- Cloudflare Pagesに接続
- `*.pages.dev` で公開確認

### 第2段階：独自ドメイン

- ドメイン候補を確認
- 取得
- Cloudflareに追加
- Custom domains設定
- sitemap.xml作成
- Google Search Console登録

### 第3段階：導線強化

- `home-and-memory.html` 作成
- 記事末尾CTAを統一
- 富士ヶ丘サービスの不動産ページへ自然リンク
- 問い合わせ導線追加

---

## 15. AIエージェントへの実装指示プロンプト

以下をそのままCodex / Claude Code / Antigravityへ渡す。

```text
新規静的サイト「ATAWI MUSIC｜大石浩之の、過去をさかのぼり、今を聴く音楽考察」を作成してください。

目的：
音楽考察を入口に、大石浩之という個人への信頼を育て、最終的に磐田市周辺の相続・空き家・不動産相談へ自然につなげるサイトです。

公開方式：
GitHubリポジトリで管理し、Cloudflare Pagesで公開する前提です。
ビルドツールは使わず、静的HTML/CSS/JSで作成してください。

サイト名：
ATAWI MUSIC

正式名称：
ATAWI MUSIC｜大石浩之の、過去をさかのぼり、今を聴く音楽考察

ロゴ表記：
ATAWI MUSIC
Presented by Hiroyuki Oishi

トップ表示：
ATAWI MUSIC｜大石浩之の、過去をさかのぼり、今を聴く音楽考察
過去をさかのぼるほど、今が大事になる。

作成ファイル：
- index.html
- about.html
- home-and-memory.html
- contact.html
- articles/index.html
- articles/nulbarich-tokyo.html
- articles/somewhere-in-tokyo.html
- themes/tokyo.html
- themes/night.html
- themes/city.html
- themes/work.html
- themes/adult.html
- assets/css/style.css
- assets/js/main.js
- robots.txt
- sitemap.xml
- README.md

デザイン：
夜・静けさ・大人・東京の記憶・仕事帰りを感じる落ち着いたデザインにしてください。
背景は暗め、文字は読みやすく、アクセントに控えめなゴールド系を使ってください。
不動産営業LPのような雰囲気にはしないでください。

記事方針：
歌詞全文転載は禁止。
長い歌詞引用も禁止。
公式YouTubeリンクまたは埋め込みを使い、本文は大石浩之自身の解釈・記憶・人生との接続を中心にしてください。

不動産導線：
タイトルやファーストビューに「不動産屋社長」「富士ヶ丘サービス」を出しすぎないでください。
ただしプロフィール、フッター、記事末尾では本業を隠さず、富士ヶ丘サービス株式会社代表であること、磐田市周辺で相続・空き家・土地建物の相談ができることを自然に明記してください。

記事末尾CTA文：
音楽は、昔住んだ街や、若い頃の自分を思い出させてくれます。
家や土地もまた、誰かの時間が残る場所です。
磐田市周辺で、相続した実家・空き家・土地の整理に悩んでいる方は、富士ヶ丘サービスまでご相談ください。

CTAボタン文言：
家・土地・空き家の整理について相談する

全体のトーン：
売り込みではなく、記憶・街・人生を大切にする個人メディアとして作ってください。
```

---

## 16. 最終結論

サイト名は、

# ATAWI MUSIC

正式名称は、

# ATAWI MUSIC｜大石浩之の、過去をさかのぼり、今を聴く音楽考察

この構成で進める。

「不動産屋社長」はタイトルには入れない。  
「富士ヶ丘サービス」もタイトルには入れない。  
ただし、プロフィール・フッター・記事末尾では正直に出す。

このサイトは、音楽を語るサイトでありながら、最終的には大石浩之という人への信頼をつくるサイトである。  
その信頼が、相続・空き家・不動産相談へ自然につながる。


---

## 17. 音楽登録DB設計

### 基本方針

ATAWI MUSICでは、曲が増えても分類・一覧・テーマ表示が崩れないように、最初から音楽登録DBを持たせる。

ただし、初期段階では本格的な外部DBは使わない。  
Supabase、MySQL、WordPress、CMSは使わない。

最初は静的JSONファイルで管理する。

```text
data/songs.json
```

このファイルを、ATAWI MUSICの音楽台帳とする。

### songs.json の役割

`songs.json` は、単なる曲リストではない。

ATAWI MUSICにおける曲の登録台帳であり、  
大石浩之の記憶を分類する棚でもある。

通常分類：

- 曲名
- アーティスト名
- 発売年
- 年代
- ジャンル
- 作詞者
- 作曲者
- 編曲者
- YouTube URL
- 記事URL

ATAWI MUSIC独自分類：

- 東京で頑張っていた頃
- 夜に残る曲
- 仕事帰りに効く曲
- 大人になって分かる曲
- 作業効率が上がる曲
- 落ち着く曲
- 元気をもらえる曲
- 街を思い出す曲
- 家や記憶につながる曲
- 過去をさかのぼり、今を聴く曲

### 初回実装で作成するDBファイル

```text
data/
├── songs.json
├── artists.json
├── genres.json
└── themes.json
```

初回実装で必須なのは `songs.json`。  
`artists.json`、`genres.json`、`themes.json` は将来拡張用として最小構成で作成する。

### 一覧表示ルール

`assets/js/main.js` は、`data/songs.json` を読み込み、以下を実行する。

1. `status` が `published` の曲だけ表示する
2. `articles/index.html` では全曲を表示する
3. `themes/tokyo.html` では東京系の曲を表示する
4. `themes/night.html` では夜に残る曲を表示する
5. `themes/work.html` では仕事帰りに効く曲を表示する
6. `themes/adult.html` では大人になって分かる曲を表示する
7. `themes/city.html` では街を思い出す曲を表示する

初回実装では、本格的な検索機能は不要。  
ただし、将来検索・絞り込み・年代別一覧・アーティスト別一覧へ拡張できるよう、データ構造は整理しておく。

---

## 18. 一度の実行で完成させる実装指示

AIエージェントは、以下を一度の実行で作成すること。

### 作成ファイル

```text
index.html
about.html
home-and-memory.html
contact.html
articles/index.html
articles/nulbarich-tokyo.html
articles/somewhere-in-tokyo.html
themes/tokyo.html
themes/night.html
themes/city.html
themes/work.html
themes/adult.html
assets/css/style.css
assets/js/main.js
assets/images/logo/atawi-music-logo-main.png
assets/images/profile/oishi.jpg
data/songs.json
data/artists.json
data/genres.json
data/themes.json
robots.txt
sitemap.xml
README.md
```

### 実装上の重要ルール

- サイトは静的HTML/CSS/JSで作る
- 外部DB・CMS・ビルドツールは使わない
- Cloudflare Pagesでそのまま公開できる構成にする
- ページは基本文字のみで構成する
- 画像はロゴと大石浩之の顔写真のみ使う
- 記事ごとのAI生成画像・夜景素材・ジャケット画像・アーティスト写真は使わない
- 歌詞全文転載は禁止
- 長い歌詞引用は禁止
- 公式YouTubeリンクまたは埋め込みを使う
- 曲が主役、文章が軸、顔写真は署名、ロゴは看板

### 初期登録曲

初回実装では、以下2曲を `data/songs.json` に登録し、記事ページも作成する。

1. 古内東子『somewhere in TOKYO』
2. Nulbarich『TOKYO』

### DB連動

`articles/index.html` と各テーマページは、`songs.json` の内容から曲カードを表示する。  
HTMLに曲リストを固定で直書きして終わらせない。  
将来曲を追加したとき、`songs.json` を更新するだけで一覧やテーマページに反映できる構造にする。

---

## 19. AIエージェントへ渡す一括実装プロンプト

```text
新規静的サイト「ATAWI MUSIC｜大石浩之の、過去をさかのぼり、今を聴く音楽考察」を一度の実行で作成してください。

目的：
音楽考察を入口に、大石浩之という個人への信頼を育て、最終的に磐田市周辺の相続・空き家・不動産相談へ自然につなげるサイトです。

公開方式：
GitHubリポジトリで管理し、Cloudflare Pagesで公開する前提です。
ビルドツールは使わず、静的HTML/CSS/JSで作成してください。

サイト名：
ATAWI MUSIC

正式名称：
ATAWI MUSIC｜大石浩之の、過去をさかのぼり、今を聴く音楽考察

ロゴ表記：
ATAWI MUSIC
Presented by Hiroyuki Oishi

トップ表示：
ATAWI MUSIC｜大石浩之の、過去をさかのぼり、今を聴く音楽考察
過去をさかのぼるほど、今が大事になる。

作成ファイル：
- index.html
- about.html
- home-and-memory.html
- contact.html
- articles/index.html
- articles/nulbarich-tokyo.html
- articles/somewhere-in-tokyo.html
- themes/tokyo.html
- themes/night.html
- themes/city.html
- themes/work.html
- themes/adult.html
- assets/css/style.css
- assets/js/main.js
- data/songs.json
- data/artists.json
- data/genres.json
- data/themes.json
- robots.txt
- sitemap.xml
- README.md

音楽登録DB：
外部DBやCMSは使わず、静的JSONで管理してください。
必ず data/songs.json を作成し、初期データとして以下の2曲を登録してください。

1. 古内東子『somewhere in TOKYO』
2. Nulbarich『TOKYO』

songs.json には、曲名、アーティスト名、発売年、年代、ジャンル、作詞者、作曲者、編曲者、YouTube URL、記事URL、テーマ、ムード、大石浩之の人生文脈、公開状態を持たせてください。

articles/index.html では、songs.json を読み込み、公開済みの曲一覧を表示してください。
themes/tokyo.html、themes/night.html、themes/work.html、themes/adult.html、themes/city.html では、songs.json の themes に基づいて曲を分類表示してください。

ATAWI MUSICの分類は、一般的な音楽ジャンルだけではなく、大石浩之の記憶分類を重視してください。

重要な分類軸：
- 東京で頑張っていた頃
- 夜に残る曲
- 仕事帰りに効く曲
- 大人になって分かる曲
- 作業効率が上がる曲
- 落ち着く曲
- 元気をもらえる曲
- 街を思い出す曲
- 家や記憶につながる曲
- 過去をさかのぼり、今を聴く曲

デザイン：
夜・静けさ・大人・東京の記憶・仕事帰りを感じる落ち着いたデザインにしてください。
背景は暗め、文字は読みやすく、アクセントに控えめなゴールド系を使ってください。
不動産営業LPのような雰囲気にはしないでください。

画像方針：
ページは基本文字のみで構成してください。
画像はロゴと大石浩之本人の顔写真のみ使用してください。
AI生成の雰囲気画像、夜景、アーティスト写真、ジャケット画像、MVスクリーンショットは使わないでください。

記事方針：
歌詞全文転載は禁止。
長い歌詞引用も禁止。
公式YouTubeリンクまたは埋め込みを使い、本文は大石浩之自身の解釈・記憶・人生との接続を中心にしてください。

不動産導線：
タイトルやファーストビューに「不動産屋社長」「富士ヶ丘サービス」を出しすぎないでください。
ただしプロフィール、フッター、記事末尾では本業を隠さず、富士ヶ丘サービス株式会社代表であること、磐田市周辺で相続・空き家・土地建物の相談ができることを自然に明記してください。

記事末尾CTA文：
音楽は、昔住んだ街や、若い頃の自分を思い出させてくれます。
家や土地もまた、誰かの時間が残る場所です。
磐田市周辺で、相続した実家・空き家・土地の整理に悩んでいる方は、富士ヶ丘サービスまでご相談ください。

CTAボタン文言：
家・土地・空き家の整理について相談する

全体のトーン：
売り込みではなく、記憶・街・人生を大切にする個人メディアとして作ってください。
曲が主役。
文章が軸。
顔写真は署名。
ロゴは看板。
画像素材は不要。
```
