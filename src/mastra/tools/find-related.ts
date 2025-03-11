import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export const findRelatedDocumentationTool = createTool({
  id: "find-related-documentation",
  description: "Finds related documentation for a given topic or code element",
  inputSchema: z.object({
    query: z.string().describe("The query to search for related documentation"),
  }),
  execute: async ({ context: { query }, mastra }) => {
    const vectorStore = mastra?.vectors?.pg;
    if (!vectorStore) {
      throw new Error("Vector store not found");
    }
    
    // Generate embedding for the query
    const {embedding} = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    });
    
    const results = await vectorStore.query({
      indexName: "default",
      queryVector: embedding,
      topK: 5,
      // Add metadata filter to only search documentation files
      filter: {
        fileType: ["md", "mdx", "txt", "rst", "docs"]
      }
    });
    
    return results;
  },
});
