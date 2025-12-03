import { BetterAuthSession } from "@/core/lib/auth/client";
import dayjs from "dayjs";

export function isExpired(expiresAt?: string | null): boolean {
	if (!expiresAt) return false; // treat missing expiry as non-expiring
	const expiry = dayjs(expiresAt);
	if (!expiry.isValid()) return true; // corrupt timestamps count as expired
	return expiry.isBefore(dayjs());
}

export function isSessionValid(session: BetterAuthSession | null): boolean {
	if (!session?.user || !session.session) return false;
	return !isExpired(session.session.expiresAt.toISOString());
}
