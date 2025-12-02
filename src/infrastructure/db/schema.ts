import { 
  pgTable, 
  text, 
  integer, 
  timestamp, 
  boolean, 
  decimal,
  date,
  time,
  pgEnum,
  serial
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMS (Dựa trên sơ đồ) ---
export const seatClassEnum = pgEnum('seat_class', ['economy', 'business']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'failed']);

// --- TABLES ---

// 1. Airline
export const airlines = pgTable('airline', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sdt: text('sdt'), // Số điện thoại
  email: text('email'),
  country: text('country'),
});

// 2. Flight
export const flights = pgTable('flight', {
  id: serial('id').primaryKey(),
  airlineId: integer('airline_id').references(() => airlines.id),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  date: date('date').notNull(),
  time: time('time').notNull(), // Lưu ý: PostgreSQL time type
  totalSeats: integer('total_seats').notNull(),
  availableSeats: integer('available_seats').notNull(),
  priceBase: decimal('price_base', { precision: 10, scale: 2 }).notNull(),
  priceTax: decimal('price_tax', { precision: 10, scale: 2 }).notNull(),
});

// 3. Seat
export const seats = pgTable('seat', {
  id: serial('id').primaryKey(),
  flightId: integer('flight_id').references(() => flights.id),
  seatNumber: text('seat_number').notNull(),
  class: seatClassEnum('class').notNull(),
  isAvailable: boolean('is_available').default(true),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});

// 4. Passenger
export const passengers = pgTable('passenger', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  dob: date('dob'),
  nationality: text('nationality'),
  passport: text('passport'),
  email: text('email'),
  phoneNumber: text('phonenumber'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. User (Auth System)
export const users = pgTable('user', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password'),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

// 6. Account (Auth System - NextAuth)
export const accounts = pgTable('account', {
  id: serial('id').primaryKey(),
  userId: integer('userId').references(() => users.id, { onDelete: 'cascade' }),
  access_token: text('access_token'),
  refresh_token: text('refresh_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  provider: text('provider'),
  providerAccountId: text('providerAccountId'),
});

// 7. Session (Auth System - NextAuth)
export const sessions = pgTable('session', {
  id: serial('id').primaryKey(),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: integer('userId').references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// 8. Booking
export const bookings = pgTable('booking', {
  id: serial('id').primaryKey(),
  flightId: integer('flight_id').references(() => flights.id),
  airlineId: integer('airline_id').references(() => airlines.id),
  userId: integer('user_id').references(() => users.id),
  amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }),
  paymentStatus: paymentStatusEnum('payment_status').default('pending'),
  bookingStatus: bookingStatusEnum('booking_status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 9. BookingPassenger (Bảng trung gian nối Booking - Passenger - Seat)
export const bookingPassengers = pgTable('booking_passenger', {
  bookingPaxId: serial('booking_pax_id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id),
  passengerId: integer('passenger_id').references(() => passengers.id),
  seatId: integer('seat_id').references(() => seats.id),
});

// --- RELATIONS (Để query dễ dàng hơn với Drizzle Query API) ---

export const airlineRelations = relations(airlines, ({ many }) => ({
  flights: many(flights),
}));

export const flightRelations = relations(flights, ({ one, many }) => ({
  airline: one(airlines, {
    fields: [flights.airlineId],
    references: [airlines.id],
  }),
  seats: many(seats),
  bookings: many(bookings),
}));

export const bookingRelations = relations(bookings, ({ one, many }) => ({
  flight: one(flights, {
    fields: [bookings.flightId],
    references: [flights.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  passengers: many(bookingPassengers),
}));

export const bookingPassengerRelations = relations(bookingPassengers, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingPassengers.bookingId],
    references: [bookings.id],
  }),
  passenger: one(passengers, {
    fields: [bookingPassengers.passengerId],
    references: [passengers.id],
  }),
  seat: one(seats, {
    fields: [bookingPassengers.seatId],
    references: [seats.id],
  }),
}));