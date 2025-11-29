import { NextResponse } from 'next/server';
import { authService } from '@/features/auth/services/auth.service';
import { loginSchema } from '@/features/auth/validations/login';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const credentials = loginSchema.parse(body);
    const result = await authService.login(credentials);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
