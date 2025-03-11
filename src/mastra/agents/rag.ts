import { Agent } from '@mastra/core/agent';
import {
  findFunctionDefinitionTool,
  findRelatedDocumentationTool,
  queryVectorTool,
  rerankVectorTool,
  basicSearchTool,
} from "../tools";
import { openai } from "@ai-sdk/openai";

export const ragAgent = new Agent({
  name: "ragAgent",
  instructions: "Helps explore and understand codebases using RAG",
  model: openai("gpt-4o"),
  tools: {
    basicSearchTool,
    findFunctionDefinitionTool,
    findRelatedDocumentationTool,
    queryVectorTool,
    rerankVectorTool,
  },
}); 