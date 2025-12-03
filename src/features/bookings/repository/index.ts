import { db } from "@/infrastructure/db/client";
import { bookingPassengers, bookings } from "@/infrastructure/db/schema";
import { atomic } from "@/infrastructure/db/wrapper";
import { eq, sql } from "drizzle-orm";

export const bookingsRepository = {
	// Bookings
	findBookingById: async (id: number) => {
		const booking = await db.select().from(bookings).where(eq(bookings.id, id));
		return booking[0] || null;
	},

	findBookingsByUserId: async (userId: string) => {
		return await db.select().from(bookings).where(eq(bookings.userId, userId));
	},

	findBookingsByFlightId: async (flightId: number) => {
		return await db
			.select()
			.from(bookings)
			.where(eq(bookings.flightId, flightId));
	},

	createBooking: async (bookingData: typeof bookings.$inferInsert) => {
		const newBooking = await db
			.insert(bookings)
			.values(bookingData)
			.returning();
		return newBooking[0];
	},

	updateBooking: async (
		id: number,
		bookingData: Partial<typeof bookings.$inferInsert>,
	) => {
		return await atomic(async (tx) => {
			const updatedBooking = await tx
				.update(bookings)
				.set({ ...bookingData, updatedAt: new Date() })
				.where(eq(bookings.id, id))
				.returning();
			return updatedBooking[0];
		});
	},

	updateBookingStatus: async (
		id: number,
		status: typeof bookings.$inferInsert.paymentStatus,
		paymentAmount?: string,
	) => {
		return await atomic(async (tx) => {
			const newBookingStatus =
				status === "paid" ? ("confirmed" as const) : ("pending" as const);
			const updatedBooking = await tx
				.update(bookings)
				.set({
					paymentStatus: status,
					amountPaid: paymentAmount ? sql`${paymentAmount}` : undefined,
					bookingStatus: newBookingStatus,
					updatedAt: new Date(),
				})
				.where(eq(bookings.id, id))
				.returning();
			return updatedBooking[0];
		});
	},

	deleteBooking: async (id: number) => {
		return await atomic(async (tx) => {
			// Delete related booking passengers first
			await tx
				.delete(bookingPassengers)
				.where(eq(bookingPassengers.bookingId, id));
			// Then delete the booking
			await tx.delete(bookings).where(eq(bookings.id, id));
			return true;
		});
	},

	// Booking Passengers
	findBookingPassengersByBookingId: async (bookingId: number) => {
		return await db
			.select()
			.from(bookingPassengers)
			.where(eq(bookingPassengers.bookingId, bookingId));
	},

	createBookingPassenger: async (
		passengerData: typeof bookingPassengers.$inferInsert,
	) => {
		const newPassenger = await db
			.insert(bookingPassengers)
			.values(passengerData)
			.returning();
		return newPassenger[0];
	},

	updateBookingPassenger: async (
		id: number,
		passengerData: Partial<typeof bookingPassengers.$inferInsert>,
	) => {
		return await atomic(async (tx) => {
			const updatedPassenger = await tx
				.update(bookingPassengers)
				.set(passengerData)
				.where(eq(bookingPassengers.bookingPaxId, id))
				.returning();
			return updatedPassenger[0];
		});
	},

	deleteBookingPassenger: async (id: number) => {
		return await atomic(async (tx) => {
			await tx
				.delete(bookingPassengers)
				.where(eq(bookingPassengers.bookingPaxId, id));
			return true;
		});
	},

	// Complex operations
	createBookingWithPassengers: async (
		bookingData: typeof bookings.$inferInsert,
		passengersData: (typeof bookingPassengers.$inferInsert)[],
	) => {
		return await atomic(async (tx) => {
			// Create booking
			const [booking] = await tx
				.insert(bookings)
				.values(bookingData)
				.returning();

			// Create passengers
			const passengers = [];
			for (const passengerData of passengersData) {
				const [passenger] = await tx
					.insert(bookingPassengers)
					.values({ ...passengerData, bookingId: booking.id })
					.returning();
				passengers.push(passenger);
			}

			return { booking, passengers };
		});
	},

	// Analytics/Reporting
	getBookingsCount: async () => {
		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(bookings);
		return result[0].count;
	},

	getBookingsByStatus: async (status: "pending" | "confirmed" | "failed") => {
		return await db
			.select()
			.from(bookings)
			.where(eq(bookings.bookingStatus, status));
	},
};
