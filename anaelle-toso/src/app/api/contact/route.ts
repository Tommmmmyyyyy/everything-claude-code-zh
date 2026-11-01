import { NextResponse, type NextRequest } from "next/server";
import { contactSchema, CONTACT_SUBJECTS } from "@/lib/forms-schema";
import { issuesToErrors } from "@/lib/booking-schema";
import { guardForm, noChannel } from "@/lib/form-guard";
import { deliverMessage } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const g = await guardForm(req, "contact");
  if ("res" in g) return g.res;
  if (g.honeypot) return NextResponse.json({ ok: true });
  const parsed = contactSchema.safeParse(g.data);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "validation", errors: issuesToErrors(parsed.error.issues) }, { status: 422 });
  const c = parsed.data;
  const subject = CONTACT_SUBJECTS.find((s) => s.id === c.subject)?.label ?? "Message";
  const r = await deliverMessage({
    kind: "contact",
    subject: `Message — ${subject} — ${c.name}`,
    rows: [
      ["Objet", subject],
      ["Nom", c.name],
      ["E-mail", c.email],
      ["Téléphone", c.phone || "—"],
      ["Message", c.message],
    ],
    replyTo: c.email,
    footer: "Répondez directement à cet e-mail pour contacter l'expéditeur.",
    payload: { contact: c },
  });
  if (!r.ok) return noChannel(r.error);
  return NextResponse.json({ ok: true, dev: r.dev ?? false });
}

export function GET() {
  return NextResponse.json({ ok: false, error: "method" }, { status: 405, headers: { Allow: "POST" } });
}
