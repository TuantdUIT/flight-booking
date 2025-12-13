import { db } from "@/infrastructure/db/client";
import * as schema from "@/infrastructure/db/schema";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { admin, username } from "better-auth/plugins";
import { ac, admin as adminRole, moderator, user as userRole } from "./permissions";

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
			banned: {
				type: "boolean",
				required: false,
				defaultValue: false,
			},
			banReason: {
				type: "string",
				required: false,
			},
			banExpires: {
				type: "date",
				required: false,
			},
		},
		fieldMap: {
			role: "role",
			banned: "banned",
			banReason: "ban_reason",
			banExpires: "ban_expires",
		},
		changeEmail: {
			enabled: false,
		},
		deleteUser: {
			enabled: false,
		},
	},
	session: {
		additionalFields: {
			impersonatedBy: {
				type: "string",
				required: false,
			},
		},
		fieldMap: {
			impersonatedBy: "impersonated_by",
		},
		cookieCache: {
			enabled: true,
			maxAge: 7 * 24 * 60 * 60, // 7 days cache duration
			strategy: "jwe", // can be "jwt" or "compact"
			refreshCache: true, // Enable stateless refresh
		},
	},
	pages: {
		signIn: "/auth/signin",
	},
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		username(),
		admin({
			ac,
			roles: {
				admin: adminRole,
				user: userRole,
				moderator,
			},
			defaultRole: "user",
			adminRoles: ["admin"],
			impersonationSessionDuration: 60 * 60, // 1 hour
			defaultBanReason: "No reason provided",
			bannedUserMessage: "You have been banned from this application. Please contact support if you believe this is an error.",
		}),
	],
	advanced: {
		database: {
			generateId: false,
		},
	},
});
