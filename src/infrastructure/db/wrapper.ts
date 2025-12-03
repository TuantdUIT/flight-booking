import type { db } from "./client";

// 1. Configuration
const MAX_RETRIES = 3;
const BASE_DELAY = 100; // ms

type DBTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

// 2. Helper: Backoff with Jitter
const delay = (attempt: number) => {
	const jitter = Math.random() * 100;
	const ms = Math.min(BASE_DELAY * 2 ** attempt + jitter, 2000);
	return new Promise((resolve) => setTimeout(resolve, ms));
};

// 3. Helper: Identify Transient Errors
const isRetryable = (error: unknown) => {
	// For Neon, errors typically have a 'code' property with PostgreSQL error codes
	if (error && typeof error === "object" && "code" in error) {
		const code = (error as any).code || "";
		// 40001: Serialization Failure (Deadlock)
		// 40P01: Deadlock Detected
		// 08*: Connection Exceptions
		return code === "40001" || code === "40P01" || code.startsWith("08");
	}
	// Add generic connection error checks here (e.g., fetch failures)
	if (error instanceof Error) {
		const message = error.message.toLowerCase();
		return (
			message.includes("connection") ||
			message.includes("network") ||
			message.includes("timeout")
		);
	}
	return false;
};

/**
 * The Atomic Wrapper
 * Wraps logic in a Serializable Transaction with Retries.
 */
export async function atomic<T>(
	callback: (tx: DBTransaction) => Promise<T>,
): Promise<T> {
	const { db } = await import("./client");

	let attempt = 0;

	while (true) {
		try {
			// Drizzle transaction automatically rolls back on error
			return await db.transaction(async (tx) => {
				return await callback(tx);
			});
		} catch (error) {
			if (attempt >= MAX_RETRIES || !isRetryable(error)) {
				console.error(
					`[DB Critical] Transaction failed after ${attempt} retries.`,
				);
				throw error; // Fail closed
			}

			console.warn(
				`[DB Retry] Transient error detected (Code: ${(error as any)?.code || "unknown"}). Retrying ${attempt + 1}/${MAX_RETRIES}...`,
			);
			await delay(attempt);
			attempt++;
		}
	}
}
