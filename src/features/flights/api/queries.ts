import httpClient from "@/core/lib/http";
import type { Flight } from "@/core/types";
import { useQuery } from "@tanstack/react-query";

interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

interface AirportsResponse extends ApiResponse<string[]> {}
interface FlightsResponse extends ApiResponse<Flight[]> {}

export function useAirportsQuery() {
	return useQuery({
		queryKey: ["airports"],
		queryFn: async (): Promise<string[]> => {
			const response = await httpClient.get<AirportsResponse>("/airports");
			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to fetch airports");
			}
			return response.data.data || [];
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useFlightsQuery() {
	return useQuery({
		queryKey: ["flights"],
		queryFn: async (): Promise<Flight[]> => {
			const response = await httpClient.get<FlightsResponse>("/flights");
			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to fetch flights");
			}
			return response.data.data || [];
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
