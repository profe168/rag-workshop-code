import { MDocument } from "@mastra/rag";

// 例：単純な文字ベースのチャンキング
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
  overlap: 0,
});

console.log("Character Chunks:", chunks);

console.log(
  "Chunk Text:",
  chunks.map((chunk) => chunk.text)
);
