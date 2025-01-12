import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import redis from '@/lib/redis';
import { verifyToken } from '@/lib/utils';

export async function POST(request) {
  try {
    // 验证用户身份
    const token = cookies().get('auth-token')?.value;
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { message: '未登录' },
        { status: 401 }
      );
    }

    const { targetUserId } = await request.json();
    
    // 生成唯一的评价链接ID
    const evaluationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 存储评价链接信息
    await redis.set(`evaluation:${evaluationId}`, JSON.stringify({
      targetUserId,
      creatorId: user.userId,
      createdAt: Date.now(),
      status: 'active'
    }));

    // 将评价ID添加到用户的评价列表中
    await redis.sadd(`user:${user.userId}:evaluations`, evaluationId);

    return NextResponse.json({
      message: '评价链接创建成功',
      evaluationId,
      evaluationUrl: `/evaluate/${evaluationId}`
    });
  } catch (error) {
    console.error('Create evaluation error:', error);
    return NextResponse.json(
      { message: '创建评价链接失败' },
      { status: 500 }
    );
  }
}
