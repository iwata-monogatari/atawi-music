## AIエージェントへ渡す一括実装プロンプト
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