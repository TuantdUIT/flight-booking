import { NextResponse } from 'next/server';
import { passengersService } from '@/features/passengers/services/passengers.service';
import { createPassengerSchema } from '@/features/passengers/validations/create-passenger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const passengerData = createPassengerSchema.parse(body);
    const passenger = await passengersService.createPassenger(passengerData);
    return NextResponse.json(passenger);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
