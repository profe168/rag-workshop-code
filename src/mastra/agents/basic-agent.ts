import { Agent } from "@mastra/core/agent";
import { basicSearchTool } from "../tools";
import { openai } from "@ai-sdk/openai";

export const basicAgent = new Agent({
  name: "basicAgent",
  instructions: "Helps explore and understand codebases using RAG",
  model: openai("gpt-4o"),
  tools: {
    basicSearchTool,
  },
});
