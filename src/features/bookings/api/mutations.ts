import { httpClient } from "@/core/lib/http";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateBookingResult } from "../types";
import type { CreateBookingSchema } from "../validations/create-booking";
import { bookingKeys } from "./queries";

/**
 * Create a new booking
 */
export function useCreateBookingMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (
			bookingData: CreateBookingSchema,
		): Promise<CreateBookingResult> => {
			const result = await httpClient.post<CreateBookingResult>(
				"/bookings",
				bookingData,
			);
			return result as unknown as CreateBookingResult;
		},
		onSuccess: () => {
			// Invalidate bookings list to refetch
			queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
		},
	});
}

/**
 * Cancel a booking
 */
export function useCancelBookingMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (bookingId: number): Promise<void> => {
			await httpClient.delete(`/bookings/${bookingId}`);
		},
		onSuccess: (_, bookingId) => {
			// Invalidate the specific booking and the list
			queryClient.invalidateQueries({
				queryKey: bookingKeys.detail(bookingId),
			});
			queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
		},
	});
}

/**
 * Update booking payment status
 */
export function useUpdateBookingPaymentMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			bookingId,
			pnr,
			paymentMethod,
		}: {
			bookingId: number;
			pnr: string;
			paymentMethod: string;
		}): Promise<{ success: boolean }> => {
			const result = await httpClient.post<{ success: boolean }>(
				`/bookings/${pnr}/payment`,
				{ paymentMethod },
			);
			return result as unknown as { success: boolean };
		},
		onSuccess: (_, { bookingId }) => {
			// Invalidate the specific booking and the list
			queryClient.invalidateQueries({
				queryKey: bookingKeys.detail(bookingId),
			});
			queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
		},
	});
}

/**
 * Confirm a booking
 */
export function useConfirmBookingMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (pnr: string): Promise<{ success: boolean }> => {
			const result = await httpClient.post<{ success: boolean }>(
				`/bookings/${pnr}/confirm`,
			);
			return result as unknown as { success: boolean };
		},
		onSuccess: (_, pnr) => {
			// Invalidate the booking by PNR and the list
			queryClient.invalidateQueries({ queryKey: bookingKeys.byPnr(pnr) });
			queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
		},
	});
}
