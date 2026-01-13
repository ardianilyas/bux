import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL;

// Create a lazy-initialized database connection
let _db: NodePgDatabase<typeof schema> | null = null;
let _pool: Pool | null = null;

export const getDb = () => {
  if (!_db) {
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Please set it in your environment variables."
      );
    }
    _pool = new Pool({ connectionString });
    _db = drizzle(_pool, { schema });
  }
  return _db;
};

// For convenience, export db but it will throw if DATABASE_URL is not set
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    return getDb()[prop as keyof NodePgDatabase<typeof schema>];
  },
});

