import { Result, err, errors, ok } from "@/core/lib/http/result";
import { flightsRepository } from "@/features/flights/repository";
import { passengersRepository } from "@/features/passengers/repository";
import { ticketsRepository } from "@/features/tickets/repository";
import { atomic } from "@/infrastructure/db/client";
import { bookingPassengers, bookings, flights, seats } from "@/infrastructure/db/schema";
import { eq } from "drizzle-orm";
import { bookingsRepository } from "../repository";
import { BookingStatus, CreateBookingResult } from "../types";
import { CreateBookingSchema } from "../validations/create-booking";

export class BookingsService {
	async createBooking(
		bookingData: CreateBookingSchema & { userId: string }
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
			const availableSeats = await flightsRepository.findAvailableSeatsByFlightId(
				flight.id
			);
			if (availableSeats.length < passengers.length) {
				return err(errors.validationError("Not enough available seats"));
			}

			// Create passengers
			const createdPassengers: Array<{id: number, name: string, email?: string | null, phoneNumber?: string | null}> = [];
			for (const passenger of passengers) {
				const passengerData = {
					name: `${passenger.firstName} ${passenger.lastName}`,
					email: passenger.email,
					phoneNumber: passenger.phone,
				};

				const newPassenger = await passengersRepository.createPassenger(passengerData);
				createdPassengers.push(newPassenger);
			}

			// Use atomic transaction for booking creation
			const bookingResult = await atomic(async (tx) => {
				// Create booking
				const bookingData = {
					flightId: flight.id,
					airlineId: flight.airlineId,
					userId: userId,
					amountPaid: flight.priceBase, // Simplified - should calculate total based on passengers
					paymentStatus: "paid" as const, // Simplified - should integrate with payment provider
					bookingStatus: "confirmed" as const,
				};

				const [newBooking] = await tx.insert(bookings).values(bookingData).returning();

				// Create passenger-booking relationships and assign seats
				for (let i = 0; i < createdPassengers.length; i++) {
					const passengerId = createdPassengers[i].id;
					const seatId = availableSeats[i].id;

					const bookingPassengerData = {
						bookingId: newBooking.id,
						passengerId: passengerId,
						seatId: seatId,
					};

					await tx.insert(bookingPassengers).values(bookingPassengerData).returning();

					// Mark seat as unavailable
					await tx.update(seats)
						.set({ isAvailable: false })
						.where(eq(seats.id, seatId));
				}

				// Update flight available seats count
				await tx.update(flights)
					.set({ availableSeats: flight.availableSeats - createdPassengers.length })
					.where(eq(flights.id, flight.id));

				return newBooking;
			});

			return ok({
				bookingId: bookingResult.id,
				pnr: `PNR${bookingResult.id.toString().padStart(6, '0')}`,
				status: bookingResult.bookingStatus as BookingStatus,
				totalAmount: Number(bookingResult.amountPaid),
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

	async cancelBooking(bookingId: number, userId: string): Promise<Result<boolean>> {
		try {
			const booking = await bookingsRepository.findBookingById(bookingId);
			if (!booking) {
				return err(errors.notFound("Booking not found"));
			}

			if (booking.userId !== userId) {
				return err(errors.unauthorized("Not authorized to cancel this booking"));
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
