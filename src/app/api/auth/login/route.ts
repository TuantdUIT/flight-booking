import { NextResponse } from 'next/server';
import { verifyCredentials } from '@/features/auth/services/auth.service';
import { LoginSchema } from '@/features/auth/validations/login';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);
    const result = await verifyCredentials(email, password);
    
    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 401 });
    }

    // Omitting session logic for now as it will be handled by NextAuth
    return NextResponse.json(result.user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
