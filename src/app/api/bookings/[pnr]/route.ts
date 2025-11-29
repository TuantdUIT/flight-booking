import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { pnr: string } }) {
  try {
    const pnr = params.pnr;

    // NOTE: Add your booking retrieval logic here
    console.log({ pnr });

    // NOTE: Replace with your actual booking data
    const booking = {
      pnr,
      flightId: '1',
      airlineId: '1',
      passengers: [],
      amountPaid: 500,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
      flight: {
        id: '1',
        airline_id: '1',
        airline_name: 'Airline A',
        flight_number: 'AA123',
        origin: 'JFK',
        destination: 'LAX',
        date: '2024-12-25',
        time: '08:00',
      },
    };

    return NextResponse.json(booking);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
