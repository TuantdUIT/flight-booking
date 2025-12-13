# Data Flow Documentation

This document provides a comprehensive overview of how data flows through the flight booking system, from UI interactions to database operations and back.

## Architecture Overview

```
UI Components (React)
    ↓
API Hooks (React Query)
    ↓
HTTP Client
    ↓
API Routes (Next.js)
    ↓
Validation Layer (Zod)
    ↓
Service Layer
    ↓
Repository Layer
    ↓
Database (PostgreSQL via Drizzle ORM)
```

---

## Complete Flow Example: Instant Booking

This section demonstrates the complete data flow for creating a booking, from user interaction to database persistence and response.

### 1. UI Layer - Summary Page

**File:** `src/app/(protected)/summary/page.tsx`

**User Action:** User clicks "Book Now (Test)" button

```typescript
const handleDirectBooking = async () => {
  // Prepare booking data from UI state
  const bookingData = {
    flightId: selectedFlight.id,              // "1"
    passengers: passengers.map((p) => ({
      firstName: p.fullName.split(" ")[0],    // "John"
      lastName: p.fullName.split(" ").slice(1).join(" "), // "Doe"
      email: p.email,                         // "john@example.com"
      phone: p.phoneNumber,                   // "+1234567890"
      dob: p.dateOfBirth,                     // "1990-01-15"
    })),
    paymentInfo: {
      cardNumber: "4111111111111111",
      expiryDate: "12/25",
      cvv: "123",
    },
  };

  // Call the mutation hook
  const result = await createBooking.mutateAsync(bookingData);
};
```

**Data at this stage:**
```json
{
  "flightId": "1",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "dob": "1990-01-15"
    }
  ],
  "paymentInfo": {
    "cardNumber": "4111111111111111",
    "expiryDate": "12/25",
    "cvv": "123"
  }
}
```

---

### 2. API Hook Layer - React Query Mutation

**File:** `src/features/bookings/api/mutations.ts`

**Purpose:** Manages API calls with caching, loading states, and error handling

```typescript
export function useCreateBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: CreateBookingSchema): Promise<CreateBookingResult> => {
      // Makes HTTP POST request to /api/bookings
      const result = await httpClient.post<CreateBookingResult>(
        "/bookings",
        bookingData,
      );
      return result as unknown as CreateBookingResult;
    },
    onSuccess: () => {
      // Invalidate cache to refetch bookings list
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}
```

**What happens:**
- React Query wraps the API call
- Provides `isPending`, `isError`, `isSuccess` states
- Automatically handles retries and caching
- Invalidates related queries on success

---

### 3. HTTP Client Layer

**File:** `src/core/lib/http/index.ts`

**Purpose:** Centralized HTTP client with authentication and error handling

```typescript
const httpClient = {
  post: async <T>(url: string, data: any): Promise<T> => {
    const response = await fetch(`/api${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authentication headers added automatically
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }
};
```

**Request sent:**
```
POST /api/bookings
Content-Type: application/json
Authorization: Bearer <token>

{
  "flightId": "1",
  "passengers": [...],
  "paymentInfo": {...}
}
```

---

### 4. API Route Layer - Next.js Route Handler

**File:** `src/app/api/bookings/route.ts`

**Purpose:** Entry point for API requests, handles authentication and routing

```typescript
export const POST = protectedRoute(async (req, _context, user) => {
  const requestId = crypto.randomUUID();

  try {
    // 1. Parse request body
    const body = await req.json();

    // 2. Validate input data
    const validationResult = createBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return err(errors.validationError(
        "Invalid booking data",
        validationResult.error.format()
      ));
    }

    // 3. Add user ID from authentication
    const bookingData = { 
      ...validationResult.data, 
      userId: user.id  // "user_123"
    };

    // 4. Call service layer
    const bookingResult = await bookingsService.createBooking(bookingData);

    // 5. Handle service response
    if (!bookingResult.ok) {
      return toJsonResponse(bookingResult, { requestId });
    }

    // 6. Return success response
    return ok(bookingResult.value);
  } catch (error) {
    return err(errors.internalError("Failed to create booking"));
  }
});
```

**Data flow:**
1. Request → Parse JSON
2. Validate with Zod schema
3. Add authenticated user ID
4. Pass to service layer
5. Format response

---

### 5. Validation Layer - Zod Schema

**File:** `src/features/bookings/validations/create-booking.ts`

**Purpose:** Type-safe validation of incoming data

```typescript
export const createBookingSchema = z.object({
  flightId: z.string().min(1, { message: "Flight ID is required" }),
  passengers: z.array(
    z.object({
      firstName: z.string().min(1, { message: "First name is required" }),
      lastName: z.string().min(1, { message: "Last name is required" }),
      email: z.string().email({ message: "Invalid email address" }),
      phone: z.string().min(1, { message: "Phone number is required" }),
      dob: z.string().optional(), // YYYY-MM-DD format
    }),
  ),
  paymentInfo: z.object({
    cardNumber: z.string().min(1, { message: "Card number is required" }),
    expiryDate: z.string().min(1, { message: "Expiry date is required" }),
    cvv: z.string().min(1, { message: "CVV is required" }),
  }),
});

export type CreateBookingSchema = z.infer<typeof createBookingSchema>;
```

**Validation checks:**
- ✅ All required fields present
- ✅ Email format valid
- ✅ String lengths meet minimums
- ✅ Type safety enforced

**If validation fails:**
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid booking data",
    "details": {
      "passengers": {
        "_errors": [],
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

---

### 6. Service Layer - Business Logic

**File:** `src/features/bookings/services/bookings.service.ts`

**Purpose:** Orchestrates business logic, coordinates multiple repositories

```typescript
async createBooking(
  bookingData: CreateBookingSchema & { userId: string }
): Promise<Result<CreateBookingResult>> {
  try {
    const { flightId, passengers, paymentInfo, userId } = bookingData;

    // STEP 1: Validate flight exists
    const flight = await flightsRepository.findFlightById(parseInt(flightId));
    if (!flight) {
      return err(errors.notFound("Flight not found"));
    }

    // STEP 2: Check seat availability
    if (flight.availableSeats < passengers.length) {
      return err(errors.validationError("Not enough available seats"));
    }

    // STEP 3: Find available seats
    const availableSeats = await flightsRepository
      .findAvailableSeatsByFlightId(flight.id);
    if (availableSeats.length < passengers.length) {
      return err(errors.validationError("Not enough available seats"));
    }

    // STEP 4: Create passenger records
    const createdPassengers = [];
    for (const passenger of passengers) {
      const passengerData = {
        name: `${passenger.firstName} ${passenger.lastName}`,
        email: passenger.email,
        phoneNumber: passenger.phone,
        dob: passenger.dob || null,
      };
      const newPassenger = await passengersRepository
        .createPassenger(passengerData);
      createdPassengers.push(newPassenger);
    }

    // STEP 5: Calculate pricing
    const baseFare = Number(flight.priceBase) * passengers.length;
    const taxes = Number(flight.priceTax) * passengers.length;
    const totalAmount = baseFare + taxes;

    // STEP 6: Generate PNR (Passenger Name Record)
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const pnr = `PNR${timestamp}${random}`;

    // STEP 7: Database transaction
    const bookingResult = await db.transaction(async (tx) => {
      // 7a. Create booking record
      const [newBooking] = await tx.insert(bookings).values({
        pnr: pnr,
        flightId: flight.id,
        airlineId: flight.airlineId,
        userId: userId,
        amountPaid: totalAmount.toString(),
        paymentStatus: "pending",
        bookingStatus: "pending",
      }).returning();

      // 7b. Link passengers to booking and assign seats
      for (let i = 0; i < createdPassengers.length; i++) {
        await tx.insert(bookingPassengers).values({
          bookingId: newBooking.id,
          passengerId: createdPassengers[i].id,
          seatId: availableSeats[i].id,
        });

        // 7c. Mark seat as unavailable
        await tx.update(seats)
          .set({ isAvailable: false })
          .where(eq(seats.id, availableSeats[i].id));
      }

      // 7d. Update flight available seats count
      await tx.update(flights)
        .set({ 
          availableSeats: flight.availableSeats - createdPassengers.length 
        })
        .where(eq(flights.id, flight.id));

      return newBooking;
    });

    // STEP 8: Return success result
    return ok({
      bookingId: bookingResult.id,
      pnr: bookingResult.pnr || pnr,
      status: bookingResult.bookingStatus as BookingStatus,
      totalAmount: totalAmount,
      passengersCount: passengers.length,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return err(errors.internalError("Failed to create booking"));
  }
}
```

**Business logic performed:**
1. ✅ Flight validation
2. ✅ Seat availability check
3. ✅ Passenger creation
4. ✅ Price calculation
5. ✅ PNR generation
6. ✅ Atomic database transaction
7. ✅ Seat assignment
8. ✅ Inventory update

---

### 7. Repository Layer - Database Operations

**File:** `src/features/flights/repository/index.ts`

**Purpose:** Direct database access using Drizzle ORM

```typescript
export const flightsRepository = {
  findFlightById: async (id: number) => {
    const flight = await db
      .select()
      .from(flights)
      .where(eq(flights.id, id));
    return flight[0] || null;
  },

  findAvailableSeatsByFlightId: async (flightId: number) => {
    return await db
      .select()
      .from(seats)
      .where(
        and(
          eq(seats.flightId, flightId),
          eq(seats.isAvailable, true)
        )
      );
  },
};
```

**SQL Generated:**
```sql
-- Find flight by ID
SELECT * FROM flights WHERE id = 1;

-- Find available seats
SELECT * FROM seats 
WHERE flight_id = 1 AND is_available = true;
```

---

### 8. Database Layer - PostgreSQL

**Schema:** `src/infrastructure/db/schema.ts`

**Tables involved in booking:**

```sql
-- bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  pnr VARCHAR(20) UNIQUE NOT NULL,
  flight_id INTEGER REFERENCES flights(id),
  airline_id INTEGER REFERENCES airlines(id),
  user_id VARCHAR(255) NOT NULL,
  amount_paid DECIMAL(10,2),
  payment_status VARCHAR(20),
  booking_status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- passengers table
CREATE TABLE passengers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  dob DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- booking_passengers (junction table)
CREATE TABLE booking_passengers (
  booking_pax_id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  passenger_id INTEGER REFERENCES passengers(id),
  seat_id INTEGER REFERENCES seats(id)
);

-- seats table
CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  flight_id INTEGER REFERENCES flights(id),
  seat_number VARCHAR(10) NOT NULL,
  seat_class VARCHAR(20),
  is_available BOOLEAN DEFAULT true
);
```

**Transaction executed:**
```sql
BEGIN;

-- Insert booking
INSERT INTO bookings (pnr, flight_id, airline_id, user_id, amount_paid, payment_status, booking_status)
VALUES ('PNRLX3K2ABC', 1, 1, 'user_123', 250.00, 'pending', 'pending')
RETURNING *;

-- Insert passenger
INSERT INTO passengers (name, email, phone_number, dob)
VALUES ('John Doe', 'john@example.com', '+1234567890', '1990-01-15')
RETURNING *;

-- Link booking and passenger
INSERT INTO booking_passengers (booking_id, passenger_id, seat_id)
VALUES (42, 101, 15);

-- Mark seat as unavailable
UPDATE seats SET is_available = false WHERE id = 15;

-- Update flight available seats
UPDATE flights SET available_seats = available_seats - 1 WHERE id = 1;

COMMIT;
```

---

## Response Flow (Back to UI)

### 9. Service → API Route

**Service returns:**
```typescript
{
  ok: true,
  value: {
    bookingId: 42,
    pnr: "PNRLX3K2ABC",
    status: "pending",
    totalAmount: 250,
    passengersCount: 1
  }
}
```

### 10. API Route → HTTP Response

**File:** `src/app/api/bookings/route.ts`

```typescript
const result = ok(bookingResult.value);
const response = toJsonResponse(result, { requestId });

return new NextResponse(response.body, {
  status: 200,
  headers: response.headers,
});
```

**HTTP Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000

{
  "ok": true,
  "value": {
    "bookingId": 42,
    "pnr": "PNRLX3K2ABC",
    "status": "pending",
    "totalAmount": 250,
    "passengersCount": 1
  }
}
```

### 11. HTTP Client → React Query

**File:** `src/features/bookings/api/mutations.ts`

```typescript
// React Query receives response
const result = await httpClient.post<CreateBookingResult>("/bookings", bookingData);

// Triggers onSuccess callback
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
}
```

### 12. React Query → UI Component

**File:** `src/app/(protected)/summary/page.tsx`

```typescript
const result = await createBooking.mutateAsync(bookingData);

// Success handling
toast.success(`Booking created! PNR: ${result.pnr}`);

const booking = {
  id: result.bookingId.toString(),
  pnr: result.pnr,
  flight: selectedFlight,
  passengers: passengers,
  totalPrice: total,
  status: result.status,
  createdAt: new Date().toISOString().split("T")[0],
};

setCurrentBooking(booking);
router.push("/confirmation");
```

**UI Updates:**
1. ✅ Success toast notification
2. ✅ Booking stored in global state
3. ✅ Navigation to confirmation page
4. ✅ Loading state cleared

---

## Error Handling Flow

### Validation Error Example

**Scenario:** Invalid email provided

```
UI (Invalid Data)
    ↓
API Hook (Sends request)
    ↓
API Route (Receives request)
    ↓
Validation Layer (FAILS)
    ↓
API Route (Returns error)
    ↓
HTTP Client (Throws error)
    ↓
React Query (Catches error)
    ↓
UI (Displays error)
```

**Error response:**
```json
{
  "ok": false,
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

**UI handling:**
```typescript
catch (error) {
  if (error instanceof Error) {
    toast.error(error.message || "Failed to create booking");
  }
}
```

### Business Logic Error Example

**Scenario:** Not enough seats available

```
UI (Valid Data)
    ↓
API Hook
    ↓
API Route (Validates ✓)
    ↓
Service Layer (Checks seats - FAILS)
    ↓
Service (Returns error result)
    ↓
API Route (Formats error)
    ↓
UI (Shows seat error banner)
```

**Service error:**
```typescript
return err(errors.validationError("Not enough available seats"));
```

**UI handling:**
```typescript
if (error.message.includes("Not enough available seats")) {
  setSeatError(true);
  toast.error("Seats are no longer available");
}
```

---

## Data Flow Patterns

### Pattern 1: Query (Read Operations)

```
UI Component
    ↓ useQuery hook
API Hook (React Query)
    ↓ HTTP GET
API Route
    ↓ No validation needed
Service Layer
    ↓ Business logic
Repository
    ↓ SQL SELECT
Database
    ↓ Returns data
... (reverse flow)
    ↓
UI Component (Renders data)
```

### Pattern 2: Mutation (Write Operations)

```
UI Component
    ↓ useMutation hook
API Hook (React Query)
    ↓ HTTP POST/PUT/DELETE
API Route
    ↓ Zod validation
Service Layer
    ↓ Business logic + Transaction
Repository
    ↓ SQL INSERT/UPDATE/DELETE
Database
    ↓ Returns result
... (reverse flow)
    ↓
UI Component (Updates + Invalidates cache)
```

### Pattern 3: Optimistic Updates

```
UI Component (Immediate update)
    ↓
React Query (Updates cache optimistically)
    ↓
API Request (Background)
    ↓
On Success: Keep optimistic update
On Error: Rollback to previous state
```

---

## Key Architectural Decisions

### 1. Result Type Pattern
```typescript
type Result<T> = 
  | { ok: true; value: T }
  | { ok: false; error: Error };
```
**Benefits:**
- Type-safe error handling
- No thrown exceptions in business logic
- Explicit error states

### 2. Repository Pattern
**Benefits:**
- Database logic isolated
- Easy to test with mocks
- Can swap ORMs without changing services

### 3. Service Layer
**Benefits:**
- Business logic centralized
- Coordinates multiple repositories
- Handles transactions

### 4. React Query
**Benefits:**
- Automatic caching
- Loading/error states
- Optimistic updates
- Cache invalidation

### 5. Zod Validation
**Benefits:**
- Type-safe validation
- Runtime type checking
- Detailed error messages
- Schema reuse

---

## Performance Considerations

### Database Transactions
- All booking operations wrapped in transactions
- Ensures data consistency
- Automatic rollback on errors

### Query Optimization
- Indexes on foreign keys
- Selective field fetching
- Batch operations where possible

### Caching Strategy
- React Query caches API responses
- Invalidation on mutations
- Stale-while-revalidate pattern

### Error Recovery
- Automatic retries (React Query)
- Graceful degradation
- User-friendly error messages

---

## Testing Strategy

### Unit Tests
- Validation schemas (Zod)
- Service layer business logic
- Repository queries

### Integration Tests
- API routes with mocked services
- Service layer with test database
- End-to-end booking flow

### E2E Tests
- Complete user journey
- Real database interactions
- UI interactions

---

## Summary

The flight booking system follows a clean, layered architecture:

1. **UI Layer**: React components with React Query
2. **API Layer**: Next.js API routes with authentication
3. **Validation Layer**: Zod schemas for type safety
4. **Service Layer**: Business logic and orchestration
5. **Repository Layer**: Database access abstraction
6. **Database Layer**: PostgreSQL with Drizzle ORM

Each layer has a single responsibility, making the system:
- ✅ Maintainable
- ✅ Testable
- ✅ Scalable
- ✅ Type-safe
- ✅ Error-resilient
