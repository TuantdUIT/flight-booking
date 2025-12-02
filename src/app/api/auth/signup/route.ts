import { NextResponse } from 'next/server';
import { signup } from '@/features/auth/services/auth.service';
import { SignUpSchema } from '@/features/auth/validations/signup';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = SignUpSchema.parse(body);
    const result = await signup(data);

    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    return NextResponse.json(result.user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
