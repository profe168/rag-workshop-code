import { Agent } from "@mastra/core/agent";
import { findCodeTool } from "./tool";
import { openai } from "@ai-sdk/openai";

export const codeAgent = new Agent({
  name: "codeAgent",
  instructions: `
    Helps find code implementations, functions, methods, and classes in the codebase.
    
    The codebase contains TypeScript implementations for:
    - Authentication services (JWT token verification, session management)
    - Error handling (custom error classes, error middleware)
    - Logging systems (structured logging, audit logging)
    
    When searching, consider:
    1. What type of code element to find (function, method, or class)
    2. Which section of the codebase to search in (authentication, error-handling, logging)
    3. Specific functionality within that section
    
    Return code snippets with explanations of how they work and their purpose.
  `,
  model: openai("gpt-4o"),
  tools: {
    findCodeTool,
  },
});
