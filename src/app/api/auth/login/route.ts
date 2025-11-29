import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // NOTE: Add your authentication logic here
    console.log({ email, password });

    // NOTE: Replace with your actual token generation
    const accessToken = 'sample-jwt-token';
    const expiresIn = 3600;

    return NextResponse.json({
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
