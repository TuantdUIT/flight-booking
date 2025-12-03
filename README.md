# Flight Booking System

A modern flight booking application built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Getting Started (Beginner-Friendly)

### Hello Developer! 👋

Welcome to the Flight Booking System! This project is designed to teach you modern web development practices while building something practical. Whether you're a student, fresh graduate, or teacher, you'll learn:

- ✅ **How real applications handle data safely**
- ✅ **Why "error handling" matters so much**
- ✅ **How to write code that doesn't break easily**
- ✅ **Best practices used by professional developers**

### 📚 Learning Path

**If you're new to this, follow this order:**
1. **Start Here** - Read the "Simple Error Handling" section below
2. **Then** - Look at "What is a Database Repository?"
3. **Finally** - Explore the "Database Safety Features"

Don't worry if some parts feel advanced - you're learning step by step! 💡

---

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

⚡ **Pro Tip:** Think of `Result<T, E>` as a "gift with a return policy" - it always tells you what happened, good or bad!

##### Quick Reference Table

---

### 🗄️ **What is a Database Repository?** (Think: "Safe File Cabinet")

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

### 🛡️ **Database Safety Features** (Think: "Auto-Save in Video Games")

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

#### 🎓 **Learning Takeaway**

This pattern is used by companies like:
- **Stripe** for payments
- **Airbnb** for bookings
- **Uber** for ride matching

You're learning the same techniques used by billion-dollar companies! 🚀

---

##### Quick Reference Table

| Action | Traditional | Result Pattern |
|--------|-------------|----------------|
| **Success** | `return data` | `return Result.ok(data)` |
| **Error** | `throw new Error("msg")` | `return Result.failed("msg")` |
| **Using Result** | `const data = func()` | `const result = func(); if (result.ok) { use data }` |

#### Basic Usage

The `Result` type has two possible states:
- **Success**: `{ ok: true, value: T }`
- **Failure**: `{ ok: false, error: AppError }`

#### Creating Results

**For Junior Developers (Recommended)**:
```typescript
import { Result } from '@/core/lib/http/result';

// Success case
const successResult = Result.ok(userData);

// Error case
const errorResult = Result.failed(errors.notFound("User not found"));
```

**Legacy Functions (still work but less readable)**:
```typescript
import { ok, err } from '@/core/lib/http/result';

// Success case
const successResult = ok(userData);

// Error case
const errorResult = err(errors.notFound("User not found"));
```

#### Handling Results

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

#### API Responses

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

#### Common Error Types

Use predefined error creators for consistency:

```typescript
import { errors } from '@/core/lib/http/result';

// Common errors
Result.failed(errors.unauthorized("Please log in first"));
Result.failed(errors.notFound("Flight not found"));
Result.failed(errors.validationError("Invalid email format", { field: "email" }));
Result.failed(errors.internalError("Database connection failed"));
```

#### Why Use Result Instead of Throwing Exceptions?

1. **Explicit**: You can't accidentally forget to handle errors
2. **Type-safe**: The compiler reminds you about error handling
3. **Readable**: Code clearly shows success vs error paths
4. **Consistent**: All APIs return the same Result pattern

#### Best Practices

- ✅ Always check `if (result.ok)` before accessing `result.value`
- ✅ Handle errors gracefully instead of swallowing them
- ✅ Use predefined `errors` for consistency
- ✅ Document what errors your functions can return
- ❌ Don't access `result.value` without checking `result.ok` first
- ❌ Don't throw exceptions from functions that return `Result`

#### Migration Guide

**Old code (exceptions)**:
```typescript
function getUser(id: string) {
  const user = findUser(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
```

**New code (Result)**:
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

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up the database:
   ```bash
   pnpm run db:reset
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Architecture Overview

### Architectural Patterns
This project follows **Clean Architecture** principles with clear separation of concerns, implementing a **hexagonal architecture** where business logic is isolated from infrastructure concerns. The codebase emphasizes **Domain-Driven Design (DDD)** with feature modules, **explicit error handling**, and **type safety** throughout.

### Core Design Decisions
- **Typed Error Handling**: Using `Result<T, E>` pattern instead of exceptions for type-safe error management
- **Feature-Based Organization**: Code organized by business features rather than technical layers
- **UI-First Design**: shadcn/ui component library with design tokens
- **API-First Approach**: RESTful APIs with structured response formats
- **TypeScript Strict**: Zero any types, comprehensive type coverage

## Detailed Project Structure

### 🏗️ `src/app/`
The **App Router** directory following Next.js 13+ conventions with route-based organization.

#### Authentication Routes (`src/app/auth/`)
- **Purpose**: User authentication pages (signin/signup)
- **Structure**:
  - `signin/page.tsx` - Login form with validation
  - `register/page.tsx` - User registration
- **Security**: Form validation, error states, loading states

#### API Routes (`src/app/api/`)
RESTful API endpoints organized by resource domains:
```
api/
├── auth/[...all]/route.ts    # NextAuth.js integration
├── flights/route.ts          # Flight search/creation
├── flights/search/route.ts   # Advanced flight queries
├── airlines/route.ts         # Airline data management
├── airports/route.ts         # Airport reference data
├── bookings/route.ts         # Booking CRUD operations
├── bookings/[pnr]/           # PNR-specific operations
├── passengers/route.ts       # Passenger management
├── tickets/[pnr]/route.ts    # Ticket operations
└── admin/example/route.ts    # Administrative endpoints
```

#### Protected Pages (`src/app/(protected)/`)
Application pages requiring authentication:
- **`page.tsx`** - Dashboard/homepage with flight search
- **`my-bookings/page.tsx`** - User booking history
- **`passengers/page.tsx`** - Add passenger information
- **`summary/page.tsx`** - Booking summary and review
- **`payment/page.tsx`** - Payment processing
- **`confirmation/page.tsx`** - Booking confirmation
- **`sections/`** - Reusable page sections (hero-search, search-results, landing)

### 🧰 `src/core/`
The **shared kernel** - reusable code that doesn't belong to any specific feature. Contains framework-agnostic business logic and shared infrastructure.

#### `src/core/components/`
**UI Components** following component composition patterns:
- **`layouts/`** - Page layout components (navbar, footer)
- **`ui/`** - shadcn/ui component library (40+ components)
  - Form controls: button, input, select, calendar, etc.
  - Feedback: loading-spinner, success-banner, error-banner
  - Data display: table, card, badge, etc.
  - Layout: separator, tabs, collapsible, etc.
- **`passenger-form.tsx`** - Composite form for passenger data

#### `src/core/lib/`
**Core utilities and infrastructure services**:

##### `src/core/lib/http/`
HTTP client and response utilities:
- **`result.ts`** - Result<T, E> error handling pattern
- **`index.ts`** - HTTP client configuration

##### `src/core/lib/auth/`
Authentication management:
- **`client.ts`** - NextAuth client-side functions
- **`index.ts`** - Auth configuration and middleware

##### `src/core/lib/store/`
**Global state management** (Zustand store):
- **`index.ts`** - Application-wide state store

##### `src/core/lib/providers/`
**React providers** for dependency injection:
- **`theme-provider.tsx`** - Theme management (light/dark mode)
- **`query-provider.tsx`** - Tanstack Query client provider

##### `src/core/lib/hooks/`
**Custom React hooks**:
- `use-mobile.ts` - Responsive design utilities
- `use-toast.ts` - Toast notification management

##### `src/core/utils/index.ts`
**Pure utility functions** - date manipulation, string formatting, etc.

#### `src/core/types/`
**Type definitions and interfaces**:
- **`auth.ts`** - Authentication-related types
- **`index.ts`** - Shared type exports

### 🎯 `src/features/`
**Feature modules** following **DDD principles**. Each feature is self-contained with its own components, services, validations, and types.

#### Feature Module Structure
Each feature follows this consistent pattern:
```
features/[feature-name]/
├── components/         # Feature-specific UI components
├── hooks/             # Feature-specific React hooks
├── services/          # Business logic and API integration
├── validations/       # Form validation schemas (Zod)
├── utils/            # Feature utilities
└── types.ts          # Feature-specific types (if needed)
```

#### `src/features/auth/`
**Authentication feature module**:
- **`components/`** - Login/signup forms
- **`hooks/`** - useLogin, useSignup, user authentication
- **`validations/`** - Email/password validation schemas
- **`utils/session.ts`** - Session management utilities

#### `src/features/flights/`
**Flight management module**:
- **`api/queries.ts`** - Tanstack Query hooks for flight data
- **`components/flight-card.tsx`** - Flight display components
- **`services/flights.service.ts`** - Flight business logic
- **`validations/flight-search.ts`** - Search form validation

#### `src/features/bookings/`
**Booking workflow management**:
- **`services/bookings.service.ts`** - Booking creation and management
- **`validations/create-booking.ts`** - Booking form schema

#### `src/features/passengers/`
**Passenger information handling**:
- **`services/passengers.service.ts`** - Passenger CRUD operations
- **`validations/create-passenger.ts`** - Passenger form validation

#### `src/features/tickets/`
**Ticket operations module**:
- **`services/tickets.service.ts`** - Ticket lifecycle management

### 🗄️ `src/infrastructure/`
**External concerns** - database, external APIs, etc. Framework-specific implementations that the core domain doesn't need to know about.

#### `src/infrastructure/db/`
**Database layer** using Drizzle ORM:
- **`client.ts`** - Database connection configuration
- **`schema.ts`** - Database schema definitions
- **`seed.ts`** - Database seeding scripts
- **`migrations/`** - Database migration files

### 📁 Root Level Configuration

#### `scripts/`
**Development and deployment scripts**:
- `reset-db.ts` - Database reset and seeding
- `seed.js`, `seed.ts` - Data seeding utilities

#### `public/`
**Static assets** - favicon, logos, placeholder images

#### Configuration Files
- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration
- **`next.config.ts`** - Next.js configuration
- **`drizzle.config.ts`** - Database ORM configuration
- **`biome.json`** - Code formatting and linting
- **`components.json`** - UI component library configuration
- **`postcss.config.mjs`** - CSS processing configuration

## Data Flow Architecture

### Request Flow
1. **UI Component** (feature module) → dispatches action/hooks
2. **Custom Hook** → calls service function
3. **Service Layer** (feature) → implements business logic, calls infrastructure
4. **Infrastructure Layer** → executes database/API operations
5. **Result<T, E>** → returned up through layers with type safety

### State Management
- **Global State**: Zustand store for app-level state
- **Server State**: Tanstack Query for API data caching
- **Local State**: React useState for component state

### Error Handling Strategy
- **API Level**: Functions return `Result<T, E>` for type-safe errors
- **UI Level**: Error boundaries and toast notifications
- **Validation**: Zod schemas with detailed error messages
- **HTTP**: Structured error responses with retry logic

## Development Workflow

### Adding New Features
1. Create feature module in `src/features/[feature-name]/`
2. Implement components, services, validations
3. Add API routes in `src/app/api/`
4. Update routing and navigation
5. Add tests and documentation

### Code Quality Standards
- **ESLint + Biome** for code quality and formatting
- **TypeScript strict mode** enabled
- **Component composition** over deep nesting
- **Feature isolation** maintained
- **Consistent error handling** using Result pattern

### Database Operations
- **Migrations**: Drizzle kit for schema changes
- **Seeding**: Structured data seeding with TypeScript
- **Connection**: Connection pooling with environment configuration

#### Database Resilience & Repositories

This project implements **enterprise-grade database reliability** with a sophisticated resilience layer and feature-specific repository pattern.

##### Atomic Transaction Wrapper (`src/infrastructure/db/wrapper.ts`)

**Database Resilience Features:**
- **Exponential backoff + jitter** - Prevents thundering herd scenarios
- **Smart error filtering** - Only retries transient PostgreSQL errors (40001, 40P01, 08xxx)
- **Configurable retry logic** - 3 attempts with progressive delays
- **Type-safe transactions** - Proper Drizzle ORM integration

**Usage in Service Layer:**
```typescript
import { atomic } from '@/infrastructure/db/client';

await atomic(async (tx) => {
  // All operations in this block are atomic and retry automatically
  await tx.insert(bookings).values(bookingData);
  await tx.update(seats).set({ isAvailable: false }).where(condition);
});
```

##### Feature Repository Pattern

Each business feature has a dedicated repository (`src/features/[feature]/repository/index.ts`) following a consistent pattern:

**Repository Structure:**
```typescript
export const featureRepository = {
  // Query operations
  findById: async (id: number) => { /* ... */ },
  findByCriteria: async (criteria) => { /* ... */ },
  search: async (query) => { /* ... */ },

  // Mutation operations (using atomic wrapper)
  create: async (data) => { db.insert(table).values(data) },
  update: async (id, data) => atomic(async (tx) => { /* update logic */ }),
  delete: async (id) => atomic(async (tx) => { /* delete logic */ }),

  // Complex operations
  createWithRelationships: async (data) => atomic(async (tx) => { /* complex logic */ }),
};
```

**Available Repositories:**
- **`authRepository`** - User management, sessions, verification
- **`bookingsRepository`** - Booking lifecycle with passenger-seat relationships
- **`flightsRepository`** - Airlines, flights, seats management
- **`passengersRepository`** - Passenger CRUD operations
- **`ticketsRepository`** - Ticket display and cancellation operations

**Repository Benefits:**
- **Separation of concerns** - Data access logic isolated from business logic
- **Transactional safety** - All write operations automatically atomic with retry
- **Type safety** - Full TypeScript integration with database schema
- **Consistent API** - Standardized CRUD operations across features
- **Lazy imports** - Repositories only load when needed

**Architecture Principles:**
- **Separation of Mechanism vs Policy** - Drizzle handles SQL, wrapper handles retries
- **Clean service layer** - Business logic doesn't handle retry logic manually
- **Production readiness** - Handles database hiccups gracefully
- **Feature isolation** - Each repository is self-contained

## Performance Considerations

- **Bundle Splitting**: Feature-based code splitting
- **Image Optimization**: Next.js Image component with lazy loading
- **Caching**: Tanstack Query for efficient data fetching
- **SSR**: Server-side rendering for initial page loads
- **Database**: Indexed queries and proper normalization

---

## 📚 **Libraries & Tools Explained**

This section explains every library and tool used in this project. Don't worry if some names feel overwhelming - each one has a specific job to make development easier! 🎯

### 🔧 **Core Framework & Runtime**

#### **Next.js** (Version 16)
- **What it is**: The main framework for our web app
- **What it does**: Handles routing, server-side rendering, and API routes
- **Why we use it**: Makes it easy to build React apps with built-in features
- **For students**: Like the foundation of a house - everything else builds on top of this

#### **React** (Version 19) & **React DOM**
- **What it is**: The user interface library
- **What it does**: Lets us create interactive UI components
- **Why we use it**: Most popular way to build modern web interfaces
- **For students**: Like LEGO blocks - you snap them together to build your app!

#### **TypeScript** (Version 5)
- **What it is**: JavaScript with "superpowers" (type safety)
- **What it does**: Catches errors before your code runs
- **Why we use it**: Prevents bugs and makes code easier to understand
- **For students**: Like spell-check for code - tells you when you make mistakes!

#### **Node.js Types** (@types/node)
- **What it is**: Type definitions for Node.js features
- **What it does**: Lets TypeScript understand Node.js functions
- **Why we use it**: So TypeScript knows about server-side features

### 🎨 **User Interface (UI) Libraries**

#### **Radix UI Components** (Many @radix-ui packages)
```
@radix-ui/react-dialog, @radix-ui/react-dropdown-menu, etc.
```
- **What it is**: Professional UI component library
- **What it does**: Ready-made, accessible UI components (buttons, menus, modals)
- **Why we use it**: Creates beautiful, consistent interfaces quickly
- **For students**: Like having pre-built LEGO pieces for common things like doors and windows

#### **Tailwind CSS** (Version 4)
- **What it is**: Utility-first CSS framework
- **What it does**: Makes styling components easy with classes
- **Why we use it**: Fast development, consistent design
- **For students**: Like having crayons labeled "red-button" and "blue-shadow"

#### **Tailwind Merge** (tailwind-merge)
- **What it is**: Smart CSS class merger
- **What it does**: Combines Tailwind classes without conflicts
- **Why we use it**: Ensures CSS classes don't override each other

#### **Tailwind Animate** (tailwindcss-animate)
- **What it is**: Animation utilities for Tailwind
- **What it does**: Makes elements move smoothly
- **Why we use it**: Adds polish to user interactions

#### **Next Themes** (next-themes)
- **What it is**: Dark/light mode support for Next.js
- **What it does**: Lets users switch between dark and light themes
- **Why we use it**: Modern apps should have dark mode!

#### **Lucide React** (lucide-react)
- **What it is**: Beautiful icon library
- **What it does**: Provides SVG icons for your interface
- **Why we use it**: Consistent, good-looking icons throughout the app

#### **Sonner** (sonner)
- **What it is**: Toast notification library
- **What it does**: Shows temporary messages to users
- **Why we use it**: Provides feedback for user actions

### 📊 **Data Management & State**

#### **TanStack Query** (@tanstack/react-query)
- **What it is**: Smart data fetching library
- **What it does**: Automatically fetches, caches, and syncs server data
- **Why we use it**: Makes API calls efficient and handles loading/error states
- **For students**: Like a smart butler who remembers what you need and fetches it automatically

#### **Zustand** (zustand)
- **What it is**: Lightweight state management
- **What it does**: Stores and shares app-wide data
- **Why we use it**: Simple way to manage global application state
- **For students**: Like a shared backpack where different parts of your app can store things

#### **Immer** (immer)
- **What it is**: Immutable state updates helper
- **What it does**: Makes it easy to update nested objects immutably
- **Why we use it**: Prevents bugs from accidentally changing shared data

### 🗄️ **Database & Backend**

#### **Neon Database** (@neondatabase/serverless)
- **What it is**: Serverless PostgreSQL database
- **What it does**: Stores all our app data (users, flights, bookings)
- **Why we use it**: Scalable, reliable database as a service
- **For students**: Like a digital filing cabinet that stores all your information safely

#### **Drizzle ORM** (drizzle-orm)
- **What it is**: Type-safe database toolkit
- **What it does**: Makes database queries safe and easy with TypeScript
- **Why we use it**: Prevents SQL injection and gives type safety
- **For students**: Like a translator between your code and database language

#### **Drizzle Kit** (drizzle-kit)
- **What it is**: Database migration tool
- **What it does**: Updates database schema when you change data models
- **Why we use it**: Keeps database structure in sync with your code
- **For students**: Like a magic wand that updates your database to match your code changes

#### **Better Auth** (better-auth)
- **What it is**: Complete authentication system
- **What it does**: Handles user login, signup, sessions, and security
- **Why we use it**: Saves time building secure authentication
- **For students**: Like a professional security guard for user accounts

### 📝 **Forms & Validation**

#### **React Hook Form** (react-hook-form)
- **What it is**: High-performance form library
- **What it does**: Makes forms easier and more efficient
- **Why we use it**: Better performance and simpler code for form handling

#### **Hookform Resolvers** (@hookform/resolvers)
- **What it is**: Bridges form validation to React Hook Form
- **What it does**: Connects Zod validation to React Hook Form
- **Why we use it**: Makes validation work seamlessly

#### **Zod** (zod)
- **What it is**: TypeScript-first validation library
- **What it does**: Validates and transforms data (ensures correct shape)
- **Why we use it**: Catches data errors before they break your app
- **For students**: Like a security checkpoint that checks if data "looks right"

#### **Day.js** (dayjs)
- **What it is**: Lightweight date/time library
- **What it does**: Makes working with dates easy
- **Why we use it**: Handles time zones, formatting, and calculations
- **For students**: Like a smart calendar that understands dates and times

### 🎲 **Charts & Visualizations**

#### **Recharts** (recharts)
- **What it is**: React charting library
- **What it does**: Creates graphs and charts from data
- **Why we use it**: Beautiful, customizable data visualizations
- **For students**: Like Microsoft Excel charts, but for your website

#### **React Day Picker** (react-day-picker)
- **What it is**: Date picker component
- **What it does**: Lets users select dates from a calendar
- **Why we use it**: Better than building a calendar from scratch

### 🛠️ **Development Tools & Utilities**

#### **Biome** (@biomejs/biome)
- **What it is**: Fast code formatter and linter
- **What it does**: Automatically fixes code style and catches errors
- **Why we use it**: Keeps code consistent and clean across the team
- **For students**: Like a robot that fixes your code spacing and style

#### **Autoprefixer** (autoprefixer)
- **What it is**: CSS vendor prefix adder
- **What it does**: Adds browser-specific CSS prefixes (-webkit-, -moz-, etc.)
- **Why we use it**: Ensures styles work on all browsers

#### **PostCSS** (postcss)
- **What it is**: CSS processing tool
- **What it does**: Transforms CSS with plugins (like autoprefixer)
- **Why we use it**: Modern CSS processing pipeline

#### **TSX** (tsx)
- **What it is**: TypeScript runner
- **What it does**: Runs TypeScript files directly
- **Why we use it**: Execute TypeScript scripts without compiling first

#### **Dotenv** (dotenv)
- **What it is**: Environment variable loader
- **What it does**: Loads sensitive config from .env files
- **Why we use it**: Keeps secrets (API keys, passwords) separate from code

### 🔒 **Security & Passwords**

#### **Bcrypt** (bcryptjs)
- **What it is**: Password hashing library
- **What it does**: Safely stores passwords
- **Why we use it**: Prevents people from reading stored passwords
- **For students**: Like a safe that scrambles passwords so they're unreadable

### 🌐 **HTTP & Networking**

#### **Axios** (axios)
- **What it is**: HTTP client library
- **What it does**: Makes HTTP requests to external APIs
- **Why we use it**: Better error handling than built-in fetch()

### 🎛️ **Specialized Components**

#### **Va** (vaul)
- **What it is**: Modern drawer component
- **What it does**: Slide-out panels for mobile/tablet interfaces
- **Why we use it**: Better than building drawers from scratch

#### **Embla Carousel** (embla-carousel-react)
- **What it is**: Modern carousel/slider component
- **What it does**: Creates image/text slideshows
- **Why we use it**: Smooth, accessible carousels

#### **Input OTP** (input-otp)
- **What it is**: One-time password input component
- **What it is**: Special input for 6-digit codes
- **Why we use it**: Better UX for verification codes

#### **React Resizable Panels** (react-resizable-panels)
- **What it is**: Resizable panel layouts
- **What it does**: Lets users resize sections of the UI
- **Why we use it**: Flexible, responsive layouts

#### **Class Variance Authority** (class-variance-authority)
- **What it is**: Component variant management
- **What it does**: Handles different styles for component states
- **Why we use it**: Keeps UI consistent across different states

#### **clsx** & **Tailwind Merge**
- **What it is**: Conditional CSS class helpers
- **What it does**: Combines CSS classes conditionally
- **Why we use it**: Makes dynamic styling easier

#### **Use Sync External Store** (use-sync-external-store)
- **What it is**: React hook for external state libraries
- **What it does**: Helps React work with external state management
- **Why we use it**: Better integration with state libraries

### 📈 **Monitoring & Analytics**

#### **Vercel Analytics** (@vercel/analytics)
- **What it is**: Web analytics tool
- **What it does**: Tracks how users interact with your app
- **Why we use it**: Understands user behavior and app performance

### 🎓 **Learning Summary**

**Each library has a specific job:**
- **Framework**: Next.js (app foundation)
- **UI**: Radix + Tailwind (looks and feels)
- **Data**: TanStack Query + Drizzle (fetching and storing data)
- **State**: Zustand (sharing data between components)
- **Security**: Better Auth + bcrypt (user accounts and passwords)
- **Validation**: Zod (checking data is correct)
- **Development**: TypeScript + Biome (catching errors early)

**The key insight**: Modern web apps use many specialized libraries because each one is an expert in its domain. You don't build everything from scratch - you use tools that experts have already perfected! 🚀

**Note**: This architecture emphasizes maintainability, testability, and type safety while providing clear boundaries between business logic and technical implementations.

## Development

- Use TypeScript strictly
- Follow the Result pattern for error handling
- Keep business logic in services, UI logic in components
- Use the provided UI components from `src/core/components/ui/`
