"use client";

import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/utils";
import {
	Calendar,
	ChevronDown,
	ChevronUp,
	Clock,
	MapPin,
	Plane,
	User,
} from "lucide-react";
import { useState } from "react";
import type { BookingWithDetails } from "../api/queries";

interface BookingCardProps {
	booking: BookingWithDetails;
}

export function BookingCard({ booking }: BookingCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const statusColors = {
		confirmed: "bg-green-500/10 text-green-700 dark:text-green-400",
		pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
		failed: "bg-red-500/10 text-red-700 dark:text-red-400",
	};

	const paymentColors = {
		paid: "bg-green-500/10 text-green-700 dark:text-green-400",
		pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
		failed: "bg-red-500/10 text-red-700 dark:text-red-400",
	};

	return (
		<div className="rounded-xl border bg-card hover:shadow-md transition-shadow">
			{/* Main Card Content */}
			<div className="p-6">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					{/* Left Section - Flight Info */}
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
							<Plane className="h-6 w-6 text-primary" />
						</div>
						<div className="min-w-0">
							<div className="flex items-center gap-2 mb-1 flex-wrap">
								<span className="font-semibold text-foreground">
									{booking.flight.flightNumber}
								</span>
								<Badge
									className={cn(
										"text-xs font-medium",
										statusColors[booking.bookingStatus],
									)}
								>
									{booking.bookingStatus}
								</Badge>
								<Badge
									className={cn(
										"text-xs font-medium",
										paymentColors[booking.paymentStatus],
									)}
								>
									{booking.paymentStatus}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">
								{booking.flight.airline}
							</p>
							<div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
								<Calendar className="h-4 w-4" />
								{new Date(booking.flight.date).toLocaleDateString("en-US", {
									weekday: "short",
									year: "numeric",
									month: "short",
									day: "numeric",
								})}
							</div>
						</div>
					</div>

					{/* Middle Section - Route */}
					<div className="flex items-center gap-4 lg:gap-6">
						<div className="text-center">
							<p className="text-lg font-bold text-foreground">
								{booking.flight.time}
							</p>
							<div className="flex items-center gap-1 text-sm text-muted-foreground">
								<MapPin className="h-3 w-3" />
								<span>{booking.flight.origin}</span>
							</div>
						</div>

						<div className="flex flex-col items-center">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<div className="h-px w-16 bg-border my-1" />
							<Plane className="h-4 w-4 text-muted-foreground rotate-90" />
						</div>

						<div className="text-center">
							<p className="text-lg font-bold text-foreground">—</p>
							<div className="flex items-center gap-1 text-sm text-muted-foreground">
								<MapPin className="h-3 w-3" />
								<span>{booking.flight.destination}</span>
							</div>
						</div>
					</div>

					{/* Right Section - Booking Details */}
					<div className="text-left lg:text-right">
						<p className="text-sm text-muted-foreground mb-1">
							PNR: <span className="font-mono font-semibold">{booking.pnr}</span>
						</p>
						<p className="text-2xl font-bold text-foreground">
							{Number(booking.amountPaid).toLocaleString("vi-VN")} ₫
						</p>
						<p className="text-sm text-muted-foreground flex items-center gap-1 lg:justify-end">
							<User className="h-3 w-3" />
							{booking.passengers.length} passenger
							{booking.passengers.length > 1 ? "s" : ""}
						</p>
					</div>
				</div>

				{/* Expand/Collapse Button */}
				<div className="mt-4 pt-4 border-t">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsExpanded(!isExpanded)}
						className="w-full justify-between"
					>
						<span className="text-sm font-medium">
							{isExpanded ? "Hide" : "Show"} passenger details
						</span>
						{isExpanded ? (
							<ChevronUp className="h-4 w-4" />
						) : (
							<ChevronDown className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>

			{/* Expanded Section - Passenger Details */}
			{isExpanded && (
				<div className="border-t bg-muted/30 p-6">
					<h3 className="text-sm font-semibold text-foreground mb-4">
						Passenger Information
					</h3>
					<div className="space-y-3">
						{booking.passengers.map((passenger, index) => (
							<div
								key={passenger.id}
								className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-background"
							>
								<div className="flex items-center gap-3">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
										{index + 1}
									</div>
									<div>
										<p className="font-medium text-foreground">
											{passenger.name}
										</p>
										{passenger.email && (
											<p className="text-xs text-muted-foreground">
												{passenger.email}
											</p>
										)}
									</div>
								</div>
								<div className="flex items-center gap-4 text-sm sm:ml-11">
									<div>
										<p className="text-muted-foreground">Seat</p>
										<p className="font-mono font-semibold">
											{passenger.seatNumber}
										</p>
									</div>
									{passenger.eTicketNumber && (
										<div>
											<p className="text-muted-foreground">E-Ticket</p>
											<p className="font-mono font-semibold text-xs">
												{passenger.eTicketNumber}
											</p>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
