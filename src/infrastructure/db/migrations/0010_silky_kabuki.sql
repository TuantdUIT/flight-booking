ALTER TABLE "booking_passenger" ADD COLUMN "e_ticket_number" text;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "pnr" text;--> statement-breakpoint
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_e_ticket_number_unique" UNIQUE("e_ticket_number");--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_pnr_unique" UNIQUE("pnr");