import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// 包装 Redis 方法以确保正确的 URL 格式
const wrapRedis = {
  // 获取值
  get: async (key) => {
    try {
      return await redis.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  // 设置值
  set: async (key, value) => {
    try {
      return await redis.set(key, value);
    } catch (error) {
      console.error('Redis SET error:', error);
      throw error;
    }
  },

  // 删除值
  del: async (key) => {
    try {
      return await redis.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
      throw error;
    }
  },

  // 获取哈希表中的所有字段和值
  hgetall: async (key) => {
    try {
      return await redis.hgetall(key);
    } catch (error) {
      console.error('Redis HGETALL error:', error);
      return null;
    }
  },

  // 设置哈希表字段的值
  hset: async (key, field, value) => {
    try {
      return await redis.hset(key, { [field]: value });
    } catch (error) {
      console.error('Redis HSET error:', error);
      throw error;
    }
  },

  // 获取哈希表中的字段值
  hget: async (key, field) => {
    try {
      return await redis.hget(key, field);
    } catch (error) {
      console.error('Redis HGET error:', error);
      return null;
    }
  },

  // 检查键是否存在
  exists: async (key) => {
    try {
      return await redis.exists(key);
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }
};

export default wrapRedis;
