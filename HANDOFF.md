# ATAWI MUSIC 全記事書き直し 引継ぎメモ

作成日時: 2026-07-03T21:26:00+09:00 (作業中断時点)

## 進捗状況

- 対象記事総数: **221曲**
- 書き直し完了: **179曲** (コミット＆プッシュ済み)
- 残り: **43曲**

## 直近の状態

- 直前のバッチ（5曲：King Gnu『白日』、星野源『アイデア』『不思議』、Original Love『接吻 -Kiss-』、MONDO GROSSO『ラビリンス』）は**執筆・ファイル書き換え完了、フォント検証、デプロイ、コミット＆プッシュ完了**。
- 直前のgit HEAD: `e9f987c` (5曲の記事を一次情報に基づき書き直し)

## 運用フロー(この後も継続する場合)

1. `data/songs.json` を順に読み、5曲ずつバッチにする
2. 5体のAgentを並列起動し、各記事を以下の方針で書き直す
   - 歌詞の引用は絶対禁止 (雰囲気・記憶の要約のみ)
   - WebSearchで制作背景・タイアップ・チャート成績・音楽的評論を裏取り
   - 確認済み事実は出典表記、未確認数字はヘッジ表現
   - 4要素 (制作背景/チャート成績/音楽的特徴/惹きつける理由) を大石浩之の記憶 (東京・磐田・仕事・家・土地・家族) と半々に織り込む
   - 導入500〜1000字、h2 3〜5個、本文合計4500〜5500字、参考リンク欄、不要CTA・明朝体禁止
   - 既存記事や同一アーティストの他記事と切り口が重複しないよう指示する
   - 明らかな事実誤り (前提の誤り) がある場合はWebSearchで正確な事実を確認し訂正する (これまで多数の事実誤りを発見・訂正済み)
3. 全員完了後、`grep -lE "Mincho|YuMincho|Noto Serif|Hiragino Mincho|明朝"` でNGフォント混入チェック
4. `C:\Users\fujig\tmp\atawi-music-public\articles\` に対象ファイルをコピー
5. `npm.cmd exec wrangler@latest -- pages deploy "C:\Users\fujig\tmp\atawi-music-public" --project-name=atawi-music --commit-dirty=true`
6. `git pull --ff-only` → `.wrangler/` 削除 → `git add` → `git commit` (バッチ内容を要約したメッセージ) → `git push`

## 残り42曲リスト(featured_order順、未着手)

| id | アーティスト | 曲名 |
|---|---|---|
| toki-asako-001 | 土岐麻子 | Gift〜あなたはマドンナ〜 |
| toki-asako-002 | 土岐麻子 | 美しい顔 |
| toki-asako-006 | 土岐麻子 | 愛を手探り |
| toki-asako-007 | 土岐麻子 | Bubble Gum Town |
| anri-001 | ANRI | 悲しみがとまらない |
| vaundy-007 | Vaundy | 花占い |
| takeuchi-mariya-004 | 竹内まりや | 駅 |
| takeuchi-mariya-005 | 竹内まりや | シングル・アゲイン |
| matsuda-seiko-004 | 松田聖子 | チェリーブラッサム |
| matsuda-seiko-005 | 松田聖子 | 暮れのバルコニー |
| kirinji-011 | KIRINJI | Rainy Runway |
| misia-003 | MISIA | つつみ込むように… |
| glay-001 | GLAY | HOWEVER |
| glay-002 | GLAY | GREAT VACATION |
| nonomura-ayano-001 | 野々村彩乃 | Ave Maria(Schubert) |
| nonomura-ayano-002 | 野々村彩乃 | 坂の上の雲/Stand Alone |
| kirinji-013 | KIRINJI | 進水式 |
| kirinji-014 | KIRINJI | Almond Eyes feat. 鎮座DOPENESS |
| ryuichi-sakamoto-002 | 坂本龍一 | The Last Emperor (Theme) |
| glay-005 | GLAY | グロリアス |
| mr-children-005 | Mr.Children | 抱きしめたい |
| mr-children-006 | Mr.Children | Tomorrow never knows |
| mr-children-007 | Mr.Children | himawari |
| m-flo-001 | m-flo | come again |
| tokyo-ska-001 | 東京スカパラダイスオーケストラ | 六本木純情派 |
| kuwata-keisuke-001 | 桑田佳祐 | 白い恋人達 |
| kuwata-keisuke-002 | 桑田佳祐 | 東京 |
| kuwata-keisuke-003 | 桑田佳祐 | ヨシ子さん。 |
| yamazaki-masayoshi-001 | 山崎まさよし | 「One more time,One more chance」 |
| pizzicato-five-001 | PIZZICATO FIVE | (曲名要確認・文字化けあり) |
| pizzicato-five-002 | PIZZICATO FIVE | (曲名要確認・文字化けあり) |
| yamazaki-masayoshi-002 | 山崎まさよし | (曲名要確認・文字化けあり) |
| saito-kazuyoshi-001 | 斉藤和義 | (曲名要確認・文字化けあり) |
| saito-kazuyoshi-002 | 斉藤和義 | (曲名要確認・文字化けあり) |
| ulfuls-001 | ウルフルズ | (曲名要確認・文字化けあり) |
| ulfuls-002 | ウルフルズ | (曲名要確認・文字化けあり) |
| ulfuls-003 | ウルフルズ | (曲名要確認・文字化けあり) |
| okuda-tamio-001 | 奥田民生 | (曲名要確認・文字化けあり) |
| ulfuls-004 | ウルフルズ | (曲名要確認・文字化けあり) |
| ulfuls-005 | ウルフルズ | (曲名要確認・文字化けあり) |
| eikichi-yazawa-001 | 矢沢永吉 | A DAY〜あれから〜 |
| yasuha-001 | Yasuha | Fly-day Chinatown |
| matsubara-miki-001 | 松原みき | 真夜中のドア〜stay with me |

※ 一部曲名がターミナル文字化けで再現できなかったものは「(曲名要確認)」としてある。実際の曲名は `data/songs.json` を `Read` ツールで直接読めば正しく取得できる(ターミナル経由のcatではなく、Readツールでの確認を推奨)。

## これまでに見つかった事実誤りの傾向(次回の参考)

既存記事(旧版)には、以下のような事実誤りがしばしば含まれていた。次回の執筆でも「前提を鵜呑みにせず必ずWebSearchで裏取りする」姿勢を継続すること。

- タイアップ先の誤り(例: サントリー→実際はコカ・コーラ、TBS→実際はフジテレビ等)
- リリース年・収録アルバムの誤り
- 「デビュー曲」「新人賞」等の位置づけの誤り
- 曲の長さ・ジャンルの誤り(例: 30秒のインストと思われていた曲が実際は2分54秒のヒップホップ曲だった)
- バンド体制(ソロ/バンド)の時期誤認
- MV出演者やクレジットの誤り

## 運用ルール(ユーザーからの指示)

- 「バッチの5件は堅持しながら、サイトの全件を確認禁止で完了させてください」との指示を受け、以降は5曲バッチを都度デプロイしながら確認なしで進行していた。
- 今後もYouTubeチャンネル更新のたびにリンクを送ってもらい、都度記事化する運用(通常の1曲リクエストフロー)も並行して継続する。

## 再開方法

このメモと `data/songs.json` を渡して「HANDOFF.mdの続きから、残り42曲の書き直しを再開してください」と依頼すれば、同じ手順で継続できる。
