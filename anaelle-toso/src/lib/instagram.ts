import "server-only";
import type { SocialPost } from "./content";

/**
 * Publications Instagram récentes via l'API officielle (Instagram API with Instagram Login).
 * Nécessite un compte professionnel ou créateur et un jeton longue durée : INSTAGRAM_ACCESS_TOKEN.
 * Résultat mis en cache 1 h. En cas d'absence de jeton ou d'erreur : null (la galerie manuelle prend le relais).
 */
export async function fetchInstagramPosts(limit = 6): Promise<SocialPost[] | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;
  const url = new URL("https://graph.instagram.com/me/media");
  url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", token);
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { caption?: string; media_type: string; media_url?: string; thumbnail_url?: string; permalink: string; timestamp?: string }[];
    };
    return (json.data ?? [])
      .map((m) => ({
        image: (m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url) ?? "",
        caption: m.caption?.slice(0, 220) ?? "",
        url: m.permalink,
        network: "instagram" as const,
        date: m.timestamp,
      }))
      .filter((p) => p.image);
  } catch {
    return null;
  }
}
