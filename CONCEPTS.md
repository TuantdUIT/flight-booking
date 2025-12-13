# 🧠 Core Concepts

This guide explains the fundamental patterns and concepts used in this project. These are the "secret sauce" that makes professional applications reliable and maintainable.

## 🔧 Core Concepts (Explained Simply)

### Simple Error Handling (Instead of "Crashes")

Imagine you're building an app where users book flights. What happens if:
- The flight is full?
- The payment fails?
- The internet connection breaks?

**Without good error handling:** Your app crashes and users get confused 😱
**With good error handling:** Your app says "Sorry, that flight is full. Try another one!" 😊

#### The `Result<T, E>` Pattern (Think: Success or Failure Box)

This project uses a smart system (inspired by the Rust programming language) that forces you to handle BOTH success AND failure. It's safer than traditional "throw errors" approaches.

**Mental Model:** Think of it like a gift box 🎁 that can contain either:
- ✅ **Success**: The actual gift (your data)
- ❌ **Failure**: A note explaining what went wrong

##### Basic Usage Example

**Traditional Code (can crash):**
```javascript
function getFlight(id) {
  const flight = database.find(id);
  if (!flight) {
    throw new Error("Flight not found!"); // 🚨 CRASH!
  }
  return flight;
}

// Later in your code...
const flight = getFlight(123);
console.log(flight.name); // Might crash!
```

**Better Code (handles errors):**
```typescript
function getFlight(id): Result<Flight> {
  const flight = database.find(id);
  if (!flight) {
    return Result.failed("Flight not found"); // ✅ Safe!
  }
  return Result.ok(flight);
}

// Later in your code...
const result = getFlight(123);
if (result.ok) {
  console.log(result.value.name); // ✅ Always safe!
} else {
  console.log("Alert user:", result.error); // ✅ Handle gracefully!
}
```

**Why This Matters:** No more surprise crashes! Your code explicitly says "I know this can fail, and here's what I'll do about it."

⚡ **Pro Tip:** Think of `Result<T, E>` as a "gift with a return policy" - it always tells you what happened, good or bad! 🚀

---

### 🗄️ What is a Database Repository? (Think: "Safe File Cabinet")

Imagine your app needs to store and retrieve data (users, flights, bookings). The "Repository Pattern" is like a librarian who organizes books and knows exactly where everything is.

**Without Repository:**
```javascript
// BAD: Mix business logic with database code everywhere
app.post('/book-flight', (req, res) => {
  const { userId, flightId } = req.body;

  // Database code mixed with business logic 😵
  db.query('INSERT INTO bookings (user_id, flight_id) VALUES (?, ?)', [userId, flightId])
    .then(() => res.send('Booked!'))
    .catch(err => res.status(500).send('Error!'));
});
```

**With Repository:**
```javascript
// GOOD: Business logic separated from data access 🤓

// Repository (Data Organizer)
export const bookingsRepository = {
  create: async (booking) => await db.insert(bookings).values(booking).returning(),
  findByUser: async (userId) => await db.select().from(bookings).where(eq(bookings.userId, userId))
};

// Service (Business Logic)
export const bookingsService = {
  async createBooking(bookingData) {
    // Your business rules here
    const existingBooking = await bookingsRepository.findByUser(bookingData.userId);
    if (existingBooking) return Result.failed("Already booked!");

    const newBooking = await bookingsRepository.create(bookingData);
    return Result.ok(newBooking);
  }
};

// API Route (Clean and simple)
const result = await bookingsService.createBooking(req.body);
if (result.ok) return res.json(result.value);
else return res.status(400).json({ error: result.error });
```

**Why This Helps Students Learn:**
- 🔍 **Clear separation** - Business logic ≠ Database code
- 🧪 **Easy to test** - You can test business logic without touching the database
- 🔄 **Easy to change** - Want to switch from PostgreSQL to MongoDB? Just change the repository!
- 👥 **Team friendly** - Frontend devs can work without knowing SQL

---

### 🛡️ Database Safety Features (Think: "Auto-Save in Video Games")

Real apps have problems:
- **Connection breaks** during checkout
- **Server overload** causes database "busy" errors
- **Race conditions** - Two people book the same seat at once

This project includes **enterprise-level safety features** that handle these automatically.

#### The "Retry Wrapper" Explained Simply

**Real-Life Analogy:** You're sending an important email, but the internet is spotty 📶
- ❌ **Without safety**: Email fails, user loses their booking
- ✅ **With safety**: System automatically retries until it works

**What It Does:**
```typescript
// Wrap any risky database operation
await atomic(async (database) => {
  // Step 1: Reserve seat for passenger
  await database.update(seats).set({ isAvailable: false }).where(eq(seats.id, seatId));

  // Step 2: Create booking record
  await database.insert(bookings).values({ userId, flightId, seatId });

  // If ANY step fails, everything gets "undone" automatically
  // If network fails, it retries up to 3 times with smart delays
});
```

#### Why "Atomic" Matters

**Think of it like a bank transfer:**
1. ✅ Take $100 from Account A → Save state
2. ✅ Add $100 to Account B → Save state
3. ❌ Internet fails before confirming → **Everything gets reversed!**

Your booking system uses this for:
- **Seat reservations** (auto-rollback if booking fails)
- **Payment processing** (refund if something breaks)
- **Data consistency** (no "half-done" operations)

#### 🎓 Learning Takeaway

This pattern is used by companies like:
- **Stripe** for payments
- **Airbnb** for bookings
- **Uber** for ride matching

You're learning the same techniques used by billion-dollar companies! 🚀

---

## 📚 Detailed Result Pattern Guide

### Quick Reference Table

| Action | Traditional | Result Pattern |
|--------|-------------|----------------|
| **Success** | `return data` | `return Result.ok(data)` |
| **Error** | `throw new Error("msg")` | `return Result.failed("msg")` |
| **Using Result** | `const data = func()` | `const result = func(); if (result.ok) { use data }` |

### Basic Usage

The `Result` type has two possible states:
- **Success**: `{ ok: true, value: T }`
- **Failure**: `{ ok: false, error: AppError }`

### Creating Results

**For Junior Developers (Recommended):**
```typescript
import { Result } from '@/core/lib/http/result';

// Success case
const successResult = Result.ok(userData);

// Error case
const errorResult = Result.failed(errors.notFound("User not found"));
```

**Legacy Functions (still work but less readable):**
```typescript
import { ok, err } from '@/core/lib/http/result';

// Success case
const successResult = ok(userData);

// Error case
const errorResult = err(errors.notFound("User not found"));
```

### Handling Results

You must always check if the result is successful or failed:

```typescript
import { Result } from '@/core/lib/http/result';

function getUser(userId: string): Result<User> {
  const user = findUser(userId);

  if (user) {
    return Result.ok(user); // Success!
  } else {
    return Result.failed(errors.notFound("User not found")); // Error!
  }
}

function processUser(userId: string) {
  const result = getUser(userId);

  if (result.ok) {
    // Success - use result.value
    console.log("User found:", result.value);
    sendWelcomeEmail(result.value.email);
  } else {
    // Error - handle result.error
    console.log("Error:", result.error.message);
    throw new Error(result.error.message); // or handle gracefully
  }
}
```

### API Responses

In API routes, use `toJsonResponse()` to automatically convert results to HTTP responses:

```typescript
import { Result, toJsonResponse } from '@/core/lib/http/result';

export async function GET(request: Request) {
  // Your business logic here
  const result: Result<Data> = someServiceOperation();

  // Automatically handles success/error response formatting
  return new Response(
    toJsonResponse(result, { requestId: "req-123" }).body,
    {
      status: toJsonResponse(result, { requestId: "req-123" }).status,
      headers: toJsonResponse(result, { requestId: "req-123" }).headers
    }
  );
}
```

### Common Error Types

Use predefined error creators for consistency:

```typescript
import { errors } from '@/core/lib/http/result';

// Common errors
Result.failed(errors.unauthorized("Please log in first"));
Result.failed(errors.notFound("Flight not found"));
Result.failed(errors.validationError("Invalid email format", { field: "email" }));
Result.failed(errors.internalError("Database connection failed"));
```

### Why Use Result Instead of Throwing Exceptions?

1. **Explicit**: You can't accidentally forget to handle errors
2. **Type-safe**: The compiler reminds you about error handling
3. **Readable**: Code clearly shows success vs error paths
4. **Consistent**: All APIs return the same Result pattern

### Best Practices

- ✅ Always check `if (result.ok)` before accessing `result.value`
- ✅ Handle errors gracefully instead of swallowing them
- ✅ Use predefined `errors` for consistency
- ✅ Document what errors your functions can return
- ❌ Don't access `result.value` without checking `result.ok` first
- ❌ Don't throw exceptions from functions that return `Result`

### Migration Guide

**Old code (exceptions):**
```typescript
function getUser(id: string) {
  const user = findUser(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
```

**New code (Result):**
```typescript
function getUser(id: string): Result<User> {
  const user = findUser(id);
  if (user) {
    return Result.ok(user);
  } else {
    return Result.failed(errors.notFound("User not found"));
  }
}
```

### Flight Booking System Examples

#### Result Pattern in Action

**Flight Search Example:**
```typescript
// src/features/flights/services/flights.service.ts
async searchFlights(searchParams: FlightSearchParams): Promise<Result<Flight[]>> {
  // Validate search parameters
  const validation = flightSearchSchema.safeParse(searchParams);
  if (!validation.success) {
    return Result.failed(errors.validationError("Invalid search parameters", validation.error));
  }

  // Check for valid date ranges
  if (searchParams.returnDate && searchParams.returnDate <= searchParams.departureDate) {
    return Result.failed(errors.validationError("Return date must be after departure date"));
  }

  try {
    const flights = await flightsRepository.search(validation.data);
    return Result.ok(flights);
  } catch (error) {
    return Result.failed(errors.internalError("Failed to search flights"));
  }
}
```

**Booking Creation with Safety:**
```typescript
// src/features/bookings/services/bookings.service.ts
async createBooking(bookingData: CreateBookingData): Promise<Result<Booking>> {
  // Validate booking data
  const validation = createBookingSchema.safeParse(bookingData);
  if (!validation.success) {
    return Result.failed(errors.validationError("Invalid booking data", validation.error));
  }

  // Business rule: Check seat availability
  const seatAvailable = await seatsRepository.isAvailable(bookingData.seatId);
  if (!seatAvailable) {
    return Result.failed(errors.conflict("Seat is no longer available"));
  }

  // Business rule: Check passenger limit
  const passengerCount = await passengersRepository.countByBooking(bookingData.bookingId);
  if (passengerCount >= 9) {
    return Result.failed(errors.validationError("Maximum 9 passengers per booking"));
  }

  // Use atomic operation for data consistency
  try {
    const booking = await atomic(async (tx) => {
      // Reserve seat
      await seatsRepository.reserve(bookingData.seatId, { transaction: tx });

      // Create booking record
      return await bookingsRepository.create(validation.data, { transaction: tx });
    });

    return Result.ok(booking);
  } catch (error) {
    return Result.failed(errors.internalError("Failed to create booking"));
  }
}
```

#### Repository Pattern Implementation

**Flight Repository:**
```typescript
// src/features/flights/repository/index.ts
export const flightsRepository = {
  async search(params: FlightSearchParams) {
    return await db
      .select()
      .from(flights)
      .where(and(
        eq(flights.origin, params.origin),
        eq(flights.destination, params.destination),
        gte(flights.departureDate, params.departureDate)
      ))
      .limit(50);
  },

  async findById(id: number) {
    const result = await db
      .select()
      .from(flights)
      .where(eq(flights.id, id))
      .limit(1);

    return result[0] || null;
  },

  async create(flightData: CreateFlightData) {
    return await db
      .insert(flights)
      .values(flightData)
      .returning();
  }
};
```

#### Database Safety in Practice

**Seat Reservation with Rollback:**
```typescript
// Atomic seat reservation during booking
await atomic(async (tx) => {
  // Step 1: Check and reserve seat
  const seat = await tx
    .select()
    .from(seats)
    .where(and(eq(seats.id, seatId), eq(seats.isAvailable, true)))
    .limit(1);

  if (!seat[0]) {
    throw new Error("Seat not available");
  }

  await tx
    .update(seats)
    .set({ isAvailable: false, reservedAt: new Date() })
    .where(eq(seats.id, seatId));

  // Step 2: Create booking record
  await tx
    .insert(bookings)
    .values({
      userId,
      flightId,
      seatId,
      status: 'confirmed',
      bookedAt: new Date()
    });

  // Step 3: Update passenger information
  await tx
    .update(passengers)
    .set({ bookingId: bookingId })
    .where(eq(passengers.id, passengerId));

  // If any step fails, everything rolls back automatically
});
```

## 🎓 Learning Takeaway

**Each pattern teaches you something important:**

- **`Result<T, E>`**: Forces you to think about what can go wrong and handle it explicitly
- **Repository Pattern**: Separates "what to do" from "how to store it" for better maintainability
- **Atomic Operations**: Makes your app reliable even when things break, preventing data corruption

### Real-World Impact

These patterns are used by billion-dollar companies:
- **Stripe** uses Result patterns for payment processing reliability
- **Airbnb** uses atomic operations for booking consistency
- **Uber** uses repository patterns for scalable data management

**In this Flight Booking System, you'll see:**
- ✅ Safe flight bookings that never leave users in inconsistent states
- ✅ Reliable seat reservations that handle network failures gracefully
- ✅ Clean code organization that scales as the project grows

## Next Steps

Now that you understand the core concepts, explore:
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - How these concepts are organized in the project
- **[LIBRARIES.md](LIBRARIES.md)** - Tools that make these patterns easy to use
- **[README.md](README.md)** - Complete project overview and setup
