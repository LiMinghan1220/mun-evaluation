import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: `${process.env.UPSTASH_REDIS_REST_URL}/rest`,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;
