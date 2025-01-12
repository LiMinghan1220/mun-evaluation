import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST(request) {
  try {
    const { evaluationId, rating, committees, impression, message } = await request.json();
    
    // 验证评价链接是否存在和有效
    const evaluationJson = await redis.get(`evaluation:${evaluationId}`);
    if (!evaluationJson) {
      return NextResponse.json(
        { message: '评价链接不存在或已失效' },
        { status: 404 }
      );
    }

    const evaluation = JSON.parse(evaluationJson);
    if (evaluation.status !== 'active') {
      return NextResponse.json(
        { message: '评价链接已失效' },
        { status: 400 }
      );
    }

    // 生成评价回复ID
    const responseId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 存储评价回复
    await redis.set(`response:${responseId}`, JSON.stringify({
      evaluationId,
      targetUserId: evaluation.targetUserId,
      rating,
      committees,
      impression,
      message,
      createdAt: Date.now()
    }));

    // 将回复ID添加到评价的回复列表中
    await redis.sadd(`evaluation:${evaluationId}:responses`, responseId);
    
    // 将回复ID添加到用户的所有回复列表中
    await redis.sadd(`user:${evaluation.targetUserId}:responses`, responseId);

    // 更新词云和评分缓存
    await updateUserStats(evaluation.targetUserId, committees, rating);

    return NextResponse.json({
      message: '评价提交成功',
      responseId
    });
  } catch (error) {
    console.error('Submit evaluation error:', error);
    return NextResponse.json(
      { message: '提交评价失败' },
      { status: 500 }
    );
  }
}

async function updateUserStats(userId, committees, rating) {
  try {
    // 更新用户的委员会词云数据
    const committeesKey = `user:${userId}:committees`;
    const committeesArray = committees.split(/[,，]/).map(c => c.trim()).filter(Boolean);
    for (const committee of committeesArray) {
      await redis.zincrby(committeesKey, 1, committee);
    }

    // 更新用户的平均评分
    const ratingsKey = `user:${userId}:ratings`;
    await redis.lpush(ratingsKey, rating);
    
    // 只保留最近的100个评分
    await redis.ltrim(ratingsKey, 0, 99);
    
    // 计算并缓存平均分
    const ratings = await redis.lrange(ratingsKey, 0, -1);
    const avgRating = ratings.reduce((sum, r) => sum + parseInt(r), 0) / ratings.length;
    await redis.set(`user:${userId}:avgRating`, avgRating.toFixed(1));
  } catch (error) {
    console.error('Update user stats error:', error);
  }
}
