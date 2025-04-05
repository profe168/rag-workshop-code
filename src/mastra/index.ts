import { Mastra } from "@mastra/core/mastra";
import { queryVectorAgent, basicAgent } from "./agents";
import { PgVector } from "@mastra/pg";
import { codeAgent } from "../bonus/agent";
import dotenv from "dotenv";

// .envファイルの読み込み
dotenv.config();

const connectionString = process.env.POSTGRES_CONNECTION_STRING;
if (!connectionString) {
  throw new Error(
    "POSTGRES_CONNECTION_STRING environment variable is required"
  );
}
const pgVector = new PgVector(connectionString);
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
