import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import redis from '@/lib/redis';

export async function GET() {
  try {
    const token = cookies().get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: '未登录' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    const userJson = await redis.get(`user:${decoded.userId}`);
    
    if (!userJson) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userJson);

    return NextResponse.json({
      user: { userId: user.userId }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { message: '验证失败' },
      { status: 401 }
    );
  }
}
