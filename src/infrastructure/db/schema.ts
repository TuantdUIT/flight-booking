import {
    pgTable,
    uuid,
    varchar,
    char,
    date,
    time,
    integer,
    numeric,
    timestamp,
    pgEnum,
    uniqueIndex,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================
// ENUMS
// ==========================

export const paymentStatusEnum = pgEnum("payment_status", [
    "pending",
    "paid",
    "failed",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
    "pending",
    "confirmed",
    "failed",
]);

// ==========================
// AIRLINE
// ==========================

export const airline = pgTable(
    "airline",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: varchar("name", { length: 100 }).notNull(),
        code: varchar("code", { length: 10 }).notNull(),
        country: varchar("country", { length: 100 }),
        createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    },
    (table) => ({
        codeIdx: uniqueIndex("airline_code_idx").on(table.code),
    })
);

export const airlineRelations = relations(airline, ({ many }) => ({
    flights: many(flight),
    bookings: many(booking),
}));

// ==========================
// FLIGHT
// ==========================

export const flight = pgTable(
    "flight",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        airlineId: uuid("airline_id")
            .notNull()
            .references(() => airline.id, { onUpdate: "cascade" }),

        origin: varchar("origin", { length: 10 }).notNull(),
        destination: varchar("destination", { length: 10 }).notNull(),

        date: date("date").notNull(),
        time: time("time").notNull(),

        totalSeats: integer("total_seats").notNull(),
        availableSeats: integer("available_seats").notNull(),

        priceBase: numeric("price_base", { precision: 10, scale: 2 }).notNull(),
        priceTax: numeric("price_tax", { precision: 10, scale: 2 }).notNull(),

        createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    },
    (table) => ({
        airlineIdx: index("flight_airline_idx").on(table.airlineId),
        routeDateIdx: index("flight_route_date_idx").on(
            table.origin,
            table.destination,
            table.date
        ),
    })
);

export const flightRelations = relations(flight, ({ one, many }) => ({
    airline: one(airline, {
        fields: [flight.airlineId],
        references: [airline.id],
    }),
    bookings: many(booking),
}));

// ==========================
// PASSENGER
// ==========================

export const passenger = pgTable(
    "passenger",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: varchar("name", { length: 100 }).notNull(),
        dob: date("dob").notNull(),
        nationality: varchar("nationality", { length: 50 }).notNull(),
        passport: varchar("passport", { length: 50 }).notNull(),
        createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    },
    (table) => ({
        passportIdx: index("passport_idx").on(table.passport),
    })
);

export const passengerRelations = relations(passenger, ({ many }) => ({
    bookings: many(bookingPassenger),
}));

// ==========================
// BOOKING
// ==========================

export const booking = pgTable(
    "booking",
    {
        pnr: char("pnr", { length: 12 }).primaryKey(),

        flightId: uuid("flight_id")
            .notNull()
            .references(() => flight.id, { onUpdate: "cascade" }),

        airlineId: uuid("airline_id")
            .notNull()
            .references(() => airline.id, { onUpdate: "cascade" }),

        amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull(),

        paymentStatus: paymentStatusEnum("payment_status").notNull(),
        bookingStatus: bookingStatusEnum("booking_status").notNull(),

        createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    },
    (table) => ({
        bookingFlightIdx: index("booking_flight_idx").on(table.flightId),
        bookingAirlineIdx: index("booking_airline_idx").on(table.airlineId),
    })
);

export const bookingRelations = relations(booking, ({ one, many }) => ({
    flight: one(flight, {
        fields: [booking.flightId],
        references: [flight.id],
    }),
    airline: one(airline, {
        fields: [booking.airlineId],
        references: [airline.id],
    }),
    passengers: many(bookingPassenger),
}));

// ==========================
// BOOKING PASSENGER (junction)
// ==========================

export const bookingPassenger = pgTable(
    "booking_passenger",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        bookingPnr: char("booking_pnr", { length: 12 })
            .notNull()
            .references(() => booking.pnr, { onDelete: "cascade" }),

        passengerId: uuid("passenger_id")
            .notNull()
            .references(() => passenger.id, { onDelete: "cascade" }),

        createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    },
    (table) => ({
        bookingIdx: index("bp_booking_idx").on(table.bookingPnr),
        passengerIdx: index("bp_passenger_idx").on(table.passengerId),
        uniqueBookingPassenger: uniqueIndex("bp_unique_booking_passenger").on(
            table.bookingPnr,
            table.passengerId
        ),
    })
);

export const bookingPassengerRelations = relations(
    bookingPassenger,
    ({ one }) => ({
        booking: one(booking, {
            fields: [bookingPassenger.bookingPnr],
            references: [booking.pnr],
        }),
        passenger: one(passenger, {
            fields: [bookingPassenger.passengerId],
            references: [passenger.id],
        }),
    })
);
