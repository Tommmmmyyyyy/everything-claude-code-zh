import { NextResponse, type NextRequest } from "next/server";
import { reviewSchema } from "@/lib/forms-schema";
import { issuesToErrors } from "@/lib/booking-schema";
import { guardForm, noChannel } from "@/lib/form-guard";
import { deliverMessage } from "@/lib/mailer";

export const runtime = "nodejs";

/**
 * Avis clients : transmis à Anaëlle pour modération (e-mail et/ou webhook vers un tableur).
 * Rien n'est publié automatiquement : un avis validé est ajouté dans l'administration (Témoignages).
 */
export async function POST(req: NextRequest) {
  const g = await guardForm(req, "avis");
  if ("res" in g) return g.res;
  if (g.honeypot) return NextResponse.json({ ok: true });
  const parsed = reviewSchema.safeParse(g.data);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "validation", errors: issuesToErrors(parsed.error.issues) }, { status: 422 });
  const a = parsed.data;
  const entry = { name: a.firstName, horse: a.horse || "", rating: a.rating, text: a.comment, image: "", date: new Date().toISOString().slice(0, 7), source: "Site" };
  const r = await deliverMessage({
    kind: "avis",
    subject: `Avis ${"★".repeat(a.rating)}${"☆".repeat(5 - a.rating)} — ${a.firstName}`,
    rows: [
      ["Prénom", a.firstName],
      ["Cheval", a.horse || "—"],
      ["Note", `${a.rating} / 5`],
      ["Avis", a.comment],
      ["E-mail (non publié)", a.email || "—"],
    ],
    replyTo: a.email || undefined,
    footer:
      "Modération : cet avis n'est pas publié automatiquement.\nPour le publier, ajoutez-le dans l'administration du site (Témoignages), ou collez ce bloc dans content/testimonials.json :\n" +
      JSON.stringify(entry, null, 2),
    payload: { review: { ...a, status: "en attente de modération" }, testimonialEntry: entry },
  });
  if (!r.ok) return noChannel(r.error);
  return NextResponse.json({ ok: true, dev: r.dev ?? false });
}

export function GET() {
  return NextResponse.json({ ok: false, error: "method" }, { status: 405, headers: { Allow: "POST" } });
}
