CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed');--> statement-breakpoint
CREATE TABLE "airline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10) NOT NULL,
	"country" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "booking" (
	"pnr" char(12) PRIMARY KEY NOT NULL,
	"flight_id" uuid NOT NULL,
	"airline_id" uuid NOT NULL,
	"amount_paid" numeric(10, 2) NOT NULL,
	"payment_status" "payment_status" NOT NULL,
	"booking_status" "booking_status" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "booking_passenger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_pnr" char(12) NOT NULL,
	"passenger_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "flight" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"airline_id" uuid NOT NULL,
	"origin" varchar(10) NOT NULL,
	"destination" varchar(10) NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"total_seats" integer NOT NULL,
	"available_seats" integer NOT NULL,
	"price_base" numeric(10, 2) NOT NULL,
	"price_tax" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "passenger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"dob" date NOT NULL,
	"nationality" varchar(50) NOT NULL,
	"passport" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_flight_id_flight_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flight"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_airline_id_airline_id_fk" FOREIGN KEY ("airline_id") REFERENCES "public"."airline"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_booking_pnr_booking_pnr_fk" FOREIGN KEY ("booking_pnr") REFERENCES "public"."booking"("pnr") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_passenger_id_passenger_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."passenger"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight" ADD CONSTRAINT "flight_airline_id_airline_id_fk" FOREIGN KEY ("airline_id") REFERENCES "public"."airline"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "airline_code_idx" ON "airline" USING btree ("code");--> statement-breakpoint
CREATE INDEX "booking_flight_idx" ON "booking" USING btree ("flight_id");--> statement-breakpoint
CREATE INDEX "booking_airline_idx" ON "booking" USING btree ("airline_id");--> statement-breakpoint
CREATE INDEX "bp_booking_idx" ON "booking_passenger" USING btree ("booking_pnr");--> statement-breakpoint
CREATE INDEX "bp_passenger_idx" ON "booking_passenger" USING btree ("passenger_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bp_unique_booking_passenger" ON "booking_passenger" USING btree ("booking_pnr","passenger_id");--> statement-breakpoint
CREATE INDEX "flight_airline_idx" ON "flight" USING btree ("airline_id");--> statement-breakpoint
CREATE INDEX "flight_route_date_idx" ON "flight" USING btree ("origin","destination","date");--> statement-breakpoint
CREATE INDEX "passport_idx" ON "passenger" USING btree ("passport");