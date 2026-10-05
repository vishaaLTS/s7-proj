import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/rbac';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export class RateLimiter {
  /**
   * Enforces rate limiting per key (e.g. IP or User ID).
   * Default: 30 requests per minute.
   */
  public static check(key: string, maxRequests = 30, windowMs = 60 * 1000): NextResponse | null {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return null;
    }

    if (record.count >= maxRequests) {
      return errorResponse('Too many requests. Please try again later.', 'RATE_LIMIT_EXCEEDED', 429);
    }

    record.count++;
    return null;
  }
}
