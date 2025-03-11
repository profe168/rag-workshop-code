import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export const findFunctionDefinitionTool = createTool({
  id: "find-function-definition",
  description: "Finds function definitions in the codebase",
  inputSchema: z.object({
    functionName: z.string().describe("The name of the function to find"),
    language: z.string().optional().describe("Optional programming language filter"),
  }),
  execute: async ({ context: { functionName, language }, mastra }) => {
    const vectorStore = mastra?.vectors?.pg;
    if (!vectorStore) {
      throw new Error("Vector store not found");
    }

    const {embedding} = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: `function ${functionName}`,
    });
    
    const results = await vectorStore.query({
      indexName: "default",
      queryVector: embedding,
      topK: 3,
      filter: {
        // Only search code files
        fileType: language ? [language] : ["ts", "js", "py", "java", "cpp", "c", "go", "rs"],
        // Only get chunks that contain function definitions
        chunkType: "function_definition"
      }
    });

    return results;
  },
});
