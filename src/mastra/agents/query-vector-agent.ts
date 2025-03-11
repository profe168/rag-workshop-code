import { Agent } from "@mastra/core/agent";
import { queryVectorTool } from "../tools";
import { openai } from "@ai-sdk/openai";

export const queryVectorAgent = new Agent({
  name: "queryVectorAgent",
  instructions: "Helps explore and understand codebases using RAG",
  model: openai("gpt-4o"),
  tools: {
    queryVectorTool,
  },
});
