import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import redis from '@/lib/redis';
import { generateToken } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const { userId, password } = await request.json();

    if (!userId || !password) {
      return NextResponse.json(
        { success: false, error: '用户ID和密码不能为空' },
        { status: 400 }
      );
    }

    // 获取用户信息
    const userJson = await redis.get(`user:${userId}`);
    if (!userJson) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 401 }
      );
    }

    let user;
    try {
      user = JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return NextResponse.json(
        { success: false, error: '用户数据格式错误' },
        { status: 500 }
      );
    }

    if (!user || !user.password) {
      console.error('Invalid user data:', user);
      return NextResponse.json(
        { success: false, error: '用户数据不完整' },
        { status: 500 }
      );
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '密码错误' },
        { status: 401 }
      );
    }

    // 生成 JWT token
    const token = generateToken({ id: userId });

    // 创建响应
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId
      }
    });

    // 设置 cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '登录失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}
