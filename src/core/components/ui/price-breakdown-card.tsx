"use client";

import type { Flight } from "@/core/types";
import { cn } from "@/core/utils";

interface PriceBreakdownCardProps {
	flight: Flight;
	passengerCount: number;
	className?: string;
}

// Helper function to format VND currency
const formatVND = (amount: number) => {
	return new Intl.NumberFormat("vi-VN").format(amount);
};

export function PriceBreakdownCard({
	flight,
	passengerCount,
	className,
}: PriceBreakdownCardProps) {
	const priceBase = Number.parseFloat(flight.priceBase);
	const priceTax = Number.parseFloat(flight.priceTax);
	const baseFare = priceBase * passengerCount;
	const taxes = priceTax * passengerCount;
	const total = baseFare + taxes;

	return (
		<div className={cn("rounded-xl border bg-card p-6", className)}>
			<h3 className="text-lg font-semibold text-foreground mb-4">
				Price Breakdown
			</h3>

			<div className="space-y-3">
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">
						Base fare ({passengerCount} × {formatVND(priceBase)} ₫)
					</span>
					<span className="font-medium text-foreground">
						{formatVND(baseFare)} ₫
					</span>
				</div>

				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Taxes & fees (12%)</span>
					<span className="font-medium text-foreground">
						{formatVND(taxes)} ₫
					</span>
				</div>

				<div className="border-t pt-3 mt-3">
					<div className="flex justify-between">
						<span className="font-semibold text-foreground">Total</span>
						<span className="text-xl font-bold text-primary">
							{formatVND(total)} ₫
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
