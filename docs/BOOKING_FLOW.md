# 🎫 Flight Booking Flow - Complete Guide

> **For University Students**: This document explains how the complete flight booking system works from start to finish.

## 📋 Table of Contents

1. [Overview](#overview)
2. [User Journey](#user-journey)
3. [Step-by-Step Flow](#step-by-step-flow)
4. [Technical Architecture](#technical-architecture)
5. [Data Flow](#data-flow)
6. [State Management](#state-management)
7. [Error Handling](#error-handling)
8. [Testing Guide](#testing-guide)

---

## Overview

The flight booking system allows users to:
1. Search for flights
2. Select a flight
3. Choose seats (optional)
4. Enter passenger information
5. Review booking summary
6. Make payment
7. Receive confirmation

**Total Steps**: 7 pages
**Average Time**: 5-10 minutes
**Authentication**: Required

---

## User Journey

```
┌─────────────┐
│   Home      │  Search flights by origin, destination, date
│   Page      │
└──────┬──────┘
       │ Select Flight
       ▼
┌─────────────┐
│ Select Seat │  Choose seats for passengers (optional)
│   Page      │
└──────┬──────┘
       │ Continue
       ▼
┌─────────────┐
│ Passengers  │  Enter passenger details (name, passport, etc.)
│   Page      │
└──────┬──────┘
       │ Continue
       ▼
┌─────────────┐
│  Summary    │  Review all booking details
│   Page      │
└──────┬──────┘
       │ Proceed to Payment
       ▼
┌─────────────┐
│  Payment    │  Enter payment information
│   Page      │
└──────┬──────┘
       │ Pay Now
       ▼
┌─────────────┐
│Confirmation │  Booking confirmed with PNR
│   Page      │
└─────────────┘
```

---

## Step-by-Step Flow

### Step 1: Home Page - Flight Search

**File**: `src/app/(protected)/page.tsx`

**What happens:**
1. User sees hero search form
2. Selects origin airport (dropdown)
3. Selects destination airport (dropdown)
4. Picks departure date (date picker)
5. Chooses number of passengers (1-9)
6. Clicks "Search Flights" button

**Validation:**
- Origin and destination cannot be the same
- Departure date cannot be in the past
- At least 1 passenger required

**API Call:**
```
GET /api/flights/search?origin=JFK&destination=LAX&departureDate=2025-12-20&passengers=2
```

**Result:**
- List of available flights displayed
- Each flight shows: airline, flight number, time, price, available seats

**User Action:**
- Click "Select Flight" button on desired flight

**State Stored:**
```typescript
{
  searchParams: { origin, destination, departureDate, passengers },
  selectedFlight: { id, airline, flightNumber, origin, destination, ... }
}
```

---

### Step 2: Select Seat Page (Optional)

**File**: `src/app/(protected)/select-seat/page.tsx`

**What happens:**
1. User sees seat map of the aircraft
2. Available seats shown in green
3. Occupied seats shown in gray
4. User clicks seats to select (one per passenger)
5. Selected seats highlighted in blue

**Seat Layout:**
- Economy class: Rows 1-20
- Business class: Rows 21-30
- 6 seats per row (A, B, C, D, E, F)

**Validation:**
- Must select exactly the number of passengers
- Cannot select occupied seats
- Cannot select same seat twice

**User Action:**
- Click "Continue to Passengers" button

**State Stored:**
```typescript
{
  selectedSeats: [
    { id: 15, seatNumber: "12A", class: "economy" },
    { id: 16, seatNumber: "12B", class: "economy" }
  ]
}
```

---

### Step 3: Passengers Page

**File**: `src/app/(protected)/passengers/page.tsx`

**What happens:**
1. User sees forms for each passenger
2. Each form has fields:
   - Full Name (required)
   - Date of Birth (required)
   - Nationality (required)
   - Passport Number (required)
   - Email (required)
   - Phone Number (required)

**Validation Rules:**
- Full name: Only letters and spaces
- Date of birth: Cannot be in future
- Email: Valid email format (xxx@xxx.xxx)
- Phone: Valid phone format
- All fields required

**Example Data:**
```typescript
{
  fullName: "John Doe",
  dateOfBirth: "1990-01-15",
  nationality: "United States",
  passportNumber: "AB1234567",
  email: "john@example.com",
  phoneNumber: "+1234567890"
}
```

**User Action:**
- Fill all passenger forms
- Click "Continue to Summary" button

**State Stored:**
```typescript
{
  passengers: [
    { id: "1", fullName: "John Doe", ... },
    { id: "2", fullName: "Jane Doe", ... }
  ]
}
```

---

### Step 4: Summary Page

**File**: `src/app/(protected)/summary/page.tsx`

**What happens:**
1. User reviews all booking details:
   - Flight information (airline, route, date, time)
   - All passenger details
   - Price breakdown (base fare + taxes)
   - Total amount

**Price Calculation:**
```typescript
baseFare = flight.priceBase × numberOfPassengers
taxes = flight.priceTax × numberOfPassengers
total = baseFare + taxes
```

**Example:**
```
Base Fare: 299.00 ₫ × 2 passengers = 598.00 ₫
Taxes:      45.00 ₫ × 2 passengers =  90.00 ₫
                                    ─────────
Total:                               688.00 ₫
```

**Two Options:**

**Option 1: Book Now (Test)**
- Creates booking immediately without payment
- Status: "pending"
- Good for testing

**Option 2: Proceed to Payment**
- Goes to payment page
- Status: "confirmed" after payment
- Production flow

**User Action:**
- Click "Proceed to Payment" button

---

### Step 5: Payment Page

**File**: `src/app/(protected)/payment/page.tsx`

**What happens:**
1. User enters payment information:
   - Cardholder Name
   - Card Number (16 digits, auto-formatted with spaces)
   - Expiration Date (MM/YY format)
   - CVV (3-4 digits)

**Card Number Formatting:**
```
User types: 1234567890123456
Displayed:  1234 5678 9012 3456
```

**Validation:**
- Cardholder name: Required
- Card number: 16 digits
- Expiration: MM/YY format
- CVV: 3-4 digits

**Security Features:**
- 🔒 Secure payment processing badge
- CVV field masked (password type)
- SSL encryption (in production)

**API Call:**
```typescript
POST /api/bookings
{
  flightId: "1",
  passengers: [...],
  paymentInfo: {
    cardNumber: "1234567890123456",
    expiryDate: "12/25",
    cvv: "123",
    cardholderName: "John Doe"
  }
}
```

**User Action:**
- Click "Pay Now" button

**What Happens Behind the Scenes:**
1. Validate payment information
2. Create booking in database
3. Create passenger records
4. Assign seats to passengers
5. Generate PNR (Passenger Name Record)
6. Generate e-ticket numbers
7. Update seat availability
8. Update flight available seats count
9. Set booking status to "confirmed"
10. Set payment status to "paid"

---

### Step 6: Confirmation Page

**File**: `src/app/(protected)/confirmation/page.tsx`

**What happens:**
1. User sees success message ✅
2. Booking reference (PNR) displayed prominently
3. Complete booking details shown:
   - Flight information
   - Passenger details with e-ticket numbers
   - Total amount paid

**PNR Format:**
```
PNR000001
```

**E-Ticket Format:**
```
1234567890123 (13 digits)
```

**Actions Available:**
- Download E-Ticket (PDF) - placeholder
- Book Another Flight - returns to home

**Email Notification:**
- Confirmation email sent to passenger email
- Contains PNR and e-ticket numbers
- Booking details included

**State:**
- Booking stored in database
- User can view in "My Bookings" page

---

## Technical Architecture

### Frontend Pages

| Page | Route | Purpose | Required Data |
|------|-------|---------|---------------|
| Home | `/` | Search flights | Airports list |
| Select Seat | `/select-seat` | Choose seats | Selected flight |
| Passengers | `/passengers` | Enter passenger info | Selected flight, search params |
| Summary | `/summary` | Review booking | Flight, passengers, search params |
| Payment | `/payment` | Process payment | All above |
| Confirmation | `/confirmation` | Show success | Created booking |
| My Bookings | `/my-bookings` | View bookings | User bookings |

### API Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/airports` | Get airport list | ✅ |
| GET | `/api/flights/search` | Search flights | ✅ |
| GET | `/api/flights/:id/seats` | Get seat map | ✅ |
| POST | `/api/bookings` | Create booking | ✅ |
| GET | `/api/bookings` | Get user bookings | ✅ |

### Database Tables

```sql
-- Core tables
airlines (id, name, sdt, email, country)
flights (id, airline_id, origin, destination, date, time, total_seats, available_seats, price_base, price_tax)
seats (id, flight_id, seat_number, class, is_available, price)
passengers (id, name, dob, nationality, passport, email, phonenumber)
bookings (id, pnr, flight_id, airline_id, user_id, amount_paid, payment_status, booking_status)
booking_passengers (booking_pax_id, booking_id, passenger_id, seat_id, e_ticket_number)

-- Auth tables (Better Auth)
users (id, name, email, email_verified, role)
sessions (id, token, user_id, expires_at)
```

### State Management

**Global Store** (Zustand): `src/core/lib/store/index.ts`

```typescript
interface BookingStore {
  // Search
  searchParams: SearchParams | null;
  setSearchParams: (params: SearchParams) => void;
  
  // Flight
  selectedFlight: Flight | null;
  setSelectedFlight: (flight: Flight) => void;
  
  // Seats
  selectedSeats: Seat[];
  setSelectedSeats: (seats: Seat[]) => void;
  
  // Passengers
  passengers: Passenger[];
  setPassengers: (passengers: Passenger[]) => void;
  
  // Booking
  currentBooking: Booking | null;
  setCurrentBooking: (booking: Booking) => void;
  
  // Reset
  resetBooking: () => void;
}
```

**Why Zustand?**
- Simple API
- No boilerplate
- TypeScript support
- Persists across page navigation
- Easy to debug

---

## Data Flow

### Complete Booking Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User fills payment form                                 │
│  2. Clicks "Pay Now"                                        │
│  3. handleSubmit() triggered                                │
│                                                              │
│  const bookingData = {                                      │
│    flightId: "1",                                           │
│    passengers: [{ firstName, lastName, email, ... }],       │
│    paymentInfo: { cardNumber, expiryDate, cvv, ... }        │
│  }                                                           │
│                                                              │
│  4. createBooking.mutateAsync(bookingData)                  │
│     ↓                                                        │
└─────┼────────────────────────────────────────────────────────┘
      │
      │ HTTP POST /api/bookings
      │ Authorization: Bearer <token>
      │ Body: bookingData
      ▼
┌─────────────────────────────────────────────────────────────┐
│                  API ROUTE (Next.js)                         │
│              src/app/api/bookings/route.ts                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. protectedRoute middleware                               │
│     - Validates authentication token                        │
│     - Extracts user.id from session                         │
│                                                              │
│  2. Parse request body                                      │
│     const body = await req.json()                           │
│                                                              │
│  3. Validate with Zod schema                                │
│     const result = createBookingSchema.safeParse(body)      │
│     if (!result.success) return validationError             │
│                                                              │
│  4. Add userId to booking data                              │
│     const bookingData = { ...result.data, userId: user.id } │
│                                                              │
│  5. Call service layer                                      │
│     const result = await bookingsService.createBooking()    │
│     ↓                                                        │
└─────┼────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVICE LAYER                               │
│        src/features/bookings/services/bookings.service.ts    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  STEP 1: Validate Flight                                    │
│  ─────────────────────────                                  │
│  const flight = await flightsRepository.findFlightById()    │
│  if (!flight) return err("Flight not found")                │
│                                                              │
│  STEP 2: Check Seat Availability                            │
│  ──────────────────────────────                             │
│  if (flight.availableSeats < passengers.length)             │
│    return err("Not enough seats")                           │
│                                                              │
│  STEP 3: Find Available Seats                               │
│  ───────────────────────────                                │
│  const seats = await flightsRepository                      │
│    .findAvailableSeatsByFlightId(flightId)                  │
│                                                              │
│  STEP 4: Create Passengers                                  │
│  ────────────────────────                                   │
│  for (passenger of passengers) {                            │
│    const p = await passengersRepository.createPassenger()   │
│    createdPassengers.push(p)                                │
│  }                                                           │
│                                                              │
│  STEP 5: Calculate Total                                    │
│  ──────────────────────                                     │
│  baseFare = flight.priceBase × passengers.length            │
│  taxes = flight.priceTax × passengers.length                │
│  total = baseFare + taxes                                   │
│                                                              │
│  STEP 6: Generate PNR                                       │
│  ─────────────────────                                      │
│  const pnr = await generateUniquePNR(db)                    │
│                                                              │
│  STEP 7: Database Transaction                               │
│  ────────────────────────────                               │
│  await db.transaction(async (tx) => {                       │
│    // 7a. Create booking                                    │
│    const booking = await tx.insert(bookings).values({      │
│      pnr, flightId, userId, amountPaid: total,             │
│      paymentStatus: "paid", bookingStatus: "confirmed"     │
│    })                                                        │
│                                                              │
│    // 7b. Link passengers and assign seats                  │
│    for (i = 0; i < passengers.length; i++) {               │
│      const eTicket = await generateUniqueETicket(tx)       │
│      await tx.insert(booking_passengers).values({          │
│        bookingId, passengerId, seatId, eTicket             │
│      })                                                      │
│                                                              │
│      // 7c. Mark seat as unavailable                        │
│      await tx.update(seats)                                 │
│        .set({ isAvailable: false })                         │
│        .where(eq(seats.id, seatId))                         │
│    }                                                         │
│                                                              │
│    // 7d. Update flight available seats                     │
│    await tx.update(flights)                                 │
│      .set({ availableSeats: flight.availableSeats - n })   │
│      .where(eq(flights.id, flightId))                       │
│  })                                                          │
│                                                              │
│  STEP 8: Return Success                                     │
│  ─────────────────────                                      │
│  return ok({                                                │
│    bookingId, pnr, status: "confirmed",                     │
│    totalAmount, passengersCount                             │
│  })                                                          │
│     ↓                                                        │
└─────┼────────────────────────────────────────────────────────┘
      │
      │ Result<CreateBookingResult>
      ▼
┌─────────────────────────────────────────────────────────────┐
│                  API ROUTE (Response)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  if (!result.ok) return errorResponse(result.error)         │
│                                                              │
│  return successResponse({                                   │
│    success: true,                                           │
│    data: result.value,                                      │
│    meta: { requestId, timestamp }                           │
│  })                                                          │
│     ↓                                                        │
└─────┼────────────────────────────────────────────────────────┘
      │
      │ HTTP 200 OK
      │ { success: true, data: {...} }
      ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (Response)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. React Query receives response                           │
│  2. Axios interceptor unwraps data                          │
│  3. Success callback triggered                              │
│                                                              │
│  const result = await createBooking.mutateAsync()           │
│  // result = { bookingId, pnr, status, totalAmount, ... }   │
│                                                              │
│  4. Show success toast                                      │
│     toast.success(`Booking created! PNR: ${result.pnr}`)    │
│                                                              │
│  5. Store booking in state                                  │
│     setCurrentBooking(booking)                              │
│                                                              │
│  6. Navigate to confirmation                                │
│     router.push("/confirmation")                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Handling

### Frontend Validation Errors

**Passenger Form:**
```typescript
// Example validation error
{
  fullName: "Name must contain only letters and spaces",
  email: "Please enter a valid email address",
  dateOfBirth: "Date of birth cannot be in the future"
}
```

**Display:**
- Red text under each field
- Error banner at top of page
- Submit button remains enabled
- User can fix and resubmit

### API Validation Errors

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid booking data",
    "details": {
      "passengers": {
        "0": {
          "email": {
            "_errors": ["Invalid email address"]
          }
        }
      }
    }
  }
}
```

**Handling:**
- Toast notification shown
- Error message displayed
- User can retry

### Business Logic Errors

**Scenario 1: Not Enough Seats**
```typescript
if (flight.availableSeats < passengers.length) {
  return err(errors.validationError("Not enough available seats"));
}
```

**User Experience:**
- Error banner: "Seats are no longer available"
- Redirect to home page
- User must search again

**Scenario 2: Flight Not Found**
```typescript
if (!flight) {
  return err(errors.notFound("Flight not found"));
}
```

**User Experience:**
- Error message: "Flight is no longer available"
- Automatic redirect to home
- User must search again

### Database Errors

**Transaction Rollback:**
```typescript
await db.transaction(async (tx) => {
  // If any operation fails, entire transaction rolls back
  // No partial bookings created
  // Database remains consistent
});
```

**Retry Logic:**
- Automatic retry for transient errors
- Exponential backoff
- Maximum 3 attempts

### Network Errors

**React Query Handling:**
```typescript
const { error, isError } = useCreateBookingMutation();

if (isError) {
  // Show error message
  // Provide retry button
  // Log error for debugging
}
```

---

## Testing Guide

### Manual Testing Checklist

#### 1. Flight Search
- [ ] Search with valid origin and destination
- [ ] Try same origin and destination (should fail)
- [ ] Try past date (should fail)
- [ ] Try 0 passengers (should fail)
- [ ] Try 10 passengers (should fail)
- [ ] Verify search results display correctly

#### 2. Seat Selection
- [ ] Click available seats
- [ ] Try clicking occupied seats (should not select)
- [ ] Select correct number of seats
- [ ] Try continuing with wrong number (should fail)
- [ ] Verify selected seats highlighted

#### 3. Passenger Information
- [ ] Fill all required fields
- [ ] Try submitting with empty fields (should fail)
- [ ] Try invalid email format (should fail)
- [ ] Try future date of birth (should fail)
- [ ] Try special characters in name (should fail)
- [ ] Verify all passengers saved

#### 4. Summary Page
- [ ] Verify flight details correct
- [ ] Verify passenger details correct
- [ ] Verify price calculation correct
- [ ] Test "Edit Passengers" button
- [ ] Test "Book Now (Test)" button
- [ ] Test "Proceed to Payment" button

#### 5. Payment Page
- [ ] Enter valid card details
- [ ] Try invalid card number (should fail)
- [ ] Try invalid expiration (should fail)
- [ ] Try invalid CVV (should fail)
- [ ] Verify card number formatting (spaces)
- [ ] Verify expiration formatting (MM/YY)
- [ ] Test payment submission

#### 6. Confirmation Page
- [ ] Verify PNR displayed
- [ ] Verify flight details correct
- [ ] Verify passenger details correct
- [ ] Verify e-ticket numbers shown
- [ ] Verify total amount correct
- [ ] Test "Book Another Flight" button

#### 7. My Bookings Page
- [ ] Verify booking appears in list
- [ ] Verify all details correct
- [ ] Test expand/collapse passenger details
- [ ] Verify status badges correct
- [ ] Verify currency display (VND)

### Test Data

**Test Airports:**
```
JFK - John F. Kennedy International Airport
LAX - Los Angeles International Airport
ORD - O'Hare International Airport
DFW - Dallas/Fort Worth International Airport
```

**Test Passenger:**
```typescript
{
  fullName: "John Doe",
  dateOfBirth: "1990-01-15",
  nationality: "United States",
  passportNumber: "AB1234567",
  email: "john.doe@example.com",
  phoneNumber: "+1234567890"
}
```

**Test Payment:**
```typescript
{
  cardholderName: "John Doe",
  cardNumber: "4111 1111 1111 1111",
  expirationDate: "12/25",
  cvv: "123"
}
```

### Automated Testing

**Unit Tests:**
```typescript
// Test validation
describe('Passenger Validation', () => {
  it('should reject invalid email', () => {
    const result = validatePassenger({ email: 'invalid' });
    expect(result.email).toBe('Please enter a valid email address');
  });
});

// Test service logic
describe('BookingsService', () => {
  it('should create booking successfully', async () => {
    const result = await bookingsService.createBooking(validData);
    expect(result.ok).toBe(true);
    expect(result.value).toHaveProperty('pnr');
  });
});
```

**Integration Tests:**
```typescript
// Test API endpoint
describe('POST /api/bookings', () => {
  it('should create booking with valid data', async () => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { Authorization: 'Bearer token' },
      body: JSON.stringify(validBookingData)
    });
    expect(response.status).toBe(200);
  });
});
```

**E2E Tests:**
```typescript
// Test complete flow
test('user can complete booking', async ({ page }) => {
  // Search flights
  await page.goto('/');
  await page.selectOption('[name="origin"]', 'JFK');
  await page.selectOption('[name="destination"]', 'LAX');
  await page.fill('[name="departureDate"]', '2025-12-20');
  await page.click('button:has-text("Search Flights")');
  
  // Select flight
  await page.click('button:has-text("Select Flight")');
  
  // Enter passengers
  await page.fill('[name="fullName"]', 'John Doe');
  // ... fill other fields
  await page.click('button:has-text("Continue to Summary")');
  
  // Review and pay
  await page.click('button:has-text("Proceed to Payment")');
  await page.fill('[name="cardNumber"]', '4111111111111111');
  // ... fill payment fields
  await page.click('button:has-text("Pay Now")');
  
  // Verify confirmation
  await expect(page.locator('h1')).toContainText('Booking Confirmed');
});
```

---

## Key Concepts for Students

### 1. State Management

**Why we need it:**
- User navigates through multiple pages
- Data must persist across pages
- Avoid losing user input

**How it works:**
```typescript
// Store data when user selects flight
setSelectedFlight(flight);

// Retrieve data on next page
const { selectedFlight } = useBookingStore();
```

**Alternative approaches:**
- URL parameters (limited data)
- Local storage (persists after refresh)
- Session storage (cleared on tab close)
- Context API (React built-in)

### 2. Form Validation

**Client-side validation:**
- Immediate feedback
- Better user experience
- Reduces server load

**Server-side validation:**
- Security requirement
- Cannot be bypassed
- Final validation layer

**Best practice:**
- Validate on both client and server
- Use same validation rules (Zod schema)
- Show clear error messages

### 3. API Design

**RESTful principles:**
```
GET    /api/bookings      - List bookings
POST   /api/bookings      - Create booking
GET    /api/bookings/:id  - Get booking
PUT    /api/bookings/:id  - Update booking
DELETE /api/bookings/:id  - Delete booking
```

**Response format:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-12-15T10:30:00Z"
  }
}
```

### 4. Database Transactions

**Why transactions:**
- Ensure data consistency
- All-or-nothing operations
- Prevent partial bookings

**Example:**
```typescript
await db.transaction(async (tx) => {
  // Create booking
  const booking = await tx.insert(bookings).values(...);
  
  // Create passengers
  await tx.insert(passengers).values(...);
  
  // If any fails, everything rolls back
});
```

### 5. Error Handling Patterns

**Result Pattern:**
```typescript
type Result<T> = 
  | { ok: true; value: T }
  | { ok: false; error: Error };

// Usage
const result = await createBooking(data);
if (!result.ok) {
  // Handle error
  return errorResponse(result.error);
}
// Use result.value
```

**Benefits:**
- Type-safe error handling
- No thrown exceptions
- Explicit error states
- Easy to test

### 6. React Query

**Why use it:**
- Automatic caching
- Loading states
- Error handling
- Retry logic
- Background refetching

**Example:**
```typescript
const { data, isLoading, isError } = useUserBookingsQuery();

if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage />;
return <BookingsList bookings={data} />;
```

### 7. TypeScript Benefits

**Type safety:**
```typescript
// Compiler catches errors
const booking: Booking = {
  id: "1",
  pnr: "PNR000001",
  // Missing 'status' - TypeScript error!
};
```

**Autocomplete:**
- IDE suggests available properties
- Reduces typos
- Faster development

**Refactoring:**
- Change type definition
- Compiler finds all usages
- Safe to update

---

## Common Issues and Solutions

### Issue 1: "Flight not found" error

**Cause:**
- Flight ID invalid
- Flight deleted from database
- Database connection issue

**Solution:**
```typescript
// Always validate flight exists
const flight = await flightsRepository.findFlightById(flightId);
if (!flight) {
  return err(errors.notFound("Flight not found"));
}
```

### Issue 2: "Not enough seats" error

**Cause:**
- Multiple users booking simultaneously
- Seats reserved but not released
- Cache not updated

**Solution:**
```typescript
// Check availability in transaction
await db.transaction(async (tx) => {
  const flight = await tx.select().from(flights).where(...);
  if (flight.availableSeats < passengers.length) {
    throw new Error("Not enough seats");
  }
  // Continue booking...
});
```

### Issue 3: State lost on page refresh

**Cause:**
- Zustand store not persisted
- User refreshes browser
- Session expired

**Solution:**
```typescript
// Add persistence middleware
import { persist } from 'zustand/middleware';

const useBookingStore = create(
  persist(
    (set) => ({ ... }),
    { name: 'booking-storage' }
  )
);
```

### Issue 4: Validation errors not showing

**Cause:**
- Error state not updated
- Component not re-rendering
- Error cleared too early

**Solution:**
```typescript
// Update error state properly
const [errors, setErrors] = useState<Errors>({});

const handleChange = (field, value) => {
  // Clear error when user types
  setErrors(prev => ({ ...prev, [field]: undefined }));
};
```

### Issue 5: Payment processing stuck

**Cause:**
- API timeout
- Network error
- Server overload

**Solution:**
```typescript
// Add timeout and retry
const createBooking = useCreateBookingMutation({
  retry: 3,
  retryDelay: 1000,
  onError: (error) => {
    toast.error("Payment failed. Please try again.");
  }
});
```

---

## Performance Optimization

### 1. Code Splitting

**Problem:** Large bundle size, slow initial load

**Solution:**
```typescript
// Lazy load pages
const PaymentPage = lazy(() => import('./payment/page'));
const ConfirmationPage = lazy(() => import('./confirmation/page'));
```

### 2. Image Optimization

**Problem:** Large images slow down page

**Solution:**
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image 
  src="/airline-logo.png" 
  width={100} 
  height={100}
  alt="Airline logo"
  loading="lazy"
/>
```

### 3. API Caching

**Problem:** Repeated API calls for same data

**Solution:**
```typescript
// React Query caching
const { data } = useUserBookingsQuery({
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### 4. Database Indexing

**Problem:** Slow queries

**Solution:**
```sql
-- Add indexes on frequently queried columns
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_flights_route ON flights(origin, destination);
CREATE INDEX idx_seats_flight_available ON seats(flight_id, is_available);
```

### 5. Debouncing

**Problem:** Too many API calls while typing

**Solution:**
```typescript
// Debounce search input
const debouncedSearch = useMemo(
  () => debounce((value) => searchFlights(value), 500),
  []
);
```

---

## Security Considerations

### 1. Authentication

**All booking endpoints require authentication:**
```typescript
export const POST = protectedRoute(async (req, context, user) => {
  // user.id available here
  // Only authenticated users can book
});
```

### 2. Authorization

**Users can only access their own bookings:**
```typescript
// Filter by userId
const bookings = await bookingsRepository
  .findBookingsByUserId(user.id);
```

### 3. Input Validation

**Never trust client input:**
```typescript
// Validate on server
const result = createBookingSchema.safeParse(body);
if (!result.success) {
  return validationError(result.error);
}
```

### 4. SQL Injection Prevention

**Use parameterized queries:**
```typescript
// ✅ Safe - Drizzle ORM
await db.select().from(bookings).where(eq(bookings.id, id));

// ❌ Unsafe - String concatenation
await db.execute(`SELECT * FROM bookings WHERE id = ${id}`);
```

### 5. Payment Security

**In production:**
- Use HTTPS only
- Tokenize card numbers
- PCI DSS compliance
- Never log sensitive data
- Use payment gateway (Stripe, PayPal)

---

## Deployment Checklist

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Authentication
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://yourdomain.com

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

### Database Migration

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# Seed database
npm run db:seed
```

### Build and Deploy

```bash
# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm start
```

### Post-Deployment

- [ ] Test all booking flows
- [ ] Verify email notifications
- [ ] Check payment processing
- [ ] Monitor error logs
- [ ] Set up analytics
- [ ] Configure backups

---

## Additional Resources

### Documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DATA_FLOW.md](./DATA_FLOW.md) - Complete data flow
- [FLIGHT_SEARCH_DATA_FLOW.md](./FLIGHT_SEARCH_DATA_FLOW.md) - Search flow
- [MY_BOOKINGS_FEATURE.md](./MY_BOOKINGS_FEATURE.md) - Bookings feature

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Zod Documentation](https://zod.dev/)

### Learning Path

1. **Week 1-2**: Understand React basics and Next.js routing
2. **Week 3-4**: Learn state management with Zustand
3. **Week 5-6**: Master form handling and validation
4. **Week 7-8**: Study API design and database operations
5. **Week 9-10**: Practice error handling and testing
6. **Week 11-12**: Deploy and optimize application

---

## Summary

The flight booking system demonstrates:

✅ **Clean Architecture** - Separation of concerns
✅ **Type Safety** - Full TypeScript coverage
✅ **Error Handling** - Graceful error management
✅ **State Management** - Persistent user data
✅ **Form Validation** - Client and server validation
✅ **Database Transactions** - Data consistency
✅ **API Design** - RESTful endpoints
✅ **Security** - Authentication and authorization
✅ **Performance** - Caching and optimization
✅ **Testing** - Unit, integration, and E2E tests

**Key Takeaways:**
1. Always validate user input (client + server)
2. Use transactions for multi-step operations
3. Handle errors gracefully with clear messages
4. Persist state across page navigation
5. Implement proper authentication/authorization
6. Write tests for critical flows
7. Optimize for performance
8. Document your code

**Next Steps:**
- Implement booking cancellation
- Add booking modification
- Create admin dashboard
- Add email notifications
- Implement PDF e-tickets
- Add payment gateway integration
- Set up monitoring and logging

---

**Questions?** Check the documentation or ask your instructor!

**Good luck with your project! 🚀**
