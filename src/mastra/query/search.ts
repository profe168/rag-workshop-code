import { embed } from "ai";
import { mastra } from "../index";
import { openai } from "@ai-sdk/openai";

const {embedding} = await embed({
  model: openai.embedding("text-embedding-3-small"),
  value: "Hello, world!",
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
