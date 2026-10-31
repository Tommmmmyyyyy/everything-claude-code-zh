/**
 * Limitation de débit en mémoire (par IP). Première barrière simple :
 * sur une plateforme serverless, chaque instance possède sa propre mémoire.
 * Pour une limite globale, brancher un stockage partagé (ex. Upstash Redis).
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= limit) {
    hits.set(key, list);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - list[0])) / 1000) };
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}
