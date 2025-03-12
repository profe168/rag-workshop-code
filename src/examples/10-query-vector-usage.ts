import { mastra } from "../mastra";

// Example: Agent choosing queryVectorTool for semantic searches
async function queryVectorExample() {
  const queryVectorAgent = mastra.getAgent("queryVectorAgent");
  // Example 1: Semantic search for error handling
  const errorResponse = await queryVectorAgent.generate(
    "Find implementations in our codebase that show how we handle database errors and validation errors"
  );

  console.log("\nError Handling Search:", errorResponse.text);

  // Example 2: Search with format and section filters
  const configResponse = await queryVectorAgent.generate(
    "How do we handle errors in our application? Filter where section is error-handling AND format is markdown. Return the top 3 results."
  );

  console.log("\nFiltered Error Handling Search:", configResponse.text);

  // Example 3: Search with reranking for authentication
  const authResponse = await queryVectorAgent.generate(
    "Find the most relevant code examples showing JWT token verification and session validation."
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

Filtered Error Handling Search: {
  role: "assistant",
  content: "I'll search for error handling information in our application",
  toolCalls: [{
    tool: "queryVectorTool",
    args: { 
      query: "error handling implementation",
      filter: {
        "$and": [
          { "section": "error-handling" },
          { "format": "markdown" }
        ]
      },
      topK: 3
    },
    result: [
      { 
        text: "class DatabaseError extends AppError {\n  constructor(\n    message: string,\n    public originalError: Error...",
        score: 0.89,
        metadata: {
          source: "error-handling.md",
          type: "documentation",
          section: "error-handling",
          format: "markdown"
        }
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
