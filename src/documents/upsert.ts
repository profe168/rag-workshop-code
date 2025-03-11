import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { mastra } from "../mastra";
import { authenticationDocs } from "./auth";
import { errorHandlingDocs } from "./error-handling";
import { loggingDocs } from "./logging";

const documents = [
  {
    text: authenticationDocs,
    metadata: {
      source: "auth.md",
      type: "documentation",
      section: "authentication",
    },
  },
  {
    text: errorHandlingDocs,
    metadata: {
      source: "error-handling.md",
      type: "documentation",
      section: "best-practices",
    },
  },
  {
    text: loggingDocs,
    metadata: {
      source: "logging.md",
      type: "documentation",
      section: "logging",
    },
  },
];

async function upsertDocuments() {
  // Create MDocument instance
  const doc = new MDocument({
    docs: documents,
    type: "markdown",
  });

  // Chunk the documents
  await doc.chunk({
    strategy: "markdown",
    headers: [
      ["#", "Header 1"],
      ["##", "Header 2"],
    ],
  });

  // Get chunked documents
  const chunks = doc.getDocs();

  // Generate embeddings
  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: chunks.map((chunk) => chunk.text),
  });

  // Get PgVector instance
  const pgVector = mastra.getVector("pg");

  // Upsert vectors
  await pgVector.upsert({
    indexName: "workshop",
    vectors: embeddings,
    metadata: chunks.map((chunk) => ({
      ...chunk.metadata,
      text: chunk.text,
    })),
  });

  console.log(`Successfully upserted ${chunks.length} document chunks`);
}

// Run the upsert
upsertDocuments().catch(console.error);
