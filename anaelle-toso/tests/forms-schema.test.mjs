// Tests des schémas de contact et d'avis (node --test).
import { test } from "node:test";
import assert from "node:assert/strict";
import { contactSchema, reviewSchema } from "../src/lib/forms-schema.ts";

const contact = { name: "Camille Martin", email: "camille@example.com", phone: "", subject: "question", message: "Bonjour, une question sur le suivi.", consent: true };
const review = { firstName: "Camille", horse: "Tornade", rating: 5, comment: "Intervention très douce, cheval détendu.", email: "", consent: true };

test("contact : accepte un message complet", () => {
  const r = contactSchema.safeParse(contact);
  assert.equal(r.success, true, JSON.stringify(r.error?.issues));
});

test("contact : refuse e-mail invalide, message trop court et absence d'accord", () => {
  const r = contactSchema.safeParse({ ...contact, email: "x", message: "court", consent: false });
  assert.equal(r.success, false);
  const paths = r.error.issues.map((i) => i.path.join("."));
  for (const p of ["email", "message", "consent"]) assert.ok(paths.includes(p), p);
});

test("contact : téléphone facultatif mais vérifié s'il est fourni", () => {
  assert.equal(contactSchema.safeParse({ ...contact, phone: "07 44 73 49 56" }).success, true);
  assert.equal(contactSchema.safeParse({ ...contact, phone: "abc" }).success, false);
});

test("avis : accepte un avis complet et convertit la note", () => {
  const r = reviewSchema.safeParse({ ...review, rating: "4" });
  assert.equal(r.success, true, JSON.stringify(r.error?.issues));
  assert.equal(r.data.rating, 4);
});

test("avis : la note doit être un entier de 1 à 5", () => {
  for (const rating of [0, 6, 2.5]) assert.equal(reviewSchema.safeParse({ ...review, rating }).success, false, String(rating));
});

test("avis : publication soumise à l'accord explicite", () => {
  assert.equal(reviewSchema.safeParse({ ...review, consent: false }).success, false);
});
