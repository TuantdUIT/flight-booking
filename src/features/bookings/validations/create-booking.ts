import { z } from "zod";

export const createBookingSchema = z.object({
	flightId: z.string().min(1, { message: "Flight ID is required" }),
	passengers: z.array(
		z.object({
			firstName: z.string().min(1, { message: "First name is required" }),
			lastName: z.string().min(1, { message: "Last name is required" }),
			email: z.string().email({ message: "Invalid email address" }),
			phone: z.string().min(1, { message: "Phone number is required" }),
			dob: z.string().optional(), // Date of birth (YYYY-MM-DD format)
		}),
	),
	paymentInfo: z.object({
		cardNumber: z.string().min(1, { message: "Card number is required" }),
		expiryDate: z.string().min(1, { message: "Expiry date is required" }),
		cvv: z.string().min(1, { message: "CVV is required" }),
		cardholderName: z.string().optional(), // Cardholder name (optional for backward compatibility)
	}),
});

export type CreateBookingSchema = z.infer<typeof createBookingSchema>;
