import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import redis from '@/lib/redis';
import { verifyToken } from '@/lib/utils';

export async function GET(request) {
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

    // 获取该用户收到的所有评价回复
    const responseIds = await redis.smembers(`user:${user.userId}:responses`);
    
    const responses = await Promise.all(
      responseIds.map(async (id) => {
        const responseJson = await redis.get(`response:${id}`);
        if (!responseJson) return null;
        
        const response = JSON.parse(responseJson);
        return {
          id,
          ...response
        };
      })
    );

    // 过滤掉已删除的回复
    const validResponses = responses.filter(Boolean);
    
    // 按创建时间倒序排序
    validResponses.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({ responses: validResponses });
  } catch (error) {
    console.error('List responses error:', error);
    return NextResponse.json(
      { message: '获取评价回复列表失败' },
      { status: 500 }
    );
  }
}
