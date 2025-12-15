"use client";

import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import { useUserBookingsQuery } from "@/features/bookings/api/queries";
import { BookingCard, EmptyBookings } from "@/features/bookings/components";
import { AlertCircle } from "lucide-react";

export default function MyBookingsPage() {
	const { data: bookings, isLoading, isError, error } = useUserBookingsQuery();

	return (
		<div className="bg-background min-h-screen">
			<div className="py-8 lg:py-12">
				<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
						<p className="mt-2 text-muted-foreground">
							View and manage your flight bookings
						</p>
					</div>

					{/* Loading State */}
					{isLoading && (
						<div className="flex flex-col items-center justify-center py-16">
							<LoadingSpinner size="lg" />
							<p className="mt-4 text-muted-foreground">
								Loading your bookings...
							</p>
						</div>
					)}

					{/* Error State */}
					{isError && (
						<div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
							<div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-destructive/20 mb-4">
								<AlertCircle className="h-6 w-6 text-destructive" />
							</div>
							<h2 className="text-lg font-semibold text-foreground mb-2">
								Failed to load bookings
							</h2>
							<p className="text-sm text-muted-foreground">
								{error instanceof Error
									? error.message
									: "An error occurred while fetching your bookings"}
							</p>
						</div>
					)}

					{/* Empty State */}
					{!isLoading && !isError && bookings && bookings.length === 0 && (
						<EmptyBookings />
					)}

					{/* Bookings List */}
					{!isLoading && !isError && bookings && bookings.length > 0 && (
						<div className="space-y-4">
							{bookings.map((booking) => (
								<BookingCard key={booking.id} booking={booking} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
