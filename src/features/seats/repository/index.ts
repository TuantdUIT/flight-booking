import { db } from "@/infrastructure/db/client";
import { seats } from "@/infrastructure/db/schema";
import { atomic } from "@/infrastructure/db/wrapper";
import { eq } from "drizzle-orm";

export const seatsRepository = {
	findByFlightId: async (flightId: number) => {
		return await db.select().from(seats).where(eq(seats.flightId, flightId));
	},

	findById: async (id: number) => {
		const seat = await db.select().from(seats).where(eq(seats.id, id));
		return seat[0] || null;
	},

	create: async (seatData: typeof seats.$inferInsert) => {
		const newSeat = await db.insert(seats).values(seatData).returning();
		return newSeat[0];
	},

	update: async (id: number, seatData: Partial<typeof seats.$inferInsert>) => {
		return await atomic(async (tx) => {
			const updatedSeat = await tx
				.update(seats)
				.set(seatData)
				.where(eq(seats.id, id))
				.returning();
			return updatedSeat[0];
		});
	},

	delete: async (id: number) => {
		return await atomic(async (tx) => {
			await tx.delete(seats).where(eq(seats.id, id));
			return true;
		});
	},

	updateAvailability: async (id: number, isAvailable: boolean) => {
		return await atomic(async (tx) => {
			const updatedSeat = await tx
				.update(seats)
				.set({ isAvailable })
				.where(eq(seats.id, id))
				.returning();
			return updatedSeat[0];
		});
	},
};
