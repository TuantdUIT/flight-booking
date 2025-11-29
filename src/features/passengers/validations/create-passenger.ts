import { z } from 'zod';

export const createPassengerSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email(),
  phone: z.string().min(1, { message: 'Phone number is required' }),
});

export type CreatePassengerSchema = z.infer<typeof createPassengerSchema>;
