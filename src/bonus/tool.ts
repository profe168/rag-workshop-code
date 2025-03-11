import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export const findCodeTool = createTool({
  id: "find-code",
  description: "Finds code snippets, functions, or examples in the codebase",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "What to search for (e.g., 'map function', 'error handling example')"
      ),
    type: z
      .enum(["function", "example", "usage"])
      .default("function")
      .describe("Type of code to find"),
    language: z
      .enum(["typescript", "javascript", "python"])
      .optional()
      .describe("Programming language to search in"),
  }),
  execute: async ({ context: { query, type, language }, mastra }) => {
    const vectorStore = mastra?.vectors?.pg;
    if (!vectorStore) {
      throw new Error("Vector store not found");
    }

    // Enhance query based on type
    const enhancedQuery =
      type === "function"
        ? `function ${query}`
        : type === "example"
          ? `example of ${query}`
          : `how to use ${query}`;

    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: enhancedQuery,
    });

    const results = await vectorStore.query({
      indexName: "workshop",
      queryVector: embedding,
      topK: 5,
      filter: {
        // Filter by content type and language
        fileType: language ? [language] : ["ts", "js", "py"],
        // Different chunk types based on what we're looking for
        chunkType:
          type === "function"
            ? "function_definition"
            : type === "example"
              ? "code_example"
              : "code_usage",
      },
    });

    return results;
  },
});
