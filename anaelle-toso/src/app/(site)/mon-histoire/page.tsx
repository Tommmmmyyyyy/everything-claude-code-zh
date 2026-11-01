import type { Metadata } from "next";
import { site, story } from "@/lib/content";
import { PageHero } from "@/components/ui/PageHero";
import { Story } from "@/components/sections/Story";
import { PageCta } from "@/components/pages/PageCta";

export const metadata: Metadata = {
  title: "Mon histoire",
  description: `${site.identity.fullName}, ${site.identity.profession.toLowerCase()} : la passion des chevaux, la découverte du métier, une approche douce et pédagogique.`,
  alternates: { canonical: "/mon-histoire" },
};

export default function MonHistoire() {
  return (
    <>
      <PageHero index="01" label="Mon histoire" title={story.title} intro={story.intro} image="/images/hero/paturage-contre-jour.jpg" imagePosition="50% 60%" tone="forest" />
      <Story content={story} header={false} />
      <PageCta
        index="02"
        title={
          <>
            Faisons <em className="italic text-sand">connaissance.</em>
          </>
        }
        text="Une question sur votre cheval, un premier contrôle à prévoir ? Je vous réponds avec plaisir."
        primary={{ href: "/rendez-vous", label: "Prendre rendez-vous" }}
        secondary={{ href: "/prestations", label: "Découvrir les prestations" }}
      />
    </>
  );
}
