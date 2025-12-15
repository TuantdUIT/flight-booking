# Flight Search Data Flow Documentation

This document provides a comprehensive overview of how data flows through the flight search system, from clicking "Search Flights" button to displaying results.

## Architecture Overview

```
UI Component (HeroSearch)
    ↓
Client-Side Validation (Zod)
    ↓
API Hook (React Query)
    ↓
HTTP Client (Axios)
    ↓
API Route (Next.js)
    ↓
Server-Side Validation (Zod)
    ↓
Service Layer
    ↓
Repository Layer
    ↓
Database (PostgreSQL via Drizzle ORM)
    ↓
... (reverse flow)
    ↓
UI Component (Display Results)
```

---

## Complete Flow Example: Flight Search

This section demonstrates the complete data flow for searching flights, from user interaction to database query and response.

### 1. UI Layer - Hero Search Component

**File:** `src/app/(protected)/sections/hero-search.tsx`

**User Action:** User fills search form and clicks "Search Flights" button

```typescript
const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Step 1: Client-side validation
  if (!validateSearch()) return;

  // Step 2: Set loading states
  propSetIsSearching(true);
  setHasSearched(false);

  try {
    // Step 3: Trigger React Query refetch
    const { data } = await refetch();
    
    // Step 4: Update UI state with results
    setSearchParams(searchForm);
    setSearchResults(data || []);
    setHasSearched(true);
  } catch (error) {
    console.error("Search failed:", error);
    setSearchResults([]);
    setHasSearched(true);
  } finally {
    propSetIsSearching(false);
  }
};
```

**Search form state:**
```json
{
  "origin": "JFK",
  "destination": "LAX",
  "departureDate": "2025-12-20",
  "passengers": 2
}
```

**What happens:**
- User fills in origin, destination, departure date, and passenger count
- Form validation runs on submit
- Loading spinner appears on button
- React Query hook is triggered to fetch data

---

### 2. Client-Side Validation Layer

**File:** `src/app/(protected)/sections/hero-search.tsx`

**Purpose:** Validate user input before making API call

```typescript
const validateSearch = (): boolean => {
  // Use Zod schema to validate
  const result = flightSearchSchema.safeParse(searchForm);

  if (!result.success) {
    // Extract and display errors
    const newErrors: SearchErrors = {};
    result.error.errors.forEach((error) => {
      const path = error.path[0] as keyof SearchErrors;
      newErrors[path] = error.message;
    });
    setErrors(newErrors);
    return false;
  }

  setErrors({});
  return true;
};
```

**Validation checks:**
- ✅ Origin is not empty
- ✅ Destination is not empty
- ✅ Origin ≠ Destination
- ✅ Departure date is not empty
- ✅ Departure date is not in the past
- ✅ Passengers between 1-9

**If validation fails:**
```json
{
  "origin": "Please select an origin",
  "destination": "Origin and destination cannot be the same"
}
```

**UI displays:** Red error messages under each invalid field

---

### 3. API Hook Layer - React Query

**File:** `src/features/flights/api/queries.ts`

**Purpose:** Manages API calls with caching, loading states, and error handling

```typescript
export function useSearchFlightsQuery(searchParams: SearchParams, enabled = false) {
  return useQuery({
    queryKey: ["flights", "search", searchParams],
    queryFn: async (): Promise<Flight[]> => {
      // Build query string
      const params = new URLSearchParams({
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        passengers: String(searchParams.passengers),
      });
      
      // Make HTTP GET request
      const flights = await httpClient.get<Flight[]>(
        `/flights/search?${params.toString()}`
      );
      return flights as unknown as Flight[];
    },
    enabled, // Only run when explicitly enabled
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for search results)
  });
}
```

**What happens:**
- React Query creates a unique cache key based on search parameters
- Query is disabled by default (`enabled = false`)
- When `refetch()` is called from UI, query executes
- Provides `isFetching` state for loading spinner
- Caches results for 2 minutes
- Automatically retries on network errors

**Query key example:**
```json
["flights", "search", {
  "origin": "JFK",
  "destination": "LAX",
  "departureDate": "2025-12-20",
  "passengers": 2
}]
```

---

### 4. HTTP Client Layer - Axios

**File:** `src/core/lib/http/index.ts`

**Purpose:** Centralized HTTP client with interceptors for authentication and response handling

```typescript
const httpClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - adds authentication
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Response interceptor - unwraps API response
httpClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const apiResponse = response.data;

    if (apiResponse.success) {
      // Return just the data for successful responses
      return apiResponse.data;
    } else {
      // Throw an ApiError for failed responses
      throw new ApiError(apiResponse.error, apiResponse.meta);
    }
  }
);
```

**Request sent:**
```
GET /api/flights/search?origin=JFK&destination=LAX&departureDate=2025-12-20&passengers=2
Content-Type: application/json
Authorization: Bearer <token>
```

**What happens:**
- Axios builds the full URL with query parameters
- Request interceptor adds authentication token
- Response interceptor unwraps the API response structure
- If `success: true`, returns just the `data` field
- If `success: false`, throws an `ApiError` with details

---

### 5. API Route Layer - Next.js Route Handler

**File:** `src/app/api/flights/search/route.ts`

**Purpose:** Entry point for API requests, handles validation and routing

```typescript
export async function GET(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    // STEP 1: Extract search params from URL query string
    const { searchParams } = new URL(request.url);
    
    const searchData = {
      origin: searchParams.get("origin") || "",
      destination: searchParams.get("destination") || "",
      departureDate: searchParams.get("departureDate") || "",
      passengers: Number(searchParams.get("passengers")) || 0,
    };

    // STEP 2: Server-side validation with Zod
    const parseResult = flightSearchSchema.safeParse(searchData);

    if (!parseResult.success) {
      const response = toJsonResponse(
        {
          ok: false,
          error: errors.validationError("Invalid search parameters", {
            issues: parseResult.error.issues,
          }),
        },
        { requestId },
      );

      return new NextResponse(response.body, {
        status: response.status,
        headers: response.headers,
      });
    }

    // STEP 3: Call service layer with validated data
    const result = await flightsService.searchFlights(parseResult.data);
    
    // STEP 4: Format and return response
    const response = toJsonResponse(result, { requestId });

    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error("Error in flight search:", error);

    const response = toJsonResponse(
      { ok: false, error: errors.internalError("Failed to process request") },
      { requestId },
    );

    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }
}
```

**Data flow:**
1. Parse URL query parameters
2. Validate with Zod schema (server-side)
3. Call service layer
4. Format response with request ID
5. Return JSON response

**Parsed search data:**
```json
{
  "origin": "JFK",
  "destination": "LAX",
  "departureDate": "2025-12-20",
  "passengers": 2
}
```

---

### 6. Server-Side Validation Layer - Zod Schema

**File:** `src/features/flights/validations/flight-search.ts`

**Purpose:** Type-safe validation of search parameters (used both client and server)

```typescript
export const flightSearchSchema = z
  .object({
    origin: z.string().min(1, { message: "Please select an origin" }),
    destination: z.string().min(1, { message: "Please select a destination" }),
    departureDate: z
      .string()
      .min(1, { message: "Please select a departure date" }),
    passengers: z
      .number()
      .int()
      .min(1, { message: "At least one passenger is required" })
      .max(9, { message: "Please select between 1 and 9 passengers" }),
  })
  .refine((data) => data.origin !== data.destination, {
    message: "Origin and destination cannot be the same",
    path: ["destination"],
  })
  .refine(
    (data) => {
      const selectedDate = dayjs(data.departureDate);
      const today = dayjs().startOf("day");
      return selectedDate.isAfter(today) || selectedDate.isSame(today, "day");
    },
    {
      message: "Departure date cannot be in the past",
      path: ["departureDate"],
    },
  );

export type FlightSearchSchema = z.infer<typeof flightSearchSchema>;
```

**Validation rules:**
1. ✅ Origin: non-empty string
2. ✅ Destination: non-empty string
3. ✅ Origin ≠ Destination (custom refinement)
4. ✅ Departure date: non-empty string
5. ✅ Departure date: not in the past (custom refinement with dayjs)
6. ✅ Passengers: integer between 1-9

**If validation fails:**
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid search parameters",
    "details": {
      "issues": [
        {
          "path": ["destination"],
          "message": "Origin and destination cannot be the same"
        }
      ]
    }
  }
}
```

---

### 7. Service Layer - Business Logic

**File:** `src/features/flights/services/flights.service.ts`

**Purpose:** Orchestrates business logic, coordinates repository calls

```typescript
searchFlights: async (
  params: FlightSearchSchema,
): Promise<Result<FlightWithAirline[]>> => {
  try {
    const { origin, destination, passengers } = params;

    // STEP 1: Search flights by origin and destination
    const flights = await flightsRepository.searchFlights(
      origin,
      destination,
    );

    // STEP 2: Filter flights with enough available seats
    const availableFlights = flights.filter(
      (flight) => flight.availableSeats >= passengers,
    );

    // STEP 3: Enrich with airline information
    const enrichedFlights: FlightWithAirline[] = await Promise.all(
      availableFlights.map(async (flight) => {
        // Fetch airline details
        const airline = flight.airlineId
          ? await flightsRepository.findAirlineById(flight.airlineId)
          : null;

        // Build enriched flight object
        return {
          id: flight.id,
          flightNumber: `FL-${flight.id}`,
          airline: airline?.name ?? "Unknown Airline",
          origin: flight.origin,
          destination: flight.destination,
          date: flight.date,
          time: flight.time,
          totalSeats: flight.totalSeats,
          availableSeats: flight.availableSeats,
          priceBase: flight.priceBase,
          priceTax: flight.priceTax,
        };
      }),
    );

    // STEP 4: Return success result
    return Result.ok(enrichedFlights);
  } catch (error) {
    console.error("Error searching flights:", error);
    return Result.failed(errors.internalError("Failed to search flights"));
  }
}
```

**Business logic performed:**
1. ✅ Query database for matching flights
2. ✅ Filter by seat availability
3. ✅ Fetch airline details for each flight
4. ✅ Enrich flight data with airline name
5. ✅ Format flight number
6. ✅ Return structured result

**Service response:**
```json
{
  "ok": true,
  "value": [
    {
      "id": 1,
      "flightNumber": "FL-1",
      "airline": "American Airlines",
      "origin": "JFK",
      "destination": "LAX",
      "date": "2025-12-20",
      "time": "08:00",
      "totalSeats": 180,
      "availableSeats": 45,
      "priceBase": "299.00",
      "priceTax": "45.00"
    },
    {
      "id": 5,
      "flightNumber": "FL-5",
      "airline": "Delta Airlines",
      "origin": "JFK",
      "destination": "LAX",
      "date": "2025-12-20",
      "time": "14:30",
      "totalSeats": 200,
      "availableSeats": 67,
      "priceBase": "325.00",
      "priceTax": "48.75"
    }
  ]
}
```

---

### 8. Repository Layer - Database Operations

**File:** `src/features/flights/repository/index.ts`

**Purpose:** Direct database access using Drizzle ORM

```typescript
searchFlights: async (origin: string, destination: string) => {
  return await db
    .select()
    .from(flights)
    .where(
      and(
        eq(flights.origin, origin), 
        eq(flights.destination, destination)
      ),
    );
},

findAirlineById: async (id: number) => {
  const airline = await db
    .select()
    .from(airlines)
    .where(eq(airlines.id, id));
  return airline[0] || null;
},
```

**SQL Generated:**
```sql
-- Search flights by route
SELECT * FROM flights 
WHERE origin = 'JFK' AND destination = 'LAX';

-- Get airline details (called for each flight)
SELECT * FROM airlines WHERE id = 1;
SELECT * FROM airlines WHERE id = 2;
```

**What happens:**
- Drizzle ORM builds type-safe SQL queries
- Uses parameterized queries to prevent SQL injection
- Returns raw database records
- Repository maps database types to TypeScript types

---

### 9. Database Layer - PostgreSQL

**Schema:** `src/infrastructure/db/schema.ts`

**Tables involved in search:**

```sql
-- flights table
CREATE TABLE flights (
  id SERIAL PRIMARY KEY,
  airline_id INTEGER REFERENCES airlines(id),
  origin VARCHAR(3) NOT NULL,
  destination VARCHAR(3) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  price_base DECIMAL(10,2) NOT NULL,
  price_tax DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- airlines table
CREATE TABLE airlines (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(3) UNIQUE NOT NULL,
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_flights_route ON flights(origin, destination);
CREATE INDEX idx_flights_date ON flights(date);
CREATE INDEX idx_flights_airline ON flights(airline_id);
```

**Query execution:**
```sql
-- Main search query
SELECT 
  id, airline_id, origin, destination, date, time,
  total_seats, available_seats, price_base, price_tax
FROM flights
WHERE origin = 'JFK' AND destination = 'LAX';

-- Results (example):
-- id | airline_id | origin | destination | date       | time  | total_seats | available_seats | price_base | price_tax
-- 1  | 1          | JFK    | LAX         | 2025-12-20 | 08:00 | 180         | 45              | 299.00     | 45.00
-- 5  | 2          | JFK    | LAX         | 2025-12-20 | 14:30 | 200         | 67              | 325.00     | 48.75
```

---

## Response Flow (Back to UI)

### 10. Service → API Route

**Service returns:**
```typescript
{
  ok: true,
  value: [
    {
      id: 1,
      flightNumber: "FL-1",
      airline: "American Airlines",
      origin: "JFK",
      destination: "LAX",
      date: "2025-12-20",
      time: "08:00",
      totalSeats: 180,
      availableSeats: 45,
      priceBase: "299.00",
      priceTax: "45.00"
    }
  ]
}
```

### 11. API Route → HTTP Response

**File:** `src/app/api/flights/search/route.ts`

```typescript
const result = await flightsService.searchFlights(parseResult.data);
const response = toJsonResponse(result, { requestId });

return new NextResponse(response.body, {
  status: response.status,
  headers: response.headers,
});
```

**HTTP Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000

{
  "success": true,
  "data": [
    {
      "id": 1,
      "flightNumber": "FL-1",
      "airline": "American Airlines",
      "origin": "JFK",
      "destination": "LAX",
      "date": "2025-12-20",
      "time": "08:00",
      "totalSeats": 180,
      "availableSeats": 45,
      "priceBase": "299.00",
      "priceTax": "45.00"
    }
  ],
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-12-15T10:30:00.000Z"
  }
}
```

### 12. HTTP Client → React Query

**File:** `src/core/lib/http/index.ts`

```typescript
// Response interceptor unwraps the response
httpClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const apiResponse = response.data;

    if (apiResponse.success) {
      // Return just the data array
      return apiResponse.data;
    }
  }
);
```

**React Query receives:**
```typescript
[
  {
    id: 1,
    flightNumber: "FL-1",
    airline: "American Airlines",
    // ... rest of flight data
  }
]
```

### 13. React Query → UI Component

**File:** `src/app/(protected)/sections/hero-search.tsx`

```typescript
const { data } = await refetch();

// Update UI state
setSearchParams(searchForm);
setSearchResults(data || []);
setHasSearched(true);
propSetIsSearching(false);
```

**UI Updates:**
1. ✅ Loading spinner disappears
2. ✅ Search results displayed in flight cards
3. ✅ "No flights found" message if empty
4. ✅ Each flight shows:
   - Airline name and flight number
   - Route (origin → destination)
   - Date and time
   - Available seats
   - Price (base + tax)
5. ✅ Results cached for 2 minutes

---

## Error Handling Flow

### Scenario 1: Validation Error (Client-Side)

```
UI (Invalid Data)
    ↓
Client Validation (FAILS)
    ↓
UI (Shows error messages)
    ↓
(No API call made)
```

**Example:** User selects same origin and destination

**UI displays:**
```
Destination field: "Origin and destination cannot be the same"
```

### Scenario 2: Validation Error (Server-Side)

```
UI (Bypassed client validation)
    ↓
API Route (Receives request)
    ↓
Server Validation (FAILS)
    ↓
API Route (Returns 400 error)
    ↓
HTTP Client (Throws ApiError)
    ↓
React Query (Catches error)
    ↓
UI (Displays error toast)
```

**Error response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid search parameters",
    "details": {
      "issues": [...]
    }
  },
  "meta": {
    "requestId": "...",
    "timestamp": "...",
    "retryable": false
  }
}
```

### Scenario 3: No Flights Found

```
UI (Valid Data)
    ↓
API Route (Validates ✓)
    ↓
Service Layer (Searches database)
    ↓
Repository (Returns empty array)
    ↓
Service (Returns success with empty array)
    ↓
UI (Shows "No flights found" message)
```

**Service response:**
```json
{
  "ok": true,
  "value": []
}
```

**UI handling:**
```typescript
if (data.length === 0) {
  // Display "No flights found for your search" message
}
```

### Scenario 4: Database Error

```
UI (Valid Data)
    ↓
API Route (Validates ✓)
    ↓
Service Layer
    ↓
Repository (Database connection fails)
    ↓
Service (Catches error, returns failed result)
    ↓
API Route (Returns 500 error)
    ↓
UI (Shows error toast)
```

**Service error:**
```typescript
return Result.failed(errors.internalError("Failed to search flights"));
```

**HTTP Response:**
```
HTTP/1.1 500 Internal Server Error

{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to search flights"
  }
}
```

---

## Data Flow Patterns

### Pattern 1: Query with URL Parameters

```
UI Component
    ↓ Build query params
React Query (useQuery with enabled=false)
    ↓ Manual refetch()
HTTP Client (GET with query string)
    ↓ /api/flights/search?origin=JFK&destination=LAX&...
API Route (Parse URL params)
    ↓ Validate
Service Layer
    ↓ Business logic
Repository
    ↓ SQL SELECT with WHERE clause
Database
    ↓ Returns matching rows
... (reverse flow)
    ↓
UI Component (Renders flight cards)
```

### Pattern 2: Dual Validation (Client + Server)

```
Client-Side Validation (Zod)
    ↓ Prevents unnecessary API calls
    ↓ Provides instant feedback
    ↓
Server-Side Validation (Same Zod schema)
    ↓ Security layer
    ↓ Handles direct API calls
    ↓ Ensures data integrity
```

### Pattern 3: Data Enrichment

```
Repository (Returns raw flight data)
    ↓
Service Layer
    ↓ For each flight:
    ↓   - Fetch airline details
    ↓   - Format flight number
    ↓   - Calculate total price
    ↓
API Route (Returns enriched data)
```

---

## Key Architectural Decisions

### 1. React Query with Manual Refetch
```typescript
const { refetch, isFetching } = useSearchFlightsQuery(searchForm, false);
```
**Benefits:**
- Query doesn't run automatically
- User controls when search happens
- Prevents unnecessary API calls on mount
- Provides loading state (`isFetching`)

### 2. URL Query Parameters (GET Request)
```
GET /api/flights/search?origin=JFK&destination=LAX&departureDate=2025-12-20&passengers=2
```
**Benefits:**
- RESTful design
- Cacheable by browsers/CDNs
- Shareable URLs (future feature)
- Idempotent operation

### 3. Dual Validation (Client + Server)
**Benefits:**
- Better UX (instant feedback)
- Security (server validates everything)
- Shared schema (DRY principle)
- Type safety

### 4. Data Enrichment in Service Layer
**Benefits:**
- Repository stays simple (raw data)
- Service adds business logic
- API returns complete data
- UI doesn't need multiple requests

### 5. Result Type Pattern
```typescript
type Result<T> = 
  | { ok: true; value: T }
  | { ok: false; error: Error };
```
**Benefits:**
- Type-safe error handling
- No thrown exceptions in business logic
- Explicit error states
- Easy to test

---

## Performance Considerations

### Caching Strategy
- **React Query cache:** 2 minutes for search results
- **Query key includes all params:** Different searches cached separately
- **Stale-while-revalidate:** Shows cached data while fetching fresh

### Database Optimization
- **Indexes on route columns:** `(origin, destination)`
- **Composite index:** Speeds up WHERE clauses
- **Selective field fetching:** Only needed columns

### N+1 Query Problem
**Current implementation:**
```typescript
// ⚠️ Potential issue: One query per flight for airline
for (const flight of flights) {
  const airline = await flightsRepository.findAirlineById(flight.airlineId);
}
```

**Optimization opportunity:**
```typescript
// ✅ Better: Single query with JOIN
SELECT flights.*, airlines.name as airline_name
FROM flights
LEFT JOIN airlines ON flights.airline_id = airlines.id
WHERE flights.origin = ? AND flights.destination = ?;
```

### Loading States
- **Button disabled during search:** Prevents duplicate requests
- **Loading spinner:** Visual feedback
- **Optimistic UI:** Could show skeleton cards while loading

---

## Testing Strategy

### Unit Tests

**Validation:**
```typescript
describe('flightSearchSchema', () => {
  it('should reject same origin and destination', () => {
    const result = flightSearchSchema.safeParse({
      origin: 'JFK',
      destination: 'JFK',
      departureDate: '2025-12-20',
      passengers: 1
    });
    expect(result.success).toBe(false);
  });
});
```

**Service Layer:**
```typescript
describe('flightsService.searchFlights', () => {
  it('should filter flights by seat availability', async () => {
    // Mock repository
    // Test filtering logic
  });
});
```

### Integration Tests

**API Route:**
```typescript
describe('GET /api/flights/search', () => {
  it('should return flights matching search criteria', async () => {
    const response = await fetch(
      '/api/flights/search?origin=JFK&destination=LAX&departureDate=2025-12-20&passengers=2'
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

### E2E Tests

**Complete User Journey:**
```typescript
test('user can search for flights', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('[name="origin"]', 'JFK');
  await page.selectOption('[name="destination"]', 'LAX');
  await page.fill('[name="departureDate"]', '2025-12-20');
  await page.selectOption('[name="passengers"]', '2');
  await page.click('button:has-text("Search Flights")');
  
  await expect(page.locator('.flight-card')).toHaveCount(2);
});
```

---

## Summary

The flight search system follows a clean, layered architecture:

1. **UI Layer**: React component with form state management
2. **Client Validation**: Zod schema for instant feedback
3. **API Hook Layer**: React Query for caching and state management
4. **HTTP Client**: Axios with interceptors for auth and response handling
5. **API Route**: Next.js route handler with server-side validation
6. **Service Layer**: Business logic and data enrichment
7. **Repository Layer**: Database access abstraction
8. **Database Layer**: PostgreSQL with indexed queries

**Key Features:**
- ✅ Dual validation (client + server)
- ✅ Type-safe end-to-end
- ✅ Automatic caching
- ✅ Loading states
- ✅ Error handling
- ✅ Data enrichment
- ✅ RESTful design
- ✅ Performance optimized

**Data Flow Summary:**
```
User clicks "Search Flights"
    → Client validation
    → React Query refetch
    → HTTP GET with query params
    → Server validation
    → Database query (origin + destination)
    → Filter by seat availability
    → Enrich with airline data
    → Return formatted results
    → Cache in React Query
    → Display flight cards
```
