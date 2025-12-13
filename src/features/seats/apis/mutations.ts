import { httpClient } from "@/core/lib/http";
import type { Seat, SeatCreateInput, SeatUpdateInput } from "@/core/types/seat";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export function useCreateSeat() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: SeatCreateInput): Promise<Seat> => {
			const seat = await httpClient.post<Seat>("/seats", input);
			return seat as unknown as Seat;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["seats", variables.flight_id],
			});
		},
	});
}

export function useUpdateSeat() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			flightId,
			...input
		}: SeatUpdateInput & { id: number; flightId: number }): Promise<Seat> => {
			const seat = await httpClient.patch<Seat>(`/seats/${id}`, input);
			return seat as unknown as Seat;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["seats", variables.flightId],
			});
		},
	});
}

export function useDeleteSeat() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			flightId,
		}: {
			id: number;
			flightId: number;
		}): Promise<boolean> => {
			const result = await httpClient.delete<boolean>(`/seats/${id}`);
			return result as unknown as boolean;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["seats", variables.flightId],
			});
		},
	});
}
