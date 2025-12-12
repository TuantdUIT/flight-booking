import { Result, ok, err, errors } from "@/core/lib/http/result";
import { seatsRepository } from "../repository";
import type { Seat, SeatCreateInput, SeatUpdateInput } from "@/core/types/seat";

const mapDbSeatToSeat = (dbSeat: any): Seat => ({
	id: dbSeat.id,
	flight_id: dbSeat.flightId,
	seat_number: dbSeat.seatNumber,
	class: dbSeat.class,
	is_available: dbSeat.isAvailable ?? true,
	price: dbSeat.price,
});

export const seatsService = {
	getSeatsByFlightId: async (flightId: number): Promise<Result<Seat[]>> => {
		try {
			const seats = await seatsRepository.findByFlightId(flightId);
			return ok(seats.map(mapDbSeatToSeat));
		} catch (error) {
			return err(errors.internalError("Failed to fetch seats"));
		}
	},

	getSeatById: async (id: number): Promise<Result<Seat>> => {
		try {
			const seat = await seatsRepository.findById(id);
			if (!seat) {
				return err(errors.notFound("Seat not found"));
			}
			return ok(mapDbSeatToSeat(seat));
		} catch (error) {
			return err(errors.internalError("Failed to fetch seat"));
		}
	},

	createSeat: async (input: SeatCreateInput): Promise<Result<Seat>> => {
		try {
			const seat = await seatsRepository.create({
				flightId: input.flight_id,
				seatNumber: input.seat_number,
				class: input.class,
				isAvailable: input.is_available,
				price: input.price,
			});
			return ok(mapDbSeatToSeat(seat));
		} catch (error) {
			return err(errors.internalError("Failed to create seat"));
		}
	},

	updateSeat: async (
		id: number,
		input: SeatUpdateInput,
	): Promise<Result<Seat>> => {
		try {
			const existing = await seatsRepository.findById(id);
			if (!existing) {
				return err(errors.notFound("Seat not found"));
			}

			const updateData: any = {};
			if (input.seat_number !== undefined)
				updateData.seatNumber = input.seat_number;
			if (input.class !== undefined) updateData.class = input.class;
			if (input.is_available !== undefined)
				updateData.isAvailable = input.is_available;
			if (input.price !== undefined) updateData.price = input.price;

			const seat = await seatsRepository.update(id, updateData);
			return ok(mapDbSeatToSeat(seat));
		} catch (error) {
			return err(errors.internalError("Failed to update seat"));
		}
	},

	deleteSeat: async (id: number): Promise<Result<boolean>> => {
		try {
			const existing = await seatsRepository.findById(id);
			if (!existing) {
				return err(errors.notFound("Seat not found"));
			}
			await seatsRepository.delete(id);
			return ok(true);
		} catch (error) {
			return err(errors.internalError("Failed to delete seat"));
		}
	},

	updateAvailability: async (
		id: number,
		isAvailable: boolean,
	): Promise<Result<Seat>> => {
		try {
			const existing = await seatsRepository.findById(id);
			if (!existing) {
				return err(errors.notFound("Seat not found"));
			}
			const seat = await seatsRepository.updateAvailability(id, isAvailable);
			return ok(mapDbSeatToSeat(seat));
		} catch (error) {
			return err(errors.internalError("Failed to update seat availability"));
		}
	},
};
