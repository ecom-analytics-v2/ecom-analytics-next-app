import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

export const client = postgres(process.env.POSTGRES_URL);

// Test the connection with a simple query
client`SELECT 1`
  .then(() => {
    // console.log("🔌 Database connection established and verified");
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
  });

export const db = drizzle(client, { schema });
