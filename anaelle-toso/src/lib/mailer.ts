import "server-only";
import type { Booking } from "./booking-schema";
import { EQUID_TYPES, REQUEST_TYPES, SLOTS, labelOf } from "./booking-schema";

/**
 * Transmission de la demande de rendez-vous.
 * Canaux pris en charge (cumulables) : Resend (API HTTP), SMTP (nodemailer), webhook (Make, Zapier, n8n…).
 * En développement, sans canal configuré, la demande est écrite dans .data/demandes.jsonl.
 */

export type DeliveryResult = { ok: boolean; channels: string[]; dev?: boolean; error?: string };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function frDate(iso: string) {
  if (!iso) return "Non précisée";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function summarize(b: Booking) {
  const rows: [string, string][] = [
    ["Type de demande", labelOf(REQUEST_TYPES, b.request.type)],
    ["Nom et prénom", b.owner.fullName],
    ["Téléphone", b.owner.phone],
    ["E-mail", b.owner.email],
    ["Cheval", b.horse.name || "—"],
    ["Âge", b.horse.age || "—"],
    ["Type d'équidé", labelOf(EQUID_TYPES, b.horse.type)],
    ["Nombre de chevaux", String(b.horse.count)],
    ["Informations complémentaires", b.horse.notes || "—"],
    ["Écurie", b.location.stable || "—"],
    ["Adresse", b.location.address || "—"],
    ["Code postal", b.location.postalCode || "—"],
    ["Ville", b.location.city || "—"],
    ["Date souhaitée", frDate(b.schedule.preferredDate)],
    ["Créneau souhaité", labelOf(SLOTS, b.schedule.slot)],
    ["Message", b.schedule.message || "—"],
  ];
  return rows;
}

export function renderEmail(b: Booking) {
  const rows = summarize(b);
  const subject = `Demande de rendez-vous — ${labelOf(REQUEST_TYPES, b.request.type)} — ${b.owner.fullName}`;
  const text = rows.map(([k, v]) => `${k} : ${v}`).join("\n") + "\n\nRépondre directement à cet e-mail pour contacter le propriétaire.";
  const html = `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#f4eadb;font-family:Arial,Helvetica,sans-serif;color:#0d0a07">
  <table role="presentation" width="100%" style="max-width:640px;margin:auto;background:#fffaf2;border-radius:12px;border:1px solid #e3d6c0">
    <tr><td style="padding:28px 28px 8px"><p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7a4b2a">Nouvelle demande via le site</p>
    <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-weight:normal;font-size:26px">${esc(subject)}</h1></td></tr>
    <tr><td style="padding:16px 28px 28px"><table role="presentation" width="100%" style="border-collapse:collapse">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 12px 8px 0;border-top:1px dashed #d9c4a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b5a45;vertical-align:top;width:38%">${esc(k)}</td><td style="padding:8px 0;border-top:1px dashed #d9c4a0;font-size:15px;white-space:pre-wrap">${esc(v)}</td></tr>`,
      )
      .join("")}
    </table>
    <p style="margin:20px 0 0;font-size:13px;color:#6b5a45">Répondez directement à cet e-mail pour contacter ${esc(b.owner.fullName)}.</p></td></tr>
  </table></body></html>`;
  return { subject, text, html };
}

export function renderAck(b: Booking) {
  const subject = "Votre demande de rendez-vous a bien été transmise";
  const text = `Bonjour ${b.owner.fullName},\n\nVotre demande (${labelOf(REQUEST_TYPES, b.request.type)}) a bien été transmise. Je vous recontacte rapidement pour convenir ensemble d'un rendez-vous. Votre demande ne vaut pas confirmation de rendez-vous.\n\nÀ très vite,\nAnaëlle Toso`;
  const html = `<p>Bonjour ${esc(b.owner.fullName)},</p><p>Votre demande (<strong>${esc(labelOf(REQUEST_TYPES, b.request.type))}</strong>) a bien été transmise. Je vous recontacte rapidement pour convenir ensemble d'un rendez-vous. Votre demande ne vaut pas confirmation de rendez-vous.</p><p>À très vite,<br>Anaëlle Toso</p>`;
  return { subject, text, html };
}

async function sendResend(to: string, mail: { subject: string; text: string; html: string }, replyTo?: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.BOOKING_FROM, to: [to], reply_to: replyTo, ...mail }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

async function sendSmtp(to: string, mail: { subject: string; text: string; html: string }, replyTo?: string) {
  const nodemailer = (await import("nodemailer")).default;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transport.sendMail({ from: process.env.BOOKING_FROM, to, replyTo, ...mail });
}

async function sendWebhook(b: Booking) {
  const res = await fetch(process.env.BOOKING_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.BOOKING_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.BOOKING_WEBHOOK_SECRET } : {}),
    },
    body: JSON.stringify({ receivedAt: new Date().toISOString(), booking: b, summary: Object.fromEntries(summarize(b)) }),
  });
  if (!res.ok) throw new Error(`Webhook ${res.status}`);
}

export function configuredChannels() {
  const to = process.env.BOOKING_TO;
  return {
    resend: !!(process.env.RESEND_API_KEY && process.env.BOOKING_FROM && to),
    smtp: !!(process.env.SMTP_HOST && process.env.BOOKING_FROM && to),
    webhook: !!process.env.BOOKING_WEBHOOK_URL,
  };
}

export async function deliver(b: Booking): Promise<DeliveryResult> {
  const ch = configuredChannels();
  const to = process.env.BOOKING_TO!;
  const mail = renderEmail(b);
  const done: string[] = [];
  const errors: string[] = [];

  if (ch.resend) {
    try {
      await sendResend(to, mail, b.owner.email);
      done.push("resend");
    } catch (e) {
      errors.push(String(e));
    }
  }
  if (ch.smtp && !done.includes("resend")) {
    try {
      await sendSmtp(to, mail, b.owner.email);
      done.push("smtp");
    } catch (e) {
      errors.push(String(e));
    }
  }
  if (ch.webhook) {
    try {
      await sendWebhook(b);
      done.push("webhook");
    } catch (e) {
      errors.push(String(e));
    }
  }

  // Accusé de réception facultatif au propriétaire
  if (done.length && process.env.BOOKING_SEND_ACK === "true") {
    const ack = renderAck(b);
    try {
      if (ch.resend) await sendResend(b.owner.email, ack, to);
      else if (ch.smtp) await sendSmtp(b.owner.email, ack, to);
    } catch (e) {
      console.warn("[rendez-vous] accusé de réception non envoyé :", e);
    }
  }

  if (done.length) return { ok: true, channels: done };

  if (!ch.resend && !ch.smtp && !ch.webhook) {
    if (process.env.NODE_ENV !== "production") {
      // Mode développement : la demande est conservée localement pour pouvoir tester le parcours.
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const dir = path.join(process.cwd(), ".data");
      await fs.mkdir(dir, { recursive: true });
      await fs.appendFile(path.join(dir, "demandes.jsonl"), JSON.stringify({ receivedAt: new Date().toISOString(), ...b }) + "\n");
      console.info("[rendez-vous] (dev) demande enregistrée dans .data/demandes.jsonl —", mail.subject);
      return { ok: true, channels: ["dev-file"], dev: true };
    }
    return { ok: false, channels: [], error: "no-channel" };
  }
  console.error("[rendez-vous] échec d'envoi :", errors);
  return { ok: false, channels: [], error: "send-failed" };
}

/* ─────────────────────────────────────────────────────────────
   Messages génériques (contact, avis) — mêmes canaux que les rendez-vous
   ───────────────────────────────────────────────────────────── */
export interface GenericMessage {
  kind: "contact" | "avis";
  subject: string;
  rows: [string, string][];
  replyTo?: string;
  footer?: string;
  payload: Record<string, unknown>;
}

function renderGeneric(m: GenericMessage) {
  const text = m.rows.map(([k, v]) => `${k} : ${v}`).join("\n") + (m.footer ? `\n\n${m.footer}` : "");
  const html = `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#f4eadb;font-family:Arial,Helvetica,sans-serif;color:#0d0a07">
  <table role="presentation" width="100%" style="max-width:640px;margin:auto;background:#fffaf2;border-radius:12px;border:1px solid #e3d6c0">
    <tr><td style="padding:28px 28px 8px"><p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7a4b2a">${m.kind === "avis" ? "Nouvel avis à modérer" : "Nouveau message via le site"}</p>
    <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-weight:normal;font-size:24px">${esc(m.subject)}</h1></td></tr>
    <tr><td style="padding:16px 28px 28px"><table role="presentation" width="100%" style="border-collapse:collapse">
    ${m.rows.map(([k, v]) => `<tr><td style="padding:8px 12px 8px 0;border-top:1px dashed #d9c4a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b5a45;vertical-align:top;width:34%">${esc(k)}</td><td style="padding:8px 0;border-top:1px dashed #d9c4a0;font-size:15px;white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}
    </table>${m.footer ? `<p style="margin:20px 0 0;font-size:13px;color:#6b5a45;white-space:pre-wrap">${esc(m.footer)}</p>` : ""}</td></tr>
  </table></body></html>`;
  return { subject: m.subject, text, html };
}

export async function deliverMessage(m: GenericMessage): Promise<DeliveryResult> {
  const ch = configuredChannels();
  const to = process.env.BOOKING_TO!;
  const mail = renderGeneric(m);
  const done: string[] = [];
  const errors: string[] = [];
  if (ch.resend) {
    try {
      await sendResend(to, mail, m.replyTo);
      done.push("resend");
    } catch (e) {
      errors.push(String(e));
    }
  }
  if (ch.smtp && !done.includes("resend")) {
    try {
      await sendSmtp(to, mail, m.replyTo);
      done.push("smtp");
    } catch (e) {
      errors.push(String(e));
    }
  }
  if (ch.webhook) {
    try {
      const res = await fetch(process.env.BOOKING_WEBHOOK_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(process.env.BOOKING_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.BOOKING_WEBHOOK_SECRET } : {}) },
        body: JSON.stringify({ kind: m.kind, receivedAt: new Date().toISOString(), ...m.payload }),
      });
      if (!res.ok) throw new Error(`Webhook ${res.status}`);
      done.push("webhook");
    } catch (e) {
      errors.push(String(e));
    }
  }
  if (done.length) return { ok: true, channels: done };
  if (!ch.resend && !ch.smtp && !ch.webhook) {
    if (process.env.NODE_ENV !== "production") {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const dir = path.join(process.cwd(), ".data");
      await fs.mkdir(dir, { recursive: true });
      await fs.appendFile(path.join(dir, `${m.kind}.jsonl`), JSON.stringify({ receivedAt: new Date().toISOString(), ...m.payload }) + "\n");
      return { ok: true, channels: ["dev-file"], dev: true };
    }
    return { ok: false, channels: [], error: "no-channel" };
  }
  console.error(`[${m.kind}] échec d'envoi :`, errors);
  return { ok: false, channels: [], error: "send-failed" };
}
