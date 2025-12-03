import { db } from "@/infrastructure/db/client";
import {
	accounts,
	sessions,
	users,
	verification,
} from "@/infrastructure/db/schema";
import { atomic } from "@/infrastructure/db/wrapper";
import { and, eq, lt } from "drizzle-orm";

export const authRepository = {
	// Users
	findUserById: async (id: string) => {
		const user = await db.select().from(users).where(eq(users.id, id));
		return user[0] || null;
	},

	findUserByEmail: async (email: string) => {
		const user = await db.select().from(users).where(eq(users.email, email));
		return user[0] || null;
	},

	createUser: async (userData: typeof users.$inferInsert) => {
		const newUser = await db.insert(users).values(userData).returning();
		return newUser[0];
	},

	updateUser: async (
		id: string,
		userData: Partial<typeof users.$inferInsert>,
	) => {
		return await atomic(async (tx) => {
			const updatedUser = await tx
				.update(users)
				.set({ ...userData, updatedAt: new Date() })
				.where(eq(users.id, id))
				.returning();
			return updatedUser[0];
		});
	},

	deleteUser: async (id: string) => {
		return await atomic(async (tx) => {
			await tx.delete(users).where(eq(users.id, id));
			return true;
		});
	},

	// Accounts
	findAccountByProvider: async (
		providerId: string,
		providerAccountId: string,
	) => {
		const account = await db
			.select()
			.from(accounts)
			.where(
				and(
					eq(accounts.providerId, providerId),
					eq(accounts.accountId, providerAccountId),
				),
			);
		return account[0] || null;
	},

	findAccountsByUserId: async (userId: string) => {
		return await db.select().from(accounts).where(eq(accounts.userId, userId));
	},

	createAccount: async (accountData: typeof accounts.$inferInsert) => {
		const newAccount = await db
			.insert(accounts)
			.values(accountData)
			.returning();
		return newAccount[0];
	},

	updateAccount: async (
		id: string,
		accountData: Partial<typeof accounts.$inferInsert>,
	) => {
		return await atomic(async (tx) => {
			const updatedAccount = await tx
				.update(accounts)
				.set({ ...accountData, updatedAt: new Date() })
				.where(eq(accounts.id, id))
				.returning();
			return updatedAccount[0];
		});
	},

	deleteAccount: async (id: string) => {
		return await atomic(async (tx) => {
			await tx.delete(accounts).where(eq(accounts.id, id));
			return true;
		});
	},

	// Sessions
	findSessionByToken: async (token: string) => {
		const session = await db
			.select()
			.from(sessions)
			.where(eq(sessions.token, token));
		return session[0] || null;
	},

	findSessionsByUserId: async (userId: string) => {
		return await db.select().from(sessions).where(eq(sessions.userId, userId));
	},

	createSession: async (sessionData: typeof sessions.$inferInsert) => {
		const newSession = await db
			.insert(sessions)
			.values(sessionData)
			.returning();
		return newSession[0];
	},

	updateSession: async (
		id: string,
		sessionData: Partial<typeof sessions.$inferInsert>,
	) => {
		return await atomic(async (tx) => {
			const updatedSession = await tx
				.update(sessions)
				.set({ ...sessionData, updatedAt: new Date() })
				.where(eq(sessions.id, id))
				.returning();
			return updatedSession[0];
		});
	},

	deleteSession: async (id: string) => {
		return await atomic(async (tx) => {
			await tx.delete(sessions).where(eq(sessions.id, id));
			return true;
		});
	},

	// Verification
	findVerificationByIdentifier: async (identifier: string) => {
		const verificationRecord = await db
			.select()
			.from(verification)
			.where(eq(verification.identifier, identifier));
		return verificationRecord[0] || null;
	},

	createVerification: async (
		verificationData: typeof verification.$inferInsert,
	) => {
		const newVerification = await db
			.insert(verification)
			.values(verificationData)
			.returning();
		return newVerification[0];
	},

	updateVerification: async (
		id: string,
		verificationData: Partial<typeof verification.$inferInsert>,
	) => {
		return await atomic(async (tx) => {
			const updatedVerification = await tx
				.update(verification)
				.set({ ...verificationData })
				.where(eq(verification.id, id))
				.returning();
			return updatedVerification[0];
		});
	},

	deleteVerification: async (id: string) => {
		return await atomic(async (tx) => {
			await tx.delete(verification).where(eq(verification.id, id));
			return true;
		});
	},

	// Cleanup expired verifications (optional utility)
	cleanupExpiredVerifications: async () => {
		const now = new Date();
		return await db.delete(verification).where(lt(verification.expiresAt, now));
	},
};
