# 🏗️ Project Architecture

This guide explains how the Flight Booking System is organized. Understanding the architecture will help you navigate the codebase and add new features.

## Architectural Patterns

This project follows **Clean Architecture** principles with clear separation of concerns, implementing a **hexagonal architecture** where business logic is isolated from infrastructure concerns. The codebase emphasizes **Domain-Driven Design (DDD)** with feature modules, **explicit error handling**, and **type safety** throughout.

## Core Design Decisions

- **Typed Error Handling**: Using `Result<T, E>` pattern instead of exceptions for type-safe error management
- **Feature-Based Organization**: Code organized by business features rather than technical layers
- **UI-First Design**: shadcn/ui component library with design tokens
- **API-First Approach**: RESTful APIs with structured response formats
- **TypeScript Strict**: Zero any types, comprehensive type coverage

## 🏗️ Detailed Project Structure

### `src/app/` - The App Router Directory

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

### `src/core/` - The Shared Kernel

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

### `src/features/` - Feature Modules

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

### `src/infrastructure/` - External Concerns

**External concerns** - database, external APIs, etc. Framework-specific implementations that the core domain doesn't need to know about.

#### `src/infrastructure/db/`
**Database layer** using Drizzle ORM:
- **`client.ts`** - Database connection configuration
- **`schema.ts`** - Database schema definitions
- **`seed.ts`** - Database seeding scripts
- **`migrations/`** - Database migration files

### Root Level Configuration

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

## Database Operations

### Database Resilience & Repositories

This project implements **enterprise-grade database reliability** with a sophisticated resilience layer and feature-specific repository pattern.

#### Atomic Transaction Wrapper (`src/infrastructure/db/wrapper.ts`)

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

#### Feature Repository Pattern

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

## 🎯 Architecture Benefits

### For Students Learning
- **Clear boundaries** - Easy to understand what goes where
- **Consistent patterns** - Same structure for every feature
- **Type safety** - Compiler catches mistakes early
- **Separation of concerns** - Business logic separate from UI/infrastructure

### For Professional Development
- **Scalable** - Easy to add new features without breaking existing code
- **Testable** - Each layer can be tested independently
- **Maintainable** - Clear organization makes changes predictable
- **Enterprise-ready** - Patterns used by large-scale applications

## Next Steps

- **[LIBRARIES.md](LIBRARIES.md)** - Learn about the specific tools and libraries used
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development workflow and best practices
