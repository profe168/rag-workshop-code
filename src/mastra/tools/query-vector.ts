import { openai } from "@ai-sdk/openai";
import { createVectorQueryTool } from "@mastra/rag";

export const queryVectorTool = createVectorQueryTool({
  id: "query-vector",
  vectorStoreName: "pg",
  indexName: "workshop",
  model: openai.embedding("text-embedding-3-small"),
});
