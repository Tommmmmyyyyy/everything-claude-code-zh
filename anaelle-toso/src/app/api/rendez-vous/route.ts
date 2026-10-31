import { NextResponse, type NextRequest } from "next/server";
import { bookingSchema, issuesToErrors, metaSchema, MIN_FILL_MS } from "@/lib/booking-schema";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { deliver } from "@/lib/mailer";

export const runtime = "nodejs";

const MAX_BYTES = 20_000;

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
}

export async function POST(req: NextRequest) {
  // 1. Origine : la demande doit provenir du site lui-même
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ ok: false, error: "origin" }, { status: 403 });
  }

  // 2. Taille du corps
  const raw = await req.text();
  if (raw.length > MAX_BYTES) return NextResponse.json({ ok: false, error: "too-large" }, { status: 413 });

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }
  const { data, meta } = (payload ?? {}) as { data?: unknown; meta?: unknown };

  // 3. Limitation de débit
  const ip = clientIp(req);
  const rl = rateLimit(ip ?? "anonyme");
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "rate-limited", message: "Trop de demandes envoyées. Merci de réessayer un peu plus tard." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  // 4. Anti-spam : pot de miel, délai minimal, Turnstile éventuel
  const m = metaSchema.safeParse(meta);
  if (!m.success) return NextResponse.json({ ok: false, error: "bad-meta" }, { status: 400 });
  const elapsed = Date.now() - m.data.startedAt;
  if (m.data.website) {
    // Robot probable : réponse neutre, rien n'est transmis.
    return NextResponse.json({ ok: true });
  }
  if (elapsed < MIN_FILL_MS || elapsed > 24 * 3600 * 1000) {
    return NextResponse.json({ ok: false, error: "timing", message: "Merci de vérifier votre demande puis de l'envoyer à nouveau." }, { status: 400 });
  }
  const ts = await verifyTurnstile(m.data.turnstileToken, ip);
  if (!ts.ok) {
    return NextResponse.json({ ok: false, error: "captcha", message: "La vérification anti-spam a échoué. Merci de réessayer." }, { status: 400 });
  }

  // 5. Validation du contenu
  const parsed = bookingSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation", errors: issuesToErrors(parsed.error.issues) }, { status: 422 });
  }

  // 6. Transmission
  const result = await deliver(parsed.data);
  if (!result.ok) {
    const message =
      result.error === "no-channel"
        ? "Le service d'envoi n'est pas encore configuré. Merci de contacter Anaëlle par téléphone ou par e-mail."
        : "Votre demande n'a pas pu être transmise. Merci de réessayer ou de contacter Anaëlle directement.";
    return NextResponse.json({ ok: false, error: result.error, message }, { status: 503 });
  }
  return NextResponse.json({ ok: true, dev: result.dev ?? false });
}

export function GET() {
  return NextResponse.json({ ok: false, error: "method" }, { status: 405, headers: { Allow: "POST" } });
}
