import { db } from "@/infrastructure/db/client";
import {
	airlines,
	bookingPassengers,
	bookings,
	flights,
	passengers,
	seats,
} from "@/infrastructure/db/schema";
import { atomic } from "@/infrastructure/db/wrapper";
import { and, eq, sql } from "drizzle-orm";

// Note: This repository handles ticket-like operations using existing booking data
// Since there's no separate tickets table, we work with bookings and passengers

export const ticketsRepository = {
	// Get complete ticket information by booking PNR/ID
	getTicketByBookingId: async (bookingId: number) => {
		const ticketInfo = await db
			.select({
				bookingId: bookings.id,
				bookingStatus: bookings.bookingStatus,
				paymentStatus: bookings.paymentStatus,
				amountPaid: bookings.amountPaid,
				flightId: flights.id,
				flightNumber: sql<string>`CONCAT(${airlines.name}, '-', ${flights.id})`,
				airline: airlines.name,
				origin: flights.origin,
				destination: flights.destination,
				date: flights.date,
				time: flights.time,
				passengerId: bookingPassengers.passengerId,
				passengerName: passengers.name,
				passengerEmail: passengers.email,
				passengerPhone: passengers.phoneNumber,
				seatId: bookingPassengers.seatId,
				seatNumber: seats.seatNumber,
				seatClass: seats.class,
				seatPrice: seats.price,
				createdAt: bookings.createdAt,
			})
			.from(bookings)
			.innerJoin(flights, eq(bookings.flightId, flights.id))
			.innerJoin(airlines, eq(flights.airlineId, airlines.id))
			.innerJoin(
				bookingPassengers,
				eq(bookings.id, bookingPassengers.bookingId),
			)
			.innerJoin(passengers, eq(bookingPassengers.passengerId, passengers.id))
			.innerJoin(seats, eq(bookingPassengers.seatId, seats.id))
			.where(eq(bookings.id, bookingId));

		return ticketInfo;
	},

	// Get all tickets for a user (PNR)
	getTicketsByUserId: async (userId: string) => {
		return await db
			.select({
				bookingId: bookings.id,
				bookingStatus: bookings.bookingStatus,
				paymentStatus: bookings.paymentStatus,
				flightId: flights.id,
				airline: airlines.name,
				origin: flights.origin,
				destination: flights.destination,
				date: flights.date,
				time: flights.time,
				passengerName: passengers.name,
				seatNumber: seats.seatNumber,
				seatClass: seats.class,
			})
			.from(bookings)
			.innerJoin(flights, eq(bookings.flightId, flights.id))
			.innerJoin(airlines, eq(flights.airlineId, airlines.id))
			.innerJoin(
				bookingPassengers,
				eq(bookings.id, bookingPassengers.bookingId),
			)
			.innerJoin(passengers, eq(bookingPassengers.passengerId, passengers.id))
			.innerJoin(seats, eq(bookingPassengers.seatId, seats.id))
			.where(eq(bookings.userId, userId))
			.orderBy(bookings.createdAt);
	},

	// Get tickets by passenger ID
	getTicketsByPassengerId: async (passengerId: number) => {
		return await db
			.select({
				bookingId: bookings.id,
				bookingStatus: bookings.bookingStatus,
				flightId: flights.id,
				airline: airlines.name,
				origin: flights.origin,
				destination: flights.destination,
				date: flights.date,
				time: flights.time,
				seatNumber: seats.seatNumber,
				seatClass: seats.class,
			})
			.from(bookingPassengers)
			.innerJoin(bookings, eq(bookingPassengers.bookingId, bookings.id))
			.innerJoin(flights, eq(bookings.flightId, flights.id))
			.innerJoin(airlines, eq(flights.airlineId, airlines.id))
			.innerJoin(seats, eq(bookingPassengers.seatId, seats.id))
			.where(eq(bookingPassengers.passengerId, passengerId))
			.orderBy(bookings.createdAt);
	},

	// Get upcoming tickets for a user
	getUpcomingTickets: async (userId: string) => {
		const now = new Date();
		return await db
			.select({
				bookingId: bookings.id,
				flightId: flights.id,
				airline: airlines.name,
				origin: flights.origin,
				destination: flights.destination,
				date: flights.date,
				time: flights.time,
				passengerName: passengers.name,
				seatNumber: seats.seatNumber,
				seatClass: seats.class,
			})
			.from(bookings)
			.innerJoin(flights, eq(bookings.flightId, flights.id))
			.innerJoin(airlines, eq(flights.airlineId, airlines.id))
			.innerJoin(
				bookingPassengers,
				eq(bookings.id, bookingPassengers.bookingId),
			)
			.innerJoin(passengers, eq(bookingPassengers.passengerId, passengers.id))
			.innerJoin(seats, eq(bookingPassengers.seatId, seats.id))
			.where(
				and(
					eq(bookings.userId, userId),
					eq(bookings.bookingStatus, "confirmed"),
					sql`${flights.date} >= ${now.toISOString().split("T")[0]}`,
				),
			)
			.orderBy(flights.date, flights.time);
	},

	// Cancel ticket (update booking status)
	cancelTicket: async (bookingId: number, passengerId: number) => {
		return await atomic(async (tx) => {
			// Update booking passenger relationship if needed
			// Usually tickets are cancelled per booking, not per passenger
			// This would depend on business logic - for now, we'll assume cancelling entire booking
			const cancelled = await tx
				.update(bookings)
				.set({
					bookingStatus: "failed" as const,
					updatedAt: new Date(),
				})
				.where(eq(bookings.id, bookingId))
				.returning();

			// Make seats available again
			await tx
				.update(seats)
				.set({ isAvailable: true })
				.where(
					eq(
						seats.id,
						sql`(SELECT seat_id FROM booking_passenger WHERE booking_id = ${bookingId} AND passenger_id = ${passengerId})`,
					),
				);

			return cancelled[0];
		});
	},

	// Get ticket count for reporting
	getTicketsCount: async () => {
		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(bookingPassengers);
		return result[0].count;
	},

	// Get ticket revenue
	getTicketRevenue: async () => {
		const result = await db
			.select({
				totalRevenue: sql<number>`COALESCE(SUM(${bookings.amountPaid}), 0)`,
				confirmedBookings: sql<number>`COUNT(CASE WHEN ${bookings.bookingStatus} = 'confirmed' THEN 1 END)`,
				totalBookings: sql<number>`COUNT(*)`,
			})
			.from(bookings)
			.where(eq(bookings.paymentStatus, "paid"));

		return result[0];
	},
};
