import { db } from "@/infrastructure/db/client";
import { passengers } from "@/infrastructure/db/schema";
import { atomic } from "@/infrastructure/db/wrapper";
import { eq, sql } from "drizzle-orm";

export const passengersRepository = {
	// Passengers
	findPassengerById: async (id: number) => {
		const passenger = await db
			.select()
			.from(passengers)
			.where(eq(passengers.id, id));
		return passenger[0] || null;
	},

	findPassengersByEmail: async (email: string) => {
		return await db
			.select()
			.from(passengers)
			.where(eq(passengers.email, email));
	},

	findPassengersByPhone: async (phoneNumber: string) => {
		return await db
			.select()
			.from(passengers)
			.where(eq(passengers.phoneNumber, phoneNumber));
	},

	searchPassengersByName: async (name: string) => {
		return await db
			.select()
			.from(passengers)
			.where(sql`LOWER(${passengers.name}) LIKE LOWER(${`%${name}%`})`);
	},

	createPassenger: async (passengerData: typeof passengers.$inferInsert) => {
		const newPassenger = await db
			.insert(passengers)
			.values(passengerData)
			.returning();
		return newPassenger[0];
	},

	updatePassenger: async (
		id: number,
		passengerData: Partial<typeof passengers.$inferInsert>,
	) => {
		return await atomic(async (tx) => {
			const updatedPassenger = await tx
				.update(passengers)
				.set({ ...passengerData, updatedAt: new Date() })
				.where(eq(passengers.id, id))
				.returning();
			return updatedPassenger[0];
		});
	},

	deletePassenger: async (id: number) => {
		return await atomic(async (tx) => {
			await tx.delete(passengers).where(eq(passengers.id, id));
			return true;
		});
	},

	// Analytics/Reporting
	getPassengersCount: async () => {
		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(passengers);
		return result[0].count;
	},

	getPassengersByNationality: async () => {
		const result = await db
			.select({
				nationality: passengers.nationality,
				count: sql<number>`count(*)`,
			})
			.from(passengers)
			.where(sql`${passengers.nationality} IS NOT NULL`)
			.groupBy(passengers.nationality)
			.orderBy(sql`count(*) desc`);
		return result;
	},
};
