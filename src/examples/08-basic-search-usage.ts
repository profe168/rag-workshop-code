import { ragAgent } from "../mastra/agents";

// Example: Agent choosing basicSearchTool for simple keyword searches
async function basicSearchExample() {
  const response = await ragAgent.generate(
    "What does our documentation say about authentication?"
  );

  console.log("Basic Search:", response.text);
}

basicSearchExample().catch(console.error);

/* Example output showing basicSearchTool is best for keyword matching:
Basic Search: {
  role: "assistant",
  content: "Let me check our documentation for information about authentication",
  toolCalls: [{
    tool: "basicSearchTool",
    args: { query: "authentication" },
    result: [
      { text: "README.md: ## Authentication\nTo authenticate with the API, you'll need...", metadata: { ... } },
      { text: "docs/auth.md: Authentication is handled through JWT tokens...", metadata: { ... } }
    ]
  }]
}
*/
