import { ragAgent } from "../mastra/agents";

// Example: Agent choosing findCodeTool for code-specific searches
async function findCodeExample() {
  // Finding function definitions
  const functionResponse = await ragAgent.generate(
    "Find all implementations of authenticate functions in our TypeScript code"
  );

  console.log("Function Search:", functionResponse.text);

  // Finding usage examples
  const usageResponse = await ragAgent.generate(
    "Show me examples of how we use the Logger class"
  );

  console.log("Usage Search:", usageResponse.text);
}

findCodeExample().catch(console.error);

/* Example output showing findCodeTool's code-aware features:
Function Search: {
  role: "assistant",
  content: "I'll search for authentication functions using code-aware search",
  toolCalls: [{
    tool: "findCodeTool",
    args: { 
      query: "authenticate",
      type: "function",
      language: "typescript"
    },
    result: [
      { text: "function authenticate(token: string) {...}", metadata: { type: "function_definition" } }
    ]
  }]
}
*/
