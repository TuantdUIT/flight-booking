# Summary Page - Booking API Integration

## Overview

The Summary Page has been integrated with the booking API mutation to allow users to create bookings directly from the summary page.

## Changes Made

### 1. Added Booking Mutation Hook

```typescript
import { useCreateBookingMutation } from "@/features/bookings/api";

const createBooking = useCreateBookingMutation();
```

### 2. Implemented Direct Booking Handler

```typescript
const handleDirectBooking = async () => {
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
      cardNumber: "4111111111111111", // Test card
      expiryDate: "12/25",
      cvv: "123",
    },
  };

  // Call the mutation
  const result = await createBooking.mutateAsync(bookingData);
  
  // Navigate to confirmation
  router.push("/confirmation");
};
```

### 3. Updated UI with Two Booking Options

**Option 1: Direct Booking (for testing)**
- Creates booking immediately with test payment info
- Skips payment page
- Good for testing the booking flow

**Option 2: Proceed to Payment**
- Goes to payment page
- User enters real payment information
- Production flow

## User Flow

### Direct Booking Flow (Testing)

```
Summary Page
    ↓
Click "Book Now (Test)"
    ↓
API Call: POST /api/bookings
    ↓
Success: Navigate to Confirmation
    ↓
Display booking with PNR
```

### Payment Flow (Production)

```
Summary Page
    ↓
Click "Proceed to Payment"
    ↓
Payment Page
    ↓
Enter payment details
    ↓
API Call: POST /api/bookings
    ↓
Success: Navigate to Confirmation
```

## Features

### Loading States

```typescript
{createBooking.isPending ? (
  <>
    <LoadingSpinner size="sm" />
    <span className="ml-2">Creating Booking...</span>
  </>
) : (
  "Book Now (Test)"
)}
```

- Button shows loading spinner during API call
- All buttons disabled during booking creation
- Prevents duplicate submissions

### Error Handling

```typescript
try {
  const result = await createBooking.mutateAsync(bookingData);
  toast.success(`Booking created! PNR: ${result.pnr}`);
} catch (error) {
  if (error.message.includes("Not enough available seats")) {
    setSeatError(true);
    toast.error("Seats are no longer available");
  } else if (error.message.includes("Flight not found")) {
    toast.error("Flight is no longer available");
    router.push("/");
  } else {
    toast.error(error.message || "Failed to create booking");
  }
}
```

**Error Scenarios:**
1. **Not enough seats** - Shows error banner, prevents booking
2. **Flight not found** - Redirects to home page
3. **Validation errors** - Shows specific error message
4. **Network errors** - Shows generic error message

### Success Handling

```typescript
// Show success toast
toast.success(`Booking created! PNR: ${result.pnr}`);

// Store booking in Zustand
setCurrentBooking(booking);

// Navigate to confirmation
router.push("/confirmation");
```

## Testing

### Test Direct Booking

1. Navigate through the booking flow:
   - Search flights
   - Select flight
   - Select seats
   - Enter passenger information
   - Review summary

2. Click "Book Now (Test)" button

3. Verify:
   - Loading spinner appears
   - Success toast shows with PNR
   - Redirected to confirmation page
   - Booking details displayed correctly

4. Check database:
```sql
-- Check booking was created
SELECT * FROM booking ORDER BY id DESC LIMIT 1;

-- Check passengers were created
SELECT * FROM passenger ORDER BY id DESC LIMIT 3;

-- Check booking-passenger links
SELECT * FROM booking_passenger ORDER BY booking_pax_id DESC LIMIT 3;
```

### Test Error Scenarios

**Scenario 1: No Available Seats**
1. Book all seats for a flight
2. Try to book again
3. Expect: Error message "Seats are no longer available"

**Scenario 2: Invalid Flight**
1. Manually change flightId in store to invalid value
2. Try to book
3. Expect: Error message "Flight is no longer available"

**Scenario 3: Network Error**
1. Stop the development server
2. Try to book
3. Expect: Error message about network failure

## API Integration Details

### Request Format

```typescript
{
  flightId: "1",
  passengers: [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890"
    }
  ],
  paymentInfo: {
    cardNumber: "4111111111111111",
    expiryDate: "12/25",
    cvv: "123"
  }
}
```

### Response Format

```typescript
{
  bookingId: 123,
  pnr: "PNR000123",
  status: "confirmed",
  totalAmount: 598,
  passengersCount: 2
}
```

### Mutation Hook Features

- ✅ Automatic cache invalidation
- ✅ Loading state management
- ✅ Error handling
- ✅ Type safety
- ✅ Retry logic (from httpClient)

## UI Components

### Button States

```typescript
// Normal state
<Button onClick={handleDirectBooking}>
  Book Now (Test)
</Button>

// Loading state
<Button disabled={createBooking.isPending}>
  <LoadingSpinner size="sm" />
  <span className="ml-2">Creating Booking...</span>
</Button>

// Disabled state
<Button disabled={createBooking.isPending}>
  Edit Passengers
</Button>
```

### Toast Notifications

```typescript
// Success
toast.success(`Booking created! PNR: ${result.pnr}`);

// Error
toast.error("Seats are no longer available");

// Info
toast.info("Processing your booking...");
```

## Benefits

### For Development

1. **Quick Testing** - Skip payment page for faster testing
2. **API Validation** - Test real API integration
3. **Error Testing** - Easy to test error scenarios
4. **Database Verification** - See real data in database

### For Users

1. **Clear Options** - Two clear paths (test vs production)
2. **Feedback** - Loading states and toast notifications
3. **Error Recovery** - Helpful error messages
4. **Smooth Flow** - Seamless navigation

## Future Enhancements

### Remove Test Button in Production

```typescript
const isProduction = process.env.NODE_ENV === 'production';

{!isProduction && (
  <Button onClick={handleDirectBooking}>
    Book Now (Test)
  </Button>
)}
```

### Add Payment Method Selection

```typescript
const [paymentMethod, setPaymentMethod] = useState("credit-card");

<Select value={paymentMethod} onChange={setPaymentMethod}>
  <option value="credit-card">Credit Card</option>
  <option value="paypal">PayPal</option>
  <option value="bank-transfer">Bank Transfer</option>
</Select>
```

### Add Booking Confirmation Modal

```typescript
const [showConfirmModal, setShowConfirmModal] = useState(false);

<Dialog open={showConfirmModal}>
  <DialogContent>
    <DialogTitle>Confirm Booking</DialogTitle>
    <DialogDescription>
      Are you sure you want to book this flight?
    </DialogDescription>
    <DialogActions>
      <Button onClick={() => setShowConfirmModal(false)}>Cancel</Button>
      <Button onClick={handleDirectBooking}>Confirm</Button>
    </DialogActions>
  </DialogContent>
</Dialog>
```

## Troubleshooting

### Issue: Button stays in loading state

**Cause:** API call failed but error wasn't caught

**Solution:** Check browser console for errors, verify API is running

### Issue: Booking created but not redirected

**Cause:** Navigation blocked or confirmation page error

**Solution:** Check confirmation page for errors, verify booking data format

### Issue: Toast doesn't appear

**Cause:** Sonner not configured

**Solution:** Ensure `<Toaster />` is in root layout

### Issue: Type errors

**Cause:** Booking type mismatch between core types and booking types

**Solution:** Use type casting: `status: "confirmed" as const`

## Related Files

- **Summary Page:** `src/app/(protected)/summary/page.tsx`
- **Booking Mutations:** `src/features/bookings/api/mutations.ts`
- **Booking Service:** `src/features/bookings/services/bookings.service.ts`
- **API Route:** `src/app/api/bookings/route.ts`
- **Types:** `src/core/types/index.ts`, `src/features/bookings/types.ts`

## Documentation

- **API Examples:** `docs/API_BOOKING_EXAMPLES.md`
- **Postman Testing:** `docs/POSTMAN_API_TESTING.md`
- **Feature Structure:** `docs/FEATURE_MODULE_STRUCTURE.md`
