import { MDocument } from "@mastra/rag";

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

const markdownDoc = new MDocument({
  docs: [{ text: markdownContent }],
  type: "markdown",
});

const chunks = await markdownDoc.chunk({
  strategy: "markdown",
  headers: [
    ["#", "Header 1"],
    ["##", "Header 2"],
    ["###", "Header 3"],
  ],
});

console.log("Markdown Chunks:", chunks);
// Output will show chunks split by headers with metadata
