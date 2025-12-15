import { db } from "@/infrastructure/db/client";
import { airlines, bookingPassengers, bookings, flights, users } from "@/infrastructure/db/schema";
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

	// Admin methods
	findBookingsWithDetails: async (limit: number = 50, offset: number = 0, status?: string | null) => {
		const baseQuery = db
			.select({
				id: bookings.id,
				pnr: bookings.pnr,
				bookingStatus: bookings.bookingStatus,
				paymentStatus: bookings.paymentStatus,
				amountPaid: bookings.amountPaid,
				userId: bookings.userId,
				flightId: bookings.flightId,
				airlineId: bookings.airlineId,
				createdAt: bookings.createdAt,
				updatedAt: bookings.updatedAt,
				// User details
				userEmail: users.email,
				userName: users.name,
				// Flight details
				flightNumber: sql<string>`CONCAT(${airlines.name}, '-', ${flights.id})`,
				airlineName: airlines.name,
				origin: flights.origin,
				destination: flights.destination,
				flightDate: flights.date,
				// Passenger count
				passengerCount: sql<number>`COUNT(${bookingPassengers.passengerId})`,
			})
			.from(bookings)
			.leftJoin(users, eq(bookings.userId, users.id))
			.leftJoin(flights, eq(bookings.flightId, flights.id))
			.leftJoin(airlines, eq(bookings.airlineId, airlines.id))
			.leftJoin(bookingPassengers, eq(bookings.id, bookingPassengers.bookingId))
			.groupBy(
				bookings.id,
				bookings.pnr,
				bookings.bookingStatus,
				bookings.paymentStatus,
				bookings.amountPaid,
				bookings.userId,
				bookings.flightId,
				bookings.airlineId,
				bookings.createdAt,
				bookings.updatedAt,
				users.email,
				users.name,
				flights.id,
				flights.origin,
				flights.destination,
				flights.date,
				airlines.name
			)
			.orderBy(bookings.createdAt)
			.limit(limit)
			.offset(offset);

		if (status && status !== "all") {
			return await baseQuery.where(eq(bookings.bookingStatus, status as any));
		}

		return await baseQuery;
	},
};
