# 日本地図の著作権・出典・利用条件

## 採用した地図
Geolonia / japanese-prefectures の `map-full.svg`（実際の日本列島の地理的形状を用いた47都道府県SVG）

- 原データ：https://github.com/geolonia/japanese-prefectures/blob/master/map-full.svg
- 原著作者の説明：https://github.com/geolonia/japanese-prefectures/blob/master/README.md
- 原図：Wikipedia「日本地図.svg」およびそこからの編集
- SVG編集：Geolonia and contributors
- ライセンス：GNU Free Documentation License (GFDL)、リポジトリ内 `docs/licenses/GFDL-1.3-only.txt` も参照

変更内容：SVGパスの地理形状は変更せず、ページ上のCSSで色・選択状態・枠線を設定し、JavaScriptで都道府県別のクリック・キーボード操作を付加する。

注意：原図では小笠原諸島等の一部離島が省略されている。地域検索は47都道府県一覧からすべて選べる。

## 廃止した地図
`lalamalink/japan-map-svg` の `deformed-japan-prefecture-map.svg`（CC0）を表示用から除外。これは地形を誇張した図で、正確な地域ナビには適切ではなかった。

## フォント
見出しはGoogle Fontsの Noto Serif JP を読み込み、端末の環境により Noto Serif CJK JP 等へフォールバック。書体の読み込み元：https://fonts.google.com/noto/specimen/Noto+Serif+JP
フォントファイルはリポジトリへ収録しない。
