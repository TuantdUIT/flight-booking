import { httpClient } from "@/core/lib/http";
import type { Flight, SearchParams } from "@/core/types";
import { useQuery } from "@tanstack/react-query";

export function useAirportsQuery() {
	return useQuery({
		queryKey: ["airports"],
		queryFn: async (): Promise<string[]> => {
			// The httpClient interceptor unwraps { success, data } and returns just the data
			// So the response IS the airports array directly
			const airports = await httpClient.get<string[]>("/airports");
			return airports as unknown as string[];
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useFlightsQuery() {
	return useQuery({
		queryKey: ["flights"],
		queryFn: async (): Promise<Flight[]> => {
			// The httpClient interceptor unwraps { success, data } and returns just the data
			const flights = await httpClient.get<Flight[]>("/flights");
			return flights as unknown as Flight[];
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useSearchFlightsQuery(searchParams: SearchParams, enabled = false) {
	return useQuery({
		queryKey: ["flights", "search", searchParams],
		queryFn: async (): Promise<Flight[]> => {
			const params = new URLSearchParams({
				origin: searchParams.origin,
				destination: searchParams.destination,
				departureDate: searchParams.departureDate,
				passengers: String(searchParams.passengers),
			});
			
			const flights = await httpClient.get<Flight[]>(`/flights/search?${params.toString()}`);
			return flights as unknown as Flight[];
		},
		enabled, // Only run when explicitly enabled
		staleTime: 2 * 60 * 1000, // 2 minutes (shorter for search results)
	});
}

