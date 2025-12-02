CREATE TYPE "public"."seat_class" AS ENUM('economy', 'business');--> statement-breakpoint
CREATE TABLE "account" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"access_token" text,
	"refresh_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"provider" text,
	"providerAccountId" text
);
--> statement-breakpoint
CREATE TABLE "seat" (
	"id" serial PRIMARY KEY NOT NULL,
	"flight_id" integer,
	"seat_number" text NOT NULL,
	"class" "seat_class" NOT NULL,
	"is_available" boolean DEFAULT true,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" integer,
	"expires" timestamp NOT NULL,
	CONSTRAINT "session_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT "booking_flight_id_flight_id_fk";
--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT "booking_airline_id_airline_id_fk";
--> statement-breakpoint
ALTER TABLE "booking_passenger" DROP CONSTRAINT "booking_passenger_booking_pnr_booking_pnr_fk";
--> statement-breakpoint
ALTER TABLE "booking_passenger" DROP CONSTRAINT "booking_passenger_passenger_id_passenger_id_fk";
--> statement-breakpoint
ALTER TABLE "flight" DROP CONSTRAINT "flight_airline_id_airline_id_fk";
--> statement-breakpoint
DROP INDEX "airline_code_idx";--> statement-breakpoint
DROP INDEX "booking_flight_idx";--> statement-breakpoint
DROP INDEX "booking_airline_idx";--> statement-breakpoint
DROP INDEX "bp_booking_idx";--> statement-breakpoint
DROP INDEX "bp_passenger_idx";--> statement-breakpoint
DROP INDEX "bp_unique_booking_passenger";--> statement-breakpoint
DROP INDEX "flight_airline_idx";--> statement-breakpoint
DROP INDEX "flight_route_date_idx";--> statement-breakpoint
DROP INDEX "passport_idx";--> statement-breakpoint
ALTER TABLE "airline" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "airline" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "airline" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "airline" ALTER COLUMN "country" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "flight_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "flight_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "airline_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "airline_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "amount_paid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "payment_status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "payment_status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "booking_status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "booking_status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_passenger" ALTER COLUMN "passenger_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "flight" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "flight" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "flight" ALTER COLUMN "airline_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "flight" ALTER COLUMN "airline_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "flight" ALTER COLUMN "origin" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "flight" ALTER COLUMN "destination" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "passenger" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "passenger" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "passenger" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "passenger" ALTER COLUMN "dob" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "passenger" ALTER COLUMN "nationality" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "passenger" ALTER COLUMN "nationality" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "passenger" ALTER COLUMN "passport" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "passenger" ALTER COLUMN "passport" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "airline" ADD COLUMN "sdt" text;--> statement-breakpoint
ALTER TABLE "airline" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "booking_passenger" ADD COLUMN "booking_pax_id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_passenger" ADD COLUMN "booking_id" text;--> statement-breakpoint
ALTER TABLE "booking_passenger" ADD COLUMN "seat_id" integer;--> statement-breakpoint
ALTER TABLE "passenger" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "passenger" ADD COLUMN "phonenumber" text;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat" ADD CONSTRAINT "seat_flight_id_flight_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flight"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_flight_id_flight_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flight"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_airline_id_airline_id_fk" FOREIGN KEY ("airline_id") REFERENCES "public"."airline"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_seat_id_seat_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."seat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_passenger_id_passenger_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."passenger"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight" ADD CONSTRAINT "flight_airline_id_airline_id_fk" FOREIGN KEY ("airline_id") REFERENCES "public"."airline"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airline" DROP COLUMN "code";--> statement-breakpoint
ALTER TABLE "airline" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "airline" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "pnr";--> statement-breakpoint
ALTER TABLE "booking_passenger" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "booking_passenger" DROP COLUMN "booking_pnr";--> statement-breakpoint
ALTER TABLE "booking_passenger" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "booking_passenger" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "flight" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "flight" DROP COLUMN "updated_at";