# Feature Module Structure Guide

## Overview

This document explains the structure of feature modules in the application and provides a standard template for creating new features.

## Current Feature Modules

The application currently has the following feature modules:

```
src/features/
├── auth/          # Authentication & authorization
├── bookings/      # Flight bookings management
├── flights/       # Flight search & display
├── passengers/    # Passenger information
├── seats/         # Seat selection & management
└── tickets/       # Ticket generation & download
```

---

## Feature Module Anatomy

Each feature module follows a consistent structure with specific responsibilities for each folder:

```
src/features/{feature-name}/
├── api/              # React Query hooks (Frontend ↔ API)
├── components/       # React components specific to this feature
├── hooks/            # Custom React hooks
├── repository/       # Database operations (Backend)
├── services/         # Business logic (Backend)
├── store/            # State management (Zustand/Redux)
├── utils/            # Utility functions
├── validations/      # Zod schemas for validation
└── types.ts          # TypeScript type definitions
```

---

## Layer-by-Layer Breakdown

### 1. **`api/` - Frontend Data Layer**

**Purpose:** React Query hooks for API communication

**Responsibilities:**
- Define query hooks for GET operations
- Define mutation hooks for POST/PUT/DELETE operations
- Manage query keys for cache invalidation
- Handle loading and error states

**Structure:**
```
api/
├── index.ts          # Public exports
├── queries.ts        # Query hooks (GET)
├── mutations.ts      # Mutation hooks (POST/PUT/DELETE)
├── README.md         # API documentation
└── EXAMPLES.md       # Usage examples
```

**Example (Bookings):**
```typescript
// queries.ts
export function useBookingsQuery() {
  return useQuery({
    queryKey: bookingKeys.lists(),
    queryFn: async () => {
      return await httpClient.get<BookingSummary[]>("/bookings");
    },
    staleTime: 2 * 60 * 1000,
  });
}

// mutations.ts
export function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateBookingSchema) => {
      return await httpClient.post<CreateBookingResult>("/bookings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}
```

**When to use:**
- ✅ Frontend components need to fetch/mutate data
- ✅ Need automatic caching and refetching
- ✅ Want loading/error states handled automatically

---

### 2. **`components/` - UI Components**

**Purpose:** React components specific to the feature

**Responsibilities:**
- Render UI elements
- Handle user interactions
- Use hooks from `api/` and `hooks/`
- Emit events to parent components

**Structure:**
```
components/
├── index.ts                    # Public exports
├── {feature}-card.tsx          # Card component
├── {feature}-list.tsx          # List component
├── {feature}-form.tsx          # Form component
└── {feature}-details.tsx       # Details component
```

**Example (Seats):**
```typescript
// seat-map.tsx
export function SeatMap({ seats, onSeatClick }) {
  return (
    <div className="seat-map">
      {seats.map(seat => (
        <Seat 
          key={seat.id} 
          seat={seat} 
          onClick={() => onSeatClick(seat)} 
        />
      ))}
    </div>
  );
}

// index.ts
export { SeatMap } from "./seat-map";
export { SelectionSummary } from "./selection-summary";
```

**Best Practices:**
- Keep components small and focused
- Use composition over inheritance
- Export through `index.ts` for clean imports
- Co-locate styles if using CSS modules

---

### 3. **`hooks/` - Custom React Hooks**

**Purpose:** Reusable React hooks for the feature

**Responsibilities:**
- Encapsulate complex logic
- Share stateful logic between components
- Integrate with external APIs or services

**Structure:**
```
hooks/
├── index.ts              # Public exports
├── use-{feature}.ts      # Main feature hook
└── use-{specific}.ts     # Specific functionality hooks
```

**Example (Seats):**
```typescript
// use-seats.ts
export function useSeats(flightId: number | null) {
  return useQuery({
    queryKey: ["seats", flightId],
    queryFn: async () => {
      if (!flightId) return [];
      const response = await fetch(`/api/seats?flightId=${flightId}`);
      return response.json();
    },
    enabled: !!flightId,
  });
}

// index.ts
export { useSeats } from "./use-seats";
```

**When to use:**
- ✅ Logic is reused across multiple components
- ✅ Need to manage complex state
- ✅ Want to separate concerns from UI

---

### 4. **`repository/` - Database Layer (Backend)**

**Purpose:** Direct database operations using Drizzle ORM

**Responsibilities:**
- CRUD operations on database tables
- Complex queries and joins
- Transaction management
- Data transformation

**Structure:**
```
repository/
└── index.ts              # All repository functions
```

**Example (Bookings):**
```typescript
// index.ts
export const bookingsRepository = {
  findBookingById: async (id: number) => {
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
    return booking[0] || null;
  },

  createBooking: async (bookingData: typeof bookings.$inferInsert) => {
    const [newBooking] = await db
      .insert(bookings)
      .values(bookingData)
      .returning();
    return newBooking;
  },

  updateBooking: async (id: number, data: Partial<typeof bookings.$inferInsert>) => {
    return await atomic(async (tx) => {
      const [updated] = await tx
        .update(bookings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(bookings.id, id))
        .returning();
      return updated;
    });
  },
};
```

**Best Practices:**
- Use transactions for multi-step operations
- Return typed results
- Handle errors gracefully
- Use the `atomic()` wrapper for transactions

---

### 5. **`services/` - Business Logic Layer (Backend)**

**Purpose:** Business logic and orchestration

**Responsibilities:**
- Coordinate between repositories
- Implement business rules
- Handle complex workflows
- Validate business constraints

**Structure:**
```
services/
└── {feature}.service.ts
```

**Example (Bookings):**
```typescript
// bookings.service.ts
export class BookingsService {
  async createBooking(bookingData: CreateBookingSchema & { userId: string }) {
    try {
      // 1. Validate flight availability
      const flight = await flightsRepository.findFlightById(bookingData.flightId);
      if (!flight) {
        return err(errors.notFound("Flight not found"));
      }

      // 2. Check seat availability
      if (flight.availableSeats < bookingData.passengers.length) {
        return err(errors.validationError("Not enough seats"));
      }

      // 3. Create booking in transaction
      const result = await atomic(async (tx) => {
        // Create passengers
        // Create booking
        // Link passengers to booking
        // Update seat availability
      });

      return ok(result);
    } catch (error) {
      return err(errors.internalError("Failed to create booking"));
    }
  }
}

export const bookingsService = new BookingsService();
```

**Best Practices:**
- Use Result pattern for error handling
- Keep services stateless
- Use dependency injection when needed
- Document complex business logic

---

### 6. **`store/` - State Management**

**Purpose:** Client-side state management (Zustand/Redux)

**Responsibilities:**
- Manage global/shared state
- Provide actions to update state
- Persist state if needed

**Structure:**
```
store/
└── index.ts              # Store definition
```

**Example (Seats):**
```typescript
// index.ts
import { create } from "zustand";

interface SeatSelectionState {
  selectedSeats: Seat[];
  toggleSeat: (seat: Seat) => void;
  removeSeat: (seatId: number) => void;
  clearSelection: () => void;
}

export const useSeatSelectionStore = create<SeatSelectionState>((set) => ({
  selectedSeats: [],
  
  toggleSeat: (seat) => set((state) => {
    const exists = state.selectedSeats.find(s => s.id === seat.id);
    if (exists) {
      return { selectedSeats: state.selectedSeats.filter(s => s.id !== seat.id) };
    }
    return { selectedSeats: [...state.selectedSeats, seat] };
  }),
  
  removeSeat: (seatId) => set((state) => ({
    selectedSeats: state.selectedSeats.filter(s => s.id !== seatId)
  })),
  
  clearSelection: () => set({ selectedSeats: [] }),
}));
```

**When to use:**
- ✅ State needs to be shared across multiple components
- ✅ State persists across route changes
- ✅ Complex state updates

---

### 7. **`validations/` - Schema Validation**

**Purpose:** Zod schemas for data validation

**Responsibilities:**
- Define validation schemas
- Type inference
- Error messages

**Structure:**
```
validations/
├── create-{feature}.ts
├── update-{feature}.ts
└── {feature}-search.ts
```

**Example (Bookings):**
```typescript
// create-booking.ts
import { z } from "zod";

export const createBookingSchema = z.object({
  flightId: z.string().min(1, { message: "Flight ID is required" }),
  passengers: z.array(
    z.object({
      firstName: z.string().min(1, { message: "First name is required" }),
      lastName: z.string().min(1, { message: "Last name is required" }),
      email: z.string().email(),
      phone: z.string().min(1, { message: "Phone number is required" }),
    })
  ),
  paymentInfo: z.object({
    cardNumber: z.string().min(1),
    expiryDate: z.string().min(1),
    cvv: z.string().min(1),
  }),
});

export type CreateBookingSchema = z.infer<typeof createBookingSchema>;
```

**Best Practices:**
- Use descriptive error messages
- Export both schema and inferred type
- Reuse common schemas
- Validate on both frontend and backend

---

### 8. **`utils/` - Utility Functions**

**Purpose:** Helper functions specific to the feature

**Responsibilities:**
- Data transformation
- Formatting
- Calculations
- Pure functions

**Structure:**
```
utils/
├── index.ts
├── formatters.ts
├── validators.ts
└── helpers.ts
```

**Example:**
```typescript
// formatters.ts
export function formatSeatNumber(row: number, column: string): string {
  return `${row}${column}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price);
}

// validators.ts
export function isValidSeatNumber(seatNumber: string): boolean {
  return /^\d+[A-F]$/.test(seatNumber);
}
```

---

### 9. **`types.ts` - Type Definitions**

**Purpose:** TypeScript types and interfaces

**Responsibilities:**
- Define domain models
- Define DTOs (Data Transfer Objects)
- Define enums and constants

**Example (Bookings):**
```typescript
// types.ts
export type PaymentStatus = "pending" | "paid" | "failed";
export type BookingStatus = "pending" | "confirmed" | "failed";

export interface CreateBookingResult {
  bookingId: number;
  pnr: string;
  status: BookingStatus;
  totalAmount: number;
  passengersCount: number;
}

export interface BookingSummary {
  id: number;
  pnr: string;
  userId: string;
  flightId: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  passengers: BookingPassenger[];
}
```

---

## Data Flow Architecture

### Frontend → Backend Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Component                                                   │
│     ↓                                                        │
│  Hook (api/queries.ts or api/mutations.ts)                  │
│     ↓                                                        │
│  httpClient (axios)                                          │
│     ↓                                                        │
│  HTTP Request                                                │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  API Route (/app/api/{feature}/route.ts)                    │
│     ↓                                                        │
│  Validation (Zod schema)                                     │
│     ↓                                                        │
│  Service (services/{feature}.service.ts)                     │
│     ↓                                                        │
│  Repository (repository/index.ts)                            │
│     ↓                                                        │
│  Database (Drizzle ORM)                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Component State Flow

```
┌──────────────────────────────────────────────────────────┐
│  Component                                                │
│    ↓                                                      │
│  Local State (useState)                                   │
│    ↓                                                      │
│  Custom Hook (hooks/use-{feature}.ts)                     │
│    ↓                                                      │
│  Global Store (store/index.ts) [Optional]                │
│    ↓                                                      │
│  API Hook (api/queries.ts or api/mutations.ts)           │
└──────────────────────────────────────────────────────────┘
```

---

## Standard Feature Module Template

### Minimal Feature (Read-only)

```
src/features/{feature}/
├── api/
│   ├── index.ts
│   └── queries.ts
├── components/
│   ├── index.ts
│   └── {feature}-card.tsx
├── repository/
│   └── index.ts
├── services/
│   └── {feature}.service.ts
└── types.ts
```

### Full Feature (CRUD)

```
src/features/{feature}/
├── api/
│   ├── index.ts
│   ├── queries.ts
│   ├── mutations.ts
│   ├── README.md
│   └── EXAMPLES.md
├── components/
│   ├── index.ts
│   ├── {feature}-card.tsx
│   ├── {feature}-list.tsx
│   ├── {feature}-form.tsx
│   └── {feature}-details.tsx
├── hooks/
│   ├── index.ts
│   └── use-{feature}.ts
├── repository/
│   └── index.ts
├── services/
│   └── {feature}.service.ts
├── store/
│   └── index.ts
├── utils/
│   ├── index.ts
│   └── formatters.ts
├── validations/
│   ├── create-{feature}.ts
│   └── update-{feature}.ts
└── types.ts
```

---

## Feature Module Checklist

When creating a new feature module, ensure:

### Backend
- [ ] Database schema defined in `src/infrastructure/db/schema.ts`
- [ ] Repository with CRUD operations
- [ ] Service with business logic
- [ ] API routes in `src/app/api/{feature}/`
- [ ] Validation schemas (Zod)
- [ ] Type definitions

### Frontend
- [ ] React Query hooks (queries & mutations)
- [ ] UI components
- [ ] Custom hooks (if needed)
- [ ] State management (if needed)
- [ ] Types matching backend

### Documentation
- [ ] API documentation (README.md)
- [ ] Usage examples (EXAMPLES.md)
- [ ] Component documentation
- [ ] Type documentation

### Testing
- [ ] Unit tests for services
- [ ] Integration tests for API routes
- [ ] Component tests
- [ ] E2E tests for critical flows

---

## Best Practices Summary

### 1. **Separation of Concerns**
- Frontend code in `api/`, `components/`, `hooks/`, `store/`
- Backend code in `repository/`, `services/`
- Shared code in `types.ts`, `validations/`, `utils/`

### 2. **Type Safety**
- Define types in `types.ts`
- Use Zod for runtime validation
- Infer types from Zod schemas
- Share types between frontend and backend

### 3. **Error Handling**
- Use Result pattern in services
- Use ApiError in frontend
- Provide user-friendly error messages
- Log errors for debugging

### 4. **Code Organization**
- Export through `index.ts` files
- Keep files small and focused
- Use consistent naming conventions
- Group related functionality

### 5. **Performance**
- Use React Query for caching
- Implement optimistic updates
- Lazy load components
- Memoize expensive calculations

### 6. **Maintainability**
- Document complex logic
- Write self-documenting code
- Use TypeScript strictly
- Follow consistent patterns

---

## Example: Creating a New "Reviews" Feature

```bash
# 1. Create folder structure
mkdir -p src/features/reviews/{api,components,hooks,repository,services,validations}

# 2. Create files
touch src/features/reviews/types.ts
touch src/features/reviews/api/{index,queries,mutations}.ts
touch src/features/reviews/components/{index,review-card,review-list,review-form}.tsx
touch src/features/reviews/repository/index.ts
touch src/features/reviews/services/reviews.service.ts
touch src/features/reviews/validations/create-review.ts

# 3. Define database schema
# Add to src/infrastructure/db/schema.ts

# 4. Create repository
# Implement CRUD operations

# 5. Create service
# Implement business logic

# 6. Create API routes
# Add to src/app/api/reviews/

# 7. Create React Query hooks
# Implement queries and mutations

# 8. Create components
# Build UI components

# 9. Document
# Add README.md and EXAMPLES.md
```

---

## Conclusion

This structure provides:
- ✅ Clear separation of concerns
- ✅ Consistent patterns across features
- ✅ Type safety throughout the stack
- ✅ Easy to test and maintain
- ✅ Scalable architecture
- ✅ Developer-friendly organization

Follow this structure for all new features to maintain consistency and code quality across the application.
