"use client";

import { PassengerForm } from "@/core/components/passenger-form";
import { Button } from "@/core/components/ui/button";
import { ErrorBanner } from "@/core/components/ui/error-banner";
import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import { PriceBreakdownCard } from "@/core/components/ui/price-breakdown-card";
import { useBookingStore } from "@/core/lib/store";
import type { Passenger } from "@/core/types";
import { ArrowLeft, ArrowRight, Clock, Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PassengerErrors = Partial<Record<keyof Passenger, string>>;

export default function PassengersPage() {
	const router = useRouter();
	const { selectedFlight, searchParams, setPassengers } = useBookingStore();
	const [passengerList, setPassengerList] = useState<Passenger[]>([]);
	const [errors, setErrors] = useState<PassengerErrors[]>([]);
	const [formError, setFormError] = useState("");

	useEffect(() => {
		if (!selectedFlight || !searchParams) {
			router.push("/");
			return;
		}

		// Initialize passenger forms
		const initialPassengers: Passenger[] = Array.from(
			{ length: searchParams.passengers },
			(_, i) => ({
				id: String(i + 1),
				fullName: "",
				dateOfBirth: "",
				nationality: "",
				passportNumber: "",
				email: "",
				phoneNumber: "",
			}),
		);
		setPassengerList(initialPassengers);
		setErrors(Array(searchParams.passengers).fill({}));
	}, [selectedFlight, searchParams, router]);

	const validatePassenger = (passenger: Passenger): PassengerErrors => {
		const errs: PassengerErrors = {};

		if (!passenger.fullName.trim()) {
			errs.fullName = "Full name is required";
		} else if (!/^[a-zA-Z\s]+$/.test(passenger.fullName)) {
			errs.fullName = "Name must contain only letters and spaces";
		}

		if (!passenger.dateOfBirth) {
			errs.dateOfBirth = "Date of birth is required";
		} else {
			const dob = new Date(passenger.dateOfBirth);
			const today = new Date();
			if (dob > today) {
				errs.dateOfBirth = "Date of birth cannot be in the future";
			}
		}

		if (!passenger.nationality) {
			errs.nationality = "Nationality is required";
		}

		if (!passenger.passportNumber.trim()) {
			errs.passportNumber = "Passport number is required";
		}

		if (!passenger.email.trim()) {
			errs.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)) {
			errs.email = "Please enter a valid email address";
		}

		if (!passenger.phoneNumber.trim()) {
			errs.phoneNumber = "Phone number is required";
		} else if (!/^[\d\s+()-]+$/.test(passenger.phoneNumber)) {
			errs.phoneNumber = "Please enter a valid phone number";
		}

		return errs;
	};

	const handlePassengerChange = (index: number, passenger: Passenger) => {
		const newList = [...passengerList];
		newList[index] = passenger;
		setPassengerList(newList);

		// Clear errors for this passenger when they make changes
		const newErrors = [...errors];
		newErrors[index] = {};
		setErrors(newErrors);
	};

	const handleSubmit = () => {
		setFormError("");

		const newErrors = passengerList.map(validatePassenger);
		setErrors(newErrors);

		const hasErrors = newErrors.some((err) => Object.keys(err).length > 0);
		if (hasErrors) {
			setFormError("Please fix the errors in the passenger information");
			return;
		}

		setPassengers(passengerList);
		router.push("/summary");
	};

	if (!selectedFlight || !searchParams) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner text="Loading..." />
			</div>
		);
	}

	return (
		<div className="bg-background">
			<div className="py-8 lg:py-12">
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
					{/* Header */}
					<div className="mb-8">
						<button
							onClick={() => router.back()}
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to flights
						</button>
						<h1 className="text-3xl font-bold text-foreground">
							Passenger Information
						</h1>
						<p className="mt-2 text-muted-foreground">
							Enter details for all {searchParams.passengers} passenger
							{searchParams.passengers > 1 ? "s" : ""}
						</p>
					</div>

					{formError && (
						<ErrorBanner
							message={formError}
							onDismiss={() => setFormError("")}
							className="mb-6"
						/>
					)}

					<div className="grid gap-8 lg:grid-cols-3">
						{/* Passenger Forms */}
						<div className="lg:col-span-2 space-y-6">
							{passengerList.map((passenger, index) => (
								<PassengerForm
									key={passenger.id}
									index={index}
									passenger={passenger}
									onChange={(p) => handlePassengerChange(index, p)}
									errors={errors[index] || {}}
								/>
							))}
						</div>

						{/* Sidebar */}
						<div className="lg:col-span-1 space-y-6">
							{/* Flight Summary */}
							<div className="rounded-xl border bg-card p-6 sticky top-24">
								<h3 className="text-lg font-semibold text-foreground mb-4">
									Flight Summary
								</h3>
								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
											<Plane className="h-5 w-5 text-primary" />
										</div>
										<div>
											<p className="font-medium text-foreground">
												{selectedFlight.flightNumber}
											</p>
											<p className="text-sm text-muted-foreground">
												{selectedFlight.airline}
											</p>
										</div>
									</div>

									<div className="border-t pt-4 space-y-4">
										{/* Time centered at top */}
										<div className="text-center">
											<p className="text-3xl font-bold text-foreground">
												{selectedFlight.departureTime}
											</p>
										</div>

										{/* Origin, Flight Path, Destination */}
										<div className="flex justify-between items-center">
											<div className="text-left">
												<p className="text-sm text-muted-foreground">
													{selectedFlight.origin}
												</p>
											</div>
											<div className="flex flex-col items-center px-4">
												<div className="w-32 border-t-2 border-dashed border-muted-foreground/40 relative mb-1">
													<Plane className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-primary rotate-90" />
												</div>
												<span className="text-xs text-muted-foreground">
													Direct
												</span>
											</div>
											<div className="text-right">
												<p className="text-sm text-muted-foreground">
													{selectedFlight.destination}
												</p>
											</div>
										</div>

										{/* Date centered below flight path */}
										<div className="text-center">
											<p className="text-sm text-muted-foreground">
												{(() => {
													const date = new Date(searchParams.departureDate);
													const day = String(date.getDate()).padStart(2, '0');
													const month = String(date.getMonth() + 1).padStart(2, '0');
													const year = date.getFullYear();
													return `${day}/${month}/${year}`;
												})()}
											</p>
										</div>
									</div>
								</div>

								<PriceBreakdownCard
									flight={selectedFlight}
									passengerCount={searchParams.passengers}
									className="mt-6 border-0 p-0"
								/>

								<Button
									onClick={handleSubmit}
									className="w-full mt-6"
									size="lg"
								>
									Continue to Summary
									<ArrowRight className="h-4 w-4 ml-2" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
