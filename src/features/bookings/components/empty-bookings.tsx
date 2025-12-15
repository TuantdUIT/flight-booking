"use client";

import { Button } from "@/core/components/ui/button";
import { Search, TicketCheck } from "lucide-react";
import Link from "next/link";

export function EmptyBookings() {
	return (
		<div className="text-center py-16">
			<div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-muted mb-6">
				<TicketCheck className="h-10 w-10 text-muted-foreground" />
			</div>
			<h2 className="text-2xl font-semibold text-foreground mb-2">
				No bookings yet
			</h2>
			<p className="text-muted-foreground mb-8 max-w-md mx-auto">
				You haven't made any flight bookings yet. Start exploring destinations
				and book your next adventure!
			</p>
			<Link href="/">
				<Button size="lg" className="gap-2">
					<Search className="h-5 w-5" />
					Search Flights
				</Button>
			</Link>
		</div>
	);
}
