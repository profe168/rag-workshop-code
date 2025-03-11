import { ragAgent } from "../mastra/agents";

// Example: Agent choosing queryVectorTool for semantic searches
async function queryVectorExample() {
  // Example 1: Basic semantic search
  const basicResponse = await ragAgent.generate(
    "How do we handle input validation in our codebase?"
  );

  console.log("Basic Vector Search:", basicResponse.text);

  // Example 2: Search with explicit filter request
  const filteredResponse = await ragAgent.generate(
    "Can you look for error handling patterns using a filter for TypeScript files and return the top 5 matches?"
  );

  console.log("Filtered Search:", filteredResponse.text);

  // Example 3: Search with reranking request
  const rerankedResponse = await ragAgent.generate(
    "Can you find code similar to this error handling: try/catch around database queries?"
  );

  console.log("Reranked Search:", rerankedResponse.text);
}

queryVectorExample().catch(console.error);

/* Example output showing queryVectorTool's semantic capabilities:
Basic Vector Search: {
  role: "assistant",
  content: "I'll search for our input validation approaches",
  toolCalls: [{
    tool: "queryVectorTool",
    args: { 
      query: "input validation data sanitization",
      topK: 5
    },
    result: [
      { text: "function validateUserInput(data: unknown) {...}", score: 0.89 }
    ]
  }]
}

Filtered Search: {
  role: "assistant",
  content: "I'll search TypeScript files for error handling patterns, limiting to top 5 results",
  toolCalls: [{
    tool: "queryVectorTool",
    args: { 
      query: "error handling patterns",
      filter: { fileType: ["ts", "tsx"] },
      topK: 5
    },
    result: [...]
  }]
}

Reranked Search: {
  role: "assistant",
  content: "Let me find similar database error handling patterns",
  toolCalls: [{
    tool: "queryVectorTool",
    args: { 
      query: "try catch database query error handling pattern",
      rerank: true,
      topK: 10
    },
    result: [
      { text: "try { await pool.query(...) } catch (e) {...}", score: 0.95 }
    ]
  }]
}
*/
