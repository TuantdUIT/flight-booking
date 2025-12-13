# Payment Flow Implementation

## Overview

The payment flow has been implemented to handle real booking creation with user-provided payment information. The system now supports two booking paths:

1. **Test Booking** (Summary Page) - Creates booking with `pending` status
2. **Payment Booking** (Payment Page) - Creates booking with `paid` and `confirmed` status

---

## Payment Page Flow

### User Journey

```
Summary Page
    ↓ Click "Proceed to Payment"
Payment Page
    ↓ Fill payment form
    ↓ Click "Pay Now"
API Call with real payment info
    ↓
Booking created with "paid" status
    ↓
Confirmation Page
```

---

## Implementation Details

### 1. Payment Form (`src/app/(protected)/payment/page.tsx`)

**User Input Fields:**
- Cardholder Name
- Card Number (formatted as XXXX XXXX XXXX XXXX)
- Expiration Date (MM/YY format)
- CVV (3-4 digits)

**Validation:**
- All fields required
- Card number must be 16 digits
- Expiration date must match MM/YY format
- CVV must be 3-4 digits

**Payment Data Sent:**
```typescript
{
  flightId: "1",
  passengers: [...],
  paymentInfo: {
    cardNumber: "4111111111111111",    // User input (spaces removed)
    expiryDate: "12/25",               // User input
    cvv: "123",                        // User input
    cardholderName: "John Doe"         // User input
  }
}
```

### 2. Validation Schema (`src/features/bookings/validations/create-booking.ts`)

Updated to accept `cardholderName`:

```typescript
paymentInfo: z.object({
  cardNumber: z.string().min(1),
  expiryDate: z.string().min(1),
  cvv: z.string().min(1),
  cardholderName: z.string().optional(), // New field
})
```

### 3. Service Logic (`src/features/bookings/services/bookings.service.ts`)

**Payment Status Determination:**

```typescript
// If cardholderName is present = user went through payment page
const isPaid = paymentInfo?.cardholderName ? true : false;
const paymentStatus = isPaid ? "paid" : "pending";
const bookingStatus = isPaid ? "confirmed" : "pending";
```

**Database Record:**
```sql
INSERT INTO bookings (
  pnr,
  flight_id,
  user_id,
  amount_paid,
  payment_status,  -- "paid" (from payment page) or "pending" (test booking)
  booking_status   -- "confirmed" (paid) or "pending" (test)
)
```

---

## Comparison: Test vs Payment Booking

### Test Booking (Summary Page - "Book Now (Test)")

```typescript
paymentInfo: {
  cardNumber: "4111111111111111",  // Mock data
  expiryDate: "12/25",             // Mock data
  cvv: "123",                      // Mock data
  // No cardholderName
}
```

**Result:**
- `paymentStatus`: `"pending"`
- `bookingStatus`: `"pending"`

### Payment Booking (Payment Page - "Pay Now")

```typescript
paymentInfo: {
  cardNumber: "4111111111111111",  // User input
  expiryDate: "12/25",             // User input
  cvv: "123",                      // User input
  cardholderName: "John Doe"       // User input (KEY INDICATOR)
}
```

**Result:**
- `paymentStatus`: `"paid"`
- `bookingStatus`: `"confirmed"`

---

## Error Handling

### Payment Page Errors

**Validation Errors:**
- Missing required fields
- Invalid card number format
- Invalid expiration date format
- Invalid CVV length

**API Errors:**
- Flight not found → Redirect to home
- Not enough seats → Show error banner
- Network errors → Show error message

**User Feedback:**
- Toast notifications for success/error
- Error banner for critical issues
- Form field validation errors
- Loading states during processing

---

## Database Schema

### Bookings Table

```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  pnr VARCHAR(20) UNIQUE,
  flight_id INTEGER,
  user_id VARCHAR(255),
  amount_paid DECIMAL(10,2),
  payment_status VARCHAR(20),  -- "pending" | "paid" | "failed"
  booking_status VARCHAR(20),  -- "pending" | "confirmed" | "cancelled"
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Status Combinations:**

| Booking Type | payment_status | booking_status |
|--------------|----------------|----------------|
| Test Booking | `pending`      | `pending`      |
| Paid Booking | `paid`         | `confirmed`    |

---

## Testing

### Test Payment Booking

1. Navigate to flight search
2. Select a flight
3. Fill passenger information
4. Click "Proceed to Payment"
5. Fill payment form:
   - Cardholder Name: "John Doe"
   - Card Number: "4111 1111 1111 1111"
   - Expiration: "12/25"
   - CVV: "123"
6. Click "Pay Now"
7. Verify booking created with:
   - `payment_status = "paid"`
   - `booking_status = "confirmed"`

### Test Quick Booking

1. Navigate to flight search
2. Select a flight
3. Fill passenger information
4. Click "Book Now (Test)"
5. Verify booking created with:
   - `payment_status = "pending"`
   - `booking_status = "pending"`

---

## Security Considerations

**Current Implementation:**
- Payment info is sent to backend but not stored
- Only booking status is persisted
- Card details are validated but not saved

**Production Recommendations:**
- Integrate with payment gateway (Stripe, PayPal)
- Never store raw card numbers
- Use tokenization for card data
- Implement PCI DSS compliance
- Add 3D Secure authentication
- Encrypt sensitive data in transit

---

## Future Enhancements

1. **Payment Gateway Integration**
   - Stripe/PayPal integration
   - Real payment processing
   - Webhook handling

2. **Payment Methods**
   - Credit/Debit cards
   - Digital wallets (Apple Pay, Google Pay)
   - Bank transfers
   - Cryptocurrency

3. **Payment Status Updates**
   - Real-time payment confirmation
   - Payment retry logic
   - Refund handling

4. **Enhanced Security**
   - 3D Secure
   - Fraud detection
   - Rate limiting
   - CAPTCHA for payment

---

## API Response

### Success Response

```json
{
  "ok": true,
  "value": {
    "bookingId": 42,
    "pnr": "PNRLX3K2ABC",
    "status": "confirmed",
    "totalAmount": 250,
    "passengersCount": 1
  }
}
```

### Error Response

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Not enough available seats"
  }
}
```

---

## Summary

The payment flow is now fully integrated with the booking system:

✅ Real payment form with validation
✅ User-provided payment information
✅ Automatic status determination (paid vs pending)
✅ Database persistence with correct statuses
✅ Error handling and user feedback
✅ Seamless navigation to confirmation page

The system distinguishes between test bookings and real payments based on the presence of `cardholderName` in the payment info, automatically setting the appropriate payment and booking statuses.
