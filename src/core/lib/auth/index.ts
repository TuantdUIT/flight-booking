import { db } from "@/infrastructure/db/client";
import * as schema from "@/infrastructure/db/schema";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { username } from "better-auth/plugins";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			...schema,
			user: schema.users,
			account: schema.accounts,
			session: schema.sessions,
			verification: schema.verification,
		},
	}),
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "user",
			},
		},
		changeEmail: {
			enabled: false,
		},
		deleteUser: {
			enabled: false,
		},
	},
	pages: {
		signIn: "/auth/signin",
	},
	emailAndPassword: {
		enabled: true,
	},
	plugins: [username()],
	advanced: {
		database: {
			generateId: false,
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 7 * 24 * 60 * 60, // 7 days cache duration
			strategy: "jwe", // can be "jwt" or "compact"
			refreshCache: true, // Enable stateless refresh
		},
	},
});
