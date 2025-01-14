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
    let userJson;
    try {
      userJson = await redis.get(`user:${userId}`);
      if (!userJson) {
        return NextResponse.json(
          { success: false, error: '用户不存在' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json(
        { success: false, error: '获取用户数据失败' },
        { status: 500 }
      );
    }

    // 解析用户数据
    let user;
    try {
      user = JSON.parse(userJson);
      if (!user || typeof user !== 'object') {
        throw new Error('Invalid user data format');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      return NextResponse.json(
        { success: false, error: '用户数据格式错误' },
        { status: 500 }
      );
    }

    // 验证用户数据
    if (!user.id || !user.password) {
      console.error('Invalid user data structure:', user);
      return NextResponse.json(
        { success: false, error: '用户数据不完整' },
        { status: 500 }
      );
    }

    // 验证密码
    try {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: '密码错误' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Password comparison error:', error);
      return NextResponse.json(
        { success: false, error: '密码验证失败' },
        { status: 500 }
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
