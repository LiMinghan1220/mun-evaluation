import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error('UPSTASH_REDIS_REST_URL is not defined')
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined')
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// 包装 Redis 方法以确保正确的错误处理
const wrapRedis = {
  // 获取值
  get: async (key) => {
    try {
      const value = await redis.get(key)
      return value
    } catch (error) {
      console.error('Redis GET error:', error)
      throw error
    }
  },

  // 设置值
  set: async (key, value) => {
    try {
      await redis.set(key, value)
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      throw error
    }
  },

  // 删除值
  del: async (key) => {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error('Redis DEL error:', error)
      throw error
    }
  },

  // 检查键是否存在
  exists: async (key) => {
    try {
      const exists = await redis.exists(key)
      return exists === 1
    } catch (error) {
      console.error('Redis EXISTS error:', error)
      throw error
    }
  }
}

export default wrapRedis