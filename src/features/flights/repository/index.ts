import { db } from "@/infrastructure/db/client";
import { airlines, flights, seats } from "@/infrastructure/db/schema";
import { atomic } from "@/infrastructure/db/wrapper";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export const flightsRepository = {
	// Airlines
	findAirlineById: async (id: number) => {
		const airline = await db.select().from(airlines).where(eq(airlines.id, id));
		return airline[0] || null;
	},

	findAllAirlines: async () => {
		return await db.select().from(airlines);
	},

	// Flights
	findAllFlights: async () => {
		return await db.select().from(flights);
	},

	createAirline: async (airlineData: typeof airlines.$inferInsert) => {
		const newAirline = await db
			.insert(airlines)
			.values(airlineData)
			.returning();
		return newAirline[0];
	},

	updateAirline: async (
		id: number,
		airlineData: Partial<typeof airlines.$inferInsert>,
	) => {
		return await atomic(async (tx) => {
			const updatedAirline = await tx
				.update(airlines)
				.set(airlineData)
				.where(eq(airlines.id, id))
				.returning();
			return updatedAirline[0];
		});
	},

	deleteAirline: async (id: number) => {
		return await atomic(async (tx) => {
			await tx.delete(airlines).where(eq(airlines.id, id));
			return true;
		});
	},

	// Flights
	findFlightById: async (id: number) => {
		const flight = await db.select().from(flights).where(eq(flights.id, id));
		return flight[0] || null;
	},

	findFlightsByAirline: async (airlineId: number) => {
		return await db
			.select()
			.from(flights)
			.where(eq(flights.airlineId, airlineId));
	},

	// --- NEW: Methods for Dropdown Data ---
	getUniqueOrigins: async () => {
		return await db
			.select({ code: flights.origin }) // Lấy cột origin
			.from(flights)
			.groupBy(flights.origin); // Gom nhóm để loại bỏ trùng lặp
	},

	getUniqueDestinations: async () => {
		return await db
			.select({ code: flights.destination }) // Lấy cột destination
			.from(flights)
			.groupBy(flights.destination); // Gom nhóm để loại bỏ trùng lặp
	},
	// --------------------------------------

	searchFlights: async (origin: string, destination: string) => {
		return await db
			.select()
			.from(flights)
			.where(
				and(eq(flights.origin, origin), eq(flights.destination, destination)),
			);
	},

	findFlightsInDateRange: async (
		origin: string,
		destination: string,
		fromDate: string,
		toDate: string,
	) => {
		return await db
			.select()
			.from(flights)
			.where(
				and(
					eq(flights.origin, origin),
					eq(flights.destination, destination),
					gte(flights.date, fromDate),
					lte(flights.date, toDate),
				),
			);
	},

	createFlight: async (flightData: typeof flights.$inferInsert) => {
		const newFlight = await db.insert(flights).values(flightData).returning();
		return newFlight[0];
	},

	updateFlight: async (
		id: number,
		flightData: Partial<typeof flights.$inferInsert>,
	) => {
		return await atomic(async (tx) => {
			const updatedFlight = await tx
				.update(flights)
				.set(flightData)
				.where(eq(flights.id, id))
				.returning();
			return updatedFlight[0];
		});
	},

	deleteFlight: async (id: number) => {
		return await atomic(async (tx) => {
			// Delete related seats first
			await tx.delete(seats).where(eq(seats.flightId, id));
			// Then delete the flight
			await tx.delete(flights).where(eq(flights.id, id));
			return true;
		});
	},

	// Seats
	findSeatsByFlightId: async (flightId: number) => {
		return await db.select().from(seats).where(eq(seats.flightId, flightId));
	},

	findAvailableSeatsByFlightId: async (flightId: number) => {
		return await db
			.select()
			.from(seats)
			.where(and(eq(seats.flightId, flightId), eq(seats.isAvailable, true)));
	},

	findSeatById: async (id: number) => {
		const seat = await db.select().from(seats).where(eq(seats.id, id));
		return seat[0] || null;
	},

	createSeat: async (seatData: typeof seats.$inferInsert) => {
		const newSeat = await db.insert(seats).values(seatData).returning();
		return newSeat[0];
	},

	updateSeat: async (
		id: number,
		seatData: Partial<typeof seats.$inferInsert>,
	) => {
		return await atomic(async (tx) => {
			const updatedSeat = await tx
				.update(seats)
				.set(seatData)
				.where(eq(seats.id, id))
				.returning();
			return updatedSeat[0];
		});
	},

	updateSeatAvailability: async (id: number, isAvailable: boolean) => {
		return await atomic(async (tx) => {
			const updatedSeat = await tx
				.update(seats)
				.set({ isAvailable })
				.where(eq(seats.id, id))
				.returning();
			return updatedSeat[0];
		});
	},

	deleteSeat: async (id: number) => {
		return await atomic(async (tx) => {
			await tx.delete(seats).where(eq(seats.id, id));
			return true;
		});
	},

	// Complex operations
	createFlightWithSeats: async (
		flightData: typeof flights.$inferInsert,
		seatsData: Omit<typeof seats.$inferInsert, "flightId">[],
	) => {
		return await atomic(async (tx) => {
			// Create flight
			const [flight] = await tx.insert(flights).values(flightData).returning();

			// Create seats
			const createdSeats = [];
			for (const seatData of seatsData) {
				const [seat] = await tx
					.insert(seats)
					.values({ ...seatData, flightId: flight.id })
					.returning();
				createdSeats.push(seat);
			}

			return { flight, seats: createdSeats };
		});
	},

	// Analytics/Reporting
	getFlightsCount: async () => {
		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(flights);
		return result[0].count;
	},

	getPopularRoutes: async () => {
		const result = await db
			.select({
				origin: flights.origin,
				destination: flights.destination,
				flight_count: sql<number>`count(*)`,
			})
			.from(flights)
			.groupBy(flights.origin, flights.destination)
			.orderBy(sql`count(*) desc`);
		return result;
	},
};
