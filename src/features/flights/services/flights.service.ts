import { Result, errors, type AppError } from "@/core/lib/http/result";
import { flightsRepository } from "../repository";
import type { FlightSearchSchema } from "../validations/flight-search";

// Types for service responses
export type FlightWithAirline = {
	id: number;
	flightNumber: string;
	airline: string;
	origin: string;
	destination: string;
	date: string;
	time: string;
	totalSeats: number;
	availableSeats: number;
	priceBase: string;
	priceTax: string;
};

export type FlightDetails = Awaited<
	ReturnType<typeof flightsRepository.findFlightById>
>;

export type SeatInfo = Awaited<
	ReturnType<typeof flightsRepository.findSeatsByFlightId>
>[number];

export const flightsService = {
	/**
	 * Get all flights
	 */
	getAllFlights: async (): Promise<Result<FlightDetails[]>> => {
		try {
			const flights = await flightsRepository.findAllFlights();
			return Result.ok(flights);
		} catch (error) {
			console.error("Error fetching all flights:", error);
			return Result.failed(errors.internalError("Failed to fetch flights"));
		}
	},

	/**
	 * Get flight by ID
	 */
	getFlightById: async (id: number): Promise<Result<FlightDetails>> => {
		try {
			const flight = await flightsRepository.findFlightById(id);

			if (!flight) {
				return Result.failed(errors.notFound(`Flight with ID ${id} not found`));
			}

			return Result.ok(flight);
		} catch (error) {
			console.error("Error fetching flight:", error);
			return Result.failed(errors.internalError("Failed to fetch flight"));
		}
	},

	/**
	 * Search flights by origin, destination, and date
	 */
	searchFlights: async (
		params: FlightSearchSchema,
	): Promise<Result<FlightWithAirline[]>> => {
		try {
			const { origin, destination, departureDate, passengers } = params;

			const flights = await flightsRepository.searchFlights(
				origin,
				destination,
				departureDate,
			);

			// Filter flights with enough available seats
			const availableFlights = flights.filter(
				(flight) => flight.availableSeats >= passengers,
			);

			// Enrich with airline info
			const enrichedFlights: FlightWithAirline[] = await Promise.all(
				availableFlights.map(async (flight) => {
					const airline = flight.airlineId
						? await flightsRepository.findAirlineById(flight.airlineId)
						: null;

					return {
						id: flight.id,
						flightNumber: `FL-${flight.id}`,
						airline: airline?.name ?? "Unknown Airline",
						origin: flight.origin,
						destination: flight.destination,
						date: flight.date,
						time: flight.time,
						totalSeats: flight.totalSeats,
						availableSeats: flight.availableSeats,
						priceBase: flight.priceBase,
						priceTax: flight.priceTax,
					};
				}),
			);

			return Result.ok(enrichedFlights);
		} catch (error) {
			console.error("Error searching flights:", error);
			return Result.failed(errors.internalError("Failed to search flights"));
		}
	},

	/**
	 * Get available seats for a flight
	 */
	getAvailableSeats: async (flightId: number): Promise<Result<SeatInfo[]>> => {
		try {
			const flight = await flightsRepository.findFlightById(flightId);

			if (!flight) {
				return Result.failed(
					errors.notFound(`Flight with ID ${flightId} not found`),
				);
			}

			const seats =
				await flightsRepository.findAvailableSeatsByFlightId(flightId);
			return Result.ok(seats);
		} catch (error) {
			console.error("Error fetching seats:", error);
			return Result.failed(errors.internalError("Failed to fetch seats"));
		}
	},

	/**
	 * Get all seats for a flight (including unavailable)
	 */
	getAllSeats: async (flightId: number): Promise<Result<SeatInfo[]>> => {
		try {
			const flight = await flightsRepository.findFlightById(flightId);

			if (!flight) {
				return Result.failed(
					errors.notFound(`Flight with ID ${flightId} not found`),
				);
			}

			const seats = await flightsRepository.findSeatsByFlightId(flightId);
			return Result.ok(seats);
		} catch (error) {
			console.error("Error fetching seats:", error);
			return Result.failed(errors.internalError("Failed to fetch seats"));
		}
	},

	/**
	 * Get unique origin airports
	 */
	getOrigins: async (): Promise<Result<string[]>> => {
		try {
			const origins = await flightsRepository.getUniqueOrigins();
			return Result.ok(origins.map((o) => o.code));
		} catch (error) {
			console.error("Error fetching origins:", error);
			return Result.failed(errors.internalError("Failed to fetch origins"));
		}
	},

	/**
	 * Get unique destination airports
	 */
	getDestinations: async (): Promise<Result<string[]>> => {
		try {
			const destinations = await flightsRepository.getUniqueDestinations();
			return Result.ok(destinations.map((d) => d.code));
		} catch (error) {
			console.error("Error fetching destinations:", error);
			return Result.failed(
				errors.internalError("Failed to fetch destinations"),
			);
		}
	},

	/**
	 * Get all airlines
	 */
	getAllAirlines: async (): Promise<
		Result<Awaited<ReturnType<typeof flightsRepository.findAllAirlines>>>
	> => {
		try {
			const airlines = await flightsRepository.findAllAirlines();
			return Result.ok(airlines);
		} catch (error) {
			console.error("Error fetching airlines:", error);
			return Result.failed(errors.internalError("Failed to fetch airlines"));
		}
	},

	/**
	 * Get popular routes for analytics
	 */
	getPopularRoutes: async (): Promise<
		Result<Awaited<ReturnType<typeof flightsRepository.getPopularRoutes>>>
	> => {
		try {
			const routes = await flightsRepository.getPopularRoutes();
			return Result.ok(routes);
		} catch (error) {
			console.error("Error fetching popular routes:", error);
			return Result.failed(
				errors.internalError("Failed to fetch popular routes"),
			);
		}
	},
};
