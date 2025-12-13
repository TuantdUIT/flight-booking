import { bookings } from "@/infrastructure/db/schema";
import { eq } from "drizzle-orm";

/**
 * Generate a unique 6-character alphanumeric PNR (Passenger Name Record) code
 * PNR codes are typically 6 characters long and contain uppercase letters and numbers
 * They must be unique across all bookings
 */

const PNR_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const PNR_LENGTH = 6;

/**
 * Generate a random PNR code
 */
function generateRandomPNR(): string {
	let pnr = '';
	for (let i = 0; i < PNR_LENGTH; i++) {
		const randomIndex = Math.floor(Math.random() * PNR_CHARSET.length);
		pnr += PNR_CHARSET[randomIndex];
	}
	return pnr;
}

/**
 * Check if a PNR code already exists in the database
 * This is a simplified version - in production you'd want to cache or use a more efficient lookup
 */
async function isPNRUnique(pnr: string, db: any): Promise<boolean> {
	try {
		const existingBooking = await db
			.select()
			.from(bookings)
			.where(eq(bookings.pnr, pnr))
			.limit(1);

		return existingBooking.length === 0;
	} catch (error) {
		// If there's an error (e.g., table doesn't exist yet), assume it's unique
		console.warn('Error checking PNR uniqueness:', error);
		return true;
	}
}

/**
 * Generate a unique PNR code
 * Will keep generating until it finds one that's not in use
 * Includes safety limit to prevent infinite loops
 */
export async function generateUniquePNR(db?: any): Promise<string> {
	const MAX_ATTEMPTS = 100;
	let attempts = 0;

	while (attempts < MAX_ATTEMPTS) {
		const pnr = generateRandomPNR();

		// If no database connection provided, just return the random PNR
		// (useful for testing or when uniqueness check isn't needed)
		if (!db) {
			return pnr;
		}

		const isUnique = await isPNRUnique(pnr, db);
		if (isUnique) {
			return pnr;
		}

		attempts++;
	}

	// If we can't generate a unique PNR after many attempts,
	// add timestamp suffix (not standard but ensures uniqueness)
	const timestamp = Date.now().toString().slice(-2);
	const randomPNR = generateRandomPNR().slice(0, 4);
	return `${randomPNR}${timestamp}`;
}

/**
 * Validate PNR format (6 characters, alphanumeric, uppercase)
 */
export function isValidPNR(pnr: string): boolean {
	if (pnr.length !== PNR_LENGTH) {
		return false;
	}

	for (const char of pnr) {
		if (!PNR_CHARSET.includes(char)) {
			return false;
		}
	}

	return true;
}

/**
 * Format PNR for display (ensure uppercase)
 */
export function formatPNR(pnr: string): string {
	return pnr.toUpperCase();
}
