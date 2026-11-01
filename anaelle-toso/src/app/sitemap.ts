export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["/", 1, "monthly"],
    ["/mon-histoire", 0.7, "yearly"],
    ["/prestations", 0.9, "monthly"],
    ["/rendez-vous", 0.9, "monthly"],
    ["/galerie", 0.6, "monthly"],
    ["/faq", 0.7, "monthly"],
    ["/contact", 0.8, "yearly"],
    ["/mentions-legales", 0.2, "yearly"],
    ["/confidentialite", 0.2, "yearly"],
  ];
  return pages.map(([p, priority, changeFrequency]) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency, priority }));
}
