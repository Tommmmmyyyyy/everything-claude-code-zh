/**
 * Tests de bout en bout (Playwright) — à lancer sur un serveur démarré :
 *   BASE_URL=http://localhost:3000 node tests/e2e.mjs
 * Vérifie les interactions principales et le parcours complet de demande de rendez-vous.
 */
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require("playwright");
} catch {
  playwright = createRequire("/opt/node22/lib/node_modules/")("playwright");
}
const { chromium } = playwright;
const BASE = process.env.BASE_URL || "http://localhost:3000";

const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(["✓", name]);
  } catch (e) {
    results.push(["✗", name, e.message.split("\n")[0]]);
  }
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error" && !/ERR_TUNNEL|ERR_PROXY|tile\.openstreetmap|Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 200));
});

await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);

const jump = async (id) => {
  await page.evaluate((i) => {
    const el = document.getElementById(i);
    const r = el.closest(".pin-spacer") || el;
    window.scrollTo(0, r.getBoundingClientRect().top + scrollY);
  }, id);
  await page.waitForTimeout(900);
};

await step("le hero affiche le nom et l'accroche", async () => {
  const h1 = await page.locator("h1#hero-title").textContent();
  assert.match(h1, /Anaëlle Toso/);
  assert.match(h1, /bouche en bonne santé/);
});

await step("le menu plein écran s'ouvre et se ferme (Échap)", async () => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /menu/i }).click();
  await page.waitForTimeout(900);
  assert.equal(await page.locator("#menu-plein-ecran").isVisible(), true);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);
  assert.equal(await page.locator("#menu-plein-ecran").isVisible(), false);
});

await step("l'explorateur anatomique change de structure", async () => {
  await jump("dentition");
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2.6));
  await page.waitForTimeout(1600);
  await page.getByRole("tab", { name: "Dents de loup" }).click();
  await page.waitForTimeout(400);
  assert.match(await page.locator("#anat-detail").textContent(), /prémolaires vestigiales/);
  await page.getByRole("tab", { name: "Incisives" }).click();
  await page.waitForTimeout(400);
  assert.match(await page.locator("#anat-detail").textContent(), /Douze incisives/);
});

await step("une prestation se déplie", async () => {
  await jump("prestations");
  const btn = page.locator("#svc-btn-pointes");
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(900);
  assert.equal(await btn.getAttribute("aria-expanded"), "true");
});

await step("l'auto-observation oriente vers le vétérinaire si besoin", async () => {
  await jump("signes");
  await page.locator("#signes label", { hasText: "Mauvaise haleine" }).click();
  await page.waitForTimeout(300);
  assert.match(await page.locator("#signes [aria-live]").textContent(), /avis vétérinaire/);
});

await step("la galerie se filtre et la visionneuse s'ouvre", async () => {
  await jump("galerie");
  await page.getByRole("button", { name: /^Le camion/ }).click();
  await page.waitForTimeout(1400);
  const visible = await page.locator("#galerie li[data-cell]:not(.hidden)").count();
  assert.equal(visible, 2);
  await page.locator("#galerie li[data-cell]:not(.hidden) button").first().click();
  await page.waitForTimeout(600);
  assert.equal(await page.getByRole("dialog").count(), 1);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(300);
  assert.match(await page.getByRole("dialog").textContent(), /02 \/ 02/);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  assert.equal(await page.getByRole("dialog").count(), 0);
});

await step("la FAQ s'ouvre et se referme", async () => {
  await jump("faq");
  const q = page.locator("#faq-q-1");
  await q.click();
  await page.waitForTimeout(600);
  assert.equal(await q.getAttribute("aria-expanded"), "true");
});

await step("le formulaire bloque une étape incomplète", async () => {
  await jump("rendez-vous");
  await page.getByRole("button", { name: /continuer/i }).click(); // étape 1 → 2
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /continuer/i }).click(); // étape 2 vide
  await page.waitForTimeout(500);
  assert.ok((await page.locator(".field-error").count()) >= 2);
});

await step("parcours complet de demande de rendez-vous", async () => {
  await page.waitForTimeout(4200); // délai anti-robot minimal
  await page.fill('[name="owner.fullName"]', "Camille Martin");
  await page.fill('[name="owner.phone"]', "06 12 34 56 78");
  await page.fill('[name="owner.email"]', "camille@example.com");
  await page.getByRole("button", { name: /continuer/i }).click();
  await page.waitForTimeout(500);
  await page.fill('[name="horse.name"]', "Tornade");
  await page.fill('[name="horse.age"]', "9 ans");
  await page.fill('[name="horse.count"]', "2");
  await page.getByRole("button", { name: /continuer/i }).click();
  await page.waitForTimeout(500);
  await page.fill('[name="location.stable"]', "Écurie des Prés");
  await page.fill('[name="location.address"]', "12 chemin des Saules");
  await page.fill('[name="location.postalCode"]', "49000");
  await page.fill('[name="location.city"]', "Angers");
  await page.getByRole("button", { name: /continuer/i }).click();
  await page.waitForTimeout(500);
  const d = new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10);
  await page.fill('[name="schedule.preferredDate"]', d);
  await page.locator("label", { hasText: "Matin" }).click();
  await page.getByRole("button", { name: /continuer/i }).click();
  await page.waitForTimeout(500);
  // Sans consentement : refus
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(400);
  assert.ok(await page.locator("#f-consent-err").isVisible());
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForSelector("text=Votre demande a bien été transmise", { timeout: 8000 });
});

/* API : défenses côté serveur */
const api = async (body, headers = {}) => {
  const r = await fetch(BASE + "/api/rendez-vous", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
  return { status: r.status, json: await r.json().catch(() => ({})) };
};
const valid = {
  request: { type: "information" },
  owner: { fullName: "Test Robot", phone: "0612345678", email: "test@example.com" },
  horse: {},
  location: {},
  schedule: {},
  consent: true,
};
await step("API : envoi trop rapide refusé", async () => {
  const r = await api({ data: valid, meta: { startedAt: Date.now() } });
  assert.equal(r.status, 400);
});
await step("API : pot de miel → réponse neutre, rien transmis", async () => {
  const r = await api({ data: valid, meta: { startedAt: Date.now() - 10000, website: "http://spam" } });
  assert.equal(r.status, 200);
});
await step("API : données invalides → 422 avec erreurs", async () => {
  const r = await api({ data: { ...valid, owner: { fullName: "", phone: "x", email: "y" } }, meta: { startedAt: Date.now() - 10000 } });
  assert.equal(r.status, 422);
  assert.ok(r.json.errors["owner.email"]);
});
await step("API : origine étrangère refusée", async () => {
  const r = await api({ data: valid, meta: { startedAt: Date.now() - 10000 } }, { Origin: "https://evil.example" });
  assert.equal(r.status, 403);
});

await step("pages légales accessibles", async () => {
  for (const p of ["/mentions-legales", "/confidentialite"]) {
    const r = await fetch(BASE + p);
    assert.equal(r.status, 200, p);
  }
  const r404 = await fetch(BASE + "/page-inexistante");
  assert.equal(r404.status, 404);
});

await step("aucune erreur JavaScript dans la console", async () => {
  assert.deepEqual(errors, []);
});

await browser.close();
for (const r of results) console.log(r.join("  "));
const failed = results.filter((r) => r[0] === "✗").length;
console.log(`\n${results.length - failed}/${results.length} vérifications réussies`);
process.exit(failed ? 1 : 0);
