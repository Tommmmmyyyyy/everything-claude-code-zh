// Tests du schéma de demande de rendez-vous (node --test, TypeScript retiré nativement par Node ≥ 22.18).
import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingSchema, issuesToErrors, metaSchema } from "../src/lib/booking-schema.ts";

const future = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
const valid = {
  request: { type: "premier-rdv" },
  owner: { fullName: "Camille Martin", phone: "06 12 34 56 78", email: "camille@example.com" },
  horse: { name: "Tornade", age: "9 ans", type: "cheval", count: "2", notes: "" },
  location: { stable: "Écurie des Prés", address: "12 chemin des Saules", postalCode: "69001", city: "Lyon" },
  schedule: { preferredDate: future, slot: "matin", message: "" },
  consent: true,
};

test("accepte une demande complète", () => {
  const r = bookingSchema.safeParse(valid);
  assert.equal(r.success, true, JSON.stringify(r.error?.issues));
  assert.equal(r.data.horse.count, 2);
});

test("exige le consentement", () => {
  const r = bookingSchema.safeParse({ ...valid, consent: false });
  assert.equal(r.success, false);
  assert.ok(issuesToErrors(r.error.issues).consent);
});

test("refuse un e-mail et un téléphone invalides", () => {
  const r = bookingSchema.safeParse({ ...valid, owner: { fullName: "A B", phone: "abc", email: "pas-un-mail" } });
  const e = issuesToErrors(r.error.issues);
  assert.ok(e["owner.phone"]);
  assert.ok(e["owner.email"]);
});

test("exige cheval et adresse sauf pour une demande d'informations", () => {
  const noLoc = { ...valid, horse: { ...valid.horse, name: "" }, location: { stable: "", address: "", postalCode: "", city: "" } };
  const r1 = bookingSchema.safeParse(noLoc);
  const e = issuesToErrors(r1.error.issues);
  assert.ok(e["horse.name"] && e["location.address"] && e["location.city"] && e["location.postalCode"]);
  const r2 = bookingSchema.safeParse({ ...noLoc, request: { type: "information" } });
  assert.equal(r2.success, true, JSON.stringify(r2.error?.issues));
});

test("refuse une date passée", () => {
  const r = bookingSchema.safeParse({ ...valid, schedule: { ...valid.schedule, preferredDate: "2020-01-01" } });
  assert.ok(issuesToErrors(r.error.issues)["schedule.preferredDate"]);
});

test("méta anti-spam", () => {
  assert.equal(metaSchema.safeParse({ startedAt: Date.now() }).success, true);
  assert.equal(metaSchema.safeParse({ website: "", startedAt: -1 }).success, false);
});
