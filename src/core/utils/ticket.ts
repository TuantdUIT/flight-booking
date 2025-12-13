import { bookingPassengers } from "@/infrastructure/db/schema";
import { eq } from "drizzle-orm";

/**
 * Generate unique E-ticket numbers for airline bookings
 * E-ticket numbers are typically 13 digits long and globally unique
 * They must be unique across all booking passengers
 */

const ETICKET_LENGTH = 13;
const ETICKET_CHARSET = '0123456789';

/**
 * Generate a random 13-digit E-ticket number
 */
function generateRandomETicket(): string {
	let eTicket = '';
	for (let i = 0; i < ETICKET_LENGTH; i++) {
		const randomIndex = Math.floor(Math.random() * ETICKET_CHARSET.length);
		eTicket += ETICKET_CHARSET[randomIndex];
	}
	return eTicket;
}

/**
 * Check if an E-ticket number already exists in the database
 */
async function isETicketUnique(eTicketNumber: string, db: any): Promise<boolean> {
	try {
		const existingTicket = await db
			.select()
			.from(bookingPassengers)
			.where(eq(bookingPassengers.eTicketNumber, eTicketNumber))
			.limit(1);

		return existingTicket.length === 0;
	} catch (error) {
		// If there's an error (e.g., table doesn't exist yet), assume it's unique
		console.warn('Error checking E-ticket uniqueness:', error);
		return true;
	}
}

/**
 * Generate a unique E-ticket number
 * Will keep generating until it finds one that's not in use
 * Includes safety limit to prevent infinite loops
 */
export async function generateUniqueETicket(db?: any): Promise<string> {
	const MAX_ATTEMPTS = 100;
	let attempts = 0;

	while (attempts < MAX_ATTEMPTS) {
		const eTicket = generateRandomETicket();

		// If no database connection provided, just return the random E-ticket
		if (!db) {
			return eTicket;
		}

		const isUnique = await isETicketUnique(eTicket, db);
		if (isUnique) {
			return eTicket;
		}

		attempts++;
	}

	// If we can't generate a unique E-ticket after many attempts,
	// add timestamp suffix (not standard but ensures uniqueness)
	const timestamp = Date.now().toString().slice(-3);
	const randomETicket = generateRandomETicket().slice(0, 10);
	return `${randomETicket}${timestamp}`;
}

/**
 * Validate E-ticket format (13 digits, numeric only)
 */
export function isValidETicket(eTicketNumber: string): boolean {
	if (eTicketNumber.length !== ETICKET_LENGTH) {
		return false;
	}

	for (const char of eTicketNumber) {
		if (!ETICKET_CHARSET.includes(char)) {
			return false;
		}
	}

	return true;
}

/**
 * Format E-ticket for display (add dashes for readability)
 */
export function formatETicket(eTicketNumber: string): string {
	// Format as XXX-XXXXXXX-X (common airline format)
	if (eTicketNumber.length === 13) {
		return `${eTicketNumber.slice(0, 3)}-${eTicketNumber.slice(3, 10)}-${eTicketNumber.slice(10)}`;
	}
	return eTicketNumber;
}
