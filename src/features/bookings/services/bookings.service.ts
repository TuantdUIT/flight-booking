import { Result, err, errors, ok } from "@/core/lib/http/result";
import { generateUniquePNR } from "@/core/utils/pnr";
import { generateUniqueETicket } from "@/core/utils/ticket";
import { flightsRepository } from "@/features/flights/repository";
import { passengersRepository } from "@/features/passengers/repository";
import { ticketsRepository } from "@/features/tickets/repository";
import { db } from "@/infrastructure/db/client";
import {
	bookingPassengers,
	bookings,
	flights,
	seats
} from "@/infrastructure/db/schema";
import { eq } from "drizzle-orm";
import { bookingsRepository } from "../repository";
import { BookingStatus, CreateBookingResult } from "../types";
import { CreateBookingSchema } from "../validations/create-booking";

export class BookingsService {
	async createBooking(
		bookingData: CreateBookingSchema & { userId: string },
	): Promise<Result<CreateBookingResult>> {
		try {
			const { flightId, passengers, paymentInfo, userId } = bookingData;

			// Find available flight
			const flight = await flightsRepository.findFlightById(parseInt(flightId));
			if (!flight) {
				return err(errors.notFound("Flight not found"));
			}

			// Check if there are enough available seats
			if (flight.availableSeats < passengers.length) {
				return err(errors.validationError("Not enough available seats"));
			}

			// Find available seats
			const availableSeats =
				await flightsRepository.findAvailableSeatsByFlightId(flight.id);
			if (availableSeats.length < passengers.length) {
				return err(errors.validationError("Not enough available seats"));
			}

			// Create passengers
			const createdPassengers: Array<{
				id: number;
				name: string;
				email?: string | null;
				phoneNumber?: string | null;
			}> = [];
			for (const passenger of passengers) {
				const passengerData = {
					name: `${passenger.firstName} ${passenger.lastName}`,
					email: passenger.email,
					phoneNumber: passenger.phone,
					dob: passenger.dob || null, // Include date of birth if provided
				};

				const newPassenger =
					await passengersRepository.createPassenger(passengerData);
				createdPassengers.push(newPassenger);
			}

			// Calculate total amount
			const baseFare = Number(flight.priceBase) * passengers.length;
			const taxes = Number(flight.priceTax) * passengers.length;
			const totalAmount = baseFare + taxes;

			// Generate unique PNR before transaction

			// Generate PNR (Passenger Name Record)
			// Format: PNR + timestamp + random string
			const timestamp = Date.now().toString(36).toUpperCase();
			const random = Math.random().toString(36).substring(2, 5).toUpperCase();
			const pnr = await generateUniquePNR(db);

			// Determine payment status based on whether real payment info was provided
			// If cardholderName is present, it means user went through payment page
			const isPaid = paymentInfo?.cardholderName ? true : false;
			const paymentStatus = isPaid ? ("paid" as const) : ("pending" as const);
			const bookingStatus = isPaid ? ("confirmed" as const) : ("pending" as const);

			// Use database transaction for booking creation
			const bookingResult = await db.transaction(async (tx) => {
				// Create booking
				const bookingData = {
					pnr: pnr,
					flightId: flight.id,
					airlineId: flight.airlineId,
					userId: userId,
					amountPaid: totalAmount.toString(),
					paymentStatus: paymentStatus,
					bookingStatus: bookingStatus,
				};

				const [newBooking] = await tx
					.insert(bookings)
					.values(bookingData)
					.returning();

				// Create passenger-booking relationships and assign seats
				for (let i = 0; i < createdPassengers.length; i++) {
					const passengerId = createdPassengers[i].id;
					const seatId = availableSeats[i].id;

					// Generate unique e-ticket number for this passenger
					const eTicketNumber = await generateUniqueETicket(tx);

					const bookingPassengerData = {
						bookingId: newBooking.id,
						passengerId: passengerId,
						seatId: seatId,
						eTicketNumber: eTicketNumber,
					};

					await tx
						.insert(bookingPassengers)
						.values(bookingPassengerData)
						.returning();

					// Mark seat as unavailable
					await tx
						.update(seats)
						.set({ isAvailable: false })
						.where(eq(seats.id, seatId));
				}

				// Update flight available seats count
				await tx
					.update(flights)
					.set({
						availableSeats: flight.availableSeats - createdPassengers.length,
					})
					.where(eq(flights.id, flight.id));

				return newBooking;
			});

			return ok({
				bookingId: bookingResult.id,
				pnr: `PNR${bookingResult.id.toString().padStart(6, "0")}`,
				status: bookingResult.bookingStatus as BookingStatus,
				totalAmount: totalAmount,
				passengersCount: passengers.length,
			});
		} catch (error) {
			console.error("Error creating booking:", error);
			return err(errors.internalError("Failed to create booking"));
		}
	}

	async getUserBookings(userId: string): Promise<Result<any[]>> {
		try {
			const userBookings =
				await bookingsRepository.findBookingsByUserId(userId);

			// Enrich bookings with flight, airline, and passenger details
			const enrichedBookings = await Promise.all(
				userBookings.map(async (booking) => {
					// Get flight details
					const flight = booking.flightId
						? await flightsRepository.findFlightById(booking.flightId)
						: null;

					// Get airline details
					const airline =
						flight && flight.airlineId
							? await flightsRepository.findAirlineById(flight.airlineId)
							: null;

					// Get passengers for this booking
					const bookingPassengerRecords =
						await bookingsRepository.findBookingPassengersByBookingId(
							booking.id,
						);

					const passengers = await Promise.all(
						bookingPassengerRecords.map(async (bp) => {
							const passenger = bp.passengerId
								? await passengersRepository.findPassengerById(bp.passengerId)
								: null;

							const seat = bp.seatId
								? await flightsRepository.findSeatById(bp.seatId)
								: null;

							return {
								id: passenger?.id || 0,
								name: passenger?.name || "Unknown",
								email: passenger?.email || null,
								phoneNumber: passenger?.phoneNumber || null,
								seatNumber: seat?.seatNumber || "N/A",
								eTicketNumber: bp.eTicketNumber || null,
							};
						}),
					);

					return {
						id: booking.id,
						pnr: booking.pnr || `PNR${booking.id.toString().padStart(6, "0")}`,
						bookingStatus: booking.bookingStatus,
						paymentStatus: booking.paymentStatus,
						amountPaid: booking.amountPaid || "0",
						createdAt: booking.createdAt,
						flight: {
							id: flight?.id || 0,
							flightNumber: `${airline?.name || "Unknown"}-${flight?.id || 0}`,
							airline: airline?.name || "Unknown Airline",
							origin: flight?.origin || "N/A",
							destination: flight?.destination || "N/A",
							date: flight?.date || new Date().toISOString().split("T")[0],
							time: flight?.time || "00:00",
							arrivalTime: flight?.arrivalTime || "00:00",
						},
						passengers,
					};
				}),
			);

			return ok(enrichedBookings);
		} catch (error) {
			console.error("Error fetching user bookings:", error);
			return err(errors.internalError("Failed to fetch bookings"));
		}
	}

	async getBookingById(bookingId: number): Promise<Result<any>> {
		try {
			const booking = await bookingsRepository.findBookingById(bookingId);
			if (!booking) {
				return err(errors.notFound("Booking not found"));
			}
			return ok(booking);
		} catch (error) {
			console.error("Error fetching booking:", error);
			return err(errors.internalError("Failed to fetch booking"));
		}
	}

	async cancelBooking(
		bookingId: number,
		userId: string,
	): Promise<Result<boolean>> {
		try {
			const booking = await bookingsRepository.findBookingById(bookingId);
			if (!booking) {
				return err(errors.notFound("Booking not found"));
			}

			if (booking.userId !== userId) {
				return err(
					errors.unauthorized("Not authorized to cancel this booking"),
				);
			}

			if (booking.bookingStatus === "confirmed") {
				// Use the tickets repository cancel function which handles seat release
				await ticketsRepository.cancelTicket(bookingId, 0); // passengerId not needed for full cancellation
			}

			return ok(true);
		} catch (error) {
			console.error("Error canceling booking:", error);
			return err(errors.internalError("Failed to cancel booking"));
		}
	}
}

export const bookingsService = new BookingsService();
