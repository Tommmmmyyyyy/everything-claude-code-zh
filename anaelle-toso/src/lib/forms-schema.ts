/**
 * Schémas des formulaires de contact et d'avis (partagés client / serveur, testés par Node).
 */
import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max, `${max} caractères maximum.`);

export const CONTACT_SUBJECTS = [
  { id: "question", label: "Une question" },
  { id: "devis", label: "Un tarif / un devis" },
  { id: "deplacement", label: "Un déplacement" },
  { id: "autre", label: "Autre" },
] as const;

export const contactSchema = z.object({
  name: trimmed(120).min(2, "Indiquez votre nom."),
  email: trimmed(160).pipe(z.email({ message: "Cette adresse e-mail ne semble pas valide." })),
  phone: trimmed(24)
    .optional()
    .default("")
    .refine((v) => !v || /^\+?[0-9][0-9 .\-()]{7,19}$/.test(v), "Ce numéro ne semble pas valide."),
  subject: z.enum(["question", "devis", "deplacement", "autre"]).default("question"),
  message: trimmed(3000).min(10, "Votre message est un peu court (10 caractères minimum)."),
  consent: z.literal(true, { message: "Votre accord est nécessaire pour envoyer le message." }),
});

export const reviewSchema = z.object({
  firstName: trimmed(40).min(2, "Indiquez votre prénom."),
  horse: trimmed(60).optional().default(""),
  rating: z.coerce.number().int().min(1, "Choisissez une note de 1 à 5.").max(5, "Choisissez une note de 1 à 5."),
  comment: trimmed(1500).min(15, "Votre avis est un peu court (15 caractères minimum)."),
  email: trimmed(160)
    .optional()
    .default("")
    .refine((v) => !v || z.email().safeParse(v).success, "Cette adresse e-mail ne semble pas valide."),
  consent: z.literal(true, { message: "Votre accord est nécessaire pour publier l'avis." }),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ReviewInput = z.input<typeof reviewSchema>;
