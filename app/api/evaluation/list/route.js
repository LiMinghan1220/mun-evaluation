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

    // 获取该用户创建的所有评价链接
    const evaluationIds = await redis.smembers(`user:${user.userId}:evaluations`);
    
    const evaluations = await Promise.all(
      evaluationIds.map(async (id) => {
        const evaluationJson = await redis.get(`evaluation:${id}`);
        if (!evaluationJson) return null;
        
        const evaluation = JSON.parse(evaluationJson);
        
        // 获取该评价链接收到的回复数量
        const responseCount = await redis.scard(`evaluation:${id}:responses`);
        
        return {
          id,
          ...evaluation,
          responseCount,
          evaluationUrl: `/evaluate/${id}`
        };
      })
    );

    // 过滤掉已删除的评价
    const validEvaluations = evaluations.filter(Boolean);
    
    // 按创建时间倒序排序
    validEvaluations.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({ evaluations: validEvaluations });
  } catch (error) {
    console.error('List evaluations error:', error);
    return NextResponse.json(
      { message: '获取评价列表失败' },
      { status: 500 }
    );
  }
}
