# CircleLog チェックリスト（厳密再採点）

最終更新: 2026-02-12

## Must（M1-M4）
- [x] M1 24時間円グラフ（SVG/400x400/ラベル/中央日付/未登録グレー/segment testid）
- [x] M2 活動追加（Dialog、入力、disabled制御、保存後反映・リセット）
- [x] M3 活動一覧（選択日フィルタ、昇順、`HH:MM`/`H:MM`、空メッセージ）
- [x] M4 活動削除（AlertDialog、確認文言、即時更新）

## Should（S1-S2）
- [x] S1 クイック追加（6ボタン、色、testid、カテゴリ選択済みでダイアログ）
- [x] S2 日付切替（前日/次日/今日、`YYYY/MM/DD (曜)`、連動表示）

## Could（C1-C2）
- [x] C1 合計表示（カテゴリ集計、降順、`H:MM`、`XX.X%`）
- [x] C2 localStorage永続化（保存・復元・例外時フォールバック）

## テスト/ビルド
- [x] Vitest（12件）通過
- [x] Playwright E2E（3件）通過
- [x] `npx tsc --noEmit` 通過
- [x] `npm run build` 通過

## 提出要件・仕様の未達
- [ ] `npm test` で全テスト（Vitest + Playwright）を実行可能にする
- [ ] `Category.id` を UUID v4 にする

## 次アクション
- [ ] `package.json` のテストスクリプトを再設計（`npm test` に unit + e2e を統合）
- [ ] デフォルトカテゴリIDを UUID v4 へ変更
- [ ] 変更後に再検証
  - [ ] `npm test`
  - [ ] `npx tsc --noEmit`
  - [ ] `npm run build`
  - [ ] `npx playwright test`
