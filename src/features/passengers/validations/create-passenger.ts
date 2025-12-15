import { z } from "zod";

export const createPassengerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" })
    .regex(/^[\p{L} ]+$/u, { message: "First name must only contain letters and spaces" }),
  lastName: z.string().min(1, { message: "Last name is required" })
    .regex(/^[\p{L} ]+$/u, { message: "Last name must only contain letters and spaces" }),
  email: z.string().email(),
  phone: z.string().min(1, { message: "Phone number is required" }),
});

export type CreatePassengerSchema = z.infer<typeof createPassengerSchema>;
