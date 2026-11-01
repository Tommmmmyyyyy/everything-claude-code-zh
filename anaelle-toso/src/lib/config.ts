/**
 * Drapeaux de configuration lus depuis l'environnement.
 * Voir .env.example pour la liste complète.
 */

/** Affiche les emplacements « À renseigner » pour les informations manquantes (true par défaut, à passer à false au lancement). */
export const SHOW_PLACEHOLDERS = process.env.NEXT_PUBLIC_SHOW_PLACEHOLDERS !== "false";

// Sur Vercel, l'URL de production est détectée automatiquement si NEXT_PUBLIC_SITE_URL n'est pas défini.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000")).replace(/\/$/, "");

/** Clé publique Cloudflare Turnstile (anti-spam optionnel). */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

/** Mode démonstration (aperçu privé) : formulaire simulé, aucune donnée envoyée, mention « Prototype ». */
export const DEMO = process.env.NEXT_PUBLIC_DEMO === "true";

/** Liens internes : en mode démo (export statique), les pages sont des fichiers .html relatifs. */
export function siteHref(href: string) {
  if (!DEMO || !href.startsWith("/")) return href;
  const m = href.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  const path = m?.[1] ?? href;
  const rest = (m?.[2] ?? "") + (m?.[3] ?? "");
  const file = path === "/" || path === "" ? "site.html" : path.replace(/^\//, "").replace(/\/$/, "") + ".html";
  return file + rest;
}

/** Ressource de /public : relative en mode démo (export statique servi depuis un sous-dossier). */
export function siteAsset(src: string) {
  return DEMO && src.startsWith("/") ? "." + src : src;
}
