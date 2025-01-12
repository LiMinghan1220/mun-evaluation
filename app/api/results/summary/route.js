import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import redis from '@/lib/redis';
import { verifyToken } from '@/lib/utils';
import OpenAI from 'openai';

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
        { message: '未登录' },
        { status: 401 }
      );
    }

    // 获取用户的所有评价回复
    const responseIds = await redis.smembers(`user:${user.userId}:responses`);
    
    const responses = await Promise.all(
      responseIds.map(async (id) => {
        const responseJson = await redis.get(`response:${id}`);
        return responseJson ? JSON.parse(responseJson) : null;
      })
    );

    // 过滤掉无效的回复
    const validResponses = responses.filter(Boolean);

    if (validResponses.length === 0) {
      return NextResponse.json({
        summary: "你的故事尚未开始，期待未来的篇章由你执笔书写。",
        wordCloudData: [],
        avgRating: 0,
        totalResponses: 0
      });
    }

    // 获取缓存的平均分
    const avgRating = parseFloat(await redis.get(`user:${user.userId}:avgRating`) || "0");

    // 获取委员会词云数据
    const committeesWithScores = await redis.zrange(`user:${user.userId}:committees`, 0, -1, "WITHSCORES");
    const wordCloudData = [];
    for (let i = 0; i < committeesWithScores.length; i += 2) {
      wordCloudData.push({
        text: committeesWithScores[i],
        value: parseInt(committeesWithScores[i + 1])
      });
    }

    // 构建更有文学性的提示
    const evaluations = validResponses.map(r => r.message).join("\\n");
    const userPrompt = `基于以下评价：\\n${evaluations}\\n\\n请用优美的散文勾勒这个人的形象，突出特点，委婉指出不足，并给出建议。`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const summary = completion.choices[0].message.content;

    // 格式化评价列表，添加时间戳
    const formattedResponses = validResponses.map(response => ({
      message: response.message,
      timestamp: response.timestamp || new Date(response.created_at).toISOString(),
      committee: response.committee || '未指定委员会',
      rating: response.rating || 0
    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return NextResponse.json({
      summary,
      wordCloudData,
      avgRating,
      totalResponses: validResponses.length,
      responses: formattedResponses
    });
  } catch (error) {
    console.error('Get results summary error:', error);
    return NextResponse.json(
      { message: '获取结果总结失败' },
      { status: 500 }
    );
  }
}
