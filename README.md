# Flight Booking System

A modern flight booking application built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

Welcome to the Flight Booking System! This project teaches modern web development practices through a practical flight booking application.

### For New Developers

**If you're just starting out, read these files in order:**

1. **[SETUP.md](SETUP.md)** - How to get the project running locally
2. **[CONCEPTS.md](CONCEPTS.md)** - Learn the core patterns used in this project
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Understand how the project is organized
4. **[LIBRARIES.md](LIBRARIES.md)** - Learn about all the tools and libraries used

### For Experienced Developers

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Project structure and design decisions
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development workflow and best practices

## What You'll Learn

This project serves as a comprehensive learning resource for modern web development, covering both fundamental concepts and advanced enterprise patterns.

### Core Development Skills
- ✅ **Type-Safe Error Handling** - Master the `Result<T, E>` pattern (inspired by Rust) for bulletproof error management
- ✅ **Clean Architecture** - Learn separation of concerns with feature-based modules and dependency injection
- ✅ **Database Safety** - Implement atomic transactions, retry logic, and connection pooling for production reliability
- ✅ **Modern React** - Build with Next.js 16 App Router, React 19, and advanced hooks patterns
- ✅ **Professional UI Development** - Create polished interfaces with shadcn/ui components and design systems
- ✅ **Enterprise Patterns** - Apply techniques used by companies like Stripe, Airbnb, and Uber

### Advanced Concepts Covered
- **Domain-Driven Design (DDD)** - Organize code around business domains rather than technical layers
- **Repository Pattern** - Abstract data access for clean, testable business logic
- **Atomic Operations** - Handle complex multi-step operations with rollback capabilities
- **TypeScript Mastery** - Strict typing, generics, and advanced type patterns
- **API Design** - RESTful APIs with proper validation, error handling, and documentation
- **State Management** - Combine global state (Zustand) with server state (TanStack Query)
- **Performance Optimization** - Code splitting, caching, and database query optimization

### Real-World Application
- **Flight Booking Workflow** - Complete user journey from search to confirmation
- **Multi-User System** - Authentication, authorization, and user session management
- **Data Consistency** - Handle race conditions and concurrent operations safely
- **Scalable Architecture** - Patterns that grow with your application needs

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM
- **State**: Zustand + TanStack Query
- **Auth**: Better Auth
- **Validation**: Zod schemas

## Architecture Overview

This project follows **Clean Architecture** principles with clear separation of concerns and enterprise-grade patterns:

### Core Architecture Patterns
- **Feature-Based Modules** - Code organized by business domains (auth, bookings, flights, etc.)
- **Result<T,E> Pattern** - Type-safe error handling inspired by Rust
- **Repository Pattern** - Clean data access layer with database abstraction
- **Atomic Transactions** - Database operations with retry logic and rollback capabilities

### Project Structure
```
src/
├── app/              # Next.js App Router (pages & API routes)
├── core/             # Shared components, utilities, and business logic
├── features/         # Feature-specific modules (DDD approach)
├── infrastructure/   # External concerns (database, external APIs)
└── lib/              # Additional utilities and configurations
```

### Key Design Decisions
- **Type-Safe Development** - Zero `any` types, comprehensive TypeScript coverage
- **UI-First Design** - shadcn/ui component library with design tokens
- **API-First Approach** - RESTful APIs with structured response formats
- **Database Resilience** - Enterprise-grade reliability with smart retry mechanisms

## Quick Setup

```bash
# Install dependencies
pnpm install

# Set up database
pnpm run db:reset

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Features

### Core Functionality
- ✈️ **Flight Search & Discovery** - Advanced search with filters, date ranges, and multi-city options
- 👥 **Passenger Management** - Add, edit, and manage passenger information for bookings
- 💺 **Seat Selection** - Interactive seat maps with real-time availability
- 💳 **Payment Processing** - Secure booking checkout with payment integration
- 📱 **Responsive Design** - Mobile-first design that works on all devices
- 🔐 **User Authentication** - Secure login/signup with Better Auth
- 🛡️ **Type-safe Error Handling** - Enterprise-grade error management with Result<T,E> pattern
- 📊 **Admin Dashboard** - Administrative features for managing flights and bookings

### Advanced Features
- **Real-time Updates** - Live seat availability and booking status
- **Booking History** - Complete booking management and history tracking
- **PNR Management** - Passenger Name Record (PNR) based booking system
- **Ticket Operations** - Ticket viewing, cancellation, and modifications
- **Multi-passenger Bookings** - Support for booking multiple passengers
- **Flight Management** - Airline and airport data management
- **Database Resilience** - Atomic transactions with retry logic and connection pooling

## API Documentation

The application provides a comprehensive REST API for all flight booking operations:

### Core Endpoints
- `GET/POST /api/flights` - Flight search and management
- `GET/POST /api/bookings` - Booking creation and retrieval
- `GET/POST /api/passengers` - Passenger information management
- `GET/POST /api/seats` - Seat availability and selection
- `GET/POST /api/tickets` - Ticket operations and PNR management
- `GET/POST /api/auth` - Authentication endpoints

### API Features
- **Structured Responses** - Consistent JSON response format with error handling
- **Request Validation** - Zod schema validation for all inputs
- **Error Handling** - Type-safe error responses with detailed messages
- **Rate Limiting** - Built-in protection against abuse

See [docs/CURL_API_EXAMPLES.md](docs/CURL_API_EXAMPLES.md) for detailed API usage examples and [docs/POSTMAN_API_TESTING.md](docs/POSTMAN_API_TESTING.md) for Postman collection setup.

## Environment Setup

### Prerequisites
- **Node.js** 18+
- **pnpm** package manager
- **PostgreSQL** database (Neon recommended for development)

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/flight_booking

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Analytics
VERCEL_ANALYTICS_ID=your-analytics-id
```

### Development Commands

```bash
# Install dependencies
pnpm install

# Database setup
pnpm run db:generate    # Generate migrations
pnpm run db:push        # Push schema to database
pnpm run db:seed        # Seed with sample data
pnpm run db:reset       # Reset and reseed database

# Development
pnpm dev                # Start development server
pnpm build             # Build for production
pnpm start             # Start production server

# Code Quality
pnpm format            # Format code with Biome
pnpm lint              # Run ESLint checks
```

## Documentation & Resources

### 📚 Learning Materials
- **[SETUP.md](SETUP.md)** - Complete setup guide for new developers
- **[CONCEPTS.md](CONCEPTS.md)** - Core patterns and concepts explained simply
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed project structure and design decisions
- **[LIBRARIES.md](LIBRARIES.md)** - All tools and libraries with explanations
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development workflow and best practices

### 🛠️ Technical Documentation
- **[docs/CURL_API_EXAMPLES.md](docs/CURL_API_EXAMPLES.md)** - API usage examples with curl commands
- **[docs/POSTMAN_API_TESTING.md](docs/POSTMAN_API_TESTING.md)** - Postman collection setup and testing guide
- **[docs/FEATURE_MODULE_QUICK_REFERENCE.md](docs/FEATURE_MODULE_QUICK_REFERENCE.md)** - Quick reference for feature modules
- **[docs/FEATURE_MODULE_STRUCTURE.md](docs/FEATURE_MODULE_STRUCTURE.md)** - How feature modules are organized
- **[docs/SEAT_SELECTION_UI.md](docs/SEAT_SELECTION_UI.md)** - Seat selection interface documentation

### 🎨 UI & UX Documentation
- **[docs/UI_IMPROVEMENTS.md](docs/UI_IMPROVEMENTS.md)** - UI enhancement guides and best practices
- **[SEAT_SELECTION_UI_IMPROVEMENTS.md](SEAT_SELECTION_UI_IMPROVEMENTS.md)** - Seat selection UI improvements
- **[SEAT_SELECTION_UPDATES.md](SEAT_SELECTION_UPDATES.md)** - Latest seat selection updates

### 📋 Project Management
- **[docs/SUMMARY_PAGE_BOOKING_INTEGRATION.md](docs/SUMMARY_PAGE_BOOKING_INTEGRATION.md)** - Booking summary integration details

## Contributing

See [DEVELOPMENT.md](DEVELOPMENT.md) for development guidelines and best practices.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the established patterns
4. Test thoroughly (unit tests, integration tests, manual testing)
5. Submit a pull request with a clear description

### Code Standards
- Follow TypeScript strict mode requirements
- Use the `Result<T, E>` pattern for all service functions
- Maintain feature module boundaries
- Write comprehensive tests for new functionality
- Follow the established naming conventions

## License

This project is open source and available under the [MIT License](LICENSE).

---

**🚀 Ready to start?** Begin with [SETUP.md](SETUP.md) to get the project running locally!

**❓ Need help?** Start with [CONCEPTS.md](CONCEPTS.md) if you're new to the patterns used in this project.
