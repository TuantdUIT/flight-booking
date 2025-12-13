import { z } from "zod";

export const bookingStatusUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
});

export type BookingStatusUpdateSchema = z.infer<typeof bookingStatusUpdateSchema>;
