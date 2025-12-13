"use client";

import { Button } from "@/core/components/ui/button";
import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import { SuccessBanner } from "@/core/components/ui/success-banner";
import { useBookingStore } from "@/core/lib/store";
import { formatETicket } from "@/core/utils/ticket";

import {
	Calendar,
	CheckCircle2,
	Clock,
	Download,
	FileText,
	Globe,
	Home,
	Mail,
	Phone,
	Plane,
	User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ConfirmationPage() {
	const router = useRouter();

	const { currentBooking, resetBooking, searchParams } = useBookingStore();

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

							<div className="border-t pt-4 space-y-4">
								{/* Route Information */}
								<div className="flex justify-center items-center gap-12">
									{/* Origin */}
									<div className="text-center">
										<p className="text-xs text-muted-foreground mb-2">From</p>
										<p className="text-sm font-medium text-foreground">
											{currentBooking.flight.origin}
										</p>
									</div>

									{/* Flight Path - Centered */}
									<div className="flex flex-col items-center">
										{/* Departure Time - Centered above plane */}
										<div className="text-center mb-3">
											<span className="text-2xl font-bold text-foreground">
												{currentBooking.flight.departureTime}
											</span>
										</div>

										{/* Plane Icon and Path */}
										<div className="relative flex items-center">
											<div className="w-32 border-t-2 border-dashed border-muted-foreground/40"></div>
											<div className="absolute left-1/2 -translate-x-1/2">
												<Plane className="w-6 h-6 text-primary rotate-90" />
											</div>
										</div>

										{/* Direct Label */}
										<div className="flex items-center gap-1 mt-3">
											<Clock className="w-3 h-3 text-muted-foreground" />
											<span className="text-xs text-muted-foreground">
												Direct
											</span>
										</div>
									</div>

									{/* Destination */}
									<div className="text-center">
										<p className="text-xs text-muted-foreground mb-2">To</p>
										<p className="text-sm font-medium text-foreground">
											{currentBooking.flight.destination}
										</p>
									</div>
								</div>

								{/* Date centered below */}
								<div className="text-center border-t pt-3">
									<div className="flex items-center justify-center gap-2">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<p className="text-sm font-medium text-foreground">
											{(() => {
												// Use flight departure date from searchParams if available, otherwise use createdAt
												const dateString =
													searchParams?.departureDate ||
													currentBooking.createdAt;
												const date = new Date(dateString);
												if (isNaN(date.getTime())) return "N/A";
												const day = String(date.getDate()).padStart(2, "0");
												const month = String(date.getMonth() + 1).padStart(
													2,
													"0",
												);
												const year = date.getFullYear();
												return `${day}/${month}/${year}`;
											})()}
										</p>
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										Departure Date
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Passengers */}
					<div className="rounded-xl border bg-card p-6 mb-6">
						<h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
							<User className="h-5 w-5 text-primary" />
							Passengers ({currentBooking.passengers.length})
						</h2>
						<div className="space-y-4">
							{currentBooking.passengers.map((passenger, index) => (
								<div
									key={passenger.id}
									className="rounded-lg bg-muted/50 p-4"
								>
									<div className="flex items-center justify-between mb-3">
										<div className="flex items-center gap-3">
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
										<div className="text-right">
											<p className="text-xs text-muted-foreground mb-1">E-Ticket</p>
											<p className="font-mono text-sm font-bold text-primary">
												{passenger.eTicketNumber ? formatETicket(passenger.eTicketNumber) : 'Pending'}
											</p>
										</div>
									</div>
									<div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm">
										<div className="flex items-center gap-2 text-muted-foreground">
											<Calendar className="h-4 w-4" />
											{passenger.dateOfBirth}
										</div>
										<div className="flex items-center gap-2 text-muted-foreground">
											<Globe className="h-4 w-4" />
											{passenger.nationality}
										</div>
										<div className="flex items-center gap-2 text-muted-foreground">
											<FileText className="h-4 w-4" />
											{passenger.passportNumber}
										</div>
										<div className="flex items-center gap-2 text-muted-foreground">
											<Mail className="h-4 w-4" />
											{passenger.email}
										</div>
										<div className="flex items-center gap-2 text-muted-foreground">
											<Phone className="h-4 w-4" />
											{passenger.phoneNumber}
										</div>
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
								{new Intl.NumberFormat("vi-VN").format(
									currentBooking.totalPrice,
								)}{" "}
								₫
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
