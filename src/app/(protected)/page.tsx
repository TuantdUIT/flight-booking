"use client";

import { Navbar } from "@/core/components/layouts/navbar";
import { Button } from "@/core/components/ui/button";
import { DateInput } from "@/core/components/ui/date-input";
import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import { SelectField } from "@/core/components/ui/select-field";
import { authClient } from "@/core/lib/auth/client";
import { airports, mockFlights } from "@/core/lib/mock-data";
import { useBookingStore } from "@/core/lib/store";
import type { Flight, SearchParams } from "@/core/types";
import { FlightCard } from "@/features/flights/components/flight-card";
import { MapPin, Plane, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useEffect, useState } from "react";

interface SearchErrors {
	origin?: string;
	destination?: string;
	departureDate?: string;
	passengers?: string;
}

export default function HomePage() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const isAuthenticated = !!session;
	const { setSearchParams, setSelectedFlight } = useBookingStore();

	const [searchForm, setSearchForm] = useState<SearchParams>({
		origin: "",
		destination: "",
		departureDate: "",
		passengers: 1,
	});
	const [errors, setErrors] = useState<SearchErrors>({});
	const [searchResults, setSearchResults] = useState<Flight[]>([]);
	const [hasSearched, setHasSearched] = useState(false);
	const [isSearching, setIsSearching] = useState(false);

	useEffect(() => {
		if (!isAuthenticated && !isPending) {
			router.push("/auth/signin");
		}
	}, [isAuthenticated, isPending, router]);

	const airportOptions = [
		{ value: "", label: "Select airport" },
		...airports.map((airport) => ({ value: airport, label: airport })),
	];

	const passengerOptions = Array.from({ length: 9 }, (_, i) => ({
		value: String(i + 1),
		label: `${i + 1} ${i === 0 ? "Passenger" : "Passengers"}`,
	}));

	const validateSearch = (): boolean => {
		const newErrors: SearchErrors = {};
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (!searchForm.origin) {
			newErrors.origin = "Please select an origin";
		}

		if (!searchForm.destination) {
			newErrors.destination = "Please select a destination";
		}

		if (
			searchForm.origin &&
			searchForm.destination &&
			searchForm.origin === searchForm.destination
		) {
			newErrors.destination = "Origin and destination cannot be the same";
		}

		if (!searchForm.departureDate) {
			newErrors.departureDate = "Please select a departure date";
		} else {
			const selectedDate = new Date(searchForm.departureDate);
			if (selectedDate < today) {
				newErrors.departureDate = "Departure date cannot be in the past";
			}
		}

		if (searchForm.passengers < 1 || searchForm.passengers > 9) {
			newErrors.passengers = "Please select between 1 and 9 passengers";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateSearch()) return;

		setIsSearching(true);
		setHasSearched(false);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		setSearchParams(searchForm);
		setSearchResults(mockFlights);
		setHasSearched(true);
		setIsSearching(false);
	};

	const handleSelectFlight = (flight: Flight) => {
		setSelectedFlight(flight);
		router.push("/passengers");
	};

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner text="Loading..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			{/* Hero Section */}
			<div className="relative bg-primary/5 py-16 lg:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-10">
						<h1 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
							Book Your Next Adventure
						</h1>
						<p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
							Search and compare flights to find the best deals for your
							university travels
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
								disabled={isSearching}
							>
								{isSearching ? (
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

			{/* Search Results */}
			{hasSearched && (
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
			)}

			{/* Features Section (when not searched) */}
			{!hasSearched && (
				<div className="py-16">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid gap-8 md:grid-cols-3">
							{[
								{
									title: "Best Prices",
									description:
										"Compare prices across multiple airlines to find the best deals",
									icon: "💰",
								},
								{
									title: "Easy Booking",
									description:
										"Simple and fast booking process in just a few clicks",
									icon: "⚡",
								},
								{
									title: "24/7 Support",
									description: "Our support team is always here to help you",
									icon: "🛟",
								},
							].map((feature) => (
								<div
									key={feature.title}
									className="rounded-xl border bg-card p-6 text-center"
								>
									<div className="text-4xl mb-4">{feature.icon}</div>
									<h3 className="text-lg font-semibold text-foreground">
										{feature.title}
									</h3>
									<p className="mt-2 text-muted-foreground text-sm">
										{feature.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
