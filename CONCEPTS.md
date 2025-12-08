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

## 🎓 Learning Takeaway

**Each pattern teaches you something important:**

- **`Result<T, E>`**: Forces you to think about what can go wrong
- **Repository Pattern**: Separates "what to do" from "how to store it"
- **Atomic Operations**: Makes your app reliable even when things break

These are the same patterns used by professional developers at companies like Google, Facebook, and Stripe. You're learning enterprise-level software development! 🚀

## Next Steps

Now that you understand the core concepts, explore:
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - How these concepts are organized in the project
- **[LIBRARIES.md](LIBRARIES.md)** - Tools that make these patterns easy to use
