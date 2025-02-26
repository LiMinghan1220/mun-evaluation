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
        { success: false, error: '密码不能为空' },
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
      try {
        const exists = await redis.exists(`user:${userId}`);
        if (!exists) {
          isUnique = true;
        }
      } catch (error) {
        console.error('Error checking user existence:', error);
        attempts++;
        continue;
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

    // 存储用户数据
    try {
      const success = await redis.set(`user:${userId}`, user);
      if (!success) {
        throw new Error('存储用户数据失败');
      }
    } catch (error) {
      console.error('Error storing user data:', error);
      throw new Error('注册失败，请稍后重试');
    }

    // 生成 JWT token
    const token = generateToken({ id: userId });

    // 创建响应
    const response = NextResponse.json(
      { success: true, userId },
      { status: 201 }
    );

    // 设置 cookie
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
