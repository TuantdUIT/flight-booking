# 🚀 Getting Started Guide

Welcome to the Flight Booking System! This guide will help you get the project running locally on your machine.

## Hello Developer! 👋

This project is designed to teach you modern web development practices while building something practical. Whether you're a student, fresh graduate, or teacher, you'll learn:

- ✅ **How real applications handle data safely**
- ✅ **Why "error handling" matters so much**
- ✅ **How to write code that doesn't break easily**
- ✅ **Best practices used by professional developers**

## 📚 Learning Path

**If you're new to this, follow this order:**
1. **Start Here** - Read the "Simple Error Handling" section in [CONCEPTS.md](CONCEPTS.md)
2. **Then** - Look at "What is a Database Repository?" in [CONCEPTS.md](CONCEPTS.md)
3. **Finally** - Explore the "Database Safety Features" in [CONCEPTS.md](CONCEPTS.md)

Don't worry if some parts feel advanced - you're learning step by step! 💡

## Prerequisites

Before you begin, make sure you have these installed:

- **Node.js** (version 18 or higher)
- **pnpm** (package manager)
- **Git** (for cloning the repository)

### Installing Node.js

Download from [nodejs.org](https://nodejs.org/) and install the LTS version.

### Installing pnpm

```bash
npm install -g pnpm
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/TuantdUIT/flight-booking.git
cd flight-booking
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all the required packages for the project.

### 3. Set Up the Database

The project uses a PostgreSQL database. We've made this easy with a reset script:

```bash
pnpm run db:reset
```

This command will:
- Create the database schema
- Run migrations
- Seed the database with sample data

### 4. Start the Development Server

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure Overview

After setup, your project should look like this:

```
flight-booking/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── core/         # Shared components and utilities
│   ├── features/     # Feature-specific modules
│   └── infrastructure/ # Database and external services
├── public/           # Static assets
├── scripts/          # Database setup scripts
└── package.json      # Project dependencies
```

## What You Can Do Now

Once everything is running, you can:

1. **Browse flights** - Search for available flights
2. **Create bookings** - Book flights for passengers
3. **Manage passengers** - Add passenger information
4. **View bookings** - See your booking history

## Next Steps

Now that you have the project running, learn about the core concepts:

- **[CONCEPTS.md](CONCEPTS.md)** - Learn about error handling, repositories, and safety features
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Understand how the project is organized
- **[LIBRARIES.md](LIBRARIES.md)** - Learn about all the tools and libraries used

## Troubleshooting

### Common Issues

**Port 3000 is already in use:**
```bash
# Kill the process using port 3000
npx kill-port 3000
# Then restart
pnpm dev
```

**Database connection issues:**
- Make sure your PostgreSQL server is running
- Check your database URL in environment variables

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

## Development Commands

```bash
# Start development server
pnpm dev

# Run tests (when available)
pnpm test

# Format code
pnpm format

# Lint code
pnpm lint

# Reset database
pnpm run db:reset
```

## Need Help?

If you run into issues:
1. Check the [CONCEPTS.md](CONCEPTS.md) for explanations of core patterns
2. Look at the [ARCHITECTURE.md](ARCHITECTURE.md) for project organization
3. Check the browser console and terminal for error messages

Happy coding! 🚀
