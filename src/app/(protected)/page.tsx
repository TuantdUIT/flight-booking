"use client";

import { useBookingStore } from "@/core/lib/store";
import type { Flight } from "@/core/types";
import {
	useAirportsQuery,
	useFlightsQuery,
} from "@/features/flights/api/queries";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { HeroSearch } from "./sections/hero-search";
import { Landing } from "./sections/landing";
import { SearchResults } from "./sections/search-results";

export default function HomePage() {
	const router = useRouter();

	const { setSearchParams, setSelectedFlight } = useBookingStore();

	const [searchResults, setSearchResults] = useState<Flight[]>([]);
	const [hasSearched, setHasSearched] = useState(false);
	const { data: airportsData = [] } = useAirportsQuery();
	const { data: flightsData = [] } = useFlightsQuery();

	const airportOptions = [
		{ value: "", label: "Select airport" },
		...(airportsData || []).map((airport: string) => ({
			value: airport,
			label: airport,
		})),
	];

	const passengerOptions = Array.from({ length: 9 }, (_, i) => ({
		value: String(i + 1),
		label: `${i + 1} ${i === 0 ? "Passenger" : "Passengers"}`,
	}));

	const handleSelectFlight = (flight: Flight) => {
		setSelectedFlight(flight);
		router.push("/passengers");
	};

	return (
		<div className="bg-background">
			<HeroSearch
				airportOptions={airportOptions}
				passengerOptions={passengerOptions}
				flightsData={flightsData}
				setSearchParams={setSearchParams}
				setSearchResults={setSearchResults}
				setHasSearched={setHasSearched}
				setIsSearching={() => {}} // not needed
			/>
			<SearchResults
				searchResults={searchResults}
				hasSearched={hasSearched}
				handleSelectFlight={handleSelectFlight}
			/>
			<Landing hasSearched={hasSearched} />
		</div>
	);
}
