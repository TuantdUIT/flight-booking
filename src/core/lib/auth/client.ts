import { adminClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, admin, moderator, user } from "./permissions";

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL: "http://localhost:3000",
	plugins: [
		usernameClient(),
		adminClient({
			ac,
			roles: {
				admin,
				user,
				moderator,
			},
		}),
	],
});

export type BetterAuthSession = typeof authClient.$Infer.Session;
