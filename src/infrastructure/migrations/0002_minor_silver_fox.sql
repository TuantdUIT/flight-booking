ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "airline" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "airline" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "booking_passenger" ALTER COLUMN "booking_pax_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "booking_passenger" ALTER COLUMN "booking_pax_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "booking_passenger" ALTER COLUMN "booking_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "booking_passenger" ALTER COLUMN "seat_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "flight_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "airline_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "flight" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "flight" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "flight" ALTER COLUMN "airline_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "passenger" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "passenger" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "seat" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "seat" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "seat" ALTER COLUMN "flight_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();