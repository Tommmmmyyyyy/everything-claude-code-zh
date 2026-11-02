/**
 * Tests de bout en bout (Playwright) — à lancer sur un serveur démarré :
 *   BASE_URL=http://localhost:3000 node tests/e2e.mjs
 * (serveur de développement : sans canal d'envoi configuré, les formulaires y sont acceptés en mode test ;
 *  la limite anti-spam des API impose d'attendre 15 min ou de redémarrer le serveur entre deux passes)
 * Vérifie l'architecture multipage (navigation, liens, retour arrière), les carrousels,
 * les animations signatures, la FAQ, les formulaires (rendez-vous, contact, avis) et les API.
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
const PAGES = ["/", "/mon-histoire", "/prestations", "/rendez-vous", "/galerie", "/faq", "/contact"];

const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(["✓", name]);
  } catch (e) {
    results.push(["✗", name, e.message.split("\n")[0]]);
  }
}

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error" && !/ERR_TUNNEL|ERR_PROXY|tile\.openstreetmap|Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 200));
});

const go = async (path) => {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
};
const jump = async (id, extra = 0) => {
  await page.evaluate(
    ([i, x]) => {
      const el = document.getElementById(i);
      const r = el.closest(".pin-spacer") || el;
      window.scrollTo(0, r.getBoundingClientRect().top + scrollY + x * innerHeight);
    },
    [id, extra],
  );
  await page.waitForTimeout(900);
};

/* ── Architecture ── */
await step("les 7 pages répondent et ont un titre h1 unique", async () => {
  for (const p of PAGES) {
    const r = await fetch(BASE + p);
    assert.equal(r.status, 200, p);
    const html = await r.text();
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `h1 sur ${p}`);
  }
});

await step("tous les liens internes et ancres existent", async () => {
  const cache = new Map();
  const htmlOf = async (p) => {
    if (!cache.has(p)) {
      const r = await fetch(BASE + p);
      cache.set(p, { status: r.status, html: r.status === 200 ? await r.text() : "" });
    }
    return cache.get(p);
  };
  const broken = [];
  for (const p of PAGES) {
    const { html } = await htmlOf(p);
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
    for (const h of hrefs) {
      if (!h.startsWith("/") && !h.startsWith("#")) continue;
      if (h.startsWith("/_next") || h.startsWith("/icon") || h.startsWith("/favicon")) continue;
      const [pathq, hash] = (h.startsWith("#") ? p + h : h).split("#");
      const path = pathq.split("?")[0] || "/";
      const t = await htmlOf(path);
      if (t.status !== 200) broken.push(`${p} → ${h} (${t.status})`);
      else if (hash && !t.html.includes(`id="${hash}"`)) broken.push(`${p} → ${h} (ancre absente)`);
    }
  }
  assert.deepEqual(broken, []);
});

await step("aucune photo de matériel ni de concours, aucune mention du vétérinaire", async () => {
  for (const p of PAGES) {
    const html = await (await fetch(BASE + p)).text();
    assert.ok(!/materiel-[a-z-]+\.jpg|concours\.jpg|cso-la-falize/.test(html), p);
    assert.ok(!/vétérinaire/i.test(html), `mention du vétérinaire sur ${p}`);
  }
});

await step("le diplôme de l'École de Mancy est indiqué", async () => {
  const html = await (await fetch(BASE + "/mon-histoire")).text();
  assert.ok(html.includes("École de Mancy"));
});

await go("/");

await step("le hero affiche le nom et l'accroche", async () => {
  const h1 = await page.locator("h1#hero-title").textContent();
  assert.match(h1, /Anaëlle Toso/);
  assert.match(h1, /bouche en bonne santé/);
});

await step("le menu principal compte 7 pages et le bouton Prendre rendez-vous", async () => {
  const nav = page.getByRole("navigation", { name: "Navigation principale" });
  assert.equal(await nav.locator("a").count(), 7);
  assert.equal(await page.locator("header a", { hasText: /demander un rendez-vous/i }).first().getAttribute("href"), "/rendez-vous");
});

await step("le carrousel des prestations avance (flèche)", async () => {
  await jump("soins");
  const region = page.locator("#soins [aria-roledescription=carrousel]");
  await region.getByRole("button", { name: "Suivant" }).click();
  await page.waitForTimeout(1200);
  assert.match(await region.locator("[aria-live]").textContent(), /^02/);
});

await step("l'animation « anatomie en mouvement » se charge et mène aux prestations", async () => {
  await jump("anatomie-en-mouvement", 0.5);
  await page.waitForTimeout(2500);
  const sec = page.locator("#anatomie-en-mouvement");
  assert.equal(await sec.locator("canvas").count(), 1);
  const hrefs = await sec.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  assert.ok(hrefs.includes("/prestations"));
});

await step("une carte de soin ouvre sa fiche sur la page Prestations", async () => {
  await jump("soins");
  await page.locator('#soins a[href="/prestations#fiche-tables"]').click();
  await page.waitForURL("**/prestations#fiche-tables", { timeout: 8000 });
  await page.waitForTimeout(2500);
  const box = await page.locator("#fiche-tables").boundingBox();
  assert.ok(box && box.y < 900 && box.y > -400, `fiche hors écran (${box?.y})`);
});

await step("le bouton retour du navigateur revient à l'accueil", async () => {
  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  assert.equal(new URL(page.url()).pathname, "/");
  assert.ok(await page.locator("h1#hero-title").isVisible());
});

await step("navigation par le menu avec transition", async () => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: /Mon histoire/ }).click();
  await page.waitForURL("**/mon-histoire", { timeout: 8000 });
  // le rideau doit se relever rapidement après l'arrivée sur la page
  await page.waitForFunction(() => getComputedStyle(document.querySelector("[data-curtain]")).visibility === "hidden", null, { timeout: 9000 });
  assert.match(await page.locator("h1").textContent(), /passion/);
});

await step("menu plein écran (tablette) : 7 vignettes, fermeture Échap", async () => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /ouvrir le menu/i }).click();
  await page.waitForTimeout(1000);
  const menu = page.locator("#menu-plein-ecran");
  assert.equal(await menu.isVisible(), true);
  assert.equal(await menu.getByRole("navigation", { name: "Pages du site" }).locator("a").count(), 7);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);
  assert.equal(await menu.isVisible(), false);
  await page.setViewportSize({ width: 1440, height: 900 });
});

/* ── Prestations ── */
await go("/prestations");

await step("l'explorateur anatomique change de structure", async () => {
  await jump("dentition", 2.6);
  await page.waitForTimeout(1200);
  await page.getByRole("tab", { name: "Dents de loup" }).click();
  await page.waitForTimeout(400);
  assert.match(await page.locator("#anat-detail").textContent(), /prémolaires vestigiales/);
  await page.getByRole("tab", { name: "Incisives" }).click();
  await page.waitForTimeout(400);
  assert.match(await page.locator("#anat-detail").textContent(), /Douze incisives/);
});

await step("les 8 fiches de soins sont présentes", async () => {
  assert.equal(await page.locator("article[id^=fiche-]").count(), 8);
});

await step("l'auto-observation propose un contrôle", async () => {
  await jump("signes");
  await page.locator("#signes label", { hasText: "Mauvaise haleine" }).click();
  await page.waitForTimeout(300);
  assert.match(await page.locator("#signes [aria-live]").textContent(), /contrôle/);
});

/* ── Galerie ── */
await go("/galerie");

await step("galerie : catégories sans photo réservées « à venir »", async () => {
  await page.getByRole("button", { name: /^Le matériel/ }).click();
  await page.waitForTimeout(900);
  const g = page.locator("#galerie");
  assert.match(await g.textContent(), /Photos à venir/);
  assert.equal(await g.locator("[aria-roledescription=carrousel] img").count(), 0);
});

await step("galerie : carrousel, mosaïque et visionneuse", async () => {
  await page.getByRole("button", { name: /^Tout/ }).click();
  await page.waitForTimeout(900);
  assert.ok((await page.locator("#galerie [aria-roledescription=carrousel] img").count()) >= 4);
  await page.getByRole("button", { name: "Mosaïque" }).click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /^Anatomie/ }).click();
  await page.waitForTimeout(1400);
  assert.equal(await page.locator("#galerie li[data-cell]:not(.hidden) img").count(), 3);
  await page.locator("#galerie li[data-cell]:not(.hidden) button").first().click();
  await page.waitForTimeout(600);
  assert.equal(await page.getByRole("dialog").count(), 1);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(300);
  assert.match(await page.getByRole("dialog").textContent(), /02 \/ 03/);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  assert.equal(await page.getByRole("dialog").count(), 0);
});

/* ── FAQ ── */
await go("/faq");

await step("FAQ : 5 catégories et accordéons", async () => {
  for (const c of ["dentisterie", "soins", "deroulement", "rendez-vous", "deplacements"]) assert.equal(await page.locator(`#faq-${c}`).count(), 1, c);
  const q = page.locator("#faq-q-soins-1");
  await q.scrollIntoViewIfNeeded();
  await q.click();
  await page.waitForTimeout(700);
  assert.equal(await q.getAttribute("aria-expanded"), "true");
  await q.click();
  await page.waitForTimeout(700);
  assert.equal(await q.getAttribute("aria-expanded"), "false");
});

/* ── Rendez-vous ── */
await go("/rendez-vous?type=suivi");

await step("un lien entrant présélectionne le type de demande", async () => {
  await page.waitForTimeout(500);
  assert.equal(await page.locator('input[value="suivi"]').isChecked(), true);
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
  await page.fill('[name="location.postalCode"]', "80260");
  await page.fill('[name="location.city"]', "Cardonnette");
  await page.getByRole("button", { name: /continuer/i }).click();
  await page.waitForTimeout(500);
  const d = new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10);
  await page.fill('[name="schedule.preferredDate"]', d);
  await page.locator("label", { hasText: "Matin" }).click();
  await page.getByRole("button", { name: /continuer/i }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(400);
  assert.ok(await page.locator("#f-consent-err").isVisible());
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForSelector("text=Votre demande a bien été transmise", { timeout: 8000 });
  assert.match(await page.locator("#rendez-vous").textContent(), /par téléphone ou par e-mail/);
});

/* ── Contact & avis ── */
await go("/contact");

await step("contact : coordonnées réelles affichées", async () => {
  const t = await page.locator("main").textContent();
  for (const s of ["07 44 73 49 56", "anaelletoso@gmail.com", "@anaelle_ts"]) assert.ok(t.includes(s), s);
  assert.equal(await page.locator('a[href="https://www.facebook.com/anaelle.toso"]').count() > 0, true);
});

await step("contact : validation puis envoi du message", async () => {
  await jump("ecrire");
  await page.getByRole("button", { name: /envoyer le message/i }).click();
  await page.waitForTimeout(400);
  assert.ok((await page.locator("#ecrire .field-error").count()) >= 3);
  await page.waitForTimeout(3200);
  await page.fill("#c-name", "Camille Martin");
  await page.fill("#c-email", "camille@example.com");
  await page.fill("#c-message", "Bonjour, je souhaiterais connaître vos disponibilités en mars.");
  await page.locator("#c-consent").check();
  await page.getByRole("button", { name: /envoyer le message/i }).click();
  await page.waitForSelector("#ecrire [role=status]", { timeout: 8000 });
});

await step("avis : note obligatoire, puis envoi en modération", async () => {
  await jump("avis");
  await page.fill("#r-firstName", "Camille");
  await page.fill("#r-comment", "Intervention très douce, cheval détendu tout du long.");
  await page.locator("#r-consent").check();
  await page.getByRole("button", { name: /publier mon avis/i }).click();
  await page.waitForTimeout(400);
  assert.ok(await page.locator("#r-rating-err").isVisible());
  await page.getByRole("radio", { name: "5 sur 5" }).check({ force: true });
  await page.getByRole("button", { name: /publier mon avis/i }).click();
  await page.waitForSelector("text=relu par Anaëlle avant d'être publié", { timeout: 8000 });
});

/* ── API : défenses côté serveur ── */
const api = async (route, body, headers = {}) => {
  const r = await fetch(BASE + route, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
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
const old = () => Date.now() - 10000;
await step("API rendez-vous : envoi trop rapide refusé", async () => {
  assert.equal((await api("/api/rendez-vous", { data: valid, meta: { startedAt: Date.now() } })).status, 400);
});
await step("API rendez-vous : pot de miel → réponse neutre", async () => {
  assert.equal((await api("/api/rendez-vous", { data: valid, meta: { startedAt: old(), website: "http://spam" } })).status, 200);
});
await step("API rendez-vous : données invalides → 422", async () => {
  const r = await api("/api/rendez-vous", { data: { ...valid, owner: { fullName: "", phone: "x", email: "y" } }, meta: { startedAt: old() } });
  assert.equal(r.status, 422);
  assert.ok(r.json.errors["owner.email"]);
});
await step("API : origine étrangère refusée", async () => {
  assert.equal((await api("/api/rendez-vous", { data: valid, meta: { startedAt: old() } }, { Origin: "https://evil.example" })).status, 403);
  assert.equal((await api("/api/contact", { data: {}, meta: { startedAt: old() } }, { Origin: "https://evil.example" })).status, 403);
});
await step("API contact : message invalide → 422", async () => {
  const r = await api("/api/contact", { data: { name: "A", email: "x", message: "court", consent: true }, meta: { startedAt: old() } });
  assert.equal(r.status, 422);
  assert.ok(r.json.errors.email && r.json.errors.message);
});
await step("API avis : note hors limites → 422", async () => {
  const r = await api("/api/avis", { data: { firstName: "Camille", rating: 6, comment: "Très bonne intervention, merci.", consent: true }, meta: { startedAt: old() } });
  assert.equal(r.status, 422);
  assert.ok(r.json.errors.rating);
});

await step("pages légales accessibles, 404 personnalisée", async () => {
  for (const p of ["/mentions-legales", "/confidentialite"]) assert.equal((await fetch(BASE + p)).status, 200, p);
  assert.equal((await fetch(BASE + "/page-inexistante")).status, 404);
});

await step("aucune erreur JavaScript dans la console", async () => {
  assert.deepEqual(errors, []);
});

await browser.close();
for (const r of results) console.log(r.join("  "));
const failed = results.filter((r) => r[0] === "✗").length;
console.log(`\n${results.length - failed}/${results.length} vérifications réussies`);
process.exit(failed ? 1 : 0);
