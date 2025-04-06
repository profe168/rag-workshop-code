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
        "What to search for (e.g., 'authentication', 'error handling', 'logging')"
      ),
    type: z
      .enum(["function", "method", "class"])
      .default("function")
      .describe("Type of code to find (function, method, or class)"),
    section: z
      .enum(["authentication", "error-handling", "logging"])
      .optional()
      .describe("Section of the codebase to search in"),
  }),
  execute: async ({ context: { query, type, section }, mastra }) => {
    const vectorStore = mastra?.vectors?.pg;
    if (!vectorStore) {
      throw new Error("Vector store not found");
    }

    // タイプに基づいてクエリを強化
    const enhancedQuery =
      type === "function"
        ? `function ${query}`
        : type === "method"
          ? `method ${query}`
          : `class ${query}`;

    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: enhancedQuery,
    });

    // フィルターを構築
    const filter: Record<string, any> = {
      type: "code",
      format: "typescript",
    };

    // セクションが指定されている場合、フィルターに追加
    if (section) {
      filter.section = section;
    }

    // 検索するコードのタイプに基づいてチャンクタイプフィルターを追加
    if (type === "function") {
      filter.chunkType = "function_definition";
    } else if (type === "method") {
      filter.chunkType = "method_definition";
    } else if (type === "class") {
      filter.chunkType = "class_definition";
    }

    const results = await vectorStore.query({
      indexName: "bonus",
      queryVector: embedding,
      topK: 5,
      filter: filter,
    });

    return results;
  },
});
