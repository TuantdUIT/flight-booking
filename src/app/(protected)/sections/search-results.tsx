"use client";

import type { Flight } from "@/core/types";
import { FlightCard } from "@/features/flights/components/flight-card";
import { Plane } from "lucide-react";

interface SearchResultsProps {
	searchResults: Flight[];
	hasSearched: boolean;
	handleSelectFlight: (flight: Flight) => void;
}

export function SearchResults({
	searchResults,
	hasSearched,
	handleSelectFlight,
}: SearchResultsProps) {
	if (!hasSearched) return null;

	return (
		<div className="py-12">
			<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-foreground">
						Available Flights
					</h2>
					<p className="text-muted-foreground">
						{searchResults.length} flights found
					</p>
				</div>

				{searchResults.length === 0 ? (
					<div className="text-center py-12">
						<Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold text-foreground">
							No flights found
						</h3>
						<p className="text-muted-foreground mt-2">
							Try adjusting your search criteria
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{searchResults.map((flight) => (
							<FlightCard
								key={flight.id}
								flight={flight}
								onSelect={handleSelectFlight}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
