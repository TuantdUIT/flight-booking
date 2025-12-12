# Bookings API - React Query Hooks

This folder contains React Query hooks for managing bookings in the application.

## Structure

```
api/
├── index.ts       # Public exports
├── queries.ts     # Query hooks (GET operations)
├── mutations.ts   # Mutation hooks (POST, PUT, DELETE operations)
└── README.md      # This file
```

## Query Hooks

### `useBookingsQuery()`

Fetches all bookings for the authenticated user.

**Usage:**
```tsx
import { useBookingsQuery } from "@/features/bookings/api";

function MyBookingsPage() {
  const { data: bookings, isLoading, error } = useBookingsQuery();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {bookings?.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

**Returns:** `BookingSummary[]`

**Cache:** 2 minutes

---

### `useBookingQuery(bookingId, enabled?)`

Fetches a single booking by ID.

**Parameters:**
- `bookingId: number` - The booking ID
- `enabled?: boolean` - Whether to enable the query (default: true)

**Usage:**
```tsx
import { useBookingQuery } from "@/features/bookings/api";

function BookingDetailsPage({ bookingId }: { bookingId: number }) {
  const { data: booking, isLoading } = useBookingQuery(bookingId);

  if (isLoading) return <LoadingSpinner />;

  return <BookingDetails booking={booking} />;
}
```

**Returns:** `BookingSummary`

**Cache:** 5 minutes

---

### `useBookingByPnrQuery(pnr, enabled?)`

Fetches a booking by PNR (Passenger Name Record).

**Parameters:**
- `pnr: string` - The PNR code (e.g., "PNR000123")
- `enabled?: boolean` - Whether to enable the query (default: true)

**Usage:**
```tsx
import { useBookingByPnrQuery } from "@/features/bookings/api";

function BookingLookupPage({ pnr }: { pnr: string }) {
  const { data: booking, isLoading } = useBookingByPnrQuery(pnr);

  if (isLoading) return <LoadingSpinner />;

  return <BookingDetails booking={booking} />;
}
```

**Returns:** `BookingSummary`

**Cache:** 5 minutes

---

## Mutation Hooks

### `useCreateBookingMutation()`

Creates a new booking.

**Usage:**
```tsx
import { useCreateBookingMutation } from "@/features/bookings/api";
import { toast } from "sonner";

function PaymentPage() {
  const createBooking = useCreateBookingMutation();

  const handleSubmit = async (data: CreateBookingSchema) => {
    try {
      const result = await createBooking.mutateAsync(data);
      toast.success(`Booking created! PNR: ${result.pnr}`);
      router.push(`/confirmation?pnr=${result.pnr}`);
    } catch (error) {
      toast.error("Failed to create booking");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button 
        type="submit" 
        disabled={createBooking.isPending}
      >
        {createBooking.isPending ? "Processing..." : "Confirm Booking"}
      </Button>
    </form>
  );
}
```

**Input:** `CreateBookingSchema`
```typescript
{
  flightId: string;
  passengers: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>;
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  };
}
```

**Returns:** `CreateBookingResult`
```typescript
{
  bookingId: number;
  pnr: string;
  status: BookingStatus;
  totalAmount: number;
  passengersCount: number;
}
```

**Side Effects:**
- Invalidates bookings list cache

---

### `useCancelBookingMutation()`

Cancels a booking.

**Usage:**
```tsx
import { useCancelBookingMutation } from "@/features/bookings/api";
import { toast } from "sonner";

function BookingCard({ booking }: { booking: BookingSummary }) {
  const cancelBooking = useCancelBookingMutation();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await cancelBooking.mutateAsync(booking.id);
      toast.success("Booking cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  return (
    <div>
      <h3>{booking.pnr}</h3>
      <Button 
        onClick={handleCancel}
        disabled={cancelBooking.isPending}
        variant="destructive"
      >
        Cancel Booking
      </Button>
    </div>
  );
}
```

**Input:** `bookingId: number`

**Returns:** `void`

**Side Effects:**
- Invalidates specific booking cache
- Invalidates bookings list cache

---

### `useUpdateBookingPaymentMutation()`

Updates the payment status of a booking.

**Usage:**
```tsx
import { useUpdateBookingPaymentMutation } from "@/features/bookings/api";

function PaymentUpdatePage() {
  const updatePayment = useUpdateBookingPaymentMutation();

  const handlePayment = async () => {
    try {
      await updatePayment.mutateAsync({
        bookingId: 123,
        pnr: "PNR000123",
        paymentMethod: "credit-card"
      });
      toast.success("Payment updated");
    } catch (error) {
      toast.error("Payment failed");
    }
  };

  return <Button onClick={handlePayment}>Update Payment</Button>;
}
```

**Input:**
```typescript
{
  bookingId: number;
  pnr: string;
  paymentMethod: string;
}
```

**Returns:** `{ success: boolean }`

**Side Effects:**
- Invalidates specific booking cache
- Invalidates bookings list cache

---

### `useConfirmBookingMutation()`

Confirms a booking.

**Usage:**
```tsx
import { useConfirmBookingMutation } from "@/features/bookings/api";

function BookingConfirmationPage({ pnr }: { pnr: string }) {
  const confirmBooking = useConfirmBookingMutation();

  const handleConfirm = async () => {
    try {
      await confirmBooking.mutateAsync(pnr);
      toast.success("Booking confirmed!");
    } catch (error) {
      toast.error("Failed to confirm booking");
    }
  };

  return <Button onClick={handleConfirm}>Confirm Booking</Button>;
}
```

**Input:** `pnr: string`

**Returns:** `{ success: boolean }`

**Side Effects:**
- Invalidates booking by PNR cache
- Invalidates bookings list cache

---

## Query Keys

The module exports `bookingKeys` for advanced cache management:

```typescript
import { bookingKeys } from "@/features/bookings/api";

// Invalidate all bookings
queryClient.invalidateQueries({ queryKey: bookingKeys.all });

// Invalidate bookings list
queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });

// Invalidate specific booking
queryClient.invalidateQueries({ queryKey: bookingKeys.detail(123) });

// Invalidate booking by PNR
queryClient.invalidateQueries({ queryKey: bookingKeys.byPnr("PNR000123") });
```

## Error Handling

All hooks use the `httpClient` which automatically handles API errors:

```tsx
import { ApiError } from "@/core/lib/http";

function MyComponent() {
  const { data, error } = useBookingsQuery();

  if (error) {
    if (error instanceof ApiError) {
      // Handle API errors
      console.log(error.code);      // Error code
      console.log(error.message);   // Error message
      console.log(error.details);   // Additional details
      console.log(error.requestId); // Request ID for debugging
      console.log(error.retryable); // Whether the error is retryable
    } else {
      // Handle network errors
      console.log("Network error:", error);
    }
  }

  return <div>...</div>;
}
```

## Best Practices

1. **Use Query Keys for Cache Management**
   ```tsx
   // Good: Use exported query keys
   queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
   
   // Bad: Hardcode query keys
   queryClient.invalidateQueries({ queryKey: ["bookings", "list"] });
   ```

2. **Handle Loading and Error States**
   ```tsx
   const { data, isLoading, error } = useBookingsQuery();
   
   if (isLoading) return <LoadingSpinner />;
   if (error) return <ErrorMessage error={error} />;
   if (!data) return <EmptyState />;
   ```

3. **Use Optimistic Updates for Better UX**
   ```tsx
   const cancelBooking = useCancelBookingMutation({
     onMutate: async (bookingId) => {
       // Cancel outgoing refetches
       await queryClient.cancelQueries({ queryKey: bookingKeys.lists() });
       
       // Snapshot previous value
       const previous = queryClient.getQueryData(bookingKeys.lists());
       
       // Optimistically update
       queryClient.setQueryData(bookingKeys.lists(), (old) =>
         old?.filter(b => b.id !== bookingId)
       );
       
       return { previous };
     },
     onError: (err, bookingId, context) => {
       // Rollback on error
       queryClient.setQueryData(bookingKeys.lists(), context?.previous);
     },
   });
   ```

4. **Disable Queries When Needed**
   ```tsx
   // Only fetch when bookingId is available
   const { data } = useBookingQuery(bookingId, !!bookingId);
   ```

## Testing

Example test for a component using these hooks:

```tsx
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBookingsQuery } from "./queries";

describe("useBookingsQuery", () => {
  it("fetches bookings successfully", async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useBookingsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```
