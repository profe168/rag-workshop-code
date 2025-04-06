import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { cohere } from "@ai-sdk/cohere";

async function embeddingExample() {
  const text = "The quick brown fox jumps over the lazy dog";

  // 例1: text-embedding-3-smallによる基本的なエンベディング
  console.log("\n1. OpenAI text-embedding-3-small (Fastest, 1536 dimensions):");
  const { embedding: smallEmbedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text,
  });
  console.log("Dimensions:", smallEmbedding.length);
  console.log("First 5 values:", smallEmbedding.slice(0, 5));

  // 例2: text-embedding-3-largeによる高品質エンベディング
  console.log(
    "\n2. OpenAI text-embedding-3-large (Best quality, 3072 dimensions):"
  );
  const { embedding: largeEmbedding } = await embed({
    model: openai.embedding("text-embedding-3-large"),
    value: text,
  });
  console.log("Dimensions:", largeEmbedding.length);
  console.log("First 5 values:", largeEmbedding.slice(0, 5));

  //  例3: Cohereエンベディングモデル
  console.log("\n3. Cohere embed-english-v3.0 (Multilingual support):");
  const { embedding: cohereEmbedding } = await embed({
    model: cohere.embedding("embed-english-v3.0"),
    value: text,
  });
  console.log("Dimensions:", cohereEmbedding.length);
  console.log("First 5 values:", cohereEmbedding.slice(0, 5));

  // 例4: 複数テキストのバッチエンベディング
  console.log("\n4. Batch embedding multiple texts:");
  const texts = [
    "The quick brown fox",
    "jumps over the lazy dog",
    "and then runs away",
  ];

  const { embeddings: batchEmbeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: texts,
  });

  console.log("Number of embeddings:", batchEmbeddings.length);
  console.log("Each embedding dimensions:", batchEmbeddings[0].length);
}

embeddingExample().catch(console.error);

/* 出力例：
1. OpenAI text-embedding-3-small（最速、1536次元）：
次元数: 1536
最初の5つの値: [0.123, -0.456, 0.789, -0.012, 0.345]

2. OpenAI text-embedding-3-large（最高品質、3072次元）：
次元数: 3072
最初の5つの値: [0.234, -0.567, 0.890, -0.123, 0.456]

3. Cohere embed-english-v3.0（多言語サポート）：
次元数: 1024
最初の5つの値: [0.345, -0.678, 0.901, -0.234, 0.567]

4. 複数テキストのバッチエンベディング：
エンベディング数: 3
各エンベディングの次元数: 1536
*/
