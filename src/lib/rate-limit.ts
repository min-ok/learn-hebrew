const buckets = new Map<string, { count: number; resetAt: number }>();

// Best-effort per-instance fixed-window limiter — resets on cold start and
// doesn't share state across serverless instances, but still throttles
// scripted abuse within a warm Vercel lambda.
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
