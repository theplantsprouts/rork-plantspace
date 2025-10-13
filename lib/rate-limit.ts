interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMITS = {
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  post: { maxRequests: 10, windowMs: 60 * 1000 },
  comment: { maxRequests: 20, windowMs: 60 * 1000 },
  like: { maxRequests: 30, windowMs: 60 * 1000 },
  message: { maxRequests: 30, windowMs: 60 * 1000 },
  default: { maxRequests: 100, windowMs: 60 * 1000 },
};

export type RateLimitType = keyof typeof RATE_LIMITS;

export const checkRateLimit = (
  identifier: string,
  type: RateLimitType = 'default'
): { allowed: boolean; retryAfter?: number } => {
  const key = `${type}:${identifier}`;
  const now = Date.now();
  const limit = RATE_LIMITS[type];
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
    });
    return { allowed: true };
  }
  
  if (entry.count >= limit.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  entry.count++;
  return { allowed: true };
};

export const resetRateLimit = (identifier: string, type: RateLimitType = 'default'): void => {
  const key = `${type}:${identifier}`;
  rateLimitStore.delete(key);
};

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);
