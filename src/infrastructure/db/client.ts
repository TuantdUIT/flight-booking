import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config({path: ".env.local"})

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
	if (!_db) {
		console.log(process.env.DATABASE_URL);
		const client = neon(process.env.DATABASE_URL!);
		_db = drizzle(client, { schema });
	}

	return _db;
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
