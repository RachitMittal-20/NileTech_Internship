// In-memory token bucket. Per-process state — fine for a single server instance,
// but resets on deploy/restart and doesn't share state across instances. If this
// app ever runs on multiple instances (serverless, multi-region, horizontal
// scaling), swap this for a shared store (e.g. Upstash Redis) using the same
// `check(key, options)` signature.

interface Bucket {
  tokens: number
  lastRefill: number
}

interface RateLimitOptions {
  /** Max attempts allowed within `windowMs`. */
  limit: number
  /** Refill window in milliseconds. */
  windowMs: number
}

const buckets = new Map<string, Bucket>()

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): { success: boolean; retryAfterMs: number } {
  const now = Date.now()
  const bucket = buckets.get(key) ?? { tokens: limit, lastRefill: now }

  const elapsed = now - bucket.lastRefill
  const refill = (elapsed / windowMs) * limit
  bucket.tokens = Math.min(limit, bucket.tokens + refill)
  bucket.lastRefill = now

  if (bucket.tokens < 1) {
    buckets.set(key, bucket)
    return { success: false, retryAfterMs: Math.ceil(windowMs / limit) }
  }

  bucket.tokens -= 1
  buckets.set(key, bucket)
  return { success: true, retryAfterMs: 0 }
}
