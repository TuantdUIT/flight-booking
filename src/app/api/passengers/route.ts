import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, dob, nationality, passport } = await request.json();

    // NOTE: Add your passenger creation logic here
    console.log({ name, dob, nationality, passport });

    // NOTE: Replace with your actual passenger data
    const passenger = {
      id: '1',
      name,
      dob,
      nationality,
      passport,
    };

    return NextResponse.json(passenger);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
