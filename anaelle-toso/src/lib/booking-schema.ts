/**
 * Schéma de la demande de rendez-vous — partagé entre le formulaire (client) et l'API (serveur).
 * Aucun alias d'import ici : le fichier est aussi testé directement par Node.
 */
import { z } from "zod";

export const REQUEST_TYPES = [
  { id: "premier-rdv", label: "Premier rendez-vous", hint: "Un premier examen pour un ou plusieurs chevaux." },
  { id: "suivi", label: "Suivi dentaire", hint: "Un contrôle régulier pour un cheval déjà suivi." },
  { id: "information", label: "Demande d'informations", hint: "Une question avant de prendre rendez-vous." },
  { id: "deplacement", label: "Demande de déplacement", hint: "Votre écurie est hors de ma zone habituelle." },
] as const;

export const EQUID_TYPES = [
  { id: "cheval", label: "Cheval" },
  { id: "poney", label: "Poney" },
  { id: "ane", label: "Âne" },
  { id: "mule", label: "Mule / bardot" },
  { id: "autre", label: "Autre" },
] as const;

export const SLOTS = [
  { id: "matin", label: "Matin" },
  { id: "apres-midi", label: "Après-midi" },
  { id: "indifferent", label: "Indifférent" },
] as const;

type Ids<T extends readonly { id: string }[]> = T[number]["id"];
const ids = <T extends readonly { id: string }[]>(list: T) => list.map((x) => x.id) as [Ids<T>, ...Ids<T>[]];

const trimmed = (max: number) => z.string().trim().max(max, `${max} caractères maximum.`);
const required = (max: number, msg = "Ce champ est requis.") => trimmed(max).min(1, msg);
const optional = (max: number) => trimmed(max).optional().default("");

export const PHONE_RE = /^\+?[0-9][0-9 .\-()]{7,19}$/;
export const POSTAL_RE = /^[0-9A-Za-z][0-9A-Za-z \-]{2,9}$/;

export const bookingSchema = z
  .object({
    request: z.object({
      type: z.enum(ids(REQUEST_TYPES), { message: "Choisissez le type de demande." }),
    }),
    owner: z.object({
      fullName: required(120, "Indiquez vos nom et prénom.").refine((v) => v.length >= 2, "Indiquez vos nom et prénom."),
      phone: required(24, "Indiquez un numéro de téléphone.").refine((v) => PHONE_RE.test(v), "Ce numéro ne semble pas valide."),
      email: trimmed(160).pipe(z.email({ message: "Cette adresse e-mail ne semble pas valide." })),
    }),
    horse: z.object({
      name: optional(80),
      age: optional(40),
      type: z.enum(ids(EQUID_TYPES)).default("cheval"),
      count: z.coerce.number().int("Nombre entier attendu.").min(1, "Au moins 1.").max(50, "50 au maximum.").default(1),
      notes: optional(1500),
    }),
    location: z.object({
      stable: optional(120),
      address: optional(200),
      postalCode: optional(10),
      city: optional(80),
    }),
    schedule: z.object({
      preferredDate: optional(10),
      slot: z.enum(ids(SLOTS)).default("indifferent"),
      message: optional(2000),
    }),
    consent: z.literal(true, { message: "Votre accord est nécessaire pour transmettre la demande." }),
  })
  .superRefine((data, ctx) => {
    const needsHorse = data.request.type !== "information";
    if (needsHorse && !data.horse.name) {
      ctx.addIssue({ code: "custom", path: ["horse", "name"], message: "Indiquez le nom du cheval (ou du premier cheval)." });
    }
    if (needsHorse) {
      if (!data.location.address) ctx.addIssue({ code: "custom", path: ["location", "address"], message: "Indiquez l'adresse de l'écurie." });
      if (!data.location.city) ctx.addIssue({ code: "custom", path: ["location", "city"], message: "Indiquez la ville." });
      if (!data.location.postalCode) ctx.addIssue({ code: "custom", path: ["location", "postalCode"], message: "Indiquez le code postal." });
    }
    if (data.location.postalCode && !POSTAL_RE.test(data.location.postalCode)) {
      ctx.addIssue({ code: "custom", path: ["location", "postalCode"], message: "Ce code postal ne semble pas valide." });
    }
    if (data.schedule.preferredDate) {
      const d = new Date(data.schedule.preferredDate + "T12:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(d.getTime())) {
        ctx.addIssue({ code: "custom", path: ["schedule", "preferredDate"], message: "Date invalide." });
      } else if (d < today) {
        ctx.addIssue({ code: "custom", path: ["schedule", "preferredDate"], message: "Choisissez une date à venir." });
      }
    }
  });

export type BookingInput = z.input<typeof bookingSchema>;
export type Booking = z.output<typeof bookingSchema>;

/** Métadonnées anti-spam envoyées avec la demande. */
export const metaSchema = z.object({
  website: z.string().max(200).optional().default(""), // pot de miel : doit rester vide
  startedAt: z.number().int().positive(),
  turnstileToken: z.string().max(4096).optional(),
});

export const MIN_FILL_MS = 4000;

/** Champs par étape (pour la validation progressive du formulaire). */
export const STEP_FIELDS: Record<string, string[]> = {
  request: ["request.type"],
  owner: ["owner.fullName", "owner.phone", "owner.email"],
  horse: ["horse.name", "horse.age", "horse.type", "horse.count", "horse.notes"],
  location: ["location.stable", "location.address", "location.postalCode", "location.city"],
  schedule: ["schedule.preferredDate", "schedule.slot", "schedule.message"],
  review: ["consent"],
};

export function labelOf<T extends readonly { id: string; label: string }[]>(list: T, id: string) {
  return list.find((x) => x.id === id)?.label ?? id;
}

/** Erreurs zod → dictionnaire « chemin.pointé » → message. */
export function issuesToErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = i.path.map(String).join(".");
    if (!out[key]) out[key] = i.message;
  }
  return out;
}
