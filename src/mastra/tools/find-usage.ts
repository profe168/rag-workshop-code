import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export const findUsageExamplesTool = createTool({
  id: "find-usage-examples",
  description: "Finds examples of how to use specific functions or features",
  inputSchema: z.object({
    target: z.string().describe("The function/feature to find usage examples for"),
    includeTests: z.boolean().default(true).describe("Whether to include test files in search"),
  }),
  execute: async ({ context: { target, includeTests }, mastra }) => {
    const vectorStore = mastra?.vectors?.pg;
    if (!vectorStore) {
      throw new Error("Vector store not found");
    }

    const {embedding} = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: `usage example ${target} implementation`,
    });
    
    const results = await vectorStore.query({
      indexName: "default",
      queryVector: embedding,
      topK: 5,
      filter: {
        // Include test files if specified
        fileType: includeTests 
          ? ["ts", "js", "py", "test.ts", "test.js", "test.py", "spec.ts", "spec.js"]
          : ["ts", "js", "py"],
        // Only get chunks that contain function calls
        chunkType: "function_call"
      }
    });

    return results;
  },
});
