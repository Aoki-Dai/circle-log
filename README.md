# React + TypeScript + Vite

このテンプレートは、Vite 上で React を HMR といくつかの ESLint ルール付きで動かすための最小構成を提供します。

現在、公式プラグインは 2 つあります。

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) は Fast Refresh のために [Babel](https://babeljs.io/)（[rolldown-vite](https://vite.dev/guide/rolldown) で使う場合は [oxc](https://oxc.rs)）を使用します
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) は Fast Refresh のために [SWC](https://swc.rs/) を使用します

## React Compiler

このテンプレートでは、開発時およびビルド時のパフォーマンスへの影響を考慮し、React Compiler は有効化されていません。追加方法は [このドキュメント](https://react.dev/learn/react-compiler/installation) を参照してください。

## ESLint 設定の拡張

本番向けアプリケーションを開発する場合は、型を考慮した lint ルールを有効にするため、設定を更新することをおすすめします。

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // 他の設定...

      // tseslint.configs.recommended を削除し、これに置き換える
      tseslint.configs.recommendedTypeChecked,
      // より厳しいルールにする場合はこちら
      tseslint.configs.strictTypeChecked,
      // スタイル系ルールを追加する場合はこちら（任意）
      tseslint.configs.stylisticTypeChecked,

      // 他の設定...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // 他のオプション...
    },
  },
])
```

React 固有の lint ルールを使うために、[eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) と [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) をインストールすることもできます。

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // 他の設定...
      // React 向け lint ルールを有効化
      reactX.configs['recommended-typescript'],
      // React DOM 向け lint ルールを有効化
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // 他のオプション...
    },
  },
])
```
