# My Bookings Feature Documentation

This document describes the complete implementation of the "My Bookings" feature following the project's Clean Architecture principles.

## Feature Overview

The My Bookings feature allows authenticated users to view all their flight bookings with detailed information including flight details, passenger information, seat assignments, and e-ticket numbers.

## Architecture

Following the project's feature-based organization pattern:

```
src/
├── features/bookings/
│   ├── api/
│   │   ├── queries.ts          # React Query hooks for data fetching
│   │   └── mutations.ts        # React Query hooks for mutations
│   ├── components/
│   │   ├── booking-card.tsx    # Individual booking display
│   │   ├── empty-bookings.tsx  # Empty state component
│   │   └── index.ts            # Component exports
│   ├── services/
│   │   └── bookings.service.ts # Business logic layer
│   ├── repository/
│   │   └── index.ts            # Database access layer
│   └── validations/
│       └── create-booking.ts   # Zod validation schemas
├── app/
│   ├── api/bookings/
│   │   └── route.ts            # API endpoint (GET /api/bookings)
│   └── (protected)/my-bookings/
│       └── page.tsx            # Frontend page component
```

## Data Flow

### 1. Frontend Request Flow

```
User visits /my-bookings
    ↓
MyBookingsPage component mounts
    ↓
useUserBookingsQuery() hook triggers
    ↓
React Query checks cache
    ↓
If stale/missing, makes HTTP GET request
    ↓
httpClient.get("/bookings")
    ↓
Axios interceptor adds auth token
    ↓
GET /api/bookings
```

### 2. Backend Processing Flow

```
API Route (route.ts)
    ↓
protectedRoute middleware (validates auth)
    ↓
bookingsService.getUserBookings(userId)
    ↓
bookingsRepository.findBookingsByUserId(userId)
    ↓
Database query (Drizzle ORM)
    ↓
Enrich with flight, airline, passenger data
    ↓
Return Result<BookingWithDetails[]>
    ↓
toJsonResponse() formats response
    ↓
HTTP 200 with JSON data
```

### 3. Response Flow

```
HTTP Response
    ↓
Axios interceptor unwraps response
    ↓
React Query caches data
    ↓
Component receives data
    ↓
Renders BookingCard components
```

## Components

### BookingCard Component

**Location:** `src/features/bookings/components/booking-card.tsx`

**Purpose:** Displays a single booking with expandable passenger details

**Features:**
- Collapsible design (show/hide passenger details)
- Status badges (booking status, payment status)
- Flight route visualization
- Passenger list with seat assignments
- E-ticket numbers display
- Responsive layout (mobile-friendly)

**Props:**
```typescript
interface BookingCardProps {
  booking: BookingWithDetails;
}
```

**State:**
- `isExpanded`: boolean - Controls passenger details visibility

### EmptyBookings Component

**Location:** `src/features/bookings/components/empty-bookings.tsx`

**Purpose:** Empty state when user has no bookings

**Features:**
- Friendly empty state message
- Call-to-action button to search flights
- Icon illustration

## API Layer

### React Query Hook

**Location:** `src/features/bookings/api/queries.ts`

```typescript
export function useUserBookingsQuery() {
  return useQuery({
    queryKey: bookingKeys.lists(),
    queryFn: async (): Promise<BookingWithDetails[]> => {
      const bookings = await httpClient.get<BookingWithDetails[]>("/bookings");
      return bookings as unknown as BookingWithDetails[];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
```

**Features:**
- Automatic caching (1 minute stale time)
- Loading and error states
- Automatic refetching on window focus
- Type-safe response

**Query Keys:**
```typescript
export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (filters: string) => [...bookingKeys.lists(), { filters }] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: number) => [...bookingKeys.details(), id] as const,
};
```

### API Endpoint

**Location:** `src/app/api/bookings/route.ts`

**Endpoint:** `GET /api/bookings`

**Authentication:** Required (protectedRoute middleware)

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "pnr": "PNR000001",
      "bookingStatus": "confirmed",
      "paymentStatus": "paid",
      "amountPaid": "344.00",
      "createdAt": "2025-12-15T10:30:00.000Z",
      "flight": {
        "id": 1,
        "flightNumber": "American Airlines-1",
        "airline": "American Airlines",
        "origin": "JFK",
        "destination": "LAX",
        "date": "2025-12-20",
        "time": "08:00"
      },
      "passengers": [
        {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com",
          "phoneNumber": "+1234567890",
          "seatNumber": "12A",
          "eTicketNumber": "1234567890123"
        }
      ]
    }
  ],
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-12-15T10:30:00.000Z"
  }
}
```

## Service Layer

### BookingsService.getUserBookings()

**Location:** `src/features/bookings/services/bookings.service.ts`

**Purpose:** Fetch and enrich user bookings with related data

**Process:**
1. Query bookings by userId from repository
2. For each booking:
   - Fetch flight details
   - Fetch airline details
   - Fetch passenger records
   - Fetch seat assignments
   - Combine into enriched booking object
3. Return Result<BookingWithDetails[]>

**Data Enrichment:**
```typescript
{
  // From bookings table
  id, pnr, bookingStatus, paymentStatus, amountPaid, createdAt,
  
  // From flights + airlines tables
  flight: {
    id, flightNumber, airline, origin, destination, date, time
  },
  
  // From passengers + seats + booking_passengers tables
  passengers: [{
    id, name, email, phoneNumber, seatNumber, eTicketNumber
  }]
}
```

## Repository Layer

### BookingsRepository

**Location:** `src/features/bookings/repository/index.ts`

**Methods Used:**
- `findBookingsByUserId(userId: string)` - Get all bookings for a user
- `findBookingPassengersByBookingId(bookingId: number)` - Get passengers for a booking

**Related Repositories:**
- `flightsRepository.findFlightById()` - Get flight details
- `flightsRepository.findAirlineById()` - Get airline details
- `flightsRepository.findSeatById()` - Get seat details
- `passengersRepository.findPassengerById()` - Get passenger details

## Database Schema

**Tables Involved:**

```sql
-- Main booking record
bookings (
  id, pnr, flight_id, airline_id, user_id,
  amount_paid, payment_status, booking_status,
  created_at, updated_at
)

-- Flight information
flights (
  id, airline_id, origin, destination,
  date, time, total_seats, available_seats,
  price_base, price_tax
)

-- Airline information
airlines (
  id, name, sdt, email, country
)

-- Passenger information
passengers (
  id, name, dob, nationality, passport,
  email, phonenumber, created_at, updated_at
)

-- Junction table linking bookings, passengers, and seats
booking_passengers (
  booking_pax_id, booking_id, passenger_id,
  seat_id, e_ticket_number
)

-- Seat assignments
seats (
  id, flight_id, seat_number, class,
  is_available, price
)
```

## Type Definitions

### BookingWithDetails

**Location:** `src/features/bookings/api/queries.ts`

```typescript
export interface BookingWithDetails {
  id: number;
  pnr: string;
  bookingStatus: "pending" | "confirmed" | "failed";
  paymentStatus: "pending" | "paid" | "failed";
  amountPaid: string;
  createdAt: Date;
  flight: {
    id: number;
    flightNumber: string;
    airline: string;
    origin: string;
    destination: string;
    date: string;
    time: string;
  };
  passengers: Array<{
    id: number;
    name: string;
    email: string | null;
    phoneNumber: string | null;
    seatNumber: string;
    eTicketNumber: string | null;
  }>;
}
```

## UI States

### Loading State
- Displays centered loading spinner
- Shows "Loading your bookings..." message
- Prevents interaction during data fetch

### Error State
- Red-themed error banner
- Error icon
- Error message from API
- User-friendly fallback message

### Empty State
- Large ticket icon
- "No bookings yet" heading
- Descriptive message
- Call-to-action button to search flights

### Success State
- List of BookingCard components
- Each card shows booking summary
- Expandable to show passenger details
- Responsive grid layout

## Performance Optimizations

### Caching Strategy
- React Query caches responses for 1 minute
- Reduces unnecessary API calls
- Automatic background refetching
- Cache invalidation on mutations

### Data Loading
- Single API call fetches all bookings
- Parallel enrichment of booking data
- Efficient database queries with proper joins

### Component Optimization
- Lazy expansion of passenger details
- Conditional rendering based on state
- Memoized components where appropriate

## Error Handling

### API Level
```typescript
try {
  const bookingsResult = await bookingsService.getUserBookings(user.id);
  if (!bookingsResult.ok) {
    return errorResponse(bookingsResult.error);
  }
  return successResponse(bookingsResult.value);
} catch (error) {
  return internalErrorResponse();
}
```

### Service Level
```typescript
try {
  const bookings = await bookingsRepository.findBookingsByUserId(userId);
  const enrichedBookings = await enrichBookings(bookings);
  return ok(enrichedBookings);
} catch (error) {
  console.error("Error fetching user bookings:", error);
  return err(errors.internalError("Failed to fetch bookings"));
}
```

### UI Level
```typescript
const { data, isLoading, isError, error } = useUserBookingsQuery();

if (isError) {
  return <ErrorState error={error} />;
}
```

## Security Considerations

### Authentication
- All endpoints protected with `protectedRoute` middleware
- User ID extracted from authenticated session
- Users can only see their own bookings

### Authorization
- Bookings filtered by userId in database query
- No way to access other users' bookings
- PNR codes are unique but not guessable

### Data Privacy
- Sensitive passenger data only shown to booking owner
- E-ticket numbers displayed securely
- No PII exposed in URLs or logs

## Testing Strategy

### Unit Tests
```typescript
describe('BookingsService.getUserBookings', () => {
  it('should return enriched bookings for user', async () => {
    const result = await bookingsService.getUserBookings('user_123');
    expect(result.ok).toBe(true);
    expect(result.value).toHaveLength(2);
    expect(result.value[0]).toHaveProperty('flight');
    expect(result.value[0]).toHaveProperty('passengers');
  });
});
```

### Integration Tests
```typescript
describe('GET /api/bookings', () => {
  it('should return user bookings when authenticated', async () => {
    const response = await fetch('/api/bookings', {
      headers: { Authorization: 'Bearer token' }
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

### E2E Tests
```typescript
test('user can view their bookings', async ({ page }) => {
  await page.goto('/my-bookings');
  await expect(page.locator('.booking-card')).toHaveCount(2);
  await page.click('button:has-text("Show passenger details")');
  await expect(page.locator('.passenger-info')).toBeVisible();
});
```

## Future Enhancements

### Planned Features
- [ ] Booking cancellation
- [ ] Booking modification
- [ ] Download e-tickets as PDF
- [ ] Email booking confirmation
- [ ] Filter bookings by status
- [ ] Sort bookings by date
- [ ] Search bookings by PNR
- [ ] Export booking history

### Performance Improvements
- [ ] Implement pagination for large booking lists
- [ ] Add virtual scrolling for better performance
- [ ] Optimize database queries with proper indexes
- [ ] Implement server-side filtering

### UX Improvements
- [ ] Add booking timeline view
- [ ] Show flight status updates
- [ ] Add check-in functionality
- [ ] Implement booking reminders
- [ ] Add calendar integration

## Troubleshooting

### Common Issues

**Issue:** Bookings not loading
- Check authentication token
- Verify API endpoint is accessible
- Check browser console for errors
- Verify database connection

**Issue:** Missing passenger details
- Check booking_passengers junction table
- Verify foreign key relationships
- Check data enrichment logic

**Issue:** Incorrect flight information
- Verify flight_id references
- Check airline_id relationships
- Validate date/time formats

## Related Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Overall project architecture
- [DATA_FLOW.md](./DATA_FLOW.md) - Complete data flow documentation
- [FLIGHT_SEARCH_DATA_FLOW.md](./FLIGHT_SEARCH_DATA_FLOW.md) - Flight search flow
