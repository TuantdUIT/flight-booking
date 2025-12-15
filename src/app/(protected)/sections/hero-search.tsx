"use client";

import { Button } from "@/core/components/ui/button";
import { DateInput } from "@/core/components/ui/date-input";
import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import { SelectField } from "@/core/components/ui/select-field";

import type { SearchParams } from "@/core/types";
import { useSearchFlightsQuery } from "@/features/flights/api/queries";
import { flightSearchSchema } from "@/features/flights/validations/flight-search";
import { MapPin, Search, Users } from "lucide-react";
import type * as React from "react";
import { useState } from "react";

interface SearchErrors {
	origin?: string;
	destination?: string;
	departureDate?: string;
	passengers?: string;
}

interface HeroSearchProps {
	airportOptions: Array<{ value: string; label: string }>;
	passengerOptions: Array<{ value: string; label: string }>;
	setSearchParams: (params: SearchParams) => void;
	setSearchResults: (results: any[]) => void;
	setHasSearched: (searched: boolean) => void;
	setIsSearching: (searching: boolean) => void;
}

export function HeroSearch({
	airportOptions,
	passengerOptions,
	setSearchParams,
	setSearchResults,
	setHasSearched,
	setIsSearching: propSetIsSearching,
}: HeroSearchProps) {
	const [searchForm, setSearchForm] = useState<SearchParams>({
		origin: "",
		destination: "",
		departureDate: "",
		passengers: 1,
	});
	const [errors, setErrors] = useState<SearchErrors>({});

	// Use the search flights query hook
	const { refetch, isFetching } = useSearchFlightsQuery(searchForm, false);

	const validateSearch = (): boolean => {
		const result = flightSearchSchema.safeParse(searchForm);

		if (!result.success) {
			const newErrors: SearchErrors = {};
			result.error.errors.forEach((error) => {
				const path = error.path[0] as keyof SearchErrors;
				newErrors[path] = error.message;
			});
			setErrors(newErrors);
			return false;
		}

		setErrors({});
		return true;
	};

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateSearch()) return;

		propSetIsSearching(true);
		setHasSearched(false);

		try {
			const { data } = await refetch();
			setSearchParams(searchForm);
			setSearchResults(data || []);
			setHasSearched(true);
		} catch (error) {
			console.error("Search failed:", error);
			setSearchResults([]);
			setHasSearched(true);
		} finally {
			propSetIsSearching(false);
		}
	};

	return (
		<div className="relative bg-primary/5 py-16 lg:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-10">
					<h1 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
						Book Your Next Adventure
					</h1>
					<p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
						Search and compare flights to find the best deals for your travels
						around the world
					</p>
				</div>

				{/* Search Form */}
				<div className="rounded-2xl border bg-card p-6 lg:p-8 shadow-lg max-w-5xl mx-auto">
					<form onSubmit={handleSearch} className="space-y-6">
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<SelectField
								label="From"
								options={airportOptions}
								value={searchForm.origin}
								onChange={(e) =>
									setSearchForm((prev) => ({
										...prev,
										origin: e.target.value,
									}))
								}
								error={errors.origin}
								icon={<MapPin className="h-4 w-4" />}
							/>

							<SelectField
								label="To"
								options={airportOptions}
								value={searchForm.destination}
								onChange={(e) =>
									setSearchForm((prev) => ({
										...prev,
										destination: e.target.value,
									}))
								}
								error={errors.destination}
								icon={<MapPin className="h-4 w-4" />}
							/>

							<DateInput
								label="Departure Date"
								value={searchForm.departureDate}
								onChange={(e) =>
									setSearchForm((prev) => ({
										...prev,
										departureDate: e.target.value,
									}))
								}
								error={errors.departureDate}
								min={new Date().toISOString().split("T")[0]}
							/>

							<SelectField
								label="Passengers"
								options={passengerOptions}
								value={String(searchForm.passengers)}
								onChange={(e) =>
									setSearchForm((prev) => ({
										...prev,
										passengers: Number.parseInt(e.target.value),
									}))
								}
								error={errors.passengers}
								icon={<Users className="h-4 w-4" />}
							/>
						</div>

						<Button
							type="submit"
							size="lg"
							className="w-full md:w-auto md:px-12"
							disabled={isFetching}
						>
							{isFetching ? (
								<LoadingSpinner size="sm" />
							) : (
								<>
									<Search className="h-5 w-5 mr-2" />
									Search Flights
								</>
							)}
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
