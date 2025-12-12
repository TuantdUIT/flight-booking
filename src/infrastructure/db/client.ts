import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

let _db: Pool | null = null;

function getDb() {
	if (!_db) {
		_db = new Pool({
			connectionString: process.env.DATABASE_URL!,
			max: 4, // Reduced for serverless (fewer concurrent functions)
			min: 0, // Allow complete scaling to zero
			idleTimeoutMillis: 10000, // Faster cleanup than default 30s
			connectionTimeoutMillis: 2000, // Fail fast instead of default 60s
			allowExitOnIdle: true, // Allow pool to exit when idle
		});
	}
	const client = drizzle({ schema, client: _db });

	return client;
}

// Export a proxy that forwards all calls to the actual db instance
export const db = getDb();

// Re-export schema for convenience
export * from "./schema";

// Re-export drizzle-orm functions to ensure version consistency
export {
	and,
	eq,
	exists,
	inArray,
	isNotNull,
	isNull,
	not,
	notExists,
	notInArray,
	or,
	sql,
} from "drizzle-orm";

// Re-export the atomic transaction wrapper
export { atomic } from "./wrapper";
