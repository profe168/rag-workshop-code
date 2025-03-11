import { MDocument } from "@mastra/rag";

// Example document content
const markdownContent = `
# User Guide
## Installation
To install the package:
\`\`\`bash
npm install @mastra/core
\`\`\`

## Basic Usage
Here's how to use the main features:

### Configuration
First, configure your settings...

### API Reference
Key functions and methods...
`;

const codeContent = `
function processData(input: string) {
  // Process the input
  const result = transform(input);
  return result;
}

function transform(data: string) {
  return data.toUpperCase();
}
`;

const jsonContent = `{
  "config": {
    "api": {
      "endpoint": "https://api.example.com",
      "version": "v1",
      "timeout": 5000
    },
    "features": [
      "authentication",
      "logging",
      "caching"
    ]
  }
}`;

// Example 1: Markdown chunking
const markdownDoc = new MDocument({
  docs: [{ text: markdownContent }],
  type: "markdown",
});

await markdownDoc.chunk({
  strategy: "markdown",
  headers: [
    ["#", "Header 1"],
    ["##", "Header 2"],
    ["###", "Header 3"],
  ],
});

console.log("Markdown Chunks:", markdownDoc.getDocs());
// Output will show chunks split by headers with metadata

// Example 2: Code chunking
const codeDoc = new MDocument({
  docs: [{ text: codeContent }],
  type: "text",
});

await codeDoc.chunk({
  strategy: "recursive",
  size: 100,
  overlap: 20,
});

console.log("Code Chunks:", codeDoc.getDocs());
// Output will show function-aware chunks

// Example 3: JSON chunking
const jsonDoc = new MDocument({
  docs: [{ text: jsonContent }],
  type: "json",
});

await jsonDoc.chunk({
  strategy: "json",
  maxSize: 100,
  minSize: 50,
});

console.log("JSON Chunks:", jsonDoc.getDocs());
// Output will show semantically meaningful JSON chunks

// Example 4: Simple character chunking
const textDoc = new MDocument({
  docs: [
    {
      text: "This is a simple text document that will be split into chunks based on character count.",
    },
  ],
  type: "text",
});

await textDoc.chunk({
  strategy: "character",
  size: 20,
  overlap: 5,
});

console.log("Character Chunks:", textDoc.getDocs());
// Output will show overlapping text chunks
