import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { mastra } from "../../mastra";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// 現在のファイルのディレクトリ名を取得
// これはCommonJSとESモジュールの両方で動作する
const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);

//プロジェクトルートに上がる（src/documentsから1レベル上）
const projectRoot = path.resolve(currentDir, "../../..");

async function upsertDocuments() {
  // documentsディレクトリへの絶対パスを使用
  const docsDir = path.join(projectRoot, "src", "documents");

  // マークダウンドキュメントを処理
  const markdownDocs = [
    {
      path: path.join(docsDir, "auth.md"),
      type: "documentation",
      section: "authentication",
    },
    {
      path: path.join(docsDir, "error-handling.md"),
      type: "documentation",
      section: "error-handling",
    },
    {
      path: path.join(docsDir, "logging.md"),
      type: "documentation",
      section: "logging",
    },
  ];

  // マークダウンファイルを読み込んで処理
  const markdownContents = await Promise.all(
    markdownDocs.map(async (doc) => ({
      text: await fs.readFile(doc.path, "utf-8"),
      metadata: {
        source: path.basename(doc.path),
        type: doc.type,
        section: doc.section,
        format: "markdown",
      },
    }))
  );

  // マークダウンドキュメントを処理
  const markdownDoc = new MDocument({
    docs: markdownContents,
    type: "markdown",
  });

  await markdownDoc.chunk({
    strategy: "markdown",
    headers: [
      ["#", "Header 1"],
      ["##", "Header 2"],
    ],
    maxSize: 1500, // Large enough for complete code examples
    minSize: 500, // Small enough to be specific but meaningful
    overlap: 100, // Enough to maintain context between chunks
  });

  // JSON設定を処理
  const configPath = path.join(docsDir, "application-settings.json");
  const configContent = await fs.readFile(configPath, "utf-8");
  const configDoc = new MDocument({
    docs: [
      {
        text: configContent,
        metadata: {
          source: "application-settings.json",
          type: "configuration",
          section: "settings",
          format: "json",
        },
      },
    ],
    type: "json",
  });

  await configDoc.chunk({
    strategy: "json",
    maxSize: 1000, // Smaller for JSON as each chunk should be a logical unit
    minSize: 200, // Allow smaller chunks for individual config sections
    overlap: 50, // Less overlap needed for structured data
  });

  // 両方のドキュメントタイプからチャンクを結合
  const markdownChunks = markdownDoc.getDocs();
  const jsonChunks = configDoc.getDocs();
  const allChunks = [...markdownChunks, ...jsonChunks];

  // すべてのチャンクのエンベディングを生成
  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: allChunks.map((chunk) => chunk.text),
  });

  try {
    // PgVectorインスタンスを取得
    const pgVector = mastra.getVector("pg");
    // 既存のインデックスを削除（存在する場合）
    await pgVector.deleteIndex("workshop");
    await pgVector.createIndex({
      indexName: "workshop",
      dimension: 1536,
    });

    // ベクトルをアップサート
    await pgVector.upsert({
      indexName: "workshop",
      vectors: embeddings,
      metadata: allChunks.map((chunk) => ({
        ...chunk.metadata,
        text: chunk.text,
      })),
    });
  } catch (error: any) {
    console.log("PostgreSQLベクトル操作をスキップします:", error.message);
    console.log("代わりにエンベディング結果をログに出力します");

    // エンベディングの一部をログに表示
    console.log(
      `最初のエンベディング（最初の5つの値）: ${embeddings[0].slice(0, 5)}`
    );
  }

  console.log(`Successfully processed ${allChunks.length} document chunks`);

  // 処理されたものに関する統計情報をログに記録
  const stats = allChunks.reduce(
    (acc, chunk) => {
      const format = chunk.metadata.format;
      acc[format] = (acc[format] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log("\nChunks by format:");
  Object.entries(stats).forEach(([format, count]) => {
    console.log(`${format}: ${count} chunks`);
  });
}

// アップサートを実行
upsertDocuments().catch(console.error);
