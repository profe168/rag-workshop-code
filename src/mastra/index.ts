import { Mastra } from '@mastra/core/mastra';

import { ragAgent } from './agents';
import { ChromaVector } from '@mastra/chroma';
import { PgVector } from '@mastra/pg';
const chromaVector = new ChromaVector({
  path: "http://localhost:8000",
});

const pgVector = new PgVector(process.env.POSTGRES_CONNECTION_STRING!);


export const mastra = new Mastra({
  agents: { 
    ragAgent 
  },
  vectors: {
    chroma: chromaVector,
    pg: pgVector,
  },
});
