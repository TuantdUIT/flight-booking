import { z } from "zod";

export const bookingSearchSchema = z.object({
  userId: z.string().uuid().optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  flightId: z.string().optional(),
  limit: z.number().int().min(1).max(1000).default(50),
  offset: z.number().int().min(0).default(0),
});

export type BookingSearchSchema = z.infer<typeof bookingSearchSchema>;
