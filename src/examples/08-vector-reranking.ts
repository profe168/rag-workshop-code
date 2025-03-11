import { embed } from "ai";
import { mastra } from "../mastra";
import { openai } from "@ai-sdk/openai";
import { rerank } from "@mastra/rag";

async function rerankingExample() {
  const query = "How can I improve vector search results?";

  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  });

  const pgVector = mastra.getVector("pg");

  // Get initial results
  const results = await pgVector.query({
    indexName: "search-examples",
    queryVector: embedding,
    topK: 10,
  });

  console.log("\nInitial Search Results:");
  console.log(results);

  // Rerank results
  const rerankedResults = await rerank(results, query, openai("gpt-4o"), {
    topK: 3,
  });

  console.log("\nReranked Results:");
  console.log(rerankedResults);
}

rerankingExample().catch(console.error);
