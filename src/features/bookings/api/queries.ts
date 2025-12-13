import { httpClient } from "@/core/lib/http";
import { useQuery } from "@tanstack/react-query";
import type { BookingSummary } from "../types";

/**
 * Query Keys for Bookings
 */
export const bookingKeys = {
	all: ["bookings"] as const,
	lists: () => [...bookingKeys.all, "list"] as const,
	list: (filters?: Record<string, unknown>) =>
		[...bookingKeys.lists(), filters] as const,
	details: () => [...bookingKeys.all, "detail"] as const,
	detail: (id: number) => [...bookingKeys.details(), id] as const,
	byPnr: (pnr: string) => [...bookingKeys.all, "pnr", pnr] as const,
};

/**
 * Fetch all bookings for the authenticated user
 */
export function useBookingsQuery() {
	return useQuery({
		queryKey: bookingKeys.lists(),
		queryFn: async (): Promise<BookingSummary[]> => {
			const bookings = await httpClient.get<BookingSummary[]>("/bookings");
			return bookings as unknown as BookingSummary[];
		},
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

/**
 * Fetch a single booking by ID
 */
export function useBookingQuery(bookingId: number, enabled = true) {
	return useQuery({
		queryKey: bookingKeys.detail(bookingId),
		queryFn: async (): Promise<BookingSummary> => {
			const booking = await httpClient.get<BookingSummary>(
				`/bookings/${bookingId}`,
			);
			return booking as unknown as BookingSummary;
		},
		enabled: enabled && !!bookingId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Fetch a booking by PNR (Passenger Name Record)
 */
export function useBookingByPnrQuery(pnr: string, enabled = true) {
	return useQuery({
		queryKey: bookingKeys.byPnr(pnr),
		queryFn: async (): Promise<BookingSummary> => {
			const booking = await httpClient.get<BookingSummary>(`/bookings/${pnr}`);
			return booking as unknown as BookingSummary;
		},
		enabled: enabled && !!pnr,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
