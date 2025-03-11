import { Agent } from "@mastra/core/agent";
import { findCodeTool } from "./tool";
import { openai } from "@ai-sdk/openai";

export const codeAgent = new Agent({
  name: "codeAgent",
  instructions:
    "Helps find code snippets, functions, or examples in the codebase",
  model: openai("gpt-4o"),
  tools: {
    findCodeTool,
  },
});
