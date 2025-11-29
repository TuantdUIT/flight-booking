import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // NOTE: Add your token invalidation logic here
    const authToken = request.headers.get('authorization');
    console.log({ authToken });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
