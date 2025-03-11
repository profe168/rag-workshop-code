import { MDocument } from "@mastra/rag";

// Example: Simple character chunking
const textDoc = new MDocument({
  docs: [
    {
      text: "This is a simple text document that will be split into chunks based on character count.",
    },
  ],
  type: "text",
});

const chunks = await textDoc.chunk({
  strategy: "character",
  size: 20,
  overlap: 5,
});

console.log("Character Chunks:", chunks);
// Output will show overlapping text chunks
