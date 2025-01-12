import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import redis from '@/lib/redis';
import { generateUniqueId } from '@/lib/utils';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { message: '密码不能为空' },
        { status: 400 }
      );
    }

    // 生成唯一用户ID
    let userId;
    let isUnique = false;
    while (!isUnique) {
      userId = generateUniqueId();
      const existingUser = await redis.get(`user:${userId}`);
      if (!existingUser) {
        isUnique = true;
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    await redis.set(`user:${userId}`, JSON.stringify({
      userId,
      password: hashedPassword,
      createdAt: Date.now()
    }));

    return NextResponse.json(
      { message: '注册成功', userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: '注册失败' },
      { status: 500 }
    );
  }
}
