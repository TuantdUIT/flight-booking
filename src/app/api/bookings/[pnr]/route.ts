import { err, errors, ok, toJsonResponse } from "@/core/lib/http/result";
import { db } from "@/infrastructure/db/client";
import {
	airlines,
	bookingPassengers,
	bookings,
	flights,
	passengers,
	seats,
} from "@/infrastructure/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { pnr: string } },
) {
	const requestId = crypto.randomUUID();

	try {
		const pnr = params.pnr;

		// Validate PNR format
		if (!pnr || pnr.length !== 6) {
			const result = err(errors.validationError("Invalid PNR format"));
			const response = toJsonResponse(result, { requestId });
			return new NextResponse(response.body, {
				status: response.status,
				headers: response.headers,
			});
		}

		// Find booking by PNR
		const bookingData = await db
			.select({
				bookingId: bookings.id,
				pnr: bookings.pnr,
				bookingStatus: bookings.bookingStatus,
				paymentStatus: bookings.paymentStatus,
				amountPaid: bookings.amountPaid,
				createdAt: bookings.createdAt,
				// Flight details
				flightId: flights.id,
				flightNumber: sql<string>`CONCAT(${airlines.name}, '-', ${flights.id})`,
				airline: airlines.name,
				origin: flights.origin,
				destination: flights.destination,
				date: flights.date,
				time: flights.time,
				// Passengers with e-tickets
				passengers: sql<any>`JSON_AGG(
					JSON_BUILD_OBJECT(
						'id', ${passengers.id},
						'name', ${passengers.name},
						'email', ${passengers.email},
						'phoneNumber', ${passengers.phoneNumber},
						'seatNumber', ${seats.seatNumber},
						'seatClass', ${seats.class},
						'eTicketNumber', ${bookingPassengers.eTicketNumber}
					)
				)`,
			})
			.from(bookings)
			.innerJoin(flights, eq(bookings.flightId, flights.id))
			.innerJoin(airlines, eq(flights.airlineId, airlines.id))
			.innerJoin(bookingPassengers, eq(bookings.id, bookingPassengers.bookingId))
			.innerJoin(passengers, eq(bookingPassengers.passengerId, passengers.id))
			.innerJoin(seats, eq(bookingPassengers.seatId, seats.id))
			.where(eq(bookings.pnr, pnr))
			.groupBy(
				bookings.id,
				bookings.pnr,
				bookings.bookingStatus,
				bookings.paymentStatus,
				bookings.amountPaid,
				bookings.createdAt,
				flights.id,
				airlines.name,
				flights.origin,
				flights.destination,
				flights.date,
				flights.time,
			)
			.limit(1);

		if (!bookingData || bookingData.length === 0) {
			const result = err(errors.notFound("Booking not found"));
			const response = toJsonResponse(result, { requestId });
			return new NextResponse(response.body, {
				status: response.status,
				headers: response.headers,
			});
		}

		const booking = bookingData[0];

		// Format the response
		const formattedBooking = {
			id: booking.bookingId,
			pnr: booking.pnr,
			status: booking.bookingStatus,
			paymentStatus: booking.paymentStatus,
			amountPaid: parseFloat(booking.amountPaid as string),
			createdAt: booking.createdAt?.toISOString() || new Date().toISOString(),
			flight: {
				id: booking.flightId,
				flightNumber: booking.flightNumber,
				airline: booking.airline,
				origin: booking.origin,
				destination: booking.destination,
				date: booking.date,
				time: booking.time,
			},
			passengers: booking.passengers || [],
		};

		const result = ok(formattedBooking);
		const response = toJsonResponse(result, { requestId });

		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	} catch (error) {
		console.error("Error fetching booking by PNR:", error);

		const result = err(errors.internalError("Failed to fetch booking"));
		const response = toJsonResponse(result, { requestId });

		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	}
}
