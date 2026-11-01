import type { Metadata } from "next";
import { gallery, site, social } from "@/lib/content";
import { fetchInstagramPosts } from "@/lib/instagram";
import { PageHero } from "@/components/ui/PageHero";
import { Gallery } from "@/components/sections/Gallery";
import { Social } from "@/components/sections/Social";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Galerie",
  description: `Chevaux, écuries, interventions : quelques images du quotidien de ${site.identity.fullName}, ${site.identity.profession.toLowerCase()}.`,
  alternates: { canonical: "/galerie" },
};

export default async function Galerie() {
  const instagram = await fetchInstagramPosts(6);
  return (
    <>
      <PageHero index="01" label="Galerie" title={gallery.title} intro={gallery.intro} tone="leather" compact art={<Viewfinder />} />
      <Gallery content={gallery} header={false} />
      <Social site={site} content={social} posts={instagram} index="02" />
    </>
  );
}

/** Motif de viseur photographique (aucune image : les photos sont juste en dessous). */
function Viewfinder() {
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full text-cream" fill="none" stroke="currentColor">
      <g strokeOpacity="0.22" strokeWidth="1.2">
        <path d="M 560 120 h -60 v 60 M 900 120 h 60 v 60 M 560 520 h -60 v -60 M 900 520 h 60 v -60" transform="translate(-20 0)" />
        <circle cx="710" cy="320" r="70" strokeDasharray="4 6" />
        <path d="M 690 320 h 40 M 710 300 v 40" />
      </g>
      <g strokeOpacity="0.12">
        <path d="M 480 320 h 120 M 820 320 h 120" strokeDasharray="2 8" />
      </g>
    </svg>
  );
}
