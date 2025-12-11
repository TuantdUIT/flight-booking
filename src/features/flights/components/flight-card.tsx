"use client";

import type { Flight } from "@/core/types";
import { cn } from "@/core/utils";
import { Plane, Clock, Users } from "lucide-react";
import { Button } from "@/core/components/ui/button";

interface FlightCardProps {
	flight: Flight;
	onSelect: (flight: Flight) => void;
	isSelected?: boolean;
}

export function FlightCard({ flight, onSelect, isSelected }: FlightCardProps) {
	return (
		<div
			className={cn(
				"group relative rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/30",
				isSelected && "border-primary ring-2 ring-primary/20",
			)}
		>
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
						<Plane className="h-6 w-6 text-primary" />
					</div>
					<div>
						<p className="font-semibold text-foreground">{flight.airline}</p>
						<p className="text-sm text-muted-foreground">
							{flight.flightNumber}
						</p>
					</div>
				</div>

				<div className="flex flex-1 items-center justify-center">
					{/* Origin - right aligned */}
					<div className="flex-1 text-right pr-4">
						<p className="text-2xl font-bold text-foreground">
							{flight.departureTime}
						</p>
						<p className="text-sm text-muted-foreground">
							{flight.origin}
						</p>
					</div>

					{/* Center - Flight path indicator */}
					<div className="flex flex-col items-center px-6 min-w-[140px]">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Clock className="h-4 w-4" />
							<span className="text-sm">{flight.duration}</span>
						</div>
						<div className="relative w-full my-2">
							<div className="w-full border-t border-dashed border-muted-foreground/40" />
							<Plane className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-90 text-primary" />
						</div>
						<p className="text-xs text-muted-foreground">Direct</p>
					</div>

					{/* Destination - left aligned */}
					<div className="flex-1 text-left pl-4">
						<p className="text-2xl font-bold text-foreground">
							{flight.arrivalTime}
						</p>
						<p className="text-sm text-muted-foreground">
							{flight.destination}
						</p>
					</div>
				</div>

				<div className="flex flex-col items-end gap-2">
					<div className="text-right">
						<p className="text-2xl font-bold text-foreground">
							${flight.price}
						</p>
						<p className="text-sm text-muted-foreground">per person</p>
					</div>
					<div className="flex items-center gap-1 text-sm">
						<Users className="h-4 w-4" />
						<span
							className={cn(
								flight.seatsRemaining <= 5
									? "text-destructive font-medium"
									: "text-muted-foreground",
							)}
						>
							{flight.seatsRemaining} seats left
						</span>
					</div>
					<Button
						onClick={() => onSelect(flight)}
						className="mt-2"
						variant={isSelected ? "secondary" : "default"}
					>
						{isSelected ? "Selected" : "Select Flight"}
					</Button>
				</div>
			</div>
		</div>
	);
}
