import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import redis from '@/lib/redis';
import { generateUniqueId, generateToken } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { error: '密码不能为空' },
        { status: 400 }
      );
    }

    // 生成唯一用户ID
    let userId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      userId = generateUniqueId();
      const existingUser = await redis.get(`user:${userId}`);
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('无法生成唯一用户ID');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const user = {
      id: userId,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    await redis.set(`user:${userId}`, JSON.stringify(user));

    // 生成 JWT token
    const token = generateToken({ id: userId });

    // 设置 cookie
    const response = NextResponse.json(
      { success: true, userId },
      { status: 201 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || '注册失败，请稍后重试' 
      },
      { status: 500 }
    );
  }
}
