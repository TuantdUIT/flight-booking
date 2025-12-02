import { db } from "@/infrastructure/db/client";
import {
	accounts,
	sessions,
	users,
	verification,
} from "@/infrastructure/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: users,
			account: accounts,
			session: sessions,
			verification,
		},
	}),
	pages: {
		signIn: "/auth/signin",
	},
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {},
	plugins: [username()],
	advanced: {
		database: {
			generateId: false,
		},
	},
	session: {
		modelName: "session",
		fields: {
			userId: "user_id",
			expiresAt: "expires_at",
			userAgent: "user_agent",
			createdAt: "created_at",
			updatedAt: "updated_at",
			ipAddress: "ip_address",
		},
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
	},
});
