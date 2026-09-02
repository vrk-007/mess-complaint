/**
 * Simple in-memory rate limiter.
 * Works per-serverless-instance. Good enough for Vercel warm instances.
 * No external dependencies needed.
 *
 * Usage:
 *   const ok = rateLimit("complaint", userId, { max: 5, windowMs: 60_000 });
 *   if (!ok) throw new Error("Too many requests");
 */

interface Entry {
  count: number;
  resetAt: number;
}

// Global map persisted across requests in the same serverless instance
const store = new Map<string, Entry>();

export function rateLimit(
  namespace: string,
  identifier: string,
  options: { max: number; windowMs: number }
): boolean {
  const key = `${namespace}:${identifier}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return true;
  }

  if (entry.count >= options.max) {
    return false; // limit exceeded
  }

  entry.count += 1;
  return true;
}
