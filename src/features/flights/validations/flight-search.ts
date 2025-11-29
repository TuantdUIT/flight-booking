import { z } from 'zod';

export const flightSearchSchema = z.object({
  origin: z.string().min(1, { message: 'Origin is required' }),
  destination: z.string().min(1, { message: 'Destination is required' }),
  departureDate: z.string().min(1, { message: 'Departure date is required' }),
  passengers: z.number().int().min(1, { message: 'At least one passenger is required' }),
});

export type FlightSearchSchema = z.infer<typeof flightSearchSchema>;
