import { Mastra } from '@mastra/core/mastra';

import { queryVectorAgent, basicAgent } from "./agents";
import { PgVector } from "@mastra/pg";
import { codeAgent } from "../bonus/agent";

const pgVector = new PgVector(process.env.POSTGRES_CONNECTION_STRING!);

export const mastra = new Mastra({
  agents: {
    queryVectorAgent,
    basicAgent,
    codeAgent,
  },
  vectors: {
    pg: pgVector,
  },
});
