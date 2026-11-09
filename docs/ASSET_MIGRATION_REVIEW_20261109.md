# 新サイト：旧サイト依存アセット89件の移行前審査台帳

基準日: 2026-11-09
対象: 旧サイト Git `a1deb9ff2580b37ac69bb56bef3089d73f82c75b`、新サイト PR #3 の `data/public-asset-dependencies.json`

移行候補92件のうち、既に同一性を検証して移した3件を除き、**89件すべて保留**。以下はファイル名・容量・出典Gitハッシュに基づく**事前分類**であり、内容審査・転載許諾・プライバシー審査・SHA-256を完了したという意味ではない。PDF・画像・ZIPを勝手に加工・黒塗り・公開しない。

内訳: 一宮市開示資料抜粋JPG 56件、その他論考用画像27件、添付PDF5件、ZIP1件。

## 公開前の必須ゲート

1. 原資料を取得し、用途・出典・頁を本人閲覧可能な一次資料と照合する。
2. 氏名・連絡先・児童／保護者情報等を含むか確認し、適法性・公開必要性を個別判断する。出典が既に公開されていることのみで転載可としない。
3. 同一ファイルのSHA-256を比較し、引用・翻案・著作権に関する扱いとクレジットを確定する。Git blob SHA-1は原ファイルのSHA-256と同一ではない。
4. 「移行可」「既存公開URLのまま」「保留」をファイルごとに確定し、新サイトでリンク切れが発生しないことをPC・モバイル双方で検証する。
5. マージ・本番デプロイ・ドメイン移行・既存Google Drive共有権限変更を行わない。

## 一宮市の開示資料抜粋画像（56件）

判定: 全件「移行保留」。確認事項: 一宮市の開示PDFと画像内容を突合。氏名・電話番号・連絡先・児童情報等の有無を画像単位で点検。出典頁と原本SHA-256が紐付くまで移行禁止。

| 原サイト内パス | バイト数 | 利用記事 | 原Git blob SHA-1 |
|---|---:|---|---|
| `/assets/research/ichinomiya-20261108/asa6_3.jpg` | 142851 | ichinomiya-pta-settlements-20261108 | `5e41cc0237be44b99e99d5352b700eee6d55af47` |
| `/assets/research/ichinomiya-20261108/asa7_3.jpg` | 240844 | ichinomiya-pta-settlements-20261108 | `a0c4a1e5ece28c85c5920f31a2084c2672d352a1` |
| `/assets/research/ichinomiya-20261108/asa7_4.jpg` | 234785 | ichinomiya-pta-settlements-20261108 | `366adb15ba54b4b85b4a20ad1ecbd1b12eee13f7` |
| `/assets/research/ichinomiya-20261108/asm6_2.jpg` | 134332 | ichinomiya-pta-settlements-20261108 | `c27b67a163c7a9da3ca764a394fa859c98597c6d` |
| `/assets/research/ichinomiya-20261108/asm6_3.jpg` | 155353 | ichinomiya-pta-settlements-20261108 | `939c6a6200be6b7842ed1d484811c472829d5c65` |
| `/assets/research/ichinomiya-20261108/asm7_2.jpg` | 132053 | ichinomiya-pta-settlements-20261108 | `1ebdc6d3029450089ffe0db0b5f034a1c447183b` |
| `/assets/research/ichinomiya-20261108/asm7_3.jpg` | 159690 | ichinomiya-pta-settlements-20261108 | `478d633bee282eca51dc8b19b9c85fce383ec6d7` |
| `/assets/research/ichinomiya-20261108/asn6_4.jpg` | 134799 | ichinomiya-pta-settlements-20261108 | `ae173a1631999024077d3d33ceb59ffe183c0004` |
| `/assets/research/ichinomiya-20261108/asn6_5.jpg` | 112705 | ichinomiya-pta-settlements-20261108 | `7d172ff652c8976f53e3527bb8cee788680f9974` |
| `/assets/research/ichinomiya-20261108/asn7_5.jpg` | 114769 | ichinomiya-pta-settlements-20261108 | `9e7d35e8caa5a8eafb177dd36a394def10e94583` |
| `/assets/research/ichinomiya-20261108/fuji7_3.jpg` | 91808 | ichinomiya-pta-settlements-20261108 | `bb66b1cf7215f1d607985fb7043af932960eda1b` |
| `/assets/research/ichinomiya-20261108/fuji7_4.jpg` | 83231 | ichinomiya-pta-settlements-20261108 | `9cac740813ac46b7d38840be9d8dde2d5ea4c73d` |
| `/assets/research/ichinomiya-20261108/fuji7_5.jpg` | 66026 | ichinomiya-pta-settlements-20261108 | `cea99f437783f0e42308049b45d5806239f430c1` |
| `/assets/research/ichinomiya-20261108/hagi6_2.jpg` | 183425 | ichinomiya-pta-settlements-20261108 | `ec9fc094600996f7c3ca0cd42aa8102de90d593c` |
| `/assets/research/ichinomiya-20261108/hagi7_2.jpg` | 182422 | ichinomiya-pta-settlements-20261108 | `3e8b600a2bc91c770052230f7db9557dee756e29` |
| `/assets/research/ichinomiya-20261108/hagiK7_1.jpg` | 139105 | ichinomiya-pta-settlements-20261108 | `71f29995cddbe507cb2ba953ac4e5631880fac62` |
| `/assets/research/ichinomiya-20261108/hagiN7_1.jpg` | 81043 | ichinomiya-pta-settlements-20261108 | `ff6cbb51a64018d8f97569c6551fba77ad83c5dc` |
| `/assets/research/ichinomiya-20261108/hgr6_2.jpg` | 169963 | ichinomiya-pta-settlements-20261108 | `e53e7a33752094a052065bb433aaf3e3072ffb14` |
| `/assets/research/ichinomiya-20261108/hgr7_2.jpg` | 163536 | ichinomiya-pta-settlements-20261108 | `e56c1ccdda37258ddb42dbc17e2fe0c03bffc0ee` |
| `/assets/research/ichinomiya-20261108/hok6_2.jpg` | 198314 | ichinomiya-pta-settlements-20261108 | `0edac514b98c970807bfa53867bb968388d92cbc` |
| `/assets/research/ichinomiya-20261108/hok6_3.jpg` | 135557 | ichinomiya-pta-settlements-20261108 | `a7d239fea08d64755acadc533a72a9425f418c35` |
| `/assets/research/ichinomiya-20261108/hokN7_1.jpg` | 113177 | ichinomiya-pta-settlements-20261108 | `e90b639c973d9d0a221fc5cbd23d2ec2cd1c28f1` |
| `/assets/research/ichinomiya-20261108/ima6_3.jpg` | 149743 | ichinomiya-pta-settlements-20261108 | `7073fb188289d52bbd68bea5d50a6252c1cfac93` |
| `/assets/research/ichinomiya-20261108/ima6_4.jpg` | 156290 | ichinomiya-pta-settlements-20261108 | `89d7b947b8388c9d92fa2a453f25a6eeb1328a45` |
| `/assets/research/ichinomiya-20261108/ima7_3.jpg` | 174850 | ichinomiya-pta-settlements-20261108 | `0923efe083aa3ebe3ba3a1117f02e14d67e0765f` |
| `/assets/research/ichinomiya-20261108/ima7_4.jpg` | 162277 | ichinomiya-pta-settlements-20261108 | `c882d1bb89b25c252b5c580d90de0d003c8abf8b` |
| `/assets/research/ichinomiya-20261108/imaN7_1.jpg` | 49037 | ichinomiya-pta-settlements-20261108 | `188da5ae8eb4bd7ddfe8df0d45d50baa6c867281` |
| `/assets/research/ichinomiya-20261108/kai6_4.jpg` | 170421 | ichinomiya-pta-settlements-20261108 | `11f756d4349f92de88ad4cd6483d667da06c314f` |
| `/assets/research/ichinomiya-20261108/kai7_4.jpg` | 164384 | ichinomiya-pta-settlements-20261108 | `efbe50e8b4d2b8fadfec32f51be8cf7daeecfa0d` |
| `/assets/research/ichinomiya-20261108/kif7_2.jpg` | 109737 | ichinomiya-pta-settlements-20261108 | `d983502f51d0fb5ec844a2a14fd72a8e52d3e1b7` |
| `/assets/research/ichinomiya-20261108/kifN7_1.jpg` | 173708 | ichinomiya-pta-settlements-20261108 | `7b92aff5ed617c065acccfca3b6241c2488fa081` |
| `/assets/research/ichinomiya-20261108/kis6_7.jpg` | 162641 | ichinomiya-pta-settlements-20261108 | `05e1e177b966deb9f6d37b1927034061a74962f6` |
| `/assets/research/ichinomiya-20261108/kita6_3.jpg` | 212314 | ichinomiya-pta-settlements-20261108 | `7ffdff751de83722c77ca7e90ef66e0e1ec9dc39` |
| `/assets/research/ichinomiya-20261108/kita7_3.jpg` | 207000 | ichinomiya-pta-settlements-20261108 | `1637a0ec4a6745ba0a095c3178ed2393047cef6e` |
| `/assets/research/ichinomiya-20261108/miya6_2.jpg` | 93577 | ichinomiya-pta-settlements-20261108 | `6fa21e3cd7cad4312a687f0b9289a7711982eaa0` |
| `/assets/research/ichinomiya-20261108/miya7_2.jpg` | 193917 | ichinomiya-pta-settlements-20261108 | `b5550f127f3f9ab666970c965f4d104b4a2e9a17` |
| `/assets/research/ichinomiya-20261108/miya7_3.jpg` | 92595 | ichinomiya-pta-settlements-20261108 | `091686ff2527d17d044966169d3bb088e77b218c` |
| `/assets/research/ichinomiya-20261108/nak6_3.jpg` | 154060 | ichinomiya-pta-settlements-20261108 | `aee1da1a70613c675623ad16f910ba07a5f70615` |
| `/assets/research/ichinomiya-20261108/nak6_4.jpg` | 92648 | ichinomiya-pta-settlements-20261108 | `70be2ae4d2a39029383c21179572067c379d0051` |
| `/assets/research/ichinomiya-20261108/nakN7_1.jpg` | 104502 | ichinomiya-pta-settlements-20261108 | `6b58bb269f7acfabad377cd2587e48cf3a81b297` |
| `/assets/research/ichinomiya-20261108/nan6_2.jpg` | 191934 | ichinomiya-pta-settlements-20261108 | `052556ecd8472a0aa17b19296a29eabd16d38b51` |
| `/assets/research/ichinomiya-20261108/nan7_2.jpg` | 182477 | ichinomiya-pta-settlements-20261108 | `90c868116c00c7fb17c9f5b47326b19e25638b3f` |
| `/assets/research/ichinomiya-20261108/obu6_16.jpg` | 158637 | ichinomiya-pta-settlements-20261108 | `8f55accc0a05845f8af31f7c71a2a3247faf2044` |
| `/assets/research/ichinomiya-20261108/obu7_13.jpg` | 164301 | ichinomiya-pta-settlements-20261108 | `0449cda79ac1a88f53a83709b89fbb4abb8b0eb3` |
| `/assets/research/ichinomiya-20261108/obu7_14.jpg` | 120349 | ichinomiya-pta-settlements-20261108 | `3c2bde92179ac0395655a6c66164ac0cf8871699` |
| `/assets/research/ichinomiya-20261108/oku6_2.jpg` | 180628 | ichinomiya-pta-settlements-20261108 | `b48beee6e541089d0b1a896b690c9323100bd5cf` |
| `/assets/research/ichinomiya-20261108/oku6_8.jpg` | 124840 | ichinomiya-pta-settlements-20261108 | `d0eba99257d8e644aa437ede4c57225c0a401794` |
| `/assets/research/ichinomiya-20261108/oku7_2.jpg` | 185603 | ichinomiya-pta-settlements-20261108 | `e9b204c4311f04d11348bf32837fc14c2de3dfcd` |
| `/assets/research/ichinomiya-20261108/tns6_3.jpg` | 117412 | ichinomiya-pta-settlements-20261108 | `c3bbc2e0f1199f02ba0c2a2609b238d3f4ead1d8` |
| `/assets/research/ichinomiya-20261108/tns6_4.jpg` | 94281 | ichinomiya-pta-settlements-20261108 | `c454a8ddc24ccfc17ee459d3dacb82af86c34fa1` |
| `/assets/research/ichinomiya-20261108/tnw7_2.jpg` | 141564 | ichinomiya-pta-settlements-20261108 | `25c6696dcb4f7dd07ac90b088104f3926d361411` |
| `/assets/research/ichinomiya-20261108/tnw7_3.jpg` | 123653 | ichinomiya-pta-settlements-20261108 | `8508a3e450dbd5f4996d756f60763ac4778ce7d9` |
| `/assets/research/ichinomiya-20261108/ytc6_3.jpg` | 156153 | ichinomiya-pta-settlements-20261108 | `68cd5235c4b3b6afd5fd7d48552dc999f195b161` |
| `/assets/research/ichinomiya-20261108/ytc7_2.jpg` | 155841 | ichinomiya-pta-settlements-20261108 | `dd0221b9a4e7dd781d57152e447843312501b78e` |
| `/assets/research/ichinomiya-20261108/ywn6_1.jpg` | 144780 | ichinomiya-pta-settlements-20261108 | `94fa6ad73443f849be0d7052dc0662e0a89d44c6` |
| `/assets/research/ichinomiya-20261108/ywn7_1.jpg` | 145424 | ichinomiya-pta-settlements-20261108 | `b7e958014296aea15d92e612b013f8ec56e9c64d` |

## その他の論考用画像・資料抜粋（27件）

判定: 全件「移行保留」。確認事項: 出典と引用・再掲載条件を確認。可視の個人情報、引用元の同一性、画像内の脚注・日付を確認後に可否決定。

| 原サイト内パス | バイト数 | 利用記事 | 原Git blob SHA-1 |
|---|---:|---|---|
| `/assets/images/article35/jichiro-mext-2012.webp` | 5820 | pta-shokumu-sennen-gimu | `77fca422c5d4017f229e7b10aef9eb66b022f087` |
| `/assets/images/article35/jichisho-1964-full.png` | 966057 | pta-shokumu-sennen-gimu | `07aa6953eb80ad6edc01b89581a7a7357f47fd58` |
| `/assets/images/article35/mext-2006-duty.webp` | 11512 | pta-shokumu-sennen-gimu | `fd23dae736cc286b574e5f88b9cc95e750cf4740` |
| `/assets/images/mext-jri-pta-scope/jri-nishinogawa-p21.webp` | 284762 | mext-jri-pta-good-practice-legal-scope | `4bb1f25868932a8750108d8835f7dddde6c85c0c` |
| `/assets/images/mext-jri-pta-scope/jri-q12-q13-p84.webp` | 141334 | mext-jri-pta-good-practice-legal-scope | `68c19f1b6f54218319043bbc9b3e9110b3b852f9` |
| `/assets/images/mext-jri-pta-scope/jri-q16-p85.webp` | 136302 | mext-jri-pta-good-practice-legal-scope | `afbe6d41c7172681658866539fe5e0241a5044b0` |
| `/assets/images/mext-jri-pta-scope/ppc-review-order-p5-p8.webp` | 513728 | mext-jri-pta-good-practice-legal-scope | `8e7b8748be4d81b56acb723a1c390810c1a8d19a` |
| `/assets/images/ppc-points/ppc-page-05-school-point1.png` | 370330 | setagaya-pta-information-separation | `5c381db0d722ece032b512a80a430d650d49120e` |
| `/assets/images/ppc-points/ppc-page-08-temporary-note.png` | 444817 | setagaya-pta-information-separation | `3d91ccb803a19bbc96a34af6d7c52e66962e13d7` |
| `/assets/images/setagaya-pta-separation/setagaya-20251209-p3.png` | 236551 | setagaya-pta-information-separation | `313b86bc797dd48cf90b63443a843257b0446300` |
| `/assets/images/setagaya-pta-separation/setagaya-pta-guide-202604-p6.png` | 336150 | setagaya-pta-information-separation | `d6e0ed9a7f4d2ec2023a05621058af1dcb30adab` |
| `/assets/images/shinjuku-2020/minutes-p28.png` | 223416 | shinjuku-2020-pta-nonmember-data | `5664aa0480f7d55df9ac249233ea826745eaf538` |
| `/assets/images/shinjuku-2020/minutes-p29.png` | 104996 | shinjuku-2020-pta-nonmember-data | `ab84b1b2e8e4ed1d117029ff7ccb8398644ed659` |
| `/assets/images/social-education-law-pta/03-related-org.webp` | 18684 | social-education-law-pta-boundary | `f732a53369081f1c6903e90a1d206d16ffe99066` |
| `/assets/images/social-education-law-pta/04-facilities.webp` | 16488 | social-education-law-pta-boundary | `ef976ab62ad078132c803573fe3ac5054afa10c9` |
| `/assets/images/tamano-chuo-pta/committee-mandate.webp` | 188378 | tamano-chuo-pta-establishment | `c38ec4f3f6c3d6e10dbddc145e2b1a08d054aa29` |
| `/assets/images/tamano-chuo-pta/condolence-draft.webp` | 102262 | tamano-chuo-pta-establishment | `ab833a769afdca23ca3a95f7ebd37f0e9fe748cf` |
| `/assets/images/tamano-chuo-pta/fees-and-privacy.webp` | 178306 | tamano-chuo-pta-establishment | `01a839eb168f96c8ca92627a07e46bf8f2d381d6` |
| `/assets/images/tamano-chuo-pta/membership-debate.webp` | 214000 | tamano-chuo-pta-establishment | `e26900cf35ee55b081cea80e1c9c70d1eca78e5a` |
| `/assets/images/tamano-chuo-pta/membership-result.webp` | 190638 | tamano-chuo-pta-establishment | `202ff067e248b4ea155926afd1f30508a4c119aa` |
| `/assets/images/tamano-chuo-pta/privacy-deletion.webp` | 24770 | tamano-chuo-pta-establishment | `00658a1c0a1f738a10b44d27fa646bd5b8f8c76c` |
| `/assets/images/tamano-chuo-pta/school-accounting.webp` | 142174 | tamano-chuo-pta-establishment | `b8a5bbbc49f30ba77abf4b0add4c389f5ff7abb5` |
| `/assets/thumb_yokohama_bessi_p4.png` | 1799832 | yokohama-notice-1965 | `acaf56b2cf386e966659839a457e66a912c315fa` |
| `/assets/yokohama_bessi_p1.png` | 2071792 | yokohama-notice-1965 | `a88024b01b02569c65750c9bbc8a02721bbbbea5` |
| `/assets/yokohama_bessi_p2.png` | 1530814 | yokohama-notice-1965 | `2a72c326d431faefc724ea3d0b17a34fa6922570` |
| `/assets/yokohama_bessi_p3.png` | 1660552 | yokohama-notice-1965 | `c1c57d3449550487d533c1ed35cf12438a2443c8` |
| `/assets/yokohama_notice_p1.png` | 276768 | yokohama-notice-1965 | `808b1c56da31f40a14d4aea4bb8912badba8b140` |

## 添付PDF（5件）

判定: 全件「移行保留」。確認事項: 原本の全ページ確認、公開に問題のある個人情報・第三者著作物、取得元・使用条件を精査。ファイルのSHA-256を確定し、元の公開ファイルとバイト一致を検証。

| 原サイト内パス | バイト数 | 利用記事 | 原Git blob SHA-1 |
|---|---:|---|---|
| `/assets/docs/article35/jichiro-mext-2012.pdf` | 9681 | pta-shokumu-sennen-gimu | `946d522ef3971fbe0dd10c3a23faa3074642280a` |
| `/assets/docs/yokohama-notice-1965-complete.pdf` | 1723250 | yokohama-notice-1965, consumer-contract, optout-invalidity, nonmember-info | `c1a05fb7f3bed16c218ac7f75a8293c8aeba0ce4` |
| `/assets/documents/journal/pta-final-point-ptf.pdf` | 165510 | pta-final-point-ptf | `90fc6816b32c5c49bf90ab9e70a29cbaf7bfdfc7` |
| `/assets/documents/journal/pta-unified-legal-theory-v1-with-errata-20260809.pdf` | 585901 | pta-unified-legal-theory | `65030f75a4444b6c0b03d3fac3980dd767e3d915` |
| `/assets/documents/journal/pta-unified-legal-theory-v1.pdf` | 634541 | pta-unified-legal-theory | `4159264dbbd88516839f271a5b856fcd907de830` |

## 添付ZIP（1件）

判定: 全件「移行保留」。確認事項: ZIPを展開してファイル一覧・各ファイル内容・ライセンス・機微情報・ハッシュを別々に確認。ZIP一括の無条件公開は禁止。

| 原サイト内パス | バイト数 | 利用記事 | 原Git blob SHA-1 |
|---|---:|---|---|
| `/assets/documents/MEXT_JRI_PTA_investigation_20261002.zip` | 524103 | mext-jri-pta-good-practice-legal-scope | `c5b5b2d2ec1efe2ff982b9cb2ff4e40a944bcbfe` |
