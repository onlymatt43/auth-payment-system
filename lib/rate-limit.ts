import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasUpstashConfig =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: ReturnType<typeof Redis.fromEnv> | null = null;

if (hasUpstashConfig) {
  redis = Redis.fromEnv();
}

export const slotsRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      prefix: 'slots:spin',
    })
  : null;

export const emailCodeRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '15 m'),
      prefix: 'auth:email-code',
    })
  : null;

export const emailCodeIpRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      prefix: 'auth:email-ip',
    })
  : null;

