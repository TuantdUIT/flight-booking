import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

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
	eq,
	and,
	or,
	not,
	isNull,
	isNotNull,
	inArray,
	notInArray,
	exists,
	notExists,
	sql,
} from "drizzle-orm";
