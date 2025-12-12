# Bookings API - Usage Examples

## Example 1: My Bookings Page

Replace the current mock data implementation with real API calls:

```tsx
"use client";

import { Button } from "@/core/components/ui/button";
import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import { ErrorBanner } from "@/core/components/ui/error-banner";
import { useBookingsQuery } from "@/features/bookings/api";
import {
  ArrowRight,
  Calendar,
  Clock,
  Plane,
  Search,
  TicketCheck,
} from "lucide-react";
import Link from "next/link";

export default function MyBookingsPage() {
  const { data: bookings, isLoading, error } = useBookingsQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading your bookings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background">
        <div className="py-8 lg:py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <ErrorBanner
              message={error.message || "Failed to load bookings"}
              className="mb-6"
            />
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="py-8 lg:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="mt-2 text-muted-foreground">
              View and manage your flight bookings
            </p>
          </div>

          {!bookings || bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
                <TicketCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No bookings yet
              </h2>
              <p className="text-muted-foreground mb-6">
                You haven't made any flight bookings yet
              </p>
              <Link href="/">
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Search Flights
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
                >
                  {/* Booking card content */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Plane className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">
                            {booking.pnr}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                            {booking.bookingStatus}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.passengers.length} passenger
                          {booking.passengers.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {new Intl.NumberFormat('vi-VN').format(booking.amountPaid)} ₫
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Example 2: Payment Page with Booking Creation

Update the payment page to use the mutation hook:

```tsx
"use client";

import { Button } from "@/core/components/ui/button";
import { ErrorBanner } from "@/core/components/ui/error-banner";
import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import { useBookingStore } from "@/core/lib/store";
import { useCreateBookingMutation } from "@/features/bookings/api";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function PaymentPage() {
  const router = useRouter();
  const { selectedFlight, searchParams, passengers, setCurrentBooking } =
    useBookingStore();
  
  const [form, setForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  
  const [errors, setErrors] = useState({});
  
  // Use the mutation hook
  const createBooking = useCreateBookingMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFlight || !searchParams) {
      toast.error("Missing flight or search information");
      return;
    }

    // Prepare booking data
    const bookingData = {
      flightId: selectedFlight.id,
      passengers: passengers.map((p) => ({
        firstName: p.fullName.split(" ")[0] || p.fullName,
        lastName: p.fullName.split(" ").slice(1).join(" ") || p.fullName,
        email: p.email,
        phone: p.phoneNumber,
      })),
      paymentInfo: {
        cardNumber: form.cardNumber.replace(/\s/g, ""),
        expiryDate: form.expiryDate,
        cvv: form.cvv,
      },
    };

    try {
      // Call the mutation
      const result = await createBooking.mutateAsync(bookingData);
      
      // Show success message
      toast.success(`Booking created! PNR: ${result.pnr}`);
      
      // Create booking object for confirmation page
      const booking = {
        id: result.bookingId.toString(),
        pnr: result.pnr,
        flight: selectedFlight,
        passengers: passengers,
        totalPrice: result.totalAmount,
        status: result.status,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setCurrentBooking(booking);
      router.push("/confirmation");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create booking. Please try again.",
      );
    }
  };

  return (
    <div className="bg-background">
      <div className="py-8 lg:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Payment</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment form fields */}
            
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={createBooking.isPending}
            >
              {createBooking.isPending ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Processing Payment...
                </div>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

## Example 3: Booking Details with Cancel

```tsx
"use client";

import { Button } from "@/core/components/ui/button";
import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import {
  useBookingQuery,
  useCancelBookingMutation,
} from "@/features/bookings/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function BookingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const bookingId = parseInt(params.id);
  
  const { data: booking, isLoading } = useBookingQuery(bookingId);
  const cancelBooking = useCancelBookingMutation();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success("Booking cancelled successfully");
      router.push("/my-bookings");
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading booking details..." />
      </div>
    );
  }

  if (!booking) {
    return <div>Booking not found</div>;
  }

  return (
    <div className="bg-background">
      <div className="py-8 lg:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Booking Details
          </h1>

          <div className="rounded-xl border bg-card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">PNR: {booking.pnr}</h2>
            <p>Status: {booking.bookingStatus}</p>
            <p>Payment: {booking.paymentStatus}</p>
            <p>Amount: {booking.amountPaid} ₫</p>
          </div>

          {booking.bookingStatus === "confirmed" && (
            <Button
              onClick={handleCancel}
              disabled={cancelBooking.isPending}
              variant="destructive"
            >
              {cancelBooking.isPending ? "Cancelling..." : "Cancel Booking"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Example 4: Booking Lookup by PNR

```tsx
"use client";

import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { useBookingByPnrQuery } from "@/features/bookings/api";
import { useState } from "react";

export default function BookingLookupPage() {
  const [pnr, setPnr] = useState("");
  const [searchPnr, setSearchPnr] = useState("");

  const { data: booking, isLoading, error } = useBookingByPnrQuery(
    searchPnr,
    !!searchPnr
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchPnr(pnr.toUpperCase());
  };

  return (
    <div className="bg-background">
      <div className="py-8 lg:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Find Your Booking
          </h1>

          <form onSubmit={handleSearch} className="flex gap-4 mb-8">
            <Input
              placeholder="Enter PNR (e.g., PNR000123)"
              value={pnr}
              onChange={(e) => setPnr(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </form>

          {error && (
            <div className="text-red-500 mb-4">
              Booking not found. Please check your PNR and try again.
            </div>
          )}

          {booking && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">
                Booking Found: {booking.pnr}
              </h2>
              <p>Status: {booking.bookingStatus}</p>
              <p>Passengers: {booking.passengers.length}</p>
              <p>Amount: {booking.amountPaid} ₫</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Example 5: Optimistic Updates

```tsx
import {
  useCancelBookingMutation,
  bookingKeys,
} from "@/features/bookings/api";
import { useQueryClient } from "@tanstack/react-query";

function BookingCard({ booking }) {
  const queryClient = useQueryClient();
  
  const cancelBooking = useCancelBookingMutation({
    // Optimistic update
    onMutate: async (bookingId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: bookingKeys.lists() });
      
      // Snapshot previous value
      const previousBookings = queryClient.getQueryData(bookingKeys.lists());
      
      // Optimistically update to remove the booking
      queryClient.setQueryData(bookingKeys.lists(), (old) =>
        old?.filter((b) => b.id !== bookingId)
      );
      
      return { previousBookings };
    },
    // Rollback on error
    onError: (err, bookingId, context) => {
      queryClient.setQueryData(bookingKeys.lists(), context?.previousBookings);
      toast.error("Failed to cancel booking");
    },
    // Refetch on success
    onSuccess: () => {
      toast.success("Booking cancelled successfully");
    },
  });

  return (
    <div>
      <h3>{booking.pnr}</h3>
      <Button onClick={() => cancelBooking.mutate(booking.id)}>
        Cancel
      </Button>
    </div>
  );
}
```
