# AGENTS.md

## 🎯 Mission

制限時間内に仕様書の要件を**正確に・完全に**再現する。自動採点システムで評価される。
仕様書にない機能は絶対に追加しない。動く70点 > クラッシュする100点。

## 📋 Workflow（厳守）

### Phase 1: 計画（最初の5〜10分）

1. 仕様書を全文読み、要件をリスト化する
2. 要件をMust/Should/Couldに分類する
3. 実装順序を決定する（Must → Should → Could）
4. **計画が完了するまでコードを書かない**

### Phase 2: TDD実装（60分）

各機能について以下のサイクルを回す：

1. 仕様書のサンプル入出力からテストを先に書く
2. テストを実行して失敗を確認（Red）
3. テストを通す最小限のコードを実装（Green）
4. テストが通ったら `git commit` する
5. 次の機能へ
⚠️ 残り20分になったらPhase 3へ強制移行

### Phase 3: 検証・修正（15分）

1. 全テストを実行し、失敗があれば修正
2. 出力フォーマットを仕様書と完全一致させる（空白、改行、大文字小文字）
3. エッジケースを確認
⚠️ 残り5分になったらPhase 4へ強制移行

### Phase 4: 提出（5分）

1. 最終テスト実行
2. git push
3. 残り時間で改善可能なら改善

## ⚙️ Tech Stack

### パターンA: TypeScript

- Language: TypeScript
- Framework: React, Vite
- CSS: Tailwind CSS, shadcn/ui
- Test: Vitest, Playwright
- Runtime: Node.js
- Lint/Format: ESLint, Prettier
- テスト実行: `npm test`
- ビルド: `npm run build`

## 📏 Rules（絶対に守ること）

### MUST

- 仕様書の要件を一字一句正確に再現する
- 変更後は必ずテストを実行する
- 1機能実装するたびに git commit する
- 出力フォーマットは仕様書のサンプルと完全一致させる
- エラーが2回連続で直らない場合、その機能を一旦スキップして次へ進む

### NEVER

- 仕様書にない機能を追加しない
- テストファイルを削除・改変しない
- 既に通っているテストを壊すコードを書かない
- 1つのタスクに3分以上ハマらない
- console.log等のデバッグ出力を本番コードに残さない

## 🧪 Testing Strategy

- 仕様書にサンプル入出力がある場合、それを最優先でテストケース化する
- 境界値（0、空文字、null、最大値）を必ずテストする
- テストは `tests/` ディレクトリに配置する
- テスト名は日本語で要件を記述する（例: `it("空文字の場合はエラーを返す")`）

## 🧪 Test Template

### TypeScript (Jest/Vitest)

```typescript
describe("機能名", () => {
  it("仕様書の要件をそのまま記述", () => {
    // Arrange: 入力データ
    const input = /* 仕様書のサンプル入力 */;
    // Act: 実行
    const result = targetFunction(input);
    // Assert: 仕様書の期待出力と完全一致
    expect(result).toEqual(/* 仕様書のサンプル出力 */);
  });

  it("境界値: 空入力", () => {
    expect(targetFunction("")).toEqual(/* 仕様書のエラー仕様 */);
  });
});
```

## 📝 Code Style

- 変数名・関数名は仕様書の用語に合わせる
- 型安全を優先する（TypeScriptの場合はany禁止）
- エラーハンドリングは仕様書に記載がある場合のみ実装する

## 🚨 Troubleshooting

- ビルドエラー → まずエラーメッセージを全文読む → 依存関係を確認
- テスト失敗 → expected vs received を確認 → フォーマット不一致を疑う
- 2回修正しても直らない → /clear してから新しいアプローチで再挑戦
- 仕様の解釈が曖昧 → 仕様書の文言を最も保守的に解釈する（自動採点は厳密に一致を見る前提）
- git push失敗 → リモートURLとブランチ名を確認。`git remote -v` で確認
