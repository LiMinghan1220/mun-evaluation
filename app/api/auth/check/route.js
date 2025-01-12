import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const token = cookies().get('auth-token')?.value;
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: '身份验证失败' },
      { status: 500 }
    );
  }
}
