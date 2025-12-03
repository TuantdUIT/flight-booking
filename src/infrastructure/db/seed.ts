import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.dev" });

import { db } from "@/infrastructure/db/client";
import { accounts, airlines, bookingPassengers, bookings, flights, passengers, seats, users } from "@/infrastructure/db/schema";

async function seed() {
	console.log("🌱 Seeding database...");

	try {
		// Clear existing data (in reverse order of dependencies)
		console.log("🧹 Clearing existing data...");
		await db.delete(bookingPassengers);
		await db.delete(bookings);
		await db.delete(seats);
		await db.delete(passengers);
		await db.delete(flights);
		await db.delete(airlines);
		await db.delete(users);

		// Insert users first
		const [user1, user2] = await db
			.insert(users)
			.values([
				{
					name: "John Doe",
					email: "john@university.edu",
				},
				{
					name: "Jane Smith",
					email: "jane@university.edu",
				},
			])
			.returning();

		console.log("✅ Users created");

		// Create accounts with passwords for better-auth
		const hashedPassword = await bcrypt.hash("password123", 12);
		await db.insert(accounts).values([
			{
				accountId: "john-creds",
				providerId: "credential",
				userId: user1.id,
				password: hashedPassword,
			},
			{
				accountId: "jane-creds",
				providerId: "credential",
				userId: user2.id,
				password: hashedPassword,
			},
		]);

		console.log("✅ User accounts created");

		// Insert airlines
		const [uniAir, uniAirExpress] = await db
			.insert(airlines)
			.values([
				{
					name: "UniAir",
					sdt: "+1-800-UNIAIR",
					email: "info@uniair.com",
					country: "United States",
				},
				{
					name: "UniAir Express",
					sdt: "+1-800-UNIEXP",
					email: "info@uniairexpress.com",
					country: "United States",
				},
			])
			.returning();

		console.log("✅ Airlines created");

		// Insert flights for today and future dates
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);

		const formatDate = (date: Date) => date.toISOString().split("T")[0];

		const flightList = await db
			.insert(flights)
			.values([
				// Today's flights
				{
					airlineId: uniAir.id,
					origin: "JFK",
					destination: "LAX",
					date: formatDate(today),
					time: "08:00:00",
					totalSeats: 180,
					availableSeats: 45,
					priceBase: "299.00",
					priceTax: "30.00",
				},
				{
					airlineId: uniAir.id,
					origin: "JFK",
					destination: "LAX",
					date: formatDate(today),
					time: "14:00:00",
					totalSeats: 180,
					availableSeats: 12,
					priceBase: "349.00",
					priceTax: "30.00",
				},
				{
					airlineId: uniAir.id,
					origin: "JFK",
					destination: "LAX",
					date: formatDate(today),
					time: "20:00:00",
					totalSeats: 180,
					availableSeats: 3,
					priceBase: "259.00",
					priceTax: "30.00",
				},
				// Tomorrow's flights
				{
					airlineId: uniAirExpress.id,
					origin: "JFK",
					destination: "LAX",
					date: formatDate(tomorrow),
					time: "06:00:00",
					totalSeats: 150,
					availableSeats: 28,
					priceBase: "399.00",
					priceTax: "30.00",
				},
				{
					airlineId: uniAir.id,
					origin: "JFK",
					destination: "LAX",
					date: formatDate(tomorrow),
					time: "12:00:00",
					totalSeats: 180,
					availableSeats: 67,
					priceBase: "319.00",
					priceTax: "30.00",
				},
				// Additional routes
				{
					airlineId: uniAir.id,
					origin: "LAX",
					destination: "JFK",
					date: formatDate(tomorrow),
					time: "15:00:00",
					totalSeats: 180,
					availableSeats: 89,
					priceBase: "329.00",
					priceTax: "30.00",
				},
				{
					airlineId: uniAir.id,
					origin: "JFK",
					destination: "ORD",
					date: formatDate(today),
					time: "10:30:00",
					totalSeats: 160,
					availableSeats: 34,
					priceBase: "199.00",
					priceTax: "25.00",
				},
				{
					airlineId: uniAirExpress.id,
					origin: "ORD",
					destination: "SFO",
					date: formatDate(tomorrow),
					time: "16:45:00",
					totalSeats: 140,
					availableSeats: 56,
					priceBase: "279.00",
					priceTax: "28.00",
				},
			])
			.returning();

		console.log("✅ Flights created");

		// Insert seats for the first flight only (for demo purposes)
		const seatData = [];
		const firstFlight = flightList[0];

		// Economy seats (A-F, rows 1-10) for demo
		for (let row = 1; row <= 10; row++) {
			for (const letter of ["A", "B", "C", "D", "E", "F"]) {
				seatData.push({
					flightId: firstFlight.id,
					seatNumber: `${row}${letter}`,
					class: "economy" as const,
					isAvailable: true,
					price: firstFlight.priceBase,
				});
			}
		}

		const createdSeats = await db.insert(seats).values(seatData).returning();
		console.log("✅ Seats created");

		// Insert sample passengers
		const passengerList = await db
			.insert(passengers)
			.values([
				{
					name: "John Doe",
					dob: "1995-05-15",
					nationality: "United States",
					passport: "US123456789",
					email: "john@university.edu",
					phoneNumber: "+1-234-567-8900",
				},
				{
					name: "Jane Smith",
					dob: "1988-09-22",
					nationality: "Canada",
					passport: "CA987654321",
					email: "jane@university.edu",
					phoneNumber: "+1-234-567-8901",
				},
				{
					name: "Mike Johnson",
					dob: "1992-03-10",
					nationality: "United Kingdom",
					passport: "UK456789123",
					email: "mike@university.edu",
					phoneNumber: "+44-20-7946-0958",
				},
			])
			.returning();

		console.log("✅ Sample passengers created");

		// Insert sample bookings
		const bookingList = await db
			.insert(bookings)
			.values([
				{
					flightId: flightList[0].id,
					airlineId: uniAir.id,
					userId: user1.id,
					amountPaid: "329.00",
					paymentStatus: "paid",
					bookingStatus: "confirmed",
				},
				{
					flightId: flightList[3].id,
					airlineId: uniAirExpress.id,
					userId: user2.id,
					amountPaid: "429.00",
					paymentStatus: "paid",
					bookingStatus: "confirmed",
				},
				{
					flightId: flightList[6].id,
					airlineId: uniAir.id,
					userId: user1.id,
					amountPaid: "224.00",
					paymentStatus: "pending",
					bookingStatus: "pending",
				},
			])
			.returning();

		console.log("✅ Sample bookings created");

		// Link passengers to bookings with seats
		await db.insert(bookingPassengers).values([
			{
				bookingId: bookingList[0].id,
				passengerId: passengerList[0].id,
				seatId: createdSeats[0].id,
			},
			{
				bookingId: bookingList[1].id,
				passengerId: passengerList[1].id,
				seatId: createdSeats[1].id,
			},
			{
				bookingId: bookingList[2].id,
				passengerId: passengerList[2].id,
				seatId: createdSeats[2].id,
			},
		]);

		console.log("✅ Booking-passenger relationships created");
		console.log("🎉 Database seeded successfully!");

		// Print summary
		console.log("\n📊 Seeding Summary:");
		console.log(`   • ${2} Users created`);
		console.log(`   • ${2} Airlines created`);
		console.log(`   • ${flightList.length} Flights created`);
		console.log(`   • ${createdSeats.length} Seats created`);
		console.log(`   • ${passengerList.length} Passengers created`);
		console.log(`   • ${bookingList.length} Bookings created`);
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		throw error;
	}
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seed()
		.then(() => {
			console.log("Seeding completed");
			process.exit(0);
		})
		.catch((error) => {
			console.error("Seeding failed:", error);
			process.exit(1);
		});
}

export { seed };
