import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { mastra } from "../mastra";

// Example documents to insert
const documents = [
  {
    text: "# Introduction to Vector Databases\nVector databases are specialized databases that store and index high-dimensional vectors for similarity search.",
    metadata: {
      source: "vector-db-guide.md",
      type: "documentation",
      section: "introduction",
    },
  },
  {
    text: "function searchVectors(query: string) {\n  const results = await vectorStore.search(query);\n  return results;\n}",
    metadata: {
      source: "search.ts",
      type: "code",
      language: "typescript",
    },
  },
];

async function upsertExampleVectors() {
  // Create MDocument instance
  const doc = new MDocument({
    docs: documents,
    type: "text",
  });

  // Chunk the documents appropriately
  const chunks = await doc.chunk({
    strategy: "recursive",
    size: 1000,
    overlap: 200,
  });

  // Generate embeddings for all chunks
  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: chunks.map((chunk) => chunk.text),
  });

  // Get PgVector instance
  const pgVector = mastra.getVector("pg");

  // Upsert vectors with their metadata
  await pgVector.upsert({
    indexName: "upsert-example",
    vectors: embeddings,
    metadata: chunks.map((chunk) => ({
      ...chunk.metadata,
      text: chunk.text,
    })),
  });

  console.log(`Successfully upserted ${chunks.length} vectors`);
}

// Run the example
upsertExampleVectors().catch(console.error);

/*
Example output:
Successfully upserted 2 vectors

The vectors are now stored in PgVector and can be queried using:
- Basic search
- Metadata filtering
- Similarity search
*/
