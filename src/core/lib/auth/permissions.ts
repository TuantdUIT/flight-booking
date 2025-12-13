import { createAccessControl } from "better-auth/plugins/access";

// Define the permissions structure for the flight booking system
const statement = {
	user: ["create", "list", "set-role", "ban", "unban", "impersonate", "delete", "set-password", "update"],
	session: ["list", "revoke", "delete"],
	booking: ["create", "read", "update", "delete", "list"],
	flight: ["create", "read", "update", "delete", "list"],
	passenger: ["create", "read", "update", "delete", "list"],
	audit: ["read", "list"],
	report: ["read", "revenue"],
} as const;

// Create the access control instance
export const ac = createAccessControl(statement);

// Define roles with their permissions
export const user = ac.newRole({
	user: [],
	session: [],
	booking: ["create", "read", "update", "list"],
	flight: ["read", "list"],
	passenger: ["create", "read", "update"],
	audit: [],
	report: [],
});

export const admin = ac.newRole({
	user: ["create", "list", "set-role", "ban", "unban", "impersonate", "delete", "set-password", "update"],
	session: ["list", "revoke", "delete"],
	booking: ["create", "read", "update", "delete", "list"],
	flight: ["create", "read", "update", "delete", "list"],
	passenger: ["create", "read", "update", "delete", "list"],
	audit: ["read", "list"],
	report: ["read", "revenue"],
});

export const moderator = ac.newRole({
	user: ["list", "ban", "unban", "update"],
	session: ["list", "revoke"],
	booking: ["read", "update", "list"],
	flight: ["read", "list"],
	passenger: ["read", "update", "list"],
	audit: ["read", "list"],
	report: ["read"],
});
