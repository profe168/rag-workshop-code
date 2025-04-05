import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { mastra } from "../../mastra";

// 挿入するドキュメントの例
const documents = [
  {
    text: `# Vector Database Guide

## Introduction
Vector databases are specialized databases that store and index high-dimensional vectors for similarity search. They are essential for modern AI applications, especially in semantic search and recommendation systems.

## Key Features
- Efficient similarity search
- Support for high-dimensional data
- Optimized for machine learning applications
- Scalable for large datasets`,
    metadata: {
      source: "vector-db-guide.md",
      type: "documentation",
      section: "introduction",
    },
  },
  {
    text: `# Search Implementation Guide

## Basic Search
Here's how to implement a basic vector search:

\`\`\`typescript
async function searchVectors(query: string) {
  // Convert query to embedding
  const { embedding } = await embed(query);
  
  // Search the vector store
  const results = await vectorStore.search({
    vector: embedding,
    topK: 5
  });
  
  return results;
}
\`\`\`

## Advanced Features
For better results, consider:
- Using metadata filters
- Implementing reranking
- Adjusting similarity thresholds`,
    metadata: {
      source: "search-guide.md",
      type: "documentation",
      section: "implementation",
    },
  },
];

async function upsertExampleVectors() {
  // MDocumentインスタンスを作成
  const doc = new MDocument({
    docs: documents,
    type: "markdown",
  });

  // ドキュメントをチャンク化
  await doc.chunk({
    strategy: "markdown",
    headers: [
      ["#", "Header 1"],
      ["##", "Header 2"],
    ],
  });

  // チャンク化されたドキュメントを取得
  const chunks = doc.getDocs();

  // エンベディングを生成
  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: chunks.map((chunk) => chunk.text),
  });

  // PgVectorインスタンスを取得
  const pgVector = mastra.getVector("pg");

  // 既存のインデックスを削除（存在する場合）
  await pgVector.deleteIndex("searchExamples");
  // インデックスを作成
  await pgVector.createIndex({
    indexName: "searchExamples",
    dimension: 1536,
  });
  // ベクトルをアップサート
  await pgVector.upsert({
    indexName: "searchExamples",
    vectors: embeddings,
    metadata: chunks.map((chunk) => ({
      ...chunk.metadata,
      text: chunk.text,
    })),
  });

  console.log(`Successfully upserted ${chunks.length} embeddings`);
}

// 例を実行
upsertExampleVectors().catch(console.error);

/*
Example output:
Successfully upserted 2 vectors

The vectors are now stored in PgVector and can be queried using:
- Basic search
- Metadata filtering
- Similarity search
*/
