import { httpClient } from "@/core/lib/http";
import { Seat } from "@/core/types/seat";
import { useQuery } from "@tanstack/react-query";

export function useSeats(flightId: number | null) {
	return useQuery({
		queryKey: ["seats", flightId],
		queryFn: async (): Promise<Seat[]> => {
			if (!flightId) return [];
			const seats = await httpClient.get<Seat[]>(`/seats?flightId=${flightId}`);
			return seats as unknown as Seat[];
		},
		enabled: !!flightId,
		staleTime: 30 * 1000,
	});
}
