import { httpClient } from "@/core/lib/http";
import { useQuery } from "@tanstack/react-query";

export const bookingKeys = {
	all: ["bookings"] as const,
	lists: () => [...bookingKeys.all, "list"] as const,
	list: (filters: string) => [...bookingKeys.lists(), { filters }] as const,
	details: () => [...bookingKeys.all, "detail"] as const,
	detail: (id: number) => [...bookingKeys.details(), id] as const,
};

export interface BookingWithDetails {
	id: number;
	pnr: string;
	bookingStatus: "pending" | "confirmed" | "failed";
	paymentStatus: "pending" | "paid" | "failed";
	amountPaid: string;
	createdAt: Date;
	flight: {
		id: number;
		flightNumber: string;
		airline: string;
		origin: string;
		destination: string;
		date: string;
		time: string;
	};
	passengers: Array<{
		id: number;
		name: string;
		email: string | null;
		phoneNumber: string | null;
		seatNumber: string;
		eTicketNumber: string | null;
	}>;
}

export function useUserBookingsQuery() {
	return useQuery({
		queryKey: bookingKeys.lists(),
		queryFn: async (): Promise<BookingWithDetails[]> => {
			const bookings = await httpClient.get<BookingWithDetails[]>("/bookings");
			return bookings as unknown as BookingWithDetails[];
		},
		staleTime: 1 * 60 * 1000, // 1 minute
	});
}

export function useBookingDetailQuery(bookingId: number, enabled = true) {
	return useQuery({
		queryKey: bookingKeys.detail(bookingId),
		queryFn: async (): Promise<BookingWithDetails> => {
			const booking = await httpClient.get<BookingWithDetails>(
				`/bookings/${bookingId}`,
			);
			return booking as unknown as BookingWithDetails;
		},
		enabled,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}
