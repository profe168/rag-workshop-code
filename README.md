# RAG ワークショップ サンプル

このリポジトリはMastraを使用したRAG（検索拡張生成）機能を示すサンプルを含んでいます。

## 始め方

1. **依存関係のインストール**:

```bash
pnpm i
```

2. **環境変数の設定**:
   - サンプル環境ファイルをコピーして独自のファイルを作成:

```bash
cp .env.example .env
```

- `.env`ファイルを開き、以下を追加:
  - OpenAI APIキー
  - PostgreSQL接続文字列

3. **インデックスの作成**:
   - ドキュメントをembeddedしてベクトルDBに格納:

```bash
pnpm run index
```

4. **評価の開始**:
   - RAGパイプラインの精度を評価:

```bash
pnpm run eval
```

## 構成

### サンプルドキュメント（`src/documents/`）

RAG機能をテストするためのマークダウンとJSONドキュメントを含みます:

- `auth.md` - JWTの例を含む認証ガイド
- `error-handling.md` - エラー処理パターンとベストプラクティス
- `logging.md` - ログシステムのドキュメント
- `application-settings.json` - アプリケーション設定
- `upsert.ts` - ベクトルストアにドキュメントを挿入するスクリプト

### 基本的なチャンキング例（`src/examples/01-04`）

1. **文字チャンキング**（`01-character-chunking.ts`）

   - 文字数による単純なテキスト分割
   - 基本的な重複チャンクを示す

2. **再帰的チャンキング**（`02-recursive-chunking.ts`）

   - 関数の境界を保持するコード対応チャンキング
   - コードのコンテキストを維持しながらチャンキングを示す

3. **JSONチャンキング**（`03-json-chunking.ts`）

   - 有効な構造を保持しながらJSONを分割
   - 構造化データ形式の扱い方を示す

4. **マークダウンチャンキング**（`04-markdown-chunking.ts`）

   - ヘッダー認識マークダウンチャンキング
   - 階層的なドキュメント分割を示す

5. **埋め込み**（`05-embedding.ts`）
   - 異なる埋め込みモデルとその特性
   - 単一対バッチ埋め込み
   - 埋め込みの次元と品質の比較

### ベクトルストア操作（`src/examples/05-07`）

5. **ベクトル挿入**（`06-vector-upserting.ts`）

   - PgVectorにドキュメントを挿入する方法
   - 完全なフロー：チャンキング → 埋め込み → 保存

6. **ベクトル検索**（`07-vector-search.ts`）

   - 基本的なベクトル類似性検索
   - フィルタ付きの単純なクエリを示す

7. **ベクトル再ランキング**（`08-vector-reranking.ts`）
   - 結果の再ランキングによる高度な検索
   - 結果の関連性向上を示す

### エージェント例（`src/examples/09-10`）

8. **基本検索**（`09-basic-search-usage.ts`）

   - エージェントを通じた単純なキーワード検索
   - 例：「認証に関するドキュメントには何が書かれていますか？」

9. **ベクトル検索**（`010-query-vector-usage.ts`）
   - エージェントを通じたセマンティック検索:
     - 基本検索
     - フィルタ付き検索（ファイルタイプ別）
     - より良い結果のための再ランキング検索

### ボーナス例（`src/bonus/`）

- **高度なコード使用法**（`01-find-code-usage.ts`）
  - エージェントを通じたコード認識検索
  - 例：
    - 関数定義の検索
    - 使用例の検索

## 使用方法

1. 異なるチャンキング戦略を理解するためにサンプルを試す:

```bash
pnpm tsx src/examples/01-character-chunking.ts
pnpm tsx src/examples/02-recursive-chunking.ts
pnpm tsx src/examples/03-json-chunking.ts
pnpm tsx src/examples/04-markdown-chunking.ts
```

2. 埋め込みとベクトルストア操作を試す:

```bash
pnpm tsx src/examples/05-embedding.ts
pnpm tsx src/examples/06-vector-upserting.ts
pnpm tsx src/examples/07-vector-search.ts
pnpm tsx src/examples/08-vector-reranking.ts
```

3. RAGを実際に見るためにエージェント例を探索:

エージェント例のサンプルデータを挿入:

```bash
pnpm tsx src/documents/upsert.ts
```

```bash
pnpm tsx src/examples/09-basic-search-usage.ts
pnpm tsx src/examples/10-query-vector-usage.ts
```

## 主要概念

### チャンキング

- ドキュメントを意味のある断片に分割
- 異なるコンテンツタイプに対する異なる戦略
- コンテキストと構造の保持

### ベクトル操作

- テキストを埋め込みに変換
- PgVectorへの保存
- 類似性検索
- 結果の再ランキング

### エージェントツール

- 基本的なキーワード検索
- フィルタ付きセマンティック検索

## 評価機能

- コンテキスト関連性評価
- RAGパイプラインの品質評価
- 検索結果の関連性分析

## ボーナス例（`src/bonus/`）

コードファイルを検索し、特定のメソッドの実装やクラス定義をコードベースで見つける方法を示すボーナス例。

### ボーナスドキュメント（`src/bonus/documents/`）

RAG機能をテストするためのマークダウンドキュメントを含みます:

- `authentication-service.ts` - 認証サービスの実装
- `error-handling.ts` - エラー処理パターンとベストプラクティス
- `logger.ts` - ログシステムのドキュメント
- `upsert.ts` - ベクトルストアにドキュメントを挿入するスクリプト

ボーナス例のコードドキュメントを挿入:

```bash
pnpm tsx src/bonus/documents/upsert.ts
```

コード検索例を実行:

```bash
pnpm tsx src/bonus/01-find-code-usage.ts
```

## 評価スクリプトの実行

基本的な評価スクリプトを実行:

```bash
pnpm run simple-eval
```

カスタム実装による評価:

```bash
pnpm run eval
```

Mastraメトリックを使用した日本語評価:

```bash
pnpm run eval-japanese
```
