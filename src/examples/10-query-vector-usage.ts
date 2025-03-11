import { queryVectorAgent } from "../mastra/agents";

// Example: Agent choosing queryVectorTool for semantic searches
async function queryVectorExample() {
  // Example 1: Semantic search for error handling
  const errorResponse = await queryVectorAgent.generate(
    "Find implementations in our codebase that show how we handle database errors and validation errors"
  );

  console.log("\nError Handling Search:", errorResponse.text);

  // Example 2: Search with format and section filters
  const configResponse = await queryVectorAgent.generate(
    "Search our JSON configuration for logging settings and monitoring outputs. Only look in the configuration files."
  );

  console.log("\nConfiguration Search:", configResponse.text);

  // Example 3: Search with reranking for authentication
  const authResponse = await queryVectorAgent.generate(
    "Find the most relevant code examples showing JWT token verification and session validation. Please rerank the results."
  );

  console.log("\nAuthentication Search:", authResponse.text);
}

queryVectorExample().catch(console.error);

/* Example output showing queryVectorTool's semantic capabilities:
Error Handling Search: {
  role: "assistant",
  content: "I'll search for our error handling implementations",
  toolCalls: [{
    tool: "queryVectorTool",
    args: { 
      query: "database error handling validation error implementation",
      filter: {
        format: "markdown",
        section: "error-handling"
      },
      topK: 3
    },
    result: [
      { 
        text: "class DatabaseError extends AppError {\n  constructor(\n    message: string,\n    public originalError: Error...",
        score: 0.89,
        metadata: { section: "error-handling" }
      }
    ]
  }]
}

Configuration Search: {
  role: "assistant",
  content: "I'll look specifically in our configuration for logging settings",
  toolCalls: [{
    tool: "queryVectorTool",
    args: { 
      query: "logging configuration monitoring outputs",
      filter: {
        format: "json",
        section: "settings"
      },
      topK: 2
    },
    result: [
      { 
        text: "\"monitoring\": {\n  \"logging\": {\n    \"level\": \"info\",\n    \"format\": \"json\",\n    \"outputs\": [...",
        score: 0.92
      }
    ]
  }]
}

Reranked Search: {
  role: "assistant",
  content: "I'll search for authentication code and rerank the results",
  toolCalls: [{
    tool: "queryVectorTool",
    args: { 
      query: "JWT token verification session validation implementation",
      filter: { section: "authentication" },
      rerank: true,
      topK: 5
    },
    result: [
      { 
        text: "async verifyToken(token: string): Promise<JWTPayload> {\n  try {\n    const decoded = jwt.verify(token, this.JWT_SECRET)...",
        score: 0.95
      }
    ]
  }]
}
*/
