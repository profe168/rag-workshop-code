import { MDocument } from "@mastra/rag";

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

const jsonDoc = new MDocument({
  docs: [{ text: jsonContent }],
  type: "json",
});

const chunks = await jsonDoc.chunk({
  strategy: "json",
  maxSize: 100,
  minSize: 50,
});

console.log("JSON Chunks:", chunks);