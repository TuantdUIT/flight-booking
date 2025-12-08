import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import dotenv from "dotenv"
import { bookingPassengers, bookings, seats, passengers, flights, airlines, users, accounts } from "@/infrastructure/db/schema";
dotenv.config({path:".env.local"})
import { db } from "../client";

async function seed() {
  console.log("🌱 Seeding database for Vietnamese Airlines System...");

  try {
    // 1. Clear existing data (in reverse order of dependencies)
    console.log("🧹 Clearing existing data...");
    await db.delete(bookingPassengers);
    await db.delete(bookings);
    await db.delete(seats);
    await db.delete(passengers);
    await db.delete(flights);
    await db.delete(airlines);
    await db.delete(users);

    // 2. Insert Users (Vietnamese Users)
    const [user1, user2] = await db
      .insert(users)
      .values([
        {
          name: "Nguyễn Văn An",
          email: "an.nguyen@example.com",
          role: "user", // Default role
        },
        {
          name: "Trần Thị Bình",
          email: "binh.tran@example.com",
          role: "admin",
        },
      ])
      .returning();

    console.log("✅ Users created");

    // Create accounts
    const hashedPassword = await bcrypt.hash("password123", 12);
    await db.insert(accounts).values([
      {
        accountId: "an-creds",
        providerId: "credential",
        userId: user1.id,
        password: hashedPassword,
      },
      {
        accountId: "binh-creds",
        providerId: "credential",
        userId: user2.id,
        password: hashedPassword,
      },
    ]);

    console.log("✅ User accounts created");

    // 3. Insert 4 Specific Airlines
    const [vnAir, vjAir, pacificAir, bambooAir] = await db
      .insert(airlines)
      .values([
        {
          name: "Vietnam Airlines",
          sdt: "1900 1100",
          email: "telesales@vietnamairlines.com",
          country: "Vietnam",
        },
        {
          name: "VietJet Air",
          sdt: "1900 1886",
          email: "19001886@vietjetair.com",
          country: "Vietnam",
        },
        {
          name: "Pacific Airlines",
          sdt: "1900 1550",
          email: "callcenter@pacificairlines.com.vn",
          country: "Vietnam",
        },
        {
          name: "Bamboo Airways",
          sdt: "1900 1166",
          email: "19001166@bambooairways.com",
          country: "Vietnam",
        },
      ])
      .returning();

    console.log("✅ Airlines created");

    // 4. Define Helper Data for Flights
    const airports = [
      "Tân Sơn Nhất (SGN)",
      "Nội Bài (HAN)",
      "Đà Nẵng (DAD)",
      "Cam Ranh (CXR)",
      "Phú Quốc (PQC)",
      "Cát Bi (HPH)",
    ];

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    // Flight Generation Helper
    // Prices in VND: Base range 800k - 3m, Tax fixed or percentage
    const flightData = [
      // Vietnam Airlines Flights
      {
        airlineId: vnAir.id,
        origin: "Nội Bài (HAN)",
        destination: "Tân Sơn Nhất (SGN)",
        date: formatDate(today),
        time: "08:00:00",
        totalSeats: 160,
        availableSeats: 160,
        priceBase: "2500000.00",
        priceTax: "450000.00",
      },
      {
        airlineId: vnAir.id,
        origin: "Tân Sơn Nhất (SGN)",
        destination: "Phú Quốc (PQC)",
        date: formatDate(tomorrow),
        time: "10:30:00",
        totalSeats: 120,
        availableSeats: 110,
        priceBase: "1800000.00",
        priceTax: "350000.00",
      },
      // VietJet Air Flights
      {
        airlineId: vjAir.id,
        origin: "Đà Nẵng (DAD)",
        destination: "Nội Bài (HAN)",
        date: formatDate(today),
        time: "14:15:00",
        totalSeats: 180,
        availableSeats: 150,
        priceBase: "980000.00",
        priceTax: "320000.00",
      },
      {
        airlineId: vjAir.id,
        origin: "Tân Sơn Nhất (SGN)",
        destination: "Cam Ranh (CXR)",
        date: formatDate(dayAfterTomorrow),
        time: "07:45:00",
        totalSeats: 180,
        availableSeats: 180,
        priceBase: "650000.00",
        priceTax: "280000.00",
      },
      // Bamboo Airways Flights
      {
        airlineId: bambooAir.id,
        origin: "Nội Bài (HAN)",
        destination: "Cát Bi (HPH)",
        date: formatDate(tomorrow),
        time: "16:00:00",
        totalSeats: 100,
        availableSeats: 90,
        priceBase: "1200000.00",
        priceTax: "300000.00",
      },
      {
        airlineId: bambooAir.id,
        origin: "Phú Quốc (PQC)",
        destination: "Nội Bài (HAN)",
        date: formatDate(dayAfterTomorrow),
        time: "09:20:00",
        totalSeats: 150,
        availableSeats: 120,
        priceBase: "2100000.00",
        priceTax: "400000.00",
      },
      // Pacific Airlines Flights
      {
        airlineId: pacificAir.id,
        origin: "Tân Sơn Nhất (SGN)",
        destination: "Đà Nẵng (DAD)",
        date: formatDate(today),
        time: "19:00:00",
        totalSeats: 180,
        availableSeats: 175,
        priceBase: "890000.00",
        priceTax: "290000.00",
      },
    ];

    const createdFlights = await db.insert(flights).values(flightData).returning();
    console.log(`✅ ${createdFlights.length} Flights created`);

    // 5. Generate Seats for ALL flights
    // Requirement: Economy = price_base, Business = price_base * 2.5
    const allSeatsData = [];

    for (const flight of createdFlights) {
      const basePrice = parseFloat(flight.priceBase as string);
      const businessPrice = (basePrice * 2.5).toFixed(2);
      const economyPrice = basePrice.toFixed(2);

      // Configuration: 20 rows total.
      // Rows 1-3: Business (4 seats/row: A, C, D, F) -> High end config
      // Rows 4-20: Economy (6 seats/row: A, B, C, D, E, F)
      
      // Business Class (Rows 1-3)
      for (let row = 1; row <= 3; row++) {
        for (const letter of ["A", "C", "D", "F"]) {
          allSeatsData.push({
            flightId: flight.id,
            seatNumber: `${row}${letter}`,
            class: "business" as const,
            isAvailable: true,
            price: businessPrice, // Constraint 3
          });
        }
      }

      // Economy Class (Rows 4-20)
      for (let row = 4; row <= 20; row++) {
        for (const letter of ["A", "B", "C", "D", "E", "F"]) {
          allSeatsData.push({
            flightId: flight.id,
            seatNumber: `${row}${letter}`,
            class: "economy" as const,
            isAvailable: true,
            price: economyPrice, // Constraint 3
          });
        }
      }
    }

    // Insert in chunks to avoid query limits if necessary, though this size is usually fine
    const createdSeats = await db.insert(seats).values(allSeatsData).returning();
    console.log(`✅ ${createdSeats.length} Seats created`);

    // 6. Insert Passengers (Vietnamese people)
    const passengerList = await db
      .insert(passengers)
      .values([
        {
          name: "Lê Thị Hồng",
          dob: "1990-05-15",
          nationality: "Vietnam",
          passport: "B1234567",
          email: "hong.le@email.com",
          phoneNumber: "0901234567",
        },
        {
          name: "Phạm Văn Minh",
          dob: "1985-11-20",
          nationality: "Vietnam",
          passport: "C9876543",
          email: "minh.pham@email.com",
          phoneNumber: "0912345678",
        },
        {
          name: "Nguyễn Thu Hà",
          dob: "1998-03-10",
          nationality: "Vietnam",
          passport: "D4567891",
          email: "ha.nguyen@email.com",
          phoneNumber: "0987654321",
        },
      ])
      .returning();

    console.log("✅ Sample Vietnamese passengers created");

    // 7. Create Sample Bookings
    // Note: ensure amountPaid includes base + tax
    const bookingList = await db
      .insert(bookings)
      .values([
        {
          flightId: createdFlights[0].id, // VN Air HAN-SGN
          airlineId: vnAir.id,
          userId: user1.id,
          amountPaid: "2950000.00", // 2.5m + 450k
          paymentStatus: "paid",
          bookingStatus: "confirmed",
        },
        {
          flightId: createdFlights[2].id, // VJ Air DAD-HAN
          airlineId: vjAir.id,
          userId: user2.id,
          amountPaid: "1300000.00", // 980k + 320k
          paymentStatus: "paid",
          bookingStatus: "confirmed",
        },
      ])
      .returning();

    console.log("✅ Sample bookings created");

    // 8. Link Passengers to Bookings (Assigning Seats)
    // We need to find available seats for these flights first
    const flight0Seats = createdSeats.filter(s => s.flightId === createdFlights[0].id && s.class === "economy");
    const flight2Seats = createdSeats.filter(s => s.flightId === createdFlights[2].id && s.class === "economy");

    await db.insert(bookingPassengers).values([
      {
        bookingId: bookingList[0].id,
        passengerId: passengerList[0].id,
        seatId: flight0Seats[0].id,
      },
      {
        bookingId: bookingList[1].id,
        passengerId: passengerList[1].id,
        seatId: flight2Seats[0].id,
      },
    ]);

    // Update seat availability (optional but good for consistency)
    await db.update(seats)
      .set({ isAvailable: false })
      .where(sql`id IN (${flight0Seats[0].id}, ${flight2Seats[0].id})`); // Assuming you import sql from drizzle-orm if needed, otherwise skip this logic for simple seed

    console.log("✅ Booking-passenger relationships created");
    console.log("🎉 Database seeded successfully with Vietnamese Airline Data!");

    // Print summary
    console.log("\n📊 Seeding Summary:");
    console.log(`   • Users: 2`);
    console.log(`   • Airlines: 4 (VN, VJ, Pacific, Bamboo)`);
    console.log(`   • Flights: ${createdFlights.length}`);
    console.log(`   • Seats: ${createdSeats.length}`);
    console.log(`   • Passengers: ${passengerList.length}`);
    console.log(`   • Bookings: ${bookingList.length}`);

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

seed();