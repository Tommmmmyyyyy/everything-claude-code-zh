import { NextResponse, type NextRequest } from "next/server";
import { metaSchema, MIN_FILL_MS } from "./booking-schema";
import { rateLimit } from "./rate-limit";
import { verifyTurnstile } from "./turnstile";

/**
 * Contrôles communs aux formulaires : origine, taille, débit, pot de miel, délai, Turnstile.
 * Renvoie { res } si la requête doit s'arrêter, sinon { data } (le contenu du formulaire).
 */
export async function guardForm(req: NextRequest, scope: string): Promise<{ res: NextResponse } | { data: unknown; honeypot: boolean }> {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return { res: NextResponse.json({ ok: false, error: "origin" }, { status: 403 }) };
  const raw = await req.text();
  if (raw.length > 20_000) return { res: NextResponse.json({ ok: false, error: "too-large" }, { status: 413 }) };
  let payload: { data?: unknown; meta?: unknown };
  try {
    payload = JSON.parse(raw);
  } catch {
    return { res: NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }) };
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
  const rl = rateLimit(`${scope}:${ip ?? "anonyme"}`);
  if (!rl.ok) {
    return { res: NextResponse.json({ ok: false, error: "rate-limited", message: "Trop d'envois. Merci de réessayer un peu plus tard." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }) };
  }
  const m = metaSchema.safeParse(payload.meta);
  if (!m.success) return { res: NextResponse.json({ ok: false, error: "bad-meta" }, { status: 400 }) };
  if (m.data.website) return { data: null, honeypot: true };
  const elapsed = Date.now() - m.data.startedAt;
  if (elapsed < MIN_FILL_MS || elapsed > 24 * 3600 * 1000) {
    return { res: NextResponse.json({ ok: false, error: "timing", message: "Merci de vérifier le formulaire puis de l'envoyer à nouveau." }, { status: 400 }) };
  }
  const ts = await verifyTurnstile(m.data.turnstileToken, ip);
  if (!ts.ok) return { res: NextResponse.json({ ok: false, error: "captcha", message: "La vérification anti-spam a échoué. Merci de réessayer." }, { status: 400 }) };
  return { data: payload.data, honeypot: false };
}

export function noChannel(error?: string) {
  const message =
    error === "no-channel"
      ? "Le service d'envoi n'est pas encore configuré. Merci de contacter Anaëlle par téléphone ou par e-mail."
      : "Votre message n'a pas pu être transmis. Merci de réessayer ou de contacter Anaëlle directement.";
  return NextResponse.json({ ok: false, error, message }, { status: 503 });
}
