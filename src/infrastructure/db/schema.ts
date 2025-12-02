import { relations, sql } from "drizzle-orm";
import {
	boolean,
	date,
	decimal,
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	time,
	timestamp,
} from "drizzle-orm/pg-core";

// --- ENUMS (Dựa trên sơ đồ) ---
export const seatClassEnum = pgEnum("seat_class", ["economy", "business"]);
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

// --- TABLES ---

// 1. Airline
export const airlines = pgTable("airline", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	sdt: text("sdt"), // Số điện thoại
	email: text("email"),
	country: text("country"),
});

// 2. Flight
export const flights = pgTable("flight", {
	id: serial("id").primaryKey(),
	airlineId: integer("airline_id").references(() => airlines.id),
	origin: text("origin").notNull(),
	destination: text("destination").notNull(),
	date: date("date").notNull(),
	time: time("time").notNull(), // Lưu ý: PostgreSQL time type
	totalSeats: integer("total_seats").notNull(),
	availableSeats: integer("available_seats").notNull(),
	priceBase: decimal("price_base", { precision: 10, scale: 2 }).notNull(),
	priceTax: decimal("price_tax", { precision: 10, scale: 2 }).notNull(),
});

// 3. Seat
export const seats = pgTable("seat", {
	id: serial("id").primaryKey(),
	flightId: integer("flight_id").references(() => flights.id),
	seatNumber: text("seat_number").notNull(),
	class: seatClassEnum("class").notNull(),
	isAvailable: boolean("is_available").default(true),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// 4. Passenger
export const passengers = pgTable("passenger", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	dob: date("dob"),
	nationality: text("nationality"),
	passport: text("passport"),
	email: text("email"),
	phoneNumber: text("phonenumber"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// 5. User (Better Auth)
export const users = pgTable("user", {
	id: text("id").primaryKey().default(sql`uuidv7()`),
	name: text("name"),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// 6. Account (Better Auth)
export const accounts = pgTable("account", {
	id: text("id").primaryKey().default(sql`uuidv7()`),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
		mode: "date",
	}),
	scope: text("scope"),
	idToken: text("id_token"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// 7. Session (Better Auth)
export const sessions = pgTable("session", {
	id: text("id").primaryKey().default(sql`uuidv7()`),
	token: text("token").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// 8. Verification (Better Auth)
export const verification = pgTable("verification", {
	id: text("id").primaryKey().default(sql`uuidv7()`),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// 9. Booking
export const bookings = pgTable("booking", {
	id: serial("id").primaryKey(),
	flightId: integer("flight_id").references(() => flights.id),
	airlineId: integer("airline_id").references(() => airlines.id),
	userId: text("user_id").references(() => users.id),
	amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }),
	paymentStatus: paymentStatusEnum("payment_status").default("pending"),
	bookingStatus: bookingStatusEnum("booking_status").default("pending"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// 9. BookingPassenger (Bảng trung gian nối Booking - Passenger - Seat)
export const bookingPassengers = pgTable("booking_passenger", {
	bookingPaxId: serial("booking_pax_id").primaryKey(),
	bookingId: integer("booking_id").references(() => bookings.id),
	passengerId: integer("passenger_id").references(() => passengers.id),
	seatId: integer("seat_id").references(() => seats.id),
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

export const bookingPassengerRelations = relations(
	bookingPassengers,
	({ one }) => ({
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
	}),
);
