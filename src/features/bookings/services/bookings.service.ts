import { Result, err, errors, ok } from "@/core/lib/http/result";
import { flightsRepository } from "@/features/flights/repository";
import { passengersRepository } from "@/features/passengers/repository";
import { ticketsRepository } from "@/features/tickets/repository";
import { db } from "@/infrastructure/db/client";
import {
	bookingPassengers,
	bookings,
	flights,
	seats,
	passengers as passengersTable,
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

			// Generate PNR (Passenger Name Record)
			// Format: PNR + timestamp + random string
			const timestamp = Date.now().toString(36).toUpperCase();
			const random = Math.random().toString(36).substring(2, 5).toUpperCase();
			const pnr = `PNR${timestamp}${random}`;

			// Use database transaction for booking creation
			const bookingResult = await db.transaction(async (tx) => {
				// Create booking
				const bookingData = {
					pnr: pnr,
					flightId: flight.id,
					airlineId: flight.airlineId,
					userId: userId,
					amountPaid: totalAmount.toString(),
					paymentStatus: "pending" as const,
					bookingStatus: "pending" as const,
				};

				const [newBooking] = await tx
					.insert(bookings)
					.values(bookingData)
					.returning();

				// Create passenger-booking relationships and assign seats
				for (let i = 0; i < createdPassengers.length; i++) {
					const passengerId = createdPassengers[i].id;
					const seatId = availableSeats[i].id;

					const bookingPassengerData = {
						bookingId: newBooking.id,
						passengerId: passengerId,
						seatId: seatId,
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
				pnr: bookingResult.pnr || pnr,
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
			const bookings = await bookingsRepository.findBookingsByUserId(userId);
			return ok(bookings);
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
