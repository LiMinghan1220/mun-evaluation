import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import redis from '@/lib/redis';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { userId, password } = await request.json();
    
    if (!userId || !password) {
      return NextResponse.json(
        { message: '用户ID和密码不能为空' },
        { status: 400 }
      );
    }

    // 查找用户
    const userJson = await redis.get(`user:${userId}`);
    if (!userJson) {
      return NextResponse.json(
        { message: '用户ID或密码错误' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userJson);

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: '用户ID或密码错误' },
        { status: 401 }
      );
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.userId },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '7d' }
    );

    // 设置cookie
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({
      message: '登录成功',
      user: { userId: user.userId }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: '登录失败' },
      { status: 500 }
    );
  }
}
