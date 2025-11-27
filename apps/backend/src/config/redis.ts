import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

export default redisClient;

// Session store helper
export class RedisSessionStore {
  private prefix = 'session:';

  async get(sessionId: string): Promise<any> {
    const data = await redisClient.get(this.prefix + sessionId);
    return data ? JSON.parse(data) : null;
  }

  async set(sessionId: string, sessionData: any, ttl: number = 604800): Promise<void> {
    await redisClient.setex(
      this.prefix + sessionId,
      ttl,
      JSON.stringify(sessionData)
    );
  }

  async destroy(sessionId: string): Promise<void> {
    await redisClient.del(this.prefix + sessionId);
  }
}

export const sessionStore = new RedisSessionStore();
