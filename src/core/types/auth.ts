export type SessionUser = {
	id: string;
	role: "admin" | "user";
	email: string;
	name?: string;
};
