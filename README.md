# PTA制度・運用研究 — 次世代サイト試作 (v0.1)

これは **ptaorg.com の置換ではなく、独立した新サイトの検討用プロトタイプ**です。現行 `ptaorg/ptaorg.github.io` に書き込みを行いません。

## 画面

| URL | 用途 |
|---|---|
| `/index.html` | 非専門家でも使いやすい入口・目的別導線・検索 |
| `/explore.html` | 学校・自治体・教育委員会回答の統合検索（絞り込み、URL保存、結果タイプ切替） |
| `/municipality.html?id=kawaguchi` | 自治体単位の研究概要、学校一覧、公開回答 |
| `/school.html?url=%2Farchive%2Fkawaguchi%2Fschool-009-es%2F` | 学校別一次資料の所在と公開状況の明示 |

`explore.html?q=安行小学校` はサンプル環境で該当学校のみ表示されます。検索と結果の表示順を統合しました。

## 起動・検証

外部ライブラリやビルド工程は不要です。`file://` では JSON を読み込めないため、HTTP サーバーから開きます。

```bash
cd ptaorg-site-next
python3 -m http.server 8765
# http://localhost:8765/
```

別のターミナルで：

```bash
npm test
```

## 公開済み実データの取り込み

**2026-10-28の同期PRで、現行リポジトリが公開している29地域・569校・教育委員会回答72件を `data/research-map-index.json` と `data/board-responses.json` に収録します。** `data/demo.json` は読み込み失敗時の画面確認用フォールバックとして残します。未公開文書原本や非公表メールは含めません。

公開されている全データ（現行索引では29地域・569校・72回答）を、既存サイトのローカルGitクローンから取り込みます。

```bash
node scripts/sync-public-data.mjs ../ptaorg.github.io
```

これにより **既存で公開済みの** `data/research-map-index.json` と `data/board-responses.json` のみをコピーします。`data/` 以外の資料、PDF・画像・メールの取り込みは行いません。読み込み時はこの2ファイルを優先し、無い場合のみ抜粋データで動作します。

同期後の結果を原本と照合し、公開・非公開区別を確認してください。現行の `ptaorg.com` はあくまで正本です。

## 同期済みデータの検証

`npm test` は既存の画面構造・検索回帰に加え、全件索引の件数、学校URLの一意性、公開回答URLのリンク先制限、公開前確認中の文書にダウンロードURLがないことを検査します。GitHub Actions `Site Next checks` はpushとPRでこのテストを実行します。GitHub Pagesへの自動公開は設定しません。

今回の同期は新リポジトリに**すでに公開済みの2つのJSONだけ**を複製します。現行リポジトリを編集しません。なお、掲載メタデータは原資料の法的適否や原本の公開許可を保証しません。

## 新規リポジトリへの格納

作成済みリポジトリ：`ptaorg/ptaorg-site-next`。
GitHub画面で空のリポジトリを作成してから、以下で追加できます。空リポジトリ作成時はREADME・license・gitignoreの自動追加をオフにしてください。

```bash
cd ptaorg-site-next
git init -b main
git add .
git commit -m "Prototype independent research site with four responsive views"
git remote add origin https://github.com/ptaorg/ptaorg-site-next.git
git push -u origin main
```

GitHub Actionsは `npm test` のみ実施し、**GitHub Pagesへのデプロイやカスタムドメイン指定はしません**。デザイン確定前に `ptaorg.com` のCNAME・DNSを編集しないでください。

## 設計上の原則

- 著者による分析と行政の公開回答、学校文書の登録情報を混同しない。
- `公開前確認中` のPDF本文やダウンロードリンクを追加しない。
- 学校・自治体の既存URLを変更せず、旧ページへの安全な参照リンクを保持する。
- プレビューから本番サイトに書き戻さない。公開済みソースJSONを表示用として読むだけ。
- 一度に全749+ページを作り直さず、4画面→使い勝手の確認→データ全件同期→その他画面の設計へ進む。

## 未実施

- 現行の全学校別HTML本文、PDF、研究論考の複製・公開
- 本番公開、ドメイン切替、SEO移行、全URLのリダイレクト
- ユーザー調査による使いやすさ検証
