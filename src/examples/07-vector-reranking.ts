import { embed } from "ai";
import { mastra } from "../mastra";
import { openai } from "@ai-sdk/openai";
import { rerank } from "@mastra/rag";

const query = "What is the capital of France?";
const { embedding } = await embed({
  model: openai.embedding("text-embedding-3-small"),
  value: query,
});

const pgVector = mastra.getVector("pg");

const results = await pgVector.query({
  indexName: "workshop",
  queryVector: embedding,
  topK: 10,
  filter: {
    source: "article1.txt",
  },
});

console.log(results);

const rerankedResults = await rerank(results, query, openai("gpt-4o"), {
  topK: 5,
});

console.log(rerankedResults);
