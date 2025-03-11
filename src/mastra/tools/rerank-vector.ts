import { openai } from "@ai-sdk/openai";
import { createVectorQueryTool } from "@mastra/rag";

export const rerankVectorTool = createVectorQueryTool({
  id: "rerank-vector",
  description: "Reranks a list of results based on a query",
  vectorStoreName: "pg",
  indexName: "default",
  model: openai.embedding("text-embedding-3-small"),
  reranker: {
    model: openai("gpt-4o"),
    options: {
      topK: 5,
    },
  },
});
