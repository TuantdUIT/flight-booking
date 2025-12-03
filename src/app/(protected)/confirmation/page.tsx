"use client";

import { Button } from "@/core/components/ui/button";
import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import { SuccessBanner } from "@/core/components/ui/success-banner";
import { useBookingStore } from "@/core/lib/store";

import {
	Calendar,
	CheckCircle2,
	Clock,
	Download,
	Home,
	MapPin,
	Plane,
	User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ConfirmationPage() {
	const router = useRouter();

	const { currentBooking, resetBooking } = useBookingStore();

	useEffect(() => {
		if (!currentBooking) {
			router.push("/");
			return;
		}
	}, [currentBooking, router]);

	const handleNewBooking = () => {
		resetBooking();
		router.push("/");
	};

	const handleDownload = () => {
		// Placeholder for e-ticket download
		alert("E-ticket download feature - This is a placeholder");
	};

	if (!currentBooking) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner text="Loading..." />
			</div>
		);
	}

	return (
		<div className="bg-background">
			<div className="py-8 lg:py-12">
				<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
					{/* Success Message */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-4">
							<CheckCircle2 className="h-8 w-8 text-success" />
						</div>
						<h1 className="text-3xl font-bold text-foreground">
							Booking Confirmed!
						</h1>
						<p className="mt-2 text-muted-foreground">
							Your flight has been successfully booked
						</p>
					</div>

					<SuccessBanner
						message="A confirmation email has been sent to your registered email address."
						className="mb-8"
					/>

					{/* Booking Reference */}
					<div className="rounded-xl border bg-card p-6 mb-6">
						<div className="text-center">
							<p className="text-sm text-muted-foreground mb-1">
								Booking Reference (PNR)
							</p>
							<p className="text-3xl font-bold text-primary tracking-wider">
								{currentBooking.pnr}
							</p>
						</div>
					</div>

					{/* Flight Details */}
					<div className="rounded-xl border bg-card p-6 mb-6">
						<h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
							<Plane className="h-5 w-5 text-primary" />
							Flight Details
						</h2>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
										<Plane className="h-5 w-5 text-primary" />
									</div>
									<div>
										<p className="font-medium text-foreground">
											{currentBooking.flight.airline}
										</p>
										<p className="text-sm text-muted-foreground">
											{currentBooking.flight.flightNumber}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
									<CheckCircle2 className="h-4 w-4" />
									{currentBooking.status}
								</div>
							</div>

							<div className="border-t pt-4">
								<div className="flex items-center justify-between">
									<div>
										<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
											<MapPin className="h-4 w-4" />
											Departure
										</div>
										<p className="text-xl font-bold text-foreground">
											{currentBooking.flight.departureTime}
										</p>
										<p className="text-sm text-muted-foreground">
											{currentBooking.flight.origin}
										</p>
									</div>

									<div className="flex flex-col items-center px-6">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm text-muted-foreground">
											{currentBooking.flight.duration}
										</span>
										<div className="w-16 border-t border-dashed border-muted-foreground/40 mt-1" />
									</div>

									<div className="text-right">
										<div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-1">
											<MapPin className="h-4 w-4" />
											Arrival
										</div>
										<p className="text-xl font-bold text-foreground">
											{currentBooking.flight.arrivalTime}
										</p>
										<p className="text-sm text-muted-foreground">
											{currentBooking.flight.destination}
										</p>
									</div>
								</div>
							</div>

							<div className="border-t pt-4 flex items-center gap-2 text-sm text-muted-foreground">
								<Calendar className="h-4 w-4" />
								{currentBooking.createdAt}
							</div>
						</div>
					</div>

					{/* Passengers */}
					<div className="rounded-xl border bg-card p-6 mb-6">
						<h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
							<User className="h-5 w-5 text-primary" />
							Passengers ({currentBooking.passengers.length})
						</h2>
						<div className="space-y-3">
							{currentBooking.passengers.map((passenger, index) => (
								<div
									key={passenger.id}
									className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
								>
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
										{index + 1}
									</div>
									<div>
										<p className="font-medium text-foreground">
											{passenger.fullName}
										</p>
										<p className="text-sm text-muted-foreground">
											{passenger.passportNumber}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Total */}
					<div className="rounded-xl border bg-card p-6 mb-8">
						<div className="flex items-center justify-between">
							<span className="text-lg font-semibold text-foreground">
								Total Paid
							</span>
							<span className="text-2xl font-bold text-primary">
								${currentBooking.totalPrice}
							</span>
						</div>
					</div>

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							variant="outline"
							onClick={handleDownload}
							className="gap-2 bg-transparent"
						>
							<Download className="h-4 w-4" />
							Download E-Ticket
						</Button>
						<Button onClick={handleNewBooking} className="gap-2">
							<Home className="h-4 w-4" />
							Book Another Flight
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
