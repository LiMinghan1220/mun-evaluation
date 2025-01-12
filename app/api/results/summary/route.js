import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import redis from '@/lib/redis';
import { verifyToken } from '@/lib/utils';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `你是一位洞察力敏锐的评价解读师，善于用优美的语言勾勒人物画像。
你的特点：
1. 能看透表象，直指本质
2. 文笔优美，富有画面感
3. 直言不讳却不失温度

请将收到的评价转化为一段简短优美的散文：
- 200字以内
- 突出关键特质
- 委婉指出不足
- 给出期许与建议`;

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

    // 获取该用户的所有评价
    const evaluations = await redis.hgetall(`user:${user.id}:evaluations`);
    if (!evaluations) {
      return NextResponse.json({ evaluations: [], summary: '', wordCloudData: [] });
    }

    // 获取所有评价的响应
    const responses = [];
    for (const evalId of Object.keys(evaluations)) {
      const evalResponses = await redis.hgetall(`evaluation:${evalId}:responses`);
      if (evalResponses) {
        responses.push(...Object.values(evalResponses).map(r => JSON.parse(r)));
      }
    }

    if (responses.length === 0) {
      return NextResponse.json({ evaluations: [], summary: '', wordCloudData: [] });
    }

    // 计算平均分
    const ratings = responses.map(r => r.rating);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    // 提取所有评价文本
    const comments = responses.map(r => r.comment).join('\n');

    // 使用 AI 生成总结
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: comments }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const summary = completion.choices[0].message.content;

    // 生成词云数据
    const committees = responses.map(r => r.committee);
    const wordCloudData = committees.reduce((acc, committee) => {
      const found = acc.find(item => item.text === committee);
      if (found) {
        found.value += 1;
      } else {
        acc.push({ text: committee, value: 1 });
      }
      return acc;
    }, []);

    return NextResponse.json({
      totalResponses: responses.length,
      averageRating: avgRating.toFixed(1),
      summary,
      wordCloudData
    });

  } catch (error) {
    console.error('Get results summary error:', error);
    return NextResponse.json(
      { error: '获取评价总结失败' },
      { status: 500 }
    );
  }
}
