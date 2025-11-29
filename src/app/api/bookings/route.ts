import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { flightId, airlineId, passengers } = await request.json();

    // NOTE: Add your booking creation logic here
    console.log({ flightId, airlineId, passengers });

    // NOTE: Replace with your actual booking data
    const booking = {
      pnr: 'XYZ123',
      flightId,
      airlineId,
      passengers,
      amountPaid: 500,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
    };

    return NextResponse.json(booking);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const authToken = request.headers.get('authorization');
    // NOTE: Add your logic to get bookings for the logged-in user
    console.log({ authToken });

    // NOTE: Replace with your actual booking data
    const bookings = [
      {
        pnr: 'XYZ123',
        flightId: '1',
        airlineId: '1',
        passengers: [],
        amountPaid: 500,
        paymentStatus: 'pending',
        bookingStatus: 'pending',
      },
    ];

    return NextResponse.json(bookings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
