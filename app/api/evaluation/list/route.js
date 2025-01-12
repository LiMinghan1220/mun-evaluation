import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import redis from '@/lib/redis';
import { verifyToken } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    // 验证用户身份
    const token = cookies().get('auth-token')?.value;
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: '未登录或会话已过期' },
        { status: 401 }
      );
    }

    // 获取用户的所有评价
    const evaluations = await redis.hgetall(`user:${user.userId}:evaluations`);
    if (!evaluations) {
      return NextResponse.json({ evaluations: [] });
    }

    // 转换评价数据格式
    const evaluationsList = await Promise.all(
      Object.entries(evaluations).map(async ([id, evalJson]) => {
        const evaluation = JSON.parse(evalJson);
        const responses = await redis.hgetall(`evaluation:${id}:responses`);
        const responseCount = responses ? Object.keys(responses).length : 0;
        
        return {
          id,
          ...evaluation,
          responseCount,
          evaluationUrl: `/evaluate/${id}`
        };
      })
    );

    // 按创建时间排序
    evaluationsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ evaluations: evaluationsList });
  } catch (error) {
    console.error('List evaluations error:', error);
    return NextResponse.json(
      { error: '获取评价列表失败' },
      { status: 500 }
    );
  }
}
