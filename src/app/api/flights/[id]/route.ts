import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const flightId = params.id;

    // NOTE: Add your flight retrieval logic here
    console.log({ flightId });

    // NOTE: Replace with your actual flight data
    const flight = {
      id: flightId,
      airline_id: '1',
      airline_name: 'Airline A',
      flight_number: 'AA123',
      origin: 'JFK',
      destination: 'LAX',
      date: '2024-12-25',
      time: '08:00',
      totalSeats: 150,
      availableSeats: 50,
      priceBase: 300,
      priceTax: 50,
    };

    return NextResponse.json(flight);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
