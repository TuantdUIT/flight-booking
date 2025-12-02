"use client";

import type { Flight } from "@/core/types";
import { cn } from "@/core/utils";

interface PriceBreakdownCardProps {
	flight: Flight;
	passengerCount: number;
	className?: string;
}

export function PriceBreakdownCard({
	flight,
	passengerCount,
	className,
}: PriceBreakdownCardProps) {
	const baseFare = flight.price * passengerCount;
	const taxes = Math.round(baseFare * 0.12);
	const serviceFee = 15;
	const total = baseFare + taxes + serviceFee;

	return (
		<div className={cn("rounded-xl border bg-card p-6", className)}>
			<h3 className="text-lg font-semibold text-foreground mb-4">
				Price Breakdown
			</h3>

			<div className="space-y-3">
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">
						Base fare ({passengerCount} × ${flight.price})
					</span>
					<span className="font-medium text-foreground">${baseFare}</span>
				</div>

				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Taxes & fees (12%)</span>
					<span className="font-medium text-foreground">${taxes}</span>
				</div>

				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Service fee</span>
					<span className="font-medium text-foreground">${serviceFee}</span>
				</div>

				<div className="border-t pt-3 mt-3">
					<div className="flex justify-between">
						<span className="font-semibold text-foreground">Total</span>
						<span className="text-xl font-bold text-primary">${total}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
